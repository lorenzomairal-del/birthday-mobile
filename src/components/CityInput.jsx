import { useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { inputClass } from './ui.jsx';

// Buscador de ciudades y lugares (Open-Meteo, gratis y sin clave). También acepta texto libre.
export default function CityInput({ value, onChange, placeholder = 'Busca una ciudad o un pueblo' }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const timer = useRef(null);
  const last = useRef('');

  const search = (q) => {
    clearTimeout(timer.current);
    const term = q.split(',')[0].trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      last.current = term;
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=8&language=es&format=json`);
        const data = await r.json();
        if (last.current !== term) return;
        const seen = new Set();
        setResults(
          (data.results || [])
            .map((c) => ({
              key: c.id,
              name: c.name,
              sub: [c.admin2 !== c.name && c.admin2, c.admin1, c.country].filter(Boolean).join(', '),
              display: [c.name, c.country].filter(Boolean).join(', '),
            }))
            .filter((c) => (seen.has(c.name + c.sub) ? false : seen.add(c.name + c.sub)))
        );
      } catch {
        setResults([]);
      } finally {
        if (last.current === term) setLoading(false);
      }
    }, 250);
  };

  const showList = focused && (results.length > 0 || loading);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mute pointer-events-none" size={17} />
      <input
        type="search"
        enterKeyHint="search"
        className={`${inputClass} pl-11 [&::-webkit-search-cancel-button]:hidden`}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          setFocused(true);
          if (value) search(value);
        }}
        onChange={(e) => {
          onChange(e.target.value);
          search(e.target.value);
        }}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />
      {showList && (
        <ul className="absolute z-30 inset-x-0 mt-1.5 bg-ink border border-line rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {loading && results.length === 0 && <li className="px-4 py-3 text-sm text-mute">Buscando…</li>}
          {results.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(c.display);
                  setResults([]);
                  setFocused(false);
                }}
                className="w-full flex items-center gap-3 text-left px-4 py-2.5 active:bg-fg/5 border-b last:border-b-0 border-line"
              >
                <MapPin size={16} className="text-mute shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium text-fg truncate">{c.name}</span>
                  <span className="block text-xs text-mute truncate">{c.sub}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
