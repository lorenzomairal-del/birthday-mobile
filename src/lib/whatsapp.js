// Enlaces de WhatsApp que abren la app directamente en el móvil (whatsapp://),
// sin pasar por la página intermedia de wa.me, que es lenta y a veces rompe los emojis.
export const isMobile = () => typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Si el número no lleva prefijo y parece español (9 cifras que empiezan por 6, 7, 8 o 9), añade el 34.
export function phoneDigits(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (/^[6789]\d{8}$/.test(d)) d = `34${d}`;
  return d;
}

export function whatsappUrl(phone, text) {
  const params = [];
  const d = phoneDigits(phone);
  if (d) params.push(`phone=${d}`);
  if (text) params.push(`text=${encodeURIComponent(text)}`);
  const q = params.join('&');
  return isMobile() ? `whatsapp://send?${q}` : `https://api.whatsapp.com/send?${q}`;
}

// En el móvil el esquema whatsapp:// no necesita pestaña nueva (en la app instalada abriría una vacía).
export const whatsappLinkProps = (phone, text) => ({
  href: whatsappUrl(phone, text),
  ...(isMobile() ? {} : { target: '_blank', rel: 'noopener noreferrer' }),
});

export const congratsText = (friend) => `¡Feliz cumpleaños, ${friend.name}! Que pases un día genial.`;
