const img = (id) => `https://images.unsplash.com/${id}?w=400&h=400&fit=crop`;

// Ideas predefinidas: se usan al abrir la tienda y cuando la IA no está configurada.
export const GIFT_POOL = [
  { name: 'Auriculares Sony WH-1000XM5', description: 'Cancelación de ruido líder, 30 horas de batería y un sonido excepcional', price: '€299-€379', image: img('photo-1505740420928-5e560c06d30e'), link: 'https://www.amazon.es/dp/B0BXNWST16' },
  { name: 'Set Spa Premium en casa', description: 'Aceites esenciales, velas aromáticas, sales de baño y mascarillas', price: '€45-€75', image: img('photo-1608571423902-eed4a5ad8108'), link: 'https://www.amazon.es/s?k=set+spa+premium' },
  { name: 'Fitbit Charge 6', description: 'Actividad física con GPS, análisis del sueño y frecuencia cardíaca', price: '€139-€179', image: img('photo-1523275335684-37898b6baf30'), link: 'https://www.amazon.es/dp/B0CCQ8RLP7' },
  { name: 'Hábitos Atómicos', description: 'El bestseller de James Clear sobre crear buenos hábitos', price: '€18-€25', image: img('photo-1544947950-fa07a98d237f'), link: 'https://www.amazon.es/s?k=habitos+atomicos' },
  { name: 'Cafetera espresso De’Longhi', description: '15 bares de presión para un café perfecto cada mañana', price: '€119-€199', image: img('photo-1517668808822-9ebb02f2a0e6'), link: 'https://www.amazon.es/s?k=cafetera+espresso+delonghi', match: 'Ideal para amantes del café' },
  { name: 'Mochila de viaje 40L', description: 'Impermeable, con compartimento para portátil y puerto USB', price: '€59-€109', image: img('photo-1553062407-98eeb64c6a62'), link: 'https://www.amazon.es/s?k=mochila+viaje+40l', match: 'Perfecta para viajeros' },
  { name: 'Lámpara Philips Hue', description: '16 millones de colores, controlable por voz con Alexa y Google', price: '€35-€69', image: img('photo-1507473885765-e6ed057f782c'), link: 'https://www.amazon.es/s?k=philips+hue+lampara', match: 'Para los amantes de la tecnología' },
  { name: 'Kit de jardinería', description: 'Herramientas de calidad, guantes y macetas decorativas', price: '€45-€85', image: img('photo-1416879595882-3373a0480b5b'), link: 'https://www.amazon.es/s?k=kit+jardineria', match: 'Para quien adora las plantas' },
  { name: 'Cámara instantánea Instax Mini', description: 'Fotos impresas al momento para guardar recuerdos', price: '€79-€99', image: img('photo-1526170375885-4d8ecf77b99f'), link: 'https://www.amazon.es/s?k=instax+mini', match: 'Para inmortalizar momentos' },
  { name: 'Set de cócteles', description: 'Coctelera, medidor, colador y libro de recetas', price: '€30-€55', image: img('photo-1514362545857-3bc16c4c7d1b'), link: 'https://www.amazon.es/s?k=set+cocteleria', match: 'Para anfitriones con estilo' },
  { name: 'Altavoz bluetooth resistente al agua', description: 'Sonido potente, 12 horas de batería, ideal para la playa', price: '€40-€90', image: img('photo-1608043152269-423dbba4e7e1'), link: 'https://www.amazon.es/s?k=altavoz+bluetooth+resistente+agua', match: 'Música en cualquier parte' },
  { name: 'Experiencia gastronómica', description: 'Caja regalo con cena o cata para dos personas', price: '€50-€120', image: img('photo-1414235077428-338989a2e8c0'), link: 'https://www.amazon.es/s?k=caja+regalo+experiencia+gastronomica', match: 'Un plan para compartir' },
];

export function poolPage(pageIndex, size = 4) {
  const start = (pageIndex * size) % GIFT_POOL.length;
  return Array.from({ length: size }, (_, i) => GIFT_POOL[(start + i) % GIFT_POOL.length]);
}

const normalize = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export function buildTrackingUrl(product, friend) {
  const base = product.link || 'https://www.amazon.es';
  const params = new URLSearchParams({
    utm_source: 'birthdaygifts_app',
    utm_medium: 'gift_recommendation',
    utm_campaign: `birthday_${normalize(friend?.name)}`,
    utm_content: `product_${product.id}`,
    utm_term: normalize(product.name),
  });
  return `${base}${base.includes('?') ? '&' : '?'}${params}`;
}

export const BUDGET_LABELS = {
  low: 'hasta 20€',
  'medium-low': '20-50€',
  medium: '50-100€',
  'medium-high': '100-200€',
  high: '200-500€',
  premium: 'más de 500€',
};
