import { useRef, useState } from 'react';
import { Gift, Pencil, Star, Trash2, ExternalLink, Send, LogOut, Download, Upload, Mail, MapPin, Heart } from 'lucide-react';
import { getZodiacSign, formatDayMonth } from '../lib/zodiac.js';
import * as store from '../lib/storage.js';
import { Field, inputClass, Button, Avatar, PhotoPicker, ConfirmSheet } from './ui.jsx';
import { inviteText } from './ConnectingView.jsx';
import { whatsappLinkProps } from '../lib/whatsapp.js';
import CityInput from './CityInput.jsx';


const EMPTY = { name: '', lastName: '', birthday: '', email: '', location: '', interests: '', photo: '' };

export default function ProfileView({ me, profile, onSaveProfile, wishlist, onChangeWishlist, friends, onImported }) {
  const [editing, setEditing] = useState(!profile);
  const [data, setData] = useState({ ...EMPTY, ...(profile || {}) });
  const [removing, setRemoving] = useState(null);
  const fileRef = useRef(null);
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });

  const shown = editing ? data : profile;
  const zodiac = getZodiacSign(shown?.birthday);
  const friendName = (id) => friends.find((f) => f.id === id)?.name;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(store.exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `birthday-gifts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (file) => {
    try {
      store.importAll(JSON.parse(await file.text()));
      onImported();
      const p = store.load('profile', null);
      if (p) {
        setData({ ...EMPTY, ...p });
        setEditing(false);
      }
      alert('Datos importados correctamente.');
    } catch {
      alert('Ese archivo no es una copia válida de la app.');
    }
  };

  return (
    <div className="space-y-4">

      <section className="bg-ink rounded-3xl p-5 border border-line">
        {editing ? (
          <div className="space-y-4">
            <PhotoPicker value={data.photo} onChange={(photo) => setData({ ...data, photo })} />
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4">
              <Field label="Nombre">
                <input className={inputClass} value={data.name} onChange={set('name')} placeholder="Ej: María" />
              </Field>
              <Field label="Apellido">
                <input className={inputClass} value={data.lastName} onChange={set('lastName')} placeholder="Ej: García" />
              </Field>
            </div>
            <Field label="Fecha de cumpleaños">
              <input type="date" className={`${inputClass} min-h-[50px]`} value={data.birthday} onChange={set('birthday')} />
            </Field>
            {zodiac && (
              <div className="px-3 py-2 rounded-xl bg-surface text-sm">
                <span className="font-semibold">
                  {zodiac.emoji} {zodiac.name} · {zodiac.element}
                </span>
                <span className="block text-xs text-mute">{zodiac.traits}</span>
              </div>
            )}
            <Field label="Email" hint="(solo visible para ti)">
              <input type="email" inputMode="email" className={inputClass} value={data.email} onChange={set('email')} placeholder="Ej: maria@email.com" />
            </Field>
            <Field label="Ciudad">
              <CityInput value={data.location} onChange={(location) => setData({ ...data, location })} />
            </Field>
            <Field label="Intereses y hobbies">
              <textarea className={inputClass} rows={3} value={data.interests} onChange={set('interests')} placeholder="Ej: fotografía, viajar, cocina italiana..." />
            </Field>
            <div className="flex gap-3">
              {profile && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setData({ ...EMPTY, ...profile });
                    setEditing(false);
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={() => {
                  onSaveProfile(data);
                  setEditing(false);
                }}
              >
                Guardar perfil
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4">
              <Avatar src={profile.photo} size={72} className="ring-4 ring-line" />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold truncate">
                  {profile.name || 'Sin nombre'} {profile.lastName}
                </h3>
                {zodiac && (
                  <p className="text-sm text-mute">
                    {zodiac.emoji} {zodiac.name} · {formatDayMonth(profile.birthday)}
                  </p>
                )}
              </div>
              <button onClick={() => setEditing(true)} aria-label="Editar perfil" className="p-2.5 rounded-xl bg-fg/[0.06] text-fg">
                <Pencil size={18} />
              </button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {profile.email && (
                <div className="flex items-center gap-2.5 p-3 bg-fg/[0.04] rounded-xl">
                  <Mail size={16} className="text-mute shrink-0" />
                  <dd className="truncate">{profile.email}</dd>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2.5 p-3 bg-fg/[0.04] rounded-xl">
                  <MapPin size={16} className="text-mute shrink-0" />
                  <dd>{profile.location}</dd>
                </div>
              )}
              {profile.interests && (
                <div className="flex items-start gap-2.5 p-3 bg-fg/[0.04] rounded-xl">
                  <Heart size={16} className="text-mute shrink-0 mt-0.5" />
                  <dd>{profile.interests}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </section>

      <section className="bg-ink rounded-3xl p-5 border border-line">
        <h4 className="font-bold text-fg flex items-center gap-2 mb-3">
          <Star size={18} className="text-fg fill-pop" /> Mi wishlist ({wishlist.length})
        </h4>
        {wishlist.length === 0 ? (
          <p className="text-sm text-mute">Marca con la estrella las ideas de regalo que quieras guardar aquí.</p>
        ) : (
          <ul className="space-y-2.5">
            {wishlist.map((item) => (
              <li key={`${item.id}-${item.friendId}`} className="flex gap-3 p-2.5 rounded-2xl bg-surface">
                {item.image ? (
                  <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-fg/[0.08] shrink-0 flex items-center justify-center text-mute"><Gift size={22} strokeWidth={1.5} /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-fg line-clamp-2">{item.name}</p>
                  <p className="text-xs text-mute">
                    {item.price}
                    {(item.friendName || friendName(item.friendId)) && ` · para ${item.friendName || friendName(item.friendId)}`}
                  </p>
                  <div className="flex gap-2 mt-1.5">
                    <a href={item.link || 'https://www.amazon.es'} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-accent flex items-center gap-1">
                      <ExternalLink size={13} /> Ver producto
                    </a>
                    <button onClick={() => setRemoving(item)} className="text-xs font-semibold text-red-700 flex items-center gap-1 ml-2">
                      <Trash2 size={13} /> Quitar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl p-5 bg-ink border border-line">
        <h4 className="font-bold text-fg flex items-center gap-2">
          <Send size={18} className="text-fg" /> Invita a tus amigos
        </h4>
        <p className="text-sm text-fg/70 mt-1 mb-3">Comparte la app con familia y amigos. Necesitarán un usuario para entrar.</p>
        <a
          {...whatsappLinkProps('', inviteText())}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold bg-surface text-fg active:bg-surface-2"
        >
          <Send size={18} /> Invitar por WhatsApp
        </a>
      </section>

      {!(window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone) && (
        <section className="rounded-3xl p-5 bg-ink border border-line">
          <h4 className="font-bold text-fg">Tenla como app</h4>
          <p className="text-sm text-mute mt-1">
            <span className="text-fg font-medium">iPhone:</span> en Safari, toca Compartir y luego «Añadir a pantalla de inicio».
          </p>
          <p className="text-sm text-mute mt-1">
            <span className="text-fg font-medium">Android:</span> en Chrome, abre el menú ⋮ y toca «Instalar aplicación».
          </p>
        </section>
      )}

      <section className="bg-ink rounded-3xl p-5 border border-line">
        <h4 className="font-bold text-fg">Tus datos</h4>
        <p className="text-sm text-mute mt-1 mb-3">
          {me?.user ? `Has entrado como @${me.user}. ` : ''}Se guardan en este navegador. Descarga una copia para pasarlos a otro móvil u ordenador.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={exportData}>
            <Download size={17} /> Exportar
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload size={17} /> Importar
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importData(f);
            e.target.value = '';
          }}
        />
        {me?.user && (
          <form method="post" action="/logout" className="mt-3">
            <Button variant="secondary" type="submit" className="w-full !text-red-700">
              <LogOut size={17} /> Cerrar sesión
            </Button>
          </form>
        )}
      </section>

      {removing && (
        <ConfirmSheet
          title="¿Quitar de la wishlist?"
          text={`Se quitará "${removing.name}" de tu wishlist.`}
          confirmLabel="Quitar"
          onConfirm={() => {
            onChangeWishlist(wishlist.filter((w) => !(w.id === removing.id && w.friendId === removing.friendId)));
            setRemoving(null);
          }}
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
}
