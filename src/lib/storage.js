// Los datos se guardan en el navegador de cada persona, separados por usuario.
let prefix = 'bg:local:';

export function setStorageUser(user) {
  prefix = `bg:${user || 'local'}:`;
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(prefix + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(prefix + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('No se pudo guardar', key, e);
    alert('No se pudo guardar: el almacenamiento del navegador está lleno. Prueba a quitar alguna foto.');
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(prefix + key);
  } catch {
    // nada
  }
}

export function exportAll() {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) out[k.slice(prefix.length)] = JSON.parse(localStorage.getItem(k));
  }
  return { app: 'birthday-gifts', version: 1, exportedAt: new Date().toISOString(), data: out };
}

export function importAll(payload) {
  if (!payload || payload.app !== 'birthday-gifts' || typeof payload.data !== 'object') {
    throw new Error('Archivo no válido');
  }
  for (const [k, v] of Object.entries(payload.data)) {
    localStorage.setItem(prefix + k, JSON.stringify(v));
  }
}
