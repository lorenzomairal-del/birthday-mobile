import { useMemo, useState } from 'react';
import { Gift, Search, Pencil, Trash2, X, ArrowRight } from 'lucide-react';
import { daysUntil, formatDayMonth, getZodiacSign, turningAge } from '../lib/zodiac.js';
import { Avatar, Button, EmptyState, Segmented, Sheet } from './ui.jsx';

const BUDGETS = { low: 'Hasta 20€', 'medium-low': '20-50€', medium: '50-100€', 'medium-high': '100-200€', high: '200-500€', premium: 'Más de 500€' };
const RELATIONS = { family: 'Familia', friend: 'Amistad', partner: 'Pareja', coworker: 'Trabajo', acquaintance: 'Conocido/a' };

function DaysLabel({ days }) {
  if (days === 0) return <span className="font-display italic text-2xl text-gold">Hoy</span>;
  return (
    <div className="text-right leading-none">
      <span className={`font-display text-[28px] ${days <= 7 ? 'text-gold' : ''}`}>{days}</span>
      <span className="block eyebrow !text-[10px] mt-1">{days === 1 ? 'día' : 'días'}</span>
    </div>
  );
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
          <button onClick={() => onEdit(friend)} aria-label="Editar" className="w-12 rounded-xl border border-line flex items-center justify-center active:bg-white/5">
            <Pencil size={18} strokeWidth={1.6} />
          </button>
          <button onClick={() => onDelete(friend)} aria-label="Eliminar" className="w-12 rounded-xl border border-line flex items-center justify-center text-red-400 active:bg-red-500/10">
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
        icon={<Gift className="text-gold" size={36} strokeWidth={1.4} />}
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
        <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface to-ink p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[radial-gradient(closest-side,rgba(217,194,156,0.22),transparent)]" />
          <p className="eyebrow">Próximo cumpleaños</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <button onClick={() => setOpen(next)} className="text-left min-w-0">
              <p className="text-xl font-medium truncate">
                {next.name} {next.lastName}
              </p>
              <p className="text-[13px] text-mute mt-1">
                {formatDayMonth(next.birthday, { day: 'numeric', month: 'short' })}
                {nextAge ? ` · cumple ${nextAge}` : ''}
                {nextZodiac ? ` · ${nextZodiac.name}` : ''}
              </p>
            </button>
            <p className="font-display text-gold leading-[0.8] shrink-0">
              {nextDays === 0 ? (
                <span className="italic text-6xl">Hoy</span>
              ) : (
                <>
                  <span className="text-[88px]">{nextDays}</span>
                  <span className="font-sans text-[13px] text-mute ml-1.5">{nextDays === 1 ? 'día' : 'días'}</span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => onGifts(next)}
            className="mt-5 w-full flex items-center justify-between rounded-2xl bg-fg text-ink px-4 py-3.5 text-[15px] font-semibold active:opacity-90"
          >
            Ideas de regalo <ArrowRight size={18} />
          </button>
        </section>
      )}

      <div className="mt-8 mb-1 flex items-center justify-between gap-3 min-h-10">
        {searching ? (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={17} />
            <input
              autoFocus
              type="search"
              placeholder="Buscar por nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-surface border border-line rounded-xl placeholder:text-mute/70 focus:outline-none focus:border-gold/50 [&::-webkit-search-cancel-button]:hidden"
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
            <button onClick={() => setSearching(true)} aria-label="Buscar" className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-fg/80 active:bg-white/5">
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
            <li key={f.id} className="border-b border-line">
              <button onClick={() => setOpen(f)} className="w-full flex items-center gap-3.5 py-4 text-left active:opacity-70">
                <Avatar src={f.photo} name={f.name} lastName={f.lastName} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {f.name} {f.lastName}
                  </p>
                  <p className="text-[13px] text-mute truncate">
                    {formatDayMonth(f.birthday, { day: 'numeric', month: 'short' })}
                    {zodiac ? ` · ${zodiac.name}` : ''}
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
