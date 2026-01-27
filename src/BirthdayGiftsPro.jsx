import React, { useState, useEffect } from 'react';
import { Gift, User, Calendar, ShoppingBag, X, Search, Trash2, Heart, Star, Users, Eye, Plus, Send, Edit, ArrowUpDown, Camera, ChevronLeft } from 'lucide-react';

const ZODIAC_SIGNS = {
  aries: { name: 'Aries', emoji: '♈', element: 'Fuego', traits: 'Aventurero, apasionado, líder natural' },
  tauro: { name: 'Tauro', emoji: '♉', element: 'Tierra', traits: 'Leal, paciente, amante del confort' },
  geminis: { name: 'Géminis', emoji: '♊', element: 'Aire', traits: 'Comunicativo, versátil, curioso' },
  cancer: { name: 'Cáncer', emoji: '♋', element: 'Agua', traits: 'Empático, protector, emocional' },
  leo: { name: 'Leo', emoji: '♌', element: 'Fuego', traits: 'Carismático, generoso, creativo' },
  virgo: { name: 'Virgo', emoji: '♍', element: 'Tierra', traits: 'Detallista, práctico, analítico' },
  libra: { name: 'Libra', emoji: '♎', element: 'Aire', traits: 'Equilibrado, diplomático, sociable' },
  escorpio: { name: 'Escorpio', emoji: '♏', element: 'Agua', traits: 'Intenso, leal, transformador' },
  sagitario: { name: 'Sagitario', emoji: '♐', element: 'Fuego', traits: 'Optimista, aventurero, filosófico' },
  capricornio: { name: 'Capricornio', emoji: '♑', element: 'Tierra', traits: 'Ambicioso, disciplinado, responsable' },
  acuario: { name: 'Acuario', emoji: '♒', element: 'Aire', traits: 'Innovador, independiente, humanitario' },
  piscis: { name: 'Piscis', emoji: '♓', element: 'Agua', traits: 'Soñador, empático, artístico' }
};

const COUNTRIES = [
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' }
];

