import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Users, MessageCircle, Trash2, Send } from 'lucide-react';
import { whatsappLinkProps } from '../lib/whatsapp.js';
import { Sheet, Field, inputClass, Button, Avatar, EmptyState, ConfirmSheet } from './ui.jsx';

const GROUPS = [
  { id: 'family', name: 'Familia', icon: '👨‍👩‍👧‍👦', color: 'from-violet-500 to-pink-500' },
  { id: 'friends', name: 'Amigos', icon: '👥', color: 'from-blue-500 to-cyan-500' },
  { id: 'professional', name: 'Profesional', icon: '💼', color: 'from-green-500 to-emerald-500' },
];

export const inviteText = () =>
  `¡Hola! Te invito a Cumpleaños, una app para no olvidar ningún cumpleaños y encontrar el regalo perfecto: ${window.location.origin}`;


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
                  data.group === g.id ? 'border-violet-500 bg-fg/[0.06] text-fg' : 'border-line text-fg/70'
                }`}
              >
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
        <button onClick={() => setSelected(null)} className="mb-3 -ml-1 flex items-center gap-1 text-fg/70 font-semibold py-1">
          <ChevronLeft size={20} /> Grupos
        </button>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-[26px] font-bold tracking-[-0.03em] leading-none">
            {group.name}
          </h2>
          <Button className="!py-2 !px-3 text-sm" onClick={() => setAdding(selected)}>
            <Plus size={17} /> Añadir
          </Button>
        </div>
        {members.length ? (
          <ul className="space-y-2.5">
            {members.map((m) => (
              <li key={m.id} className="bg-surface rounded-2xl p-3 flex items-center gap-3">
                <Avatar size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-fg truncate">{m.name}</p>
                  <p className="text-xs text-mute truncate">{m.phone}</p>
                </div>
                <a
                  {...whatsappLinkProps(m.phone)}
                  aria-label={`WhatsApp a ${m.name}`}
                  className="px-3 py-2 bg-ink text-fg rounded-full text-sm font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <MessageCircle size={16} /> <span className="hidden min-[400px]:inline">WhatsApp</span>
                </a>
                <button onClick={() => setRemoving({ group: selected, member: m })} aria-label={`Quitar a ${m.name}`} className="p-2 text-mute">
                  <Trash2 size={17} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Users className="text-mute" size={40} />}
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

      <ul className="space-y-2.5">
        {GROUPS.map((g) => {
          const count = (connections[g.id] || []).length;
          return (
            <li key={g.id}>
              <button
                onClick={() => setSelected(g.id)}
                className="w-full bg-surface rounded-2xl p-4 flex items-center gap-4 text-left active:bg-surface-2"
              >
                <span className="w-11 h-11 rounded-full bg-pop text-pop-fg flex items-center justify-center text-lg font-bold shrink-0">{count}</span>
                <div className="flex-1">
                  <p className="font-bold text-fg">{g.name}</p>
                  <p className="text-sm text-mute">
                    {count === 1 ? 'persona' : 'personas'}
                  </p>
                </div>
                <ChevronRight className="text-line" />
              </button>
            </li>
          );
        })}
      </ul>

      <Button className="w-full" onClick={() => setAdding('')}>
        <Plus size={19} /> Añadir persona a un grupo
      </Button>
      <a
        {...whatsappLinkProps('', inviteText())}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold bg-surface text-fg active:bg-surface-2"
      >
        <Send size={18} /> Invitar por WhatsApp
      </a>
      {sheets}
    </div>
  );
}
