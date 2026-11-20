import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Users, MessageCircle, Trash2, Send } from 'lucide-react';
import { Sheet, Field, inputClass, Button, Avatar, EmptyState, ConfirmSheet } from './ui.jsx';

const GROUPS = [
  { id: 'family', name: 'Familia', icon: '👨‍👩‍👧‍👦', color: 'from-violet-500 to-pink-500' },
  { id: 'friends', name: 'Amigos', icon: '👥', color: 'from-blue-500 to-cyan-500' },
  { id: 'professional', name: 'Profesional', icon: '💼', color: 'from-green-500 to-emerald-500' },
];

export const inviteText = () =>
  `¡Hola! 🎁 Te invito a Birthday Gifts, una app para no olvidar ningún cumpleaños y encontrar el regalo perfecto: ${window.location.origin}`;

const whatsappLink = (phone, text) =>
  `https://wa.me/${(phone || '').replace(/[^0-9]/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

function AddConnectionSheet({ group, onSave, onClose }) {
  const [data, setData] = useState({ name: '', phone: '', group: group || '' });
  const valid = data.name.trim() && data.phone.trim() && data.group;
  return (
    <Sheet
      title="Añadir persona"
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" disabled={!valid} onClick={() => onSave(data)}>
            Guardar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Nombre completo">
          <input className={inputClass} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="Ej: María García" />
        </Field>
        <Field label="Teléfono (con prefijo)">
          <input type="tel" inputMode="tel" className={inputClass} value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} placeholder="Ej: +34 612 345 678" />
        </Field>
        <Field label="Grupo">
          <div className="grid grid-cols-3 gap-2">
            {GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setData({ ...data, group: g.id })}
                className={`rounded-xl border py-3 text-sm font-semibold ${
                  data.group === g.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                <span className="block text-xl mb-0.5">{g.icon}</span>
                {g.name}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </Sheet>
  );
}

export default function ConnectingView({ connections, onChange }) {
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(null); // null | '' | groupId
  const [removing, setRemoving] = useState(null);

  const add = (data) => {
    const item = { name: data.name.trim(), phone: data.phone.trim(), id: Date.now().toString(), status: 'Pendiente' };
    onChange({ ...connections, [data.group]: [...(connections[data.group] || []), item] });
    setAdding(null);
  };

  const remove = (groupId, id) => {
    onChange({ ...connections, [groupId]: (connections[groupId] || []).filter((m) => m.id !== id) });
    setRemoving(null);
  };

  const sheets = (
    <>
      {adding !== null && <AddConnectionSheet group={adding} onSave={add} onClose={() => setAdding(null)} />}
      {removing && (
        <ConfirmSheet
          title={`¿Quitar a ${removing.member.name}?`}
          text="Se quitará de este grupo."
          confirmLabel="Quitar"
          onConfirm={() => remove(removing.group, removing.member.id)}
          onClose={() => setRemoving(null)}
        />
      )}
    </>
  );

  if (selected) {
    const group = GROUPS.find((g) => g.id === selected);
    const members = connections[selected] || [];
    return (
      <div>
        <button onClick={() => setSelected(null)} className="mb-3 -ml-1 flex items-center gap-1 text-violet-700 font-semibold py-1">
          <ChevronLeft size={20} /> Grupos
        </button>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl font-extrabold">
            {group.icon} {group.name}
          </h2>
          <Button className="!py-2 !px-3 text-sm" onClick={() => setAdding(selected)}>
            <Plus size={17} /> Añadir
          </Button>
        </div>
        {members.length ? (
          <ul className="space-y-2.5">
            {members.map((m) => (
              <li key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
                <Avatar size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.phone}</p>
                </div>
                <a
                  href={whatsappLink(m.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp a ${m.name}`}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <MessageCircle size={16} /> <span className="hidden min-[400px]:inline">WhatsApp</span>
                </a>
                <button onClick={() => setRemoving({ group: selected, member: m })} aria-label={`Quitar a ${m.name}`} className="p-2 text-gray-400">
                  <Trash2 size={17} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Users className="text-violet-400" size={40} />}
            title="Grupo vacío"
            text="Añade a la primera persona de este grupo"
            action={<Button onClick={() => setAdding(selected)}>Añadir persona</Button>}
          />
        )}
        {sheets}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-brand">Mis conexiones</h2>

      <ul className="space-y-2.5">
        {GROUPS.map((g) => {
          const count = (connections[g.id] || []).length;
          return (
            <li key={g.id}>
              <button
                onClick={() => setSelected(g.id)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 text-left active:bg-gray-50"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center text-2xl shrink-0`}>{g.icon}</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{g.name}</p>
                  <p className="text-sm text-gray-500">
                    {count} persona{count === 1 ? '' : 's'}
                  </p>
                </div>
                <ChevronRight className="text-gray-300" />
              </button>
            </li>
          );
        })}
      </ul>

      <Button className="w-full" onClick={() => setAdding('')}>
        <Plus size={19} /> Añadir persona a un grupo
      </Button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(inviteText())}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold bg-green-500 text-white"
      >
        <Send size={18} /> Invitar por WhatsApp
      </a>
      {sheets}
    </div>
  );
}
