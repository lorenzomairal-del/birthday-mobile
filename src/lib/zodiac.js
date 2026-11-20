export const ZODIAC_SIGNS = {
  aries: { name: 'Aries', emoji: '♈', element: 'Fuego', traits: 'Aventurero, apasionado, líder natural' },
  tauro: { name: 'Tauro', emoji: '♉', element: 'Tierra', traits: 'Leal, paciente, amante del confort' },
  geminis: { name: 'Géminis', emoji: '♊', element: 'Aire', traits: 'Comunicativo, versátil, curioso' },
  cancer: { name: 'Cáncer', emoji: '♋', element: 'Agua', traits: 'Empático, protector, emocional' },
  leo: { name: 'Leo', emoji: '♌', element: 'Fuego', traits: 'Carismático, generoso, creativo' },
  virgo: { name: 'Virgo', emoji: '♍', element: 'Tierra', traits: 'Detallista, práctico, analítico' },
  libra: { name: 'Libra', emoji: '♎', element: 'Aire', traits: 'Equilibrado, diplomático, sociable' },
  escorpio: { name: 'Escorpio', emoji: '♏', element: 'Agua', traits: 'Intenso, leal, transformador' },
  sagitario: { name: 'Sagitario', emoji: '♐', element: 'Fuego', traits: 'Optimista, aventurero, filosófico' },
  capricornio: { name: 'Capricornio', emoji: '♑', element: 'Tierra', traits: 'Ambicioso, disciplinado, responsable' },
  acuario: { name: 'Acuario', emoji: '♒', element: 'Aire', traits: 'Innovador, independiente, humanitario' },
  piscis: { name: 'Piscis', emoji: '♓', element: 'Agua', traits: 'Soñador, empático, artístico' },
};

export function getZodiacSign(date) {
  const parts = parseDate(date);
  if (!parts) return null;
  const { month, day } = parts;
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS.aries;
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS.tauro;
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS.geminis;
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS.cancer;
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS.leo;
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS.virgo;
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS.libra;
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS.escorpio;
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS.sagitario;
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS.capricornio;
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS.acuario;
  return ZODIAC_SIGNS.piscis;
}

// "YYYY-MM-DD" se lee como fecha local (new Date() la leería en UTC y podía
// mostrar el día anterior según la zona horaria).
export function parseDate(value) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}

export function daysUntil(birthday) {
  const p = parseDate(birthday);
  if (!p) return Infinity;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(today.getFullYear(), p.month - 1, p.day);
  if (next < today) next = new Date(today.getFullYear() + 1, p.month - 1, p.day);
  return Math.round((next - today) / 864e5);
}

export function turningAge(birthday) {
  const p = parseDate(birthday);
  if (!p || p.year < 1900) return null;
  const now = new Date();
  const days = daysUntil(birthday);
  const nextYear = days === 0 ? now.getFullYear() : new Date(now.getTime() + days * 864e5).getFullYear();
  const age = nextYear - p.year;
  return age > 0 && age < 130 ? age : null;
}

export function formatDayMonth(birthday, opts = { day: 'numeric', month: 'long' }) {
  const p = parseDate(birthday);
  if (!p) return '';
  return new Date(2000, p.month - 1, p.day).toLocaleDateString('es-ES', opts);
}
