import { useMemo, useState } from 'react';
import { Gift, Search, Pencil, Trash2, X } from 'lucide-react';
import { daysUntil, formatDayMonth, getZodiacSign, turningAge } from '../lib/zodiac.js';
import { Avatar, Button, EmptyState, Segmented, Sheet } from './ui.jsx';

const BUDGETS = { low: 'Hasta 20€', 'medium-low': '20-50€', medium: '50-100€', 'medium-high': '100-200€', high: '200-500€', premium: 'Más de 500€' };
const RELATIONS = { family: 'Familia', friend: 'Amistad', partner: 'Pareja', coworker: 'Trabajo', acquaintance: 'Conocido/a' };

function DaysLabel({ days }) {
  const text = days === 0 ? 'hoy' : days === 1 ? 'mañana' : `en ${days} días`;
  return <span className="text-[13px] font-semibold text-accent whitespace-nowrap">{text}</span>;
}

function FriendSheet({ friend, onClose, onGifts, onEdit, onDelete }) {
  const zodiac = getZodiacSign(friend.birthday);
  const age = turningAge(friend.birthday);
  const days = daysUntil(friend.birthday);
  const details = [
    ['Ciudad', friend.location],
    ['Intereses', friend.interests],
    ['Hobbies', friend.hobbies],
    ['Comida favorita', friend.favoriteFood],
    ['Estilo', friend.style && friend.style[0].toUpperCase() + friend.style.slice(1)],
    ['Presupuesto', BUDGETS[friend.budget]],
    ['Relación', RELATIONS[friend.relationship]],
  ].filter(([, v]) => v);

  return (
    <Sheet
      title={`${friend.name} ${friend.lastName || ''}`}
      subtitle={`${formatDayMonth(friend.birthday)}${age ? ` · cumple ${age}` : ''} · ${
        days === 0 ? '¡hoy!' : days === 1 ? 'mañana' : `en ${days} días`
      }`}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => onGifts(friend)}>
            <Gift size={17} /> Ideas de regalo
          </Button>
          <button onClick={() => onEdit(friend)} aria-label="Editar" className="w-12 rounded-xl border border-line flex items-center justify-center active:bg-fg/5">
            <Pencil size={18} strokeWidth={1.6} />
          </button>
          <button onClick={() => onDelete(friend)} aria-label="Eliminar" className="w-12 rounded-xl border border-line flex items-center justify-center text-red-700 active:bg-red-500/10">
            <Trash2 size={18} strokeWidth={1.6} />
          </button>
        </div>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar src={friend.photo} name={friend.name} lastName={friend.lastName} size={64} />
        {zodiac && (
          <div>
            <p className="font-display text-2xl leading-none">
              {zodiac.name} <span className="text-mute italic text-lg">· {zodiac.element}</span>
            </p>
            <p className="text-sm text-mute mt-1.5">{zodiac.traits}</p>
          </div>
        )}
      </div>
      {details.length > 0 && (
        <dl className="mt-5 divide-y divide-line border-y border-line">
          {details.map(([k, v]) => (
            <div key={k} className="py-3 flex gap-4">
              <dt className="eyebrow w-28 shrink-0 pt-0.5">{k}</dt>
              <dd className="text-sm text-fg/90">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </Sheet>
  );
}

export default function HomeView({ friends, onAdd, onEdit, onDelete, onGifts }) {
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [sort, setSort] = useState('date');
  const [open, setOpen] = useState(null);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return friends
      .filter((f) => !q || `${f.name || ''} ${f.lastName || ''}`.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === 'name'
          ? `${a.name} ${a.lastName || ''}`.localeCompare(`${b.name} ${b.lastName || ''}`, 'es')
          : daysUntil(a.birthday) - daysUntil(b.birthday)
      );
  }, [friends, search, sort]);

  if (!friends.length) {
    return (
      <EmptyState
        icon={<Gift className="text-accent" size={36} strokeWidth={1.4} />}
        title="Aún no hay cumpleaños"
        text="Añade a tus amigos y familia para empezar"
        action={<Button onClick={onAdd}>Añadir persona</Button>}
      />
    );
  }

  const next = [...friends].sort((a, b) => daysUntil(a.birthday) - daysUntil(b.birthday))[0];
  const nextDays = daysUntil(next.birthday);
  const nextAge = turningAge(next.birthday);
  const nextZodiac = getZodiacSign(next.birthday);
  const act = (fn) => (f) => {
    setOpen(null);
    fn(f);
  };

  return (
    <div>
      {!search && (
        <section className="pt-1">
          <p className="eyebrow !text-accent font-semibold">
            {nextDays === 0 ? 'Hoy' : nextDays === 1 ? 'Mañana' : `En ${nextDays} días`}
          </p>
          <button onClick={() => setOpen(next)} className="block text-left mt-2.5">
            <h2 className="font-display text-[44px] leading-[1] tracking-tight">
              {next.name} {next.lastName}{' '}
              {nextAge ? <em className="font-normal">cumple {nextAge}</em> : <em className="font-normal">está de cumpleaños</em>}
            </h2>
          </button>
          <p className="text-[15px] leading-relaxed text-fg/75 mt-3">
            {formatDayMonth(next.birthday)}.
            {nextZodiac ? ` ${nextZodiac.name}: ${nextZodiac.traits.toLowerCase()}.` : ''}
            {next.interests ? ` Le gusta: ${next.interests}.` : ''}
          </p>
          <div className="flex gap-2.5 mt-5">
            <button onClick={() => onGifts(next)} className="rounded-full bg-fg text-ink px-5 py-3 text-[15px] font-semibold active:opacity-85">
              Ideas de regalo
            </button>
            <button onClick={() => setOpen(next)} className="rounded-full border-[1.5px] border-fg px-5 py-3 text-[15px] font-semibold active:bg-fg/5">
              Ver ficha
            </button>
          </div>
        </section>
      )}

      <div className="mt-9 mb-1 flex items-center justify-between gap-3 min-h-10 border-b border-fg/30">
        {searching ? (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={17} />
            <input
              autoFocus
              type="search"
              placeholder="Buscar por nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-surface border border-line rounded-xl placeholder:text-mute/70 focus:outline-none focus:border-accent/50 [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              onClick={() => {
                setSearch('');
                setSearching(false);
              }}
              aria-label="Cerrar búsqueda"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-mute"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <>
            <Segmented
              value={sort}
              onChange={setSort}
              options={[
                { value: 'date', label: 'Próximos' },
                { value: 'name', label: 'A–Z' },
              ]}
            />
            <button onClick={() => setSearching(true)} aria-label="Buscar" className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-fg/80 active:bg-fg/5">
              <Search size={17} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

      {list.length === 0 && <p className="text-center text-mute py-10">No hay nadie con ese nombre.</p>}

      <ul>
        {list.map((f) => {
          const days = daysUntil(f.birthday);
          const zodiac = getZodiacSign(f.birthday);
          return (
            <li key={f.id} className="border-b border-fg/15">
              <button onClick={() => setOpen(f)} className="w-full flex items-center gap-4 py-3.5 text-left active:opacity-70">
                <div className="w-12 text-center shrink-0">
                  <span className="block font-display text-[28px] leading-none">{formatDayMonth(f.birthday, { day: 'numeric' })}</span>
                  <span className="eyebrow !text-[10px]">{formatDayMonth(f.birthday, { month: 'short' }).replace('.', '')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[19px] leading-tight truncate">
                    {f.name} {f.lastName}
                  </p>
                  <p className="text-[13px] text-mute truncate">
                    {zodiac ? zodiac.name : ''}
                    {turningAge(f.birthday) ? ` · cumple ${turningAge(f.birthday)}` : ''}
                  </p>
                </div>
                <DaysLabel days={days} />
              </button>
            </li>
          );
        })}
      </ul>

      {open && (
        <FriendSheet friend={open} onClose={() => setOpen(null)} onGifts={act(onGifts)} onEdit={act(onEdit)} onDelete={act(onDelete)} />
      )}
    </div>
  );
}
