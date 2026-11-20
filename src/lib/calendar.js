import { parseDate } from './zodiac.js';

// Genera un .ics con un evento anual por persona y avisos el día antes y el mismo día.
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s || '').replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

function event(f) {
  const p = parseDate(f.birthday);
  if (!p || !p.month || !p.day) return null;
  const now = new Date();
  // Primer año en que el evento existe (si se sabe el año, ese; si no, el actual).
  const startYear = p.year >= 1900 ? p.year : now.getFullYear();
  const start = `${startYear}${pad(p.month)}${pad(p.day)}`;
  const endDate = new Date(startYear, p.month - 1, p.day + 1);
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}`;
  const name = `${f.name || ''} ${f.lastName || ''}`.trim();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  return [
    'BEGIN:VEVENT',
    `UID:bg-${f.id || name}-${p.month}${p.day}@cumpleanos`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    'RRULE:FREQ=YEARLY',
    `SUMMARY:${esc(`Cumpleaños de ${name}`)}`,
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(`Mañana es el cumpleaños de ${name}`)}`,
    'TRIGGER:-PT15H',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(`Hoy es el cumpleaños de ${name}`)}`,
    'TRIGGER:PT9H',
    'END:VALARM',
    'END:VEVENT',
  ].join('\r\n');
}

export function buildIcs(friends) {
  const events = friends.map(event).filter(Boolean);
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cumpleanos//ES', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Cumpleaños', ...events, 'END:VCALENDAR'].join('\r\n');
}

export function downloadIcs(friends, filename = 'cumpleanos.ics') {
  const blob = new Blob([buildIcs(friends)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Datos mínimos para el servidor: [id, nombre, fecha].
export function calendarPayload(friends) {
  const rows = friends.map((f) => [f.id || '', `${f.name || ''} ${f.lastName || ''}`.trim(), f.birthday]);
  const bytes = new TextEncoder().encode(JSON.stringify(rows));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// El .ics lo sirve el servidor: así el iPhone lo abre directamente en Calendario.
export const icsUrl = (friends, download = false) => `/api/calendar.ics?d=${calendarPayload(friends)}${download ? '&dl=1' : ''}`;

// Enlace de Google Calendar para una persona (evento anual de todo el día).
export function googleCalendarUrl(f) {
  const p = parseDate(f.birthday);
  if (!p) return 'https://calendar.google.com';
  const now = new Date();
  let year = now.getFullYear();
  if (new Date(year, p.month - 1, p.day) < new Date(now.getFullYear(), now.getMonth(), now.getDate())) year += 1;
  const s = new Date(year, p.month - 1, p.day);
  const e = new Date(year, p.month - 1, p.day + 1);
  const fmt = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const name = `${f.name || ''} ${f.lastName || ''}`.trim();
  const params = [
    'action=TEMPLATE',
    `text=${encodeURIComponent(`Cumpleaños de ${name}`)}`,
    `dates=${fmt(s)}/${fmt(e)}`,
    `recur=${encodeURIComponent('RRULE:FREQ=YEARLY')}`,
    `details=${encodeURIComponent('Recordatorio de la app Cumpleaños')}`,
  ];
  return `https://calendar.google.com/calendar/render?${params.join('&')}`;
}
