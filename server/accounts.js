// Cuentas creadas con enlace de invitación y su progreso hacia el cheque regalo.
// VERSIÓN DE PRUEBA: se guarda en un archivo JSON del servidor. En Render (plan gratis)
// ese archivo se borra cada vez que el servidor se reinicia o se despliega.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const FILE = path.join(DIR, 'accounts.json');
export const REWARD_AMOUNT = Number(process.env.REWARD_AMOUNT || 5);

let db = { users: {}, rewards: {} };
try {
  db = { users: {}, rewards: {}, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };
} catch {
  /* primera vez: no hay archivo */
}

function save() {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('No se pudo guardar accounts.json', e.message);
  }
}

const hash = (pass, salt) => crypto.scryptSync(String(pass), salt, 32).toString('hex');

export const hasAccount = (user) => Boolean(db.users[user]);

export function checkPassword(user, pass) {
  const u = db.users[user];
  if (!u) return false;
  const a = Buffer.from(hash(pass, u.salt), 'hex');
  return crypto.timingSafeEqual(a, Buffer.from(u.hash, 'hex'));
}

export function createAccount(user, pass, name, invitedBy) {
  const salt = crypto.randomBytes(16).toString('hex');
  db.users[user] = { name, salt, hash: hash(pass, salt), invitedBy, createdAt: Date.now(), birthday: false, order: false, done: false };
  save();
}

// Código simulado: NO es un cheque real de Amazon.
const fakeCode = () => `PRUEBA-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

function grant(user, reason) {
  (db.rewards[user] ||= []).push({ code: fakeCode(), amount: REWARD_AMOUNT, reason, at: Date.now() });
}

// Marca un paso del invitado ('birthday' u 'order'); al completar los dos, premia a ambos.
export function markStep(user, step) {
  const u = db.users[user];
  if (!u || !['birthday', 'order'].includes(step)) return;
  u[step] = true;
  if (u.birthday && u.order && !u.done) {
    u.done = true;
    grant(user, 'Bienvenida');
    if (u.invitedBy) grant(u.invitedBy, `Invitaste a ${u.name || user}`);
  }
  save();
}

export function accountInfo(user) {
  const u = db.users[user];
  const invited = Object.entries(db.users)
    .filter(([, v]) => v.invitedBy === user)
    .map(([id, v]) => ({ user: id, name: v.name || id, birthday: v.birthday, order: v.order, done: v.done, createdAt: v.createdAt }));
  return {
    invitedBy: u?.invitedBy || null,
    steps: u ? { birthday: u.birthday, order: u.order, done: u.done } : null,
    invited,
    rewards: db.rewards[user] || [],
  };
}