const getZodiacSign = (date) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS.aries;
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS.tauro;
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS.geminis;
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS.cancer;
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS.leo;
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS.virgo;
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS.libra;
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS.escorpio;
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS.sagitario;
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS.capricornio;
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS.acuario;
  return ZODIAC_SIGNS.piscis;
};
export default function BirthdayGiftsPro() {
  const storage = {
    get: async (key) => {
      try {
        if (window?.storage?.get) return await window.storage.get(key);
        const raw = localStorage.getItem(key);
        return raw ? { value: raw } : null;
      } catch (e) {
        return null;
      }
    },
    set: async (key, value) => {
      try {
        if (window?.storage?.set) return await window.storage.set(key, value);
        localStorage.setItem(key, value);
      } catch (e) {
        // ignore
      }
    }
  };

  const [view, setView] = useState('home');
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');

  const [wishlist, setWishlist] = useState([]);
  const [connections, setConnections] = useState({ family: [], friends: [], professional: [] });
  const [profile, setProfile] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showShop, setShowShop] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const f = await storage.get('friends');
        if (f?.value) setFriends(JSON.parse(f.value));

        const w = await storage.get('wishlist');
        if (w?.value) setWishlist(JSON.parse(w.value));

        const c = await storage.get('connections');
        if (c?.value) setConnections(JSON.parse(c.value));

        const p = await storage.get('profile');
        if (p?.value) setProfile(JSON.parse(p.value));
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const persistFriends = async (next) => {
    setFriends(next);
    await storage.set('friends', JSON.stringify(next));
  };

  const persistWishlist = async (next) => {
    setWishlist(next);
    await storage.set('wishlist', JSON.stringify(next));
  };

  // Keep the existing signature used by children
  const getDays = (birthday) => {
    if (!birthday) return 0;
    const now = new Date();
    const b = new Date(birthday);
    const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
    if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      next.setFullYear(now.getFullYear() + 1);
    }
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const end = new Date(next.getFullYear(), next.getMonth(), next.getDate()).getTime();
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  const saveFriend = async (data) => {
    const newFriend = {
      ...data,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    const next = [...friends, newFriend];
    await persistFriends(next);
    setShowAdd(false);
  };

  const updateFriend = async (data) => {
    if (!data?.id) return;
    const next = friends.map((f) => (f.id === data.id ? { ...f, ...data } : f));
    await persistFriends(next);
    setShowEdit(null);
  };

  const deleteFriend = async (friendId) => {
    const nextFriends = friends.filter((f) => f.id !== friendId);
    await persistFriends(nextFriends);

    // Remove wishlist items linked to that friend
    const nextWishlist = wishlist.filter((w) => w.friendId !== friendId);
    await persistWishlist(nextWishlist);

    // Cleanup per-friend storage used in GiftShop
    try {
      localStorage.removeItem(`favs-${friendId}`);
      localStorage.removeItem(`gift-history-${friendId}`);
    } catch (e) {
      // ignore
    }

    setShowDeleteModal(null);
  };

  const filtered = [...friends]
    .filter((f) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return `${f.name || ''} ${f.lastName || ''}`.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === 'name') {
        return `${a.name || ''} ${a.lastName || ''}`.localeCompare(`${b.name || ''} ${b.lastName || ''}`, 'es');
      }
      // sort === 'date' : by next upcoming birthday
      return getDays(a.birthday) - getDays(b.birthday);
    });
  return (
  <div className="app-shell">
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="bg-white/95 backdrop-blur sticky top-0 z-40 shadow-lg border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Birthday Gifts Pro
              </h1>
              <p className="text-xs text-gray-600 font-medium">Nunca olvides un cumpleaños</p>
            </div>
          </div>

          {view === 'home' && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Añadir
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 pb-24">
        {view === 'home' && (
          <HomeView
            friends={filtered}
            search={search}
            setSearch={setSearch}
            getDays={getDays}
            deleteFriend={deleteFriend}
            setShowShop={setShowShop}
            setShowEdit={setShowEdit}
            setShowDeleteModal={setShowDeleteModal}
            sort={sort}
            setSort={setSort}
          />
        )}

        {view === 'connecting' && (
          <ConnectingView
            connections={connections}
            setConnections={async (c) => {
              setConnections(c);
              await storage.set('connections', JSON.stringify(c));
            }}
            friends={friends}
            wishlist={wishlist}
          />
        )}

        {view === 'profile' && (
          <ProfileView
            profile={profile}
            setProfile={async (p) => {
              setProfile(p);
              await storage.set('profile', JSON.stringify(p));
            }}
            wishlist={wishlist}
            setWishlist={async (w) => {
              await persistWishlist(w);
            }}
          />
        )}
      </div>

      {showAdd && <WizardModal onSave={saveFriend} onClose={() => setShowAdd(false)} />}
      {showEdit && <WizardModal friend={showEdit} onSave={updateFriend} onClose={() => setShowEdit(null)} isEdit />}
      {showShop && (
        <GiftShop
          friend={showShop}
          wishlist={wishlist}
          setWishlist={async (w) => {
            await persistWishlist(w);
          }}
          onClose={() => setShowShop(null)}
        />
      )}
      {showDeleteModal && (
        <DeleteModal friend={showDeleteModal} onDelete={deleteFriend} onClose={() => setShowDeleteModal(null)} />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur z-50 shadow-2xl border-t">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-around">
          <button
            onClick={() => {
              setShowShop(null);
              setView('home');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              view === 'home' ? 'text-purple-600 scale-110' : 'text-gray-400'
            }`}
          >
            <Calendar size={24} />
            <span className="text-xs font-semibold">Cumpleaños</span>
          </button>

          <button
            onClick={() => {
              setShowShop(null);
              setView('connecting');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              view === 'connecting' ? 'text-purple-600 scale-110' : 'text-gray-400'
            }`}
          >
            <Users size={24} />
            <span className="text-xs font-semibold">Connecting</span>
          </button>

          <button
            onClick={() => {
              setShowShop(null);
              setView('profile');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              view === 'profile' ? 'text-purple-600 scale-110' : 'text-gray-400'
            }`}
          >
            <User size={24} />
            <span className="text-xs font-semibold">Mi Perfil</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
function HomeView({ friends, search, setSearch, getDays, deleteFriend, setShowShop, setShowEdit, setShowDeleteModal, sort, setSort }) {
  const [showSort, setShowSort] = useState(false);

  if (!friends.length && !search) {
    return (
      <div className="text-center py-20">
        <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
          <Gift className="text-purple-400" size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">No hay cumpleaños guardados</h2>
        <p className="text-gray-600">Añade a tus amigos para comenzar</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input type="text" placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-12 py-3 bg-white/95 backdrop-blur border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <Search className="absolute right-4 top-3 text-gray-400" size={20} />
        </div>
        <div className="relative">
          <button onClick={() => setShowSort(!showSort)} className="px-4 py-3 bg-white/95 border rounded-xl hover:shadow-md flex items-center gap-2 font-semibold text-gray-700">
            <ArrowUpDown size={18} />Ordenar
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl z-10 min-w-[200px] border">
              <button onClick={() => { setSort('date'); setShowSort(false); }} className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-2 ${sort === 'date' ? 'bg-purple-50 text-purple-700 font-bold' : ''}`}>
                <Calendar size={16} />Por fecha
              </button>
              <button onClick={() => { setSort('name'); setShowSort(false); }} className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors ${sort === 'name' ? 'bg-purple-50 text-purple-700 font-bold' : ''}`}>
                🔤 Alfabético
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {friends.map(f => {
          const days = getDays(f.birthday);
          const zodiac = getZodiacSign(f.birthday);
          return (
            <div key={f.id} className="bg-white/95 backdrop-blur border border-gray-200 rounded-2xl p-5 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <User className="text-purple-400" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{f.name} {f.lastName}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {new Date(f.birthday).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-sm font-medium text-purple-600">
                    {days === 0 ? '🎉 ¡Hoy es su cumpleaños!' : `Faltan ${days} día${days === 1 ? '' : 's'}`}
                  </p>
                  <div className="mt-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <span className="text-xl">{zodiac.emoji}</span>
                      {zodiac.name} • {zodiac.element}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{zodiac.traits}</p>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => setShowEdit(f)} className="text-xs text-gray-700 hover:text-purple-600 flex items-center gap-1 font-medium">
                      <Edit size={12} />Editar
                    </button>
                    <button onClick={() => setShowDeleteModal(f)} className="text-xs text-gray-700 hover:text-red-600 flex items-center gap-1 font-medium">
                      <Trash2 size={12} />Eliminar
                    </button>
                  </div>
                </div>
                <button onClick={() => setShowShop(f)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2">
                  <ShoppingBag size={16} />Ver Regalos
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WizardModal({ friend, onSave, onClose, isEdit }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(friend || { name: '', lastName: '', birthday: '', gender: '', location: '', interests: '', hobbies: '', favoriteFood: '', style: '', budget: '', relationship: '', photo: '' });

  const handleSave = () => {
    if (data.name && data.birthday) {
      onSave(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold">{isEdit ? 'Editar' : 'Añadir'} Persona</h3>
            <p className="text-sm text-gray-500">Paso {step} de 3</p>
          </div>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {step === 1 && (
            <>
              <div className="text-center mb-4">
                <h4 className="text-base font-bold text-gray-800">📋 Información Básica</h4>
              </div>
              
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {data.photo ? (
                    <img src={data.photo} alt="Foto" className="w-20 h-20 rounded-full object-cover border-4 border-purple-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-4 border-purple-200">
                      <User className="text-purple-400" size={32} />
                    </div>
                  )}
                  <button type="button" onClick={() => document.getElementById('photoInput').click()} className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full hover:bg-purple-700 shadow-lg">
                    <Camera size={14} />
                  </button>
                  <input id="photoInput" type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setData({...data, photo: reader.result});
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre *</label>
                <input type="text" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} placeholder="Ej: María" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Apellido</label>
                <input type="text" value={data.lastName} onChange={(e) => setData({...data, lastName: e.target.value})} placeholder="Ej: García" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha de cumpleaños *</label>
                <input type="date" value={data.birthday} onChange={(e) => setData({...data, birthday: e.target.value})} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Género</label>
                <select value={data.gender} onChange={(e) => setData({...data, gender: e.target.value})} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Seleccionar...</option>
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                  <option value="other">Prefiero no especificarlo</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-4">
                <h4 className="text-base font-bold text-gray-800">🎯 Gustos e Intereses</h4>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ciudad</label>
                <input type="text" value={data.location} onChange={(e) => setData({...data, location: e.target.value})} placeholder="Ej: Madrid" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Intereses</label>
                <textarea value={data.interests} onChange={(e) => setData({...data, interests: e.target.value})} placeholder="Ej: Tecnología, fotografía, viajes..." rows="3" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Hobbies</label>
                <textarea value={data.hobbies} onChange={(e) => setData({...data, hobbies: e.target.value})} placeholder="Ej: Leer, hacer deporte, cocinar..." rows="3" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-4">
                <h4 className="text-base font-bold text-gray-800">🎁 Preferencias de Regalos</h4>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Comida favorita</label>
                <input type="text" value={data.favoriteFood} onChange={(e) => setData({...data, favoriteFood: e.target.value})} placeholder="Ej: Pizza, sushi, pasta..." className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Estilo personal</label>
                <select value={data.style} onChange={(e) => setData({...data, style: e.target.value})} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Seleccionar estilo...</option>
                  <option value="casual">Casual</option>
                  <option value="deportivo">Deportivo</option>
                  <option value="elegante">Elegante</option>
                  <option value="formal">Formal</option>
                  <option value="bohemio">Bohemio</option>
                  <option value="minimalista">Minimalista</option>
                  <option value="urbano">Urbano</option>
                  <option value="vintage">Vintage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Presupuesto habitual para regalos</label>
                <select value={data.budget} onChange={(e) => setData({...data, budget: e.target.value})} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Seleccionar presupuesto...</option>
                  <option value="low">Hasta €20</option>
                  <option value="medium-low">€20-€50</option>
                  <option value="medium">€50-€100</option>
                  <option value="medium-high">€100-€200</option>
                  <option value="high">€200-€500</option>
                  <option value="premium">Más de €500</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Relación</label>
                <select value={data.relationship} onChange={(e) => setData({...data, relationship: e.target.value})} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Seleccionar relación...</option>
                  <option value="family">Familiar</option>
                  <option value="friend">Amigo/a</option>
                  <option value="partner">Pareja</option>
                  <option value="coworker">Compañero/a de trabajo</option>
                  <option value="acquaintance">Conocido/a</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50">
              Atrás
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 1 && (!data.name || !data.birthday)} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50">
              Siguiente
            </button>
          ) : (
            <button onClick={handleSave} disabled={!data.name || !data.birthday} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50">
              Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function GiftShop({ friend, wishlist, setWishlist, onClose }) {
  const [favs, setFavs] = useState([]);
  const [allGiftPages, setAllGiftPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [giftIdeas, setGiftIdeas] = useState([]);
  const [showFavs, setShowFavs] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const toggleWishlist = async (g) => {
    const itemWithFriend = { ...g, friendId: friend.id };
    const isInWishlist = wishlist.some(w => w.id === g.id && w.friendId === friend.id);
    const updated = isInWishlist ? wishlist.filter(w => !(w.id === g.id && w.friendId === friend.id)) : [...wishlist, itemWithFriend];
    setWishlist(updated);
  };

  useEffect(() => {
    const load = async () => {
      let historyLoaded = false;
      try {
        const data = await window.storage.get(`favs-${friend.id}`);
        if (data) setFavs(JSON.parse(data.value));
        
        const historyData = await window.storage.get(`gift-history-${friend.id}`);
        if (historyData) {
          const saved = JSON.parse(historyData.value);
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          if (saved.timestamp > sevenDaysAgo) {
            setAllGiftPages(saved.pages);
            setCurrentPage(saved.currentPage || 0);
            setGiftIdeas(saved.pages[saved.currentPage || 0] || []);
            setChatHistory(saved.chatHistory || []);
            historyLoaded = true;
          }
        }
      } catch (e) {
        console.log('Error loading history:', e);
      }
      
      if (!historyLoaded) {
        const initialGifts = [
          { id: 1, name: "Auriculares Sony WH-1000XM5", description: "Cancelación de ruido líder en la industria con 30 horas de batería y calidad de audio excepcional", price: "€299-€379", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", link: "https://www.amazon.es/dp/B0BXNWST16" },
          { id: 2, name: "Set Spa Premium Casa", description: "Kit completo de relajación con aceites esenciales, velas aromáticas, sales de baño y mascarillas", price: "€45-€75", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop", link: "https://www.amazon.es/s?k=set+spa+premium" },
          { id: 3, name: "Smartwatch Fitbit Charge 6", description: "Monitor completo de actividad física con GPS integrado, análisis del sueño y seguimiento de frecuencia cardíaca", price: "€139-€179", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", link: "https://www.amazon.es/dp/B0CCQ8RLP7" },
          { id: 4, name: "Bestseller - Atomic Habits", description: "El libro más vendido sobre creación de hábitos y productividad personal del autor James Clear", price: "€18-€25", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop", link: "https://www.amazon.es/dp/0735211299" }
        ];
        setAllGiftPages([initialGifts]);
        setGiftIdeas(initialGifts);
        setCurrentPage(0);
      }
    };
    load();
  }, [friend.id]);

  const toggleFav = async (g) => {
    const isFav = favs.some(f => f.id === g.id);
    const updated = isFav ? favs.filter(f => f.id !== g.id) : [...favs, g];
    setFavs(updated);
    await window.storage.set(`favs-${friend.id}`, JSON.stringify(updated));
  };

  const askAI = async () => {
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg;
    setChatHistory([...chatHistory, { role: 'user', text: userMsg }]);
    setChatMsg('');
    setLoading(true);
    setChatHistory(prev => [...prev, { role: 'assistant', text: '💭 Pensando...' }]);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `4 regalos para ${friend.name}${friend.interests ? ` (le gusta: ${friend.interests})` : ''}. Usuario dice: ${userMsg}. Responde JSON sin markdown: [{"name":"...","description":"80 chars producto","match":"Por qué es perfecto para ${friend.name} (40 chars)","price":"€X-€Y","image":"https://images.unsplash.com/photo-XXXXX?w=400&h=400&fit=crop&q=80","link":"https://amazon.es/dp/CODIGO"}]`
          }]
        })
      });

      const data = await response.json();
      const text = data.content.find(c => c.type === 'text')?.text || '[]';
      const newGifts = JSON.parse(text.replace(/```json|```/g, '').trim());
      
      const giftsWithIds = newGifts.map((g, i) => ({ 
        ...g, 
        id: Date.now() + i, 
        image: g.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        link: g.link || 'https://www.amazon.es',
        match: g.match || `Perfecto para ${friend.name}`
      }));
      
      const updatedPages = [...allGiftPages, giftsWithIds];
      setAllGiftPages(updatedPages);
      setCurrentPage(updatedPages.length - 1);
      setGiftIdeas(giftsWithIds);
      
      const newChatHistory = chatHistory.filter(m => m.text !== '💭 Pensando...').concat([{ role: 'assistant', text: `¡Perfecto! He encontrado ${newGifts.length} ideas personalizadas. Mira abajo 👇` }]);
      setChatHistory(newChatHistory);
      
      await window.storage.set(`gift-history-${friend.id}`, JSON.stringify({
        pages: updatedPages,
        currentPage: updatedPages.length - 1,
        chatHistory: newChatHistory,
        timestamp: Date.now()
      }));
      
      setLoading(false);
    } catch (error) {
      setChatHistory(prev => prev.filter(m => m.text !== '💭 Pensando...'));
      setChatHistory(prev => [...prev, { role: 'assistant', text: '❌ Error al generar ideas. Intenta de nuevo.' }]);
      setLoading(false);
    }
  };

  const generateNewIdeas = async () => {
    setLoading(true);
    setGiftIdeas([]);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `4 regalos originales para ${friend.name}. JSON sin markdown: [{"name":"...","description":"100 chars engagement","price":"€X-€Y","image":"https://images.unsplash.com/photo-X?w=400","link":"https://amazon.es/..."}]`
          }]
        })
      });

      const data = await response.json();
      const text = data.content.find(c => c.type === 'text')?.text || '[]';
      const newGifts = JSON.parse(text.replace(/```json|```/g, '').trim());
      
      const giftsWithIds = newGifts.map((g, i) => ({ 
        ...g, 
        id: Date.now() + i, 
        image: g.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        link: g.link || 'https://www.amazon.es'
      }));
      
      const updatedPages = [...allGiftPages, giftsWithIds];
      setAllGiftPages(updatedPages);
      setCurrentPage(updatedPages.length - 1);
      setGiftIdeas(giftsWithIds);
      setLoading(false);
    } catch (error) {
      const fallback = [
        { id: Date.now()+1, name: "Cafetera Espresso DeLonghi", description: "15 bares de presión con molinillo integrado para café perfecto cada mañana", price: "€119-€199", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop", link: "https://www.amazon.es/s?k=cafetera+espresso+delonghi", match: "Ideal para amantes del café" },
        { id: Date.now()+2, name: "Mochila Viaje Samsonite 40L", description: "Impermeable con compartimento para laptop y puerto USB para cargar dispositivos", price: "€59-€109", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", link: "https://www.amazon.es/s?k=mochila+viaje+samsonite", match: "Perfecta para viajeros" },
        { id: Date.now()+3, name: "Lámpara Philips Hue", description: "16 millones de colores controlables por voz con Alexa y Google Home", price: "€35-€69", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop", link: "https://www.amazon.es/dp/B016H0QU7I", match: "Para los tech lovers" },
        { id: Date.now()+4, name: "Kit Jardinería Profesional", description: "Set completo con herramientas premium, guantes y macetas decorativas", price: "€45-€85", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop", link: "https://www.amazon.es/s?k=kit+jardineria", match: "Perfecto para plant lovers" }
      ];
      const updatedPages = [...allGiftPages, fallback];
      setAllGiftPages(updatedPages);
      setCurrentPage(updatedPages.length - 1);
      setGiftIdeas(fallback);
      setLoading(false);
    }
  };

  const goToPage = async (pageIndex) => {
    setCurrentPage(pageIndex);
    setGiftIdeas(allGiftPages[pageIndex]);
    await window.storage.set(`gift-history-${friend.id}`, JSON.stringify({
      pages: allGiftPages,
      currentPage: pageIndex,
      chatHistory,
      timestamp: Date.now()
    }));
  };

  const normalizeText = (text) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const buildTrackingUrl = (product) => {
    const baseUrl = product.link;
    const utmParams = new URLSearchParams({
      utm_source: 'birthdaygifts_app',
      utm_medium: 'gift_recommendation',
      utm_campaign: `birthday_${normalizeText(friend.name)}`,
      utm_content: `product_${product.id}`,
      utm_term: normalizeText(product.name)
    });
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${utmParams.toString()}`;
  };

  const display = showFavs ? favs : giftIdeas;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl flex flex-col" style={{ maxHeight: '85vh' }}>
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold">🎁 Encuentra el regalo perfecto</h3>
              <p className="text-sm text-gray-600">Para {friend.name} {friend.lastName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-600" />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFavs(false)} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${!showFavs ? 'bg-purple-100 text-purple-700' : 'text-gray-600'}`}>Recomendaciones</button>
            <button onClick={() => setShowFavs(true)} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${showFavs ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}>❤️ Favoritos ({favs.length})</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showFavs && (
            <div className="mb-5">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="space-y-2 mb-3 max-h-24 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <p className="text-sm text-gray-700">💬 Cuéntame qué le gusta a {friend.name} y te ayudaré a encontrar el regalo perfecto...</p>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <p key={i} className={`text-sm ${msg.role === 'user' ? 'text-gray-800 font-medium' : 'text-purple-700'}`}>
                        {msg.role === 'user' ? 'Tú: ' : '💡 '}
                        {msg.text === '💭 Pensando...' ? (
                          <span className="inline-flex items-center gap-1">
                            Analizando
                            <span className="inline-flex gap-0.5">
                              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                            </span>
                          </span>
                        ) : msg.text}
                      </p>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && askAI()} placeholder="Ej: Le encanta el café, los libros..." className="flex-1 px-3 py-2.5 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <button onClick={askAI} disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 hover:shadow-lg transition-all">
                    {loading ? '...' : '✨'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {display.length === 0 && loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          ) : display.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No hay favoritos guardados</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {display.map(g => (
                  <div key={g.id} className="bg-white rounded-xl border border-purple-100 overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100">
                      <img src={g.image} alt={g.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'; }} />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button onClick={() => toggleWishlist(g)} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all">
                          <Star size={18} className={wishlist.some(w => w.id === g.id && w.friendId === friend.id) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'} />
                        </button>
                        <button onClick={() => toggleFav(g)} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all">
                          <Heart size={18} className={favs.some(f => f.id === g.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h5 className="font-bold text-sm mb-1 text-gray-800 line-clamp-1">{g.name}</h5>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2 h-8">{g.description}</p>
                      {g.match && <p className="text-xs text-purple-600 bg-purple-50 rounded px-2 py-1 mb-2 italic">✨ {g.match}</p>}
                      <p className="text-purple-600 font-bold text-sm mb-3">{g.price}</p>
                      <button onClick={() => window.open(buildTrackingUrl(g), '_blank')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all flex items-center justify-center gap-1">
                        <ShoppingBag size={14} />Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {!showFavs && allGiftPages.length > 1 && (
                <div className="flex justify-center gap-2 mb-4">
                  {allGiftPages.map((_, index) => (
                    <button key={index} onClick={() => goToPage(index)} className={`w-8 h-8 rounded-full font-bold text-sm transition-all ${currentPage === index ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
              
              {!showFavs && (
                <button onClick={generateNewIdeas} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl text-sm font-bold hover:shadow-md transition-all flex items-center justify-center gap-2 border border-purple-200 disabled:opacity-50">
                  🎁 {loading ? 'Generando ideas...' : 'Generar Nuevas Ideas de Regalos'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function DeleteModal({ friend, onDelete, onClose }) {
  const [confirmText, setConfirmText] = useState('');
  
  const handleDelete = () => {
    if (confirmText === 'Eliminar') {
      onDelete(friend.id);
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar a {friend.name}?</h3>
          <p className="text-gray-600 text-sm">Esta acción no se puede deshacer. Todos los datos asociados serán eliminados permanentemente.</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Para confirmar, escribe <span className="text-red-600 font-bold">"Eliminar"</span> (sin comillas)
          </label>
          <input 
            type="text" 
            value={confirmText} 
            onChange={(e) => setConfirmText(e.target.value)} 
            placeholder="Escribe aquí..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            autoFocus
          />
          {confirmText && confirmText !== 'Eliminar' && (
            <p className="text-xs text-red-600 mt-2">❌ Debe escribir exactamente "Eliminar"</p>
          )}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleDelete}
            disabled={confirmText !== 'Eliminar'}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectingView({ connections, setConnections, friends, wishlist }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddGroup, setShowAddGroup] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  
  const addConnection = async (connectionData) => {
    const newConnection = { ...connectionData, id: Date.now().toString(), status: 'Pendiente' };
    const groupKey = connectionData.group;
    const updated = { ...connections, [groupKey]: [...(connections[groupKey] || []), newConnection] };
    setConnections(updated);
    await window.storage.set('connections', JSON.stringify(updated));
    setShowAddGroup(null);
  };
  
  const groups = [
    { id: 'family', name: 'Familia', icon: '👨‍👩‍👧‍👦', color: 'from-purple-500 to-pink-500', members: connections.family || [] },
    { id: 'friends', name: 'Amigos', icon: '👥', color: 'from-blue-500 to-cyan-500', members: connections.friends || [] },
    { id: 'professional', name: 'Profesional', icon: '💼', color: 'from-green-500 to-emerald-500', members: connections.professional || [] }
  ];

  if (selectedGroup) {
    const group = groups.find(g => g.id === selectedGroup);
    return (
      <div>
        <button onClick={() => setSelectedGroup(null)} className="mb-4 flex items-center gap-2 text-purple-600 font-semibold hover:underline">
          <ChevronLeft size={20} />Volver
        </button>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{group.name}</h2>
          <button onClick={() => setShowAddGroup(selectedGroup)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold">
            <Plus size={16} className="inline mr-1" />Añadir persona
          </button>
        </div>
        
        {group.members.length > 0 ? (
          <div className="space-y-3">
            {group.members.map(member => (
              <div key={member.id} className="bg-white/95 rounded-xl p-4 border flex items-center justify-between hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <User size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200"
                  >
                    <Send size={14} className="inline mr-1" />WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/95 rounded-2xl border">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No hay personas en este grupo</p>
            <button onClick={() => setShowAddGroup(selectedGroup)} className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold">
              Añadir primera persona
            </button>
          </div>
        )}
        
        {showAddGroup && <AddConnectionModal group={showAddGroup} onSave={addConnection} onClose={() => setShowAddGroup(null)} />}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Mis Conexiones</h2>
        <button onClick={() => setShowInvite(true)} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold flex items-center gap-2">
          <Send size={16} />Invitar por WhatsApp
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {groups.map(group => (
          <button key={group.id} onClick={() => setSelectedGroup(group.id)} className="bg-white/95 rounded-2xl p-6 border hover:shadow-xl transition-all">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center`}>
              <Users size={32} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{group.name}</h3>
            <p className="text-3xl font-bold text-purple-600 mb-1">{group.members.length}</p>
            <p className="text-xs text-gray-500">personas</p>
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => setShowAddGroup('new')} 
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
      >
        <Plus size={24} />
        Añadir persona a un grupo
      </button>
      
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      {showAddGroup && <AddConnectionModal group={showAddGroup === 'new' ? '' : showAddGroup} onSave={addConnection} onClose={() => setShowAddGroup(null)} />}
    </div>
  );
}

function ProfileView({ profile, setProfile, wishlist, setWishlist }) {
  const [edit, setEdit] = useState(!profile);
  const [data, setData] = useState(profile || { name: '', lastName: '', birthday: '', email: '', location: '', interests: '', photo: '' });
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const zodiac = data.birthday ? getZodiacSign(data.birthday) : null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setData({...data, photo: reader.result});
      reader.readAsDataURL(file);
    }
  };

  const searchCities = async (query) => {
    if (!query || query.length < 2) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=es&format=json`);
      const data = await response.json();
      
      if (data.results) {
        const cities = data.results.map(city => ({
          name: city.name,
          country: city.country,
          admin1: city.admin1,
          display: `${city.name}, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country}`
        }));
        setCitySuggestions(cities);
        setShowSuggestions(true);
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setData({...data, location: value});
    searchCities(value);
  };

  const selectCity = (city) => {
    setData({...data, location: city.display});
    setShowSuggestions(false);
    setCitySuggestions([]);
  };

  const handleDeleteFromWishlist = async (item) => {
    const updated = wishlist.filter(w => !(w.id === item.id && w.friendId === item.friendId));
    await setWishlist(updated);
    setDeleteConfirm(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Mi Perfil</h2>
      
      <div className="bg-white/95 rounded-2xl p-6 border">
        {edit ? (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {data.photo ? (
                  <img src={data.photo} alt="Perfil" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-4 border-purple-200">
                    <User className="text-purple-400" size={40} />
                  </div>
                )}
                <button type="button" onClick={() => document.getElementById('profilePhoto').click()} className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 shadow-lg">
                  <Camera size={16} />
                </button>
                <input id="profilePhoto" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
                <input type="text" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} placeholder="Ej: María" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Apellido</label>
                <input type="text" value={data.lastName} onChange={(e) => setData({...data, lastName: e.target.value})} placeholder="Ej: García" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha de cumpleaños</label>
              <input type="date" value={data.birthday} onChange={(e) => setData({...data, birthday: e.target.value})} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              {zodiac && (
                <div className="mt-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                  <p className="text-sm font-bold flex items-center gap-2 text-gray-800">
                    <span className="text-2xl">{zodiac.emoji}</span>
                    {zodiac.name} • {zodiac.element}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{zodiac.traits}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-purple-600">(solo visible para ti)</span></label>
              <input type="email" value={data.email} onChange={(e) => setData({...data, email: e.target.value})} placeholder="Ej: maria.garcia@email.com" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ciudad</label>
              <input 
                type="text" 
                value={data.location} 
                onChange={handleLocationChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Ej: Madrid, España" 
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
              />
              {showSuggestions && citySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-purple-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {citySuggestions.map((city, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectCity(city)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b last:border-b-0"
                    >
                      <p className="text-sm font-medium text-gray-800">{city.name}</p>
                      <p className="text-xs text-gray-500">{city.admin1 && `${city.admin1}, `}{city.country}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Intereses y hobbies</label>
              <textarea value={data.interests} onChange={(e) => setData({...data, interests: e.target.value})} placeholder="Ej: Fotografía, viajar, cocina italiana..." rows="3" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            
            <button onClick={async () => { await setProfile(data); setEdit(false); }} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg">Guardar Perfil</button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-6 mb-6">
              {profile.photo ? (
                <img src={profile.photo} alt="Perfil" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-4 border-purple-200 shadow-lg">
                  <User className="text-purple-400" size={40} />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{profile.name} {profile.lastName}</h3>
                {profile.birthday && zodiac && (
                  <p className="text-sm text-gray-600 mt-1">{zodiac.emoji} {zodiac.name} • {new Date(profile.birthday).toLocaleDateString('es-ES')}</p>
                )}
              </div>
              <button onClick={() => setEdit(true)} className="px-5 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200">
                <Edit size={14} className="inline mr-1" />Editar
              </button>
            </div>
            
            <div className="space-y-3">
              {profile.email && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-700">{profile.email}</p>
                </div>
              )}
              {profile.location && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Ubicación</p>
                  <p className="text-sm font-medium text-gray-700">{profile.location}</p>
                </div>
              )}
              {profile.interests && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Intereses</p>
                  <p className="text-sm font-medium text-gray-700">{profile.interests}</p>
                </div>
              )}
            </div>
            
            {wishlist && wishlist.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Star size={18} className="text-yellow-600 fill-yellow-600" />
                  Mi Wishlist ({wishlist.length})
                </h4>
                <div className="space-y-3">
                  {wishlist.slice(0, 5).map(item => (
                    <div key={`${item.id}-${item.friendId}`} className="p-3 bg-white rounded-lg border border-yellow-200 flex gap-3">
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'; }} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800 mb-1">{item.name}</p>
                        <p className="text-xs text-gray-600 mb-2">{item.price}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.open(item.link || 'https://amazon.es', '_blank')}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 flex items-center gap-1"
                          >
                            <Eye size={12} />Ver producto
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(item)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1"
                          >
                            <Trash2 size={12} />Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {wishlist.length > 5 && (
                    <p className="text-xs text-gray-600 text-center pt-2">+ {wishlist.length - 5} productos más</p>
                  )}
                </div>
              </div>
            )}
            
            {deleteConfirm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
                  <h3 className="text-lg font-bold mb-2">¿Eliminar de Wishlist?</h3>
                  <p className="text-sm text-gray-600 mb-6">¿Quieres eliminar <span className="font-semibold">{deleteConfirm.name}</span> de tu wishlist?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50">
                      Cancelar
                    </button>
                    <button onClick={() => handleDeleteFromWishlist(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Send size={18} className="text-green-600" />
                Invita a tus amigos
              </h4>
              <p className="text-xs text-gray-600 mb-3">Comparte Birthday Gifts con familiares y amigos</p>
              <button 
                onClick={() => {
                  const text = encodeURIComponent("¡Hola! 🎁 Únete a Birthday Gifts App para nunca olvidar cumpleaños y encontrar regalos perfectos. ¡Descárgala ahora!");
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
                className="w-full py-2.5 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 flex items-center justify-center gap-2 text-sm"
              >
                <Send size={16} />
                Invitar por WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddConnectionModal({ group, onSave, onClose }) {
  const [data, setData] = useState({ name: '', phone: '', group });
  
  const groupNames = {
    family: 'Familia',
    friends: 'Amigos',
    professional: 'Profesional'
  };

  const handleSave = () => {
    if (data.name && data.phone && data.group) {
      onSave(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Añadir persona</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo</label>
            <input 
              type="text" 
              value={data.name} 
              onChange={(e) => setData({...data, name: e.target.value})} 
              placeholder="Ej: María García"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono (con prefijo)</label>
            <input 
              type="tel" 
              value={data.phone} 
              onChange={(e) => setData({...data, phone: e.target.value})} 
              placeholder="Ej: +34 612345678"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Grupo *</label>
            <select 
              value={data.group} 
              onChange={(e) => setData({...data, group: e.target.value})}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Seleccionar grupo...</option>
              <option value="family">👨‍👩‍👧‍👦 Familia</option>
              <option value="friends">👥 Amigos</option>
              <option value="professional">💼 Profesional</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={!data.name || !data.phone || !data.group}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ onClose }) {
  const inviteText = encodeURIComponent("¡Hola! 🎁 Únete a Birthday Gifts App para nunca olvidar cumpleaños y encontrar regalos perfectos. ¡Descárgala ahora!");
  const whatsappUrl = `https://wa.me/?text=${inviteText}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Invitar amigos</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="text-center py-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Send size={40} className="text-green-600" />
          </div>
          <h4 className="text-lg font-bold mb-2">Comparte Birthday Gifts</h4>
          <p className="text-gray-600 text-sm mb-6">Invita a tus amigos y familiares para que nunca olviden un cumpleaños</p>
          
          <button 
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Invitar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectGroupModal({ groups, onSelectGroup, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Selecciona un grupo</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <p className="text-gray-600 text-sm mb-6">¿A qué grupo quieres añadir esta persona?</p>

        <div className="space-y-3">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center flex-shrink-0`}>
                <Users size={24} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-800">{group.name}</p>
                <p className="text-xs text-gray-500">{group.members.length} persona{group.members.length !== 1 ? 's' : ''}</p>
              </div>
              <ChevronLeft size={20} className="text-gray-400 rotate-180" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FriendWishlistModal({ friend, wishlist, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b z-10 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Perfil de {friend.name}</h3>
              <p className="text-sm text-gray-600">Wishlist y preferencias</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            {friend.photo ? (
              <img src={friend.photo} alt={friend.name} className="w-20 h-20 rounded-full object-cover border-4 border-purple-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-4 border-purple-200">
                <User size={32} className="text-purple-400" />
              </div>
            )}
            <div>
              <h4 className="text-lg font-bold">{friend.name} {friend.lastName}</h4>
              {friend.birthday && (
                <p className="text-sm text-gray-600">{new Date(friend.birthday).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Star size={18} className="text-yellow-600 fill-yellow-600" />
              Wishlist ({wishlist.length})
            </h4>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {wishlist.map(item => (
                  <div key={`${item.id}-${friend.id}`} className="bg-white rounded-xl border border-purple-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'; }} />
                    </div>
                    <div className="p-3">
                      <h5 className="font-bold text-sm mb-1 text-gray-800 line-clamp-1">{item.name}</h5>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2 h-8">{item.description}</p>
                      <p className="text-purple-600 font-bold text-sm">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Star size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No tiene productos en su wishlist</p>
              </div>
            )}
          </div>

          {friend.interests && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <h5 className="font-semibold text-sm text-gray-700 mb-2">Intereses</h5>
              <p className="text-sm text-gray-600">{friend.interests}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
