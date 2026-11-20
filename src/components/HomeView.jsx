import { useMemo, useState } from 'react';
import { Gift, Search, Pencil, Trash2, X, ArrowRight, MessageCircle, CalendarPlus } from 'lucide-react';
import { daysUntil, formatDayMonth, getZodiacSign, turningAge } from '../lib/zodiac.js';
import { Avatar, Button, EmptyState, Segmented, Sheet } from './ui.jsx';
import { congratsLink, downloadIcs } from '../lib/calendar.js';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const monthOf = (b) => +((/^\d{4}-(\d{2})/.exec(b || '') || [])[1] || 0);

const BUDGETS = { low: 'Hasta 20€', 'medium-low': '20-50€', medium: '50-100€', 'medium-high': '100-200€', high: '200-500€', premium: 'Más de 500€' };
const RELATIONS = { family: 'Familia', friend: 'Amistad', partner: 'Pareja', coworker: 'Trabajo', acquaintance: 'Conocido/a' };

function DaysLabel({ days }) {
  if (days === 0) return <span className="px-2.5 py-1 rounded-full bg-pop text-pop-fg text-[13px] font-semibold">Hoy</span>;
  if (days === 1) return <span className="text-[15px] font-semibold whitespace-nowrap">Mañana</span>;
  return (
    <span className="text-[15px] font-semibold whitespace-nowrap">
      {days} <span className="text-mute font-medium">días</span>
    </span>
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
          <button onClick={() => onEdit(friend)} aria-label="Editar" className="w-12 rounded-full bg-surface flex items-center justify-center active:bg-fg/5">
            <Pencil size={18} strokeWidth={1.6} />
          </button>
          <button onClick={() => onDelete(friend)} aria-label="Eliminar" className="w-12 rounded-full bg-surface flex items-center justify-center text-red-700 active:bg-red-500/10">
            <Trash2 size={18} strokeWidth={1.6} />
          </button>
        </div>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar src={friend.photo} name={friend.name} lastName={friend.lastName} size={64} />
        {zodiac && (
          <div>
            <p className="text-lg font-semibold leading-none">
              {zodiac.name} <span className="text-mute font-medium">· {zodiac.element}</span>
            </p>
            <p className="text-sm text-mute mt-1.5">{zodiac.traits}</p>
          </div>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <a
          href={congratsLink(friend)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[15px] font-semibold bg-surface active:bg-surface-2"
        >
          <MessageCircle size={17} strokeWidth={1.8} /> Felicitar
        </a>
        <button
          onClick={() => downloadIcs([friend], `cumple-${(friend.name || 'persona').toLowerCase()}.ics`)}
          className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[15px] font-semibold bg-surface active:bg-surface-2"
        >
          <CalendarPlus size={17} strokeWidth={1.8} /> Recordatorio
        </button>
      </div>
      {details.length > 0 && (
        <dl className="mt-5 divide-y divide-line">
          {details.map(([k, v]) => (
            <div key={k} className="py-3 flex gap-4">
              <dt className="eyebrow w-32 shrink-0">{k}</dt>
              <dd className="text-[15px]">{v}</dd>
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
        icon={<Gift className="text-pop-fg" size={34} strokeWidth={1.6} />}
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
  const grouped = sort === 'date' && !search.trim();
  const thisMonth = new Date().getMonth() + 1;
  const monthLabel = (f) => {
    const m = monthOf(f.birthday);
    if (m === thisMonth && daysUntil(f.birthday) < 32) return 'Este mes';
    return m === (thisMonth % 12) + 1 ? 'El mes que viene' : MONTHS[m - 1] || '';
  };
  const act = (fn) => (f) => {
    setOpen(null);
    fn(f);
  };

  return (
    <div>
      {!search && (
        <section className="rounded-[28px] bg-pop text-pop-fg p-5 pt-[18px]">
          <p className="text-[13px] font-semibold opacity-70">Próximo cumpleaños</p>
          <button onClick={() => setOpen(next)} className="block w-full text-left">
            <p className="flex items-baseline gap-2 mt-1">
              {nextDays === 0 ? (
                <span className="text-[64px] font-bold tracking-[-0.05em] leading-[1]">¡Hoy!</span>
              ) : (
                <>
                  <span className="text-[84px] font-bold tracking-[-0.06em] leading-[0.9]">{nextDays}</span>
                  <span className="text-lg font-semibold opacity-80">{nextDays === 1 ? 'día' : 'días'}</span>
                </>
              )}
            </p>
            <p className="mt-3 text-xl font-semibold tracking-[-0.02em] truncate">
              {next.name} {next.lastName}
            </p>
            <p className="text-sm font-medium opacity-70 mt-0.5">
              {nextAge ? `Cumple ${nextAge} · ` : ''}
              {formatDayMonth(next.birthday, { day: 'numeric', month: 'long' })}
              {nextZodiac ? ` · ${nextZodiac.name}` : ''}
            </p>
          </button>
          <button
            onClick={() => onGifts(next)}
            className="mt-5 w-full flex items-center justify-between rounded-full bg-pop-fg text-pop px-5 py-3.5 text-[15px] font-semibold active:opacity-90"
          >
            Ideas de regalo <ArrowRight size={18} />
          </button>
        </section>
      )}

      <div className="mt-7 mb-1 flex items-center justify-between gap-3 min-h-10">
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
            <button onClick={() => setSearching(true)} aria-label="Buscar" className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-fg/70 active:bg-surface-2">
              <Search size={17} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

      {list.length === 0 && <p className="text-center text-mute py-10">No hay nadie con ese nombre.</p>}

      <ul>
        {list.map((f, i) => {
          const days = daysUntil(f.birthday);
          const zodiac = getZodiacSign(f.birthday);
          const label = monthLabel(f);
          const header = grouped && (i === 0 || monthLabel(list[i - 1]) !== label);
          return (
            <li key={f.id} className={header ? '' : 'border-t border-line'}>
              {header && <p className={`eyebrow pb-1 ${i === 0 ? 'pt-2' : 'pt-6'}`}>{label}</p>}
              <button onClick={() => setOpen(f)} className="w-full flex items-center gap-3.5 py-3 text-left active:opacity-60">
                <Avatar src={f.photo} name={f.name} lastName={f.lastName} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold tracking-[-0.01em] truncate">
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

      <button
        onClick={() => downloadIcs(friends)}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-full bg-surface px-5 py-3.5 text-[15px] font-semibold active:bg-surface-2"
      >
        <CalendarPlus size={17} strokeWidth={1.8} /> Añadir todos a mi calendario
      </button>
      <p className="mt-2 text-center text-[13px] text-mute">Te avisará el día antes y el mismo día, cada año.</p>

      {open && (
        <FriendSheet friend={open} onClose={() => setOpen(null)} onGifts={act(onGifts)} onEdit={act(onEdit)} onDelete={act(onDelete)} />
      )}
    </div>
  );
}
