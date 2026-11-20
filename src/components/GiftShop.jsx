import { useState } from 'react';
import { Heart, Star, ShoppingBag, Sparkles, Send, Gift, RefreshCw } from 'lucide-react';
import * as store from '../lib/storage.js';
import { poolPage, buildTrackingUrl, BUDGET_LABELS } from '../lib/gifts.js';
import { Sheet, Segmented, Button } from './ui.jsx';

const WEEK = 7 * 864e5;

function loadHistory(friendId) {
  const saved = store.load(`gift-history-${friendId}`, null);
  if (saved && saved.timestamp > Date.now() - WEEK && saved.pages?.length) return saved;
  const first = poolPage(0).map((g, i) => ({ ...g, id: `pool-0-${i}` }));
  return { pages: [first], currentPage: 0, chatHistory: [], poolCursor: 1, timestamp: Date.now() };
}

function GiftCard({ gift, isFav, inWishlist, onFav, onWishlist, onBuy }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-violet-100 to-pink-100">
        {gift.image && !broken ? (
          <img src={gift.image} alt="" loading="lazy" className="w-full h-full object-cover" onError={() => setBroken(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gift size={40} className="text-violet-300" />
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 flex gap-1.5">
          <button onClick={onWishlist} aria-label="Añadir a mi wishlist" className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow">
            <Star size={16} className={inWishlist ? 'fill-amber-400 text-amber-400' : 'text-gray-400'} />
          </button>
          <button onClick={onFav} aria-label="Favorito" className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow">
            <Heart size={16} className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
          </button>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h5 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2">{gift.name}</h5>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{gift.description}</p>
        {gift.match && <p className="text-[11px] text-violet-700 bg-violet-50 rounded-md px-2 py-1 mt-2 line-clamp-2">✨ {gift.match}</p>}
        <div className="mt-auto pt-2">
          <p className="text-violet-700 font-bold text-sm mb-2">{gift.price}</p>
          <button onClick={onBuy} className="w-full bg-brand text-white rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1.5">
            <ShoppingBag size={15} /> Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GiftShop({ friend, aiEnabled, wishlist, onChangeWishlist, onClose }) {
  const [tab, setTab] = useState('ideas');
  const [favs, setFavs] = useState(() => store.load(`favs-${friend.id}`, []));
  const [hist, setHist] = useState(() => loadHistory(friend.id));
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const saveHist = (next) => {
    const h = { ...next, timestamp: Date.now() };
    setHist(h);
    store.save(`gift-history-${friend.id}`, h);
  };

  const toggleFav = (g) => {
    const next = favs.some((f) => f.id === g.id) ? favs.filter((f) => f.id !== g.id) : [...favs, g];
    setFavs(next);
    store.save(`favs-${friend.id}`, next);
  };

  const inWishlist = (g) => wishlist.some((w) => w.id === g.id && w.friendId === friend.id);
  const toggleWishlist = (g) =>
    onChangeWishlist(
      inWishlist(g)
        ? wishlist.filter((w) => !(w.id === g.id && w.friendId === friend.id))
        : [...wishlist, { ...g, friendId: friend.id, friendName: friend.name }]
    );

  const fetchIdeas = async (userMsg) => {
    setLoading(true);
    const chat = userMsg ? [...hist.chatHistory, { role: 'user', text: userMsg }] : hist.chatHistory;
    setHist({ ...hist, chatHistory: [...chat, { role: 'assistant', text: '…', pending: true }] });

    let ideas = null;
    let reply;
    if (aiEnabled) {
      try {
        const r = await fetch('/api/gift-ideas', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            friend: { ...friend, photo: undefined, budget: BUDGET_LABELS[friend.budget] || '' },
            message: userMsg || '',
          }),
        });
        if (r.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (r.ok) ideas = (await r.json()).ideas;
      } catch {
        // seguimos con las ideas predefinidas
      }
    }

    const stamp = Date.now();
    let poolCursor = hist.poolCursor || 1;
    if (ideas?.length) {
      reply = `¡Listo! ${ideas.length} ideas pensadas para ${friend.name} 👇`;
    } else {
      ideas = poolPage(poolCursor);
      poolCursor += 1;
      reply = aiEnabled
        ? 'No pude generar ideas con IA ahora mismo, te dejo otras sugerencias 👇'
        : 'Te dejo más sugerencias 👇 (la IA no está activada en esta app)';
    }
    const page = ideas.map((g, i) => ({ ...g, id: `${stamp}-${i}` }));
    const pages = [...hist.pages, page];
    saveHist({
      pages,
      currentPage: pages.length - 1,
      poolCursor,
      chatHistory: userMsg ? [...chat, { role: 'assistant', text: reply }] : chat,
    });
    setLoading(false);
  };

  const send = () => {
    const text = msg.trim();
    if (!text || loading) return;
    setMsg('');
    fetchIdeas(text);
  };

  const ideas = hist.pages[hist.currentPage] || [];
  const display = tab === 'favs' ? favs : ideas;

  return (
    <Sheet title="🎁 Ideas de regalo" subtitle={`Para ${friend.name} ${friend.lastName || ''}`} onClose={onClose} full>
      <div className="sticky top-0 z-10 bg-white pb-3 -mx-5 px-5">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'ideas', label: 'Recomendaciones' },
            { value: 'favs', label: `❤️ Favoritos (${favs.length})` },
          ]}
        />
      </div>

      {tab === 'ideas' && (
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100 p-3 mb-4">
          <div className="space-y-1.5 mb-2.5 max-h-28 overflow-y-auto text-sm">
            {hist.chatHistory.length === 0 ? (
              <p className="text-gray-700">
                💬 Cuéntame qué le gusta a {friend.name} y te ayudo a encontrar el regalo perfecto.
              </p>
            ) : (
              hist.chatHistory.map((m, i) => (
                <p key={i} className={m.role === 'user' ? 'text-gray-900 font-medium' : 'text-violet-700'}>
                  {m.role === 'user' ? 'Tú: ' : '💡 '}
                  {m.pending ? <span className="animate-pulse">Pensando…</span> : m.text}
                </p>
              ))
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Ej: le encanta el café y los libros"
              enterKeyHint="send"
              className="flex-1 min-w-0 px-3 py-2.5 bg-white border border-violet-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-100"
            />
            <button type="submit" disabled={loading || !msg.trim()} aria-label="Pedir ideas" className="px-3.5 bg-brand text-white rounded-xl disabled:opacity-40">
              {aiEnabled ? <Sparkles size={18} /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}

      {display.length === 0 ? (
        <div className="text-center py-14 text-gray-500">
          <Heart size={48} className="mx-auto text-gray-200 mb-3" />
          {tab === 'favs' ? 'Aún no tienes favoritos. Toca el ❤️ de una idea.' : 'Sin ideas todavía.'}
        </div>
      ) : (
        <div className={`grid grid-cols-2 gap-3 ${loading ? 'opacity-50' : ''}`}>
          {display.map((g) => (
            <GiftCard
              key={g.id}
              gift={g}
              isFav={favs.some((f) => f.id === g.id)}
              inWishlist={inWishlist(g)}
              onFav={() => toggleFav(g)}
              onWishlist={() => toggleWishlist(g)}
              onBuy={() => window.open(buildTrackingUrl(g, friend), '_blank', 'noopener')}
            />
          ))}
        </div>
      )}

      {tab === 'ideas' && (
        <>
          {hist.pages.length > 1 && (
            <div className="flex justify-center flex-wrap gap-2 mt-4">
              {hist.pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => saveHist({ ...hist, currentPage: i })}
                  className={`w-9 h-9 rounded-full text-sm font-bold ${
                    hist.currentPage === i ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
          <Button variant="soft" className="w-full mt-4" disabled={loading} onClick={() => fetchIdeas('')}>
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Buscando ideas…' : 'Generar nuevas ideas'}
          </Button>
        </>
      )}
    </Sheet>
  );
}
