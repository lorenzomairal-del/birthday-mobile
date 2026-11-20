import { useEffect, useState, useCallback } from 'react';
import { Gift, Calendar, Users, User, Plus } from 'lucide-react';
import * as store from './lib/storage.js';
import HomeView from './components/HomeView.jsx';
import FriendForm from './components/FriendForm.jsx';
import GiftShop from './components/GiftShop.jsx';
import ConnectingView from './components/ConnectingView.jsx';
import ProfileView from './components/ProfileView.jsx';
import { ConfirmSheet } from './components/ui.jsx';

const TABS = [
  { id: 'home', label: 'Cumpleaños', icon: Calendar },
  { id: 'connecting', label: 'Connecting', icon: Users },
  { id: 'profile', label: 'Mi perfil', icon: User },
];

export default function App() {
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('home');

  const [friends, setFriends] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [connections, setConnections] = useState({ family: [], friends: [], professional: [] });
  const [profile, setProfile] = useState(null);

  const [editing, setEditing] = useState(null); // null | 'new' | friend
  const [shopFor, setShopFor] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadAll = useCallback(() => {
    setFriends(store.load('friends', []));
    setWishlist(store.load('wishlist', []));
    setConnections({ family: [], friends: [], professional: [], ...store.load('connections', {}) });
    setProfile(store.load('profile', null));
  }, []);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => {
        if (r.status === 401) {
          window.location.href = '/login';
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .catch(() => null)
      .then((data) => {
        if (data) setMe(data);
        store.setStorageUser(data?.user);
        loadAll();
        setReady(true);
      });
  }, [loadAll]);

  const persist = (key, setter) => (next) => {
    setter(next);
    store.save(key, next);
  };
  const saveFriends = persist('friends', setFriends);
  const saveWishlist = persist('wishlist', setWishlist);
  const saveConnections = persist('connections', setConnections);
  const saveProfile = persist('profile', setProfile);

  const upsertFriend = (data) => {
    if (data.id) {
      saveFriends(friends.map((f) => (f.id === data.id ? { ...f, ...data } : f)));
    } else {
      saveFriends([...friends, { ...data, id: Date.now().toString(), createdAt: Date.now() }]);
    }
    setEditing(null);
  };

  const deleteFriend = (id) => {
    saveFriends(friends.filter((f) => f.id !== id));
    saveWishlist(wishlist.filter((w) => w.friendId !== id));
    store.remove(`favs-${id}`);
    store.remove(`gift-history-${id}`);
    setDeleting(null);
  };

  if (!ready) {
    return <div className="min-h-dvh flex items-center justify-center text-violet-400"><Gift size={40} className="animate-pulse" /></div>;
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-lg border-b border-gray-100 pt-safe">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shrink-0">
              <Gift className="text-white" size={19} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[17px] font-extrabold text-brand leading-tight">Birthday Gifts</h1>
              <p className="text-[11px] text-gray-500 leading-tight truncate">Nunca olvides un cumpleaños</p>
            </div>
          </div>
          {view === 'home' && (
            <button
              onClick={() => setEditing('new')}
              className="bg-brand text-white pl-3 pr-4 h-9 rounded-full text-sm font-bold flex items-center gap-1.5 shrink-0 active:opacity-90"
            >
              <Plus size={17} /> Añadir
            </button>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-4 pb-[calc(88px+env(safe-area-inset-bottom))]">
        {view === 'home' && (
          <HomeView
            friends={friends}
            onAdd={() => setEditing('new')}
            onEdit={setEditing}
            onDelete={setDeleting}
            onGifts={setShopFor}
          />
        )}
        {view === 'connecting' && <ConnectingView connections={connections} onChange={saveConnections} />}
        {view === 'profile' && (
          <ProfileView
            me={me}
            profile={profile}
            onSaveProfile={saveProfile}
            wishlist={wishlist}
            onChangeWishlist={saveWishlist}
            friends={friends}
            onImported={loadAll}
          />
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-100 pb-safe">
        <div className="max-w-xl mx-auto grid grid-cols-3">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setView(id);
                  window.scrollTo({ top: 0 });
                }}
                className={`flex flex-col items-center gap-0.5 pt-2.5 pb-2 text-[11px] font-semibold transition ${
                  active ? 'text-violet-600' : 'text-gray-400'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={`px-4 py-1 rounded-full ${active ? 'bg-violet-100' : ''}`}>
                  <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {editing && (
        <FriendForm friend={editing === 'new' ? null : editing} onSave={upsertFriend} onClose={() => setEditing(null)} />
      )}
      {shopFor && (
        <GiftShop friend={shopFor} aiEnabled={me?.ai} wishlist={wishlist} onChangeWishlist={saveWishlist} onClose={() => setShopFor(null)} />
      )}
      {deleting && (
        <ConfirmSheet
          title={`¿Eliminar a ${deleting.name}?`}
          text="Se borrarán sus datos, favoritos y regalos guardados. No se puede deshacer."
          requireWord="Eliminar"
          onConfirm={() => deleteFriend(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
