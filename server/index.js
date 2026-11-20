// Servidor de producción: sirve la app compilada (dist/) detrás de un login
// con usuario y contraseña, y hace de puente con la IA para las ideas de regalo.
//
// Variables de entorno:
//   APP_USERS          "usuario1:contraseña1,usuario2:contraseña2" (obligatoria)
//   SESSION_SECRET     texto largo aleatorio para firmar la cookie (obligatoria en producción)
//   ANTHROPIC_API_KEY  opcional; sin ella la app usa ideas de regalo predefinidas
//   PORT               lo pone Render automáticamente

import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { loginPage as renderLogin } from './loginPage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE = 'bg_session';
const SESSION_DAYS = 30;

// Hoja de estilos compilada, para cargar las fuentes en la página de login.
let APP_CSS = '';
try {
  APP_CSS = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').match(/href="(\/assets\/[^"]+\.css)"/)?.[1] || '';
} catch {
  console.warn('No se encontró dist/index.html: ejecuta npm run build.');
}
const loginPage = (error, username) => renderLogin(error, username, APP_CSS);

const USERS = parseUsers(process.env.APP_USERS || '');
if (USERS.size === 0) {
  console.error('Falta APP_USERS (formato "usuario:contraseña,usuario2:contraseña2"). Nadie podrá entrar.');
}

let SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('SESSION_SECRET no definido: se usa uno temporal (las sesiones se cerrarán al reiniciar).');
}

function parseUsers(raw) {
  const map = new Map();
  for (const pair of raw.split(',')) {
    const idx = pair.indexOf(':');
    if (idx <= 0) continue;
    const user = pair.slice(0, idx).trim().toLowerCase();
    const pass = pair.slice(idx + 1).trim();
    if (user && pass) map.set(user, pass);
  }
  return map;
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!data.u || !USERS.has(data.u) || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

function setSessionCookie(res, user) {
  const token = sign({ u: user, exp: Date.now() + SESSION_DAYS * 864e5 });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    maxAge: SESSION_DAYS * 864e5,
    path: '/',
  });
}

// Freno simple a intentos de contraseña: 10 fallos por IP cada 15 minutos.
const attempts = new Map();
function tooManyAttempts(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.reset < now) return false;
  return rec.count >= 10;
}
function recordFailure(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.reset < now) attempts.set(ip, { count: 1, reset: now + 15 * 60e3 });
  else rec.count += 1;
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '100kb' }));

app.get('/healthz', (_req, res) => res.send('ok'));
// Iconos y manifiesto de la app: públicos para que el móvil pueda instalarla.
for (const file of ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest']) {
  app.get(`/${file}`, (_req, res) => res.sendFile(path.join(DIST, file)));
}
// Los archivos compilados (JS, CSS, fuentes) no contienen datos: se sirven sin sesión
// para que la página de login pueda usar las mismas fuentes que la app.
app.use('/assets', express.static(path.join(DIST, 'assets'), { maxAge: '30d', immutable: true }));

app.get('/login', (req, res) => {
  if (verify(readCookie(req, COOKIE))) return res.redirect('/');
  res.type('html').send(loginPage());
});

app.post('/login', (req, res) => {
  const ip = req.ip;
  if (tooManyAttempts(ip)) {
    return res.status(429).type('html').send(loginPage('Demasiados intentos. Prueba de nuevo en unos minutos.'));
  }
  const user = String(req.body.username || '').trim().toLowerCase();
  const pass = String(req.body.password || '');
  const stored = USERS.get(user);
  // Compara siempre, aunque el usuario no exista, para no dar pistas por tiempo.
  const ok = safeEqual(pass, stored ?? crypto.randomBytes(16).toString('hex')) && stored !== undefined;
  if (!ok) {
    recordFailure(ip);
    return res.status(401).type('html').send(loginPage('Usuario o contraseña incorrectos.', user));
  }
  attempts.delete(ip);
  setSessionCookie(res, user);
  res.redirect('/');
});

app.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.redirect('/login');
});

// A partir de aquí todo exige sesión.
app.use((req, res, next) => {
  const session = verify(readCookie(req, COOKIE));
  if (!session) {
    if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'no_session' });
    return res.redirect('/login');
  }
  req.user = session.u;
  next();
});

app.get('/api/me', (req, res) => {
  res.json({ user: req.user, ai: Boolean(process.env.ANTHROPIC_API_KEY) });
});

// Ideas de regalo con IA. La clave nunca llega al navegador.
app.post('/api/gift-ideas', async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'ai_disabled' });

  const f = req.body?.friend || {};
  const hint = String(req.body?.message || '').slice(0, 500);
  const clip = (v) => String(v || '').slice(0, 200);
  const details = [
    f.interests && `intereses: ${clip(f.interests)}`,
    f.hobbies && `hobbies: ${clip(f.hobbies)}`,
    f.favoriteFood && `comida favorita: ${clip(f.favoriteFood)}`,
    f.style && `estilo: ${clip(f.style)}`,
    f.budget && `presupuesto: ${clip(f.budget)}`,
    f.relationship && `relación: ${clip(f.relationship)}`,
    f.location && `ciudad: ${clip(f.location)}`,
  ].filter(Boolean).join('; ');

  const prompt = `Sugiere 4 regalos de cumpleaños concretos y variados para ${clip(f.name) || 'una persona'}${details ? ` (${details})` : ''}.${hint ? ` Indicaciones del usuario: ${hint}.` : ''}
Responde SOLO con un array JSON, sin markdown, con este formato:
[{"name":"producto (máx 50 caracteres)","description":"descripción breve (máx 100 caracteres)","match":"por qué encaja (máx 40 caracteres)","price":"€X-€Y","search":"términos para buscarlo en Amazon"}]`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) {
      console.error('Error IA', r.status, await r.text());
      return res.status(502).json({ error: 'ai_error' });
    }
    const data = await r.json();
    const text = data.content?.find((c) => c.type === 'text')?.text || '[]';
    const match = text.match(/\[[\s\S]*\]/);
    const ideas = JSON.parse(match ? match[0] : '[]')
      .slice(0, 6)
      .map((g) => ({
        name: String(g.name || '').slice(0, 80),
        description: String(g.description || '').slice(0, 160),
        match: String(g.match || '').slice(0, 80),
        price: String(g.price || '').slice(0, 30),
        link: `https://www.amazon.es/s?k=${encodeURIComponent(g.search || g.name || '')}`,
      }));
    res.json({ ideas });
  } catch (e) {
    console.error('Error IA', e);
    res.status(502).json({ error: 'ai_error' });
  }
});

app.use(express.static(DIST, { index: false, maxAge: '1h' }));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));

app.listen(PORT, () => {
  console.log(`Birthday Gifts escuchando en el puerto ${PORT} (${USERS.size} usuario/s)`);
});
