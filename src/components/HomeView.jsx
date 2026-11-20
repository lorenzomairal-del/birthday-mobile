import { useMemo, useState } from 'react';
import { Gift, Search, Pencil, Trash2, Calendar, X, PartyPopper } from 'lucide-react';
import { daysUntil, formatDayMonth, getZodiacSign, turningAge } from '../lib/zodiac.js';
import { Avatar, Button, EmptyState, Segmented } from './ui.jsx';

function DaysBadge({ days }) {
  if (days === 0) return <span className="px-2.5 py-1 rounded-full bg-brand text-white text-xs font-bold">¡Hoy!</span>;
  const soon = days <= 7;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${soon ? 'bg-pink-100 text-pink-700' : 'bg-violet-50 text-violet-700'}`}>
      {days === 1 ? 'Mañana' : `${days} días`}
    </span>
  );
}

export default function HomeView({ friends, onAdd, onEdit, onDelete, onGifts }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');

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
        icon={<Gift className="text-violet-400" size={44} />}
        title="Aún no hay cumpleaños"
        text="Añade a tus amigos y familia para empezar"
        action={<Button onClick={onAdd}>Añadir persona</Button>}
      />
    );
  }

  const next = [...friends].sort((a, b) => daysUntil(a.birthday) - daysUntil(b.birthday))[0];
  const nextDays = daysUntil(next.birthday);
  const nextAge = turningAge(next.birthday);

  return (
    <div className="space-y-4">
      {!search && (
        <button
          onClick={() => onGifts(next)}
          className="w-full text-left rounded-3xl p-5 bg-brand text-white shadow-lg shadow-pink-200/60 relative overflow-hidden"
        >
          <PartyPopper className="absolute -right-3 -bottom-3 text-white/15" size={110} />
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Próximo cumpleaños</p>
          <div className="flex items-center gap-3 mt-2">
            <Avatar src={next.photo} size={52} className="ring-2 ring-white/60" />
            <div className="min-w-0">
              <p className="text-xl font-extrabold truncate">
                {next.name} {next.lastName}
              </p>
              <p className="text-sm text-white/90">
                {formatDayMonth(next.birthday)}
                {nextAge ? ` · cumple ${nextAge}` : ''}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold">
            {nextDays === 0 ? '🎉 ¡Es hoy! ' : nextDays === 1 ? '⏰ Es mañana. ' : `⏳ Faltan ${nextDays} días. `}
            <span className="underline underline-offset-2">Ver ideas de regalo</span>
          </p>
        </button>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
        <input
          type="search"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button onClick={() => setSearch('')} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 font-medium">
          {list.length} persona{list.length === 1 ? '' : 's'}
        </p>
        <Segmented
          value={sort}
          onChange={setSort}
          options={[
            { value: 'date', label: 'Próximos' },
            { value: 'name', label: 'A-Z' },
          ]}
        />
      </div>

      {list.length === 0 && <p className="text-center text-gray-500 py-10">No hay nadie con ese nombre.</p>}

      <ul className="space-y-3">
        {list.map((f) => {
          const days = daysUntil(f.birthday);
          const zodiac = getZodiacSign(f.birthday);
          const age = turningAge(f.birthday);
          return (
            <li key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <Avatar src={f.photo} size={52} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">
                    {f.name} {f.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 flex-wrap">
                    <Calendar size={14} className="shrink-0" />
                    <span>{formatDayMonth(f.birthday)}</span>
                    {age ? <span className="whitespace-nowrap">· cumple {age}</span> : null}
                  </p>
                </div>
                <DaysBadge days={days} />
              </div>

              {zodiac && (
                <div className="mt-3 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-50 to-pink-50 text-sm">
                  <span className="font-semibold text-gray-800">
                    {zodiac.emoji} {zodiac.name} · {zodiac.element}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">{zodiac.traits}</span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <Button className="flex-1 !py-2.5" onClick={() => onGifts(f)}>
                  <Gift size={17} /> Ideas de regalo
                </Button>
                <button onClick={() => onEdit(f)} aria-label={`Editar a ${f.name}`} className="p-2.5 rounded-xl border border-gray-200 text-gray-600 active:bg-gray-50">
                  <Pencil size={18} />
                </button>
                <button onClick={() => onDelete(f)} aria-label={`Eliminar a ${f.name}`} className="p-2.5 rounded-xl border border-gray-200 text-gray-600 active:bg-red-50 active:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
