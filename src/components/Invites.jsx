import { useState } from 'react';
import { Check, Copy, Gift, Send, X, ExternalLink } from 'lucide-react';
import { inviteText, whatsappLinkProps } from '../lib/whatsapp.js';

const REDEEM = 'https://www.amazon.es/gc/redeem';

function Step({ done, title, children }) {
  return (
    <li className="flex gap-3 py-2.5">
      <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-pop-fg text-pop' : 'border-2 border-pop-fg/30'}`}>
        {done && <Check size={14} strokeWidth={3} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-semibold ${done ? 'opacity-60 line-through decoration-1' : ''}`}>{title}</p>
        {!done && children}
      </div>
    </li>
  );
}

export function RewardCode({ reward }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] text-mute">{reward.reason}</p>
        <span className="px-2 py-0.5 rounded-full bg-pop text-pop-fg text-[11px] font-bold">PRUEBA</span>
      </div>
      <p className="mt-1 text-2xl font-bold tracking-[-0.02em]">{reward.amount} € en Amazon</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            navigator.clipboard?.writeText(reward.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-ink border border-line px-3 py-2.5 font-mono text-[13px] font-semibold whitespace-nowrap min-w-0 active:bg-surface-2"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />} {reward.code}
        </button>
        <a href={REDEEM} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-fg text-ink px-4 py-2.5 text-sm font-semibold">
          Canjear <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

// Tarjeta para quien entra con invitación: pasos hasta el cheque.
export function WelcomeCard({ me, friendsCount, onOrder, onAdd }) {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(`bg:${me.user}:welcome-hidden`) === '1';
    } catch {
      return false;
    }
  });
  if (!me?.invitedBy || !me.steps || hidden) return null;
  const { birthday, order, done } = me.steps;
  const hide = () => {
    try {
      localStorage.setItem(`bg:${me.user}:welcome-hidden`, '1');
    } catch {
      /* sin almacenamiento */
    }
    setHidden(true);
  };

  return (
    <section className="mb-5 rounded-[28px] bg-pop text-pop-fg p-5 relative">
      {done && (
        <button onClick={hide} aria-label="Ocultar" className="absolute top-3 right-3 p-2 opacity-60">
          <X size={18} />
        </button>
      )}
      <p className="text-[13px] font-semibold opacity-70 flex items-center gap-1.5">
        <Gift size={15} /> Regalo de bienvenida
      </p>
      {done ? (
        <>
          <p className="mt-1 text-xl font-bold tracking-[-0.02em]">¡Lo conseguiste! 🎉</p>
          <p className="text-sm opacity-80 mb-3">Tú y @{me.invitedBy} tenéis un cheque regalo. Lo tienes también en Perfil.</p>
          {me.rewards?.slice(-1).map((r) => <RewardCode key={r.code} reward={r} />)}
        </>
      ) : (
        <>
          <p className="mt-1 text-xl font-bold tracking-[-0.02em] leading-snug">
            Gana {me.rewardAmount} € en Amazon para ti y para @{me.invitedBy}
          </p>
          <ul className="mt-2">
            <Step done title="Crea tu cuenta" />
            <Step done={birthday || friendsCount > 0} title="Añade un cumpleaños">
              <button onClick={onAdd} className="mt-1.5 rounded-full bg-pop-fg text-pop px-4 py-2 text-sm font-semibold">
                Añadir persona
              </button>
            </Step>
            <Step done={order} title="Haz tu primer pedido de regalo">
              <p className="text-[13px] opacity-70 mt-0.5">Elige una idea de regalo y pídela en Amazon.</p>
              {(birthday || friendsCount > 0) && (
                <button onClick={onOrder} className="mt-2 rounded-full border border-pop-fg/30 px-4 py-2 text-sm font-semibold active:bg-pop-fg/10">
                  Ya he hecho mi pedido
                </button>
              )}
            </Step>
          </ul>
        </>
      )}
    </section>
  );
}

// Sección del Perfil: enlace personal, personas invitadas y cheques conseguidos.
export function InviteSection({ me }) {
  const [copied, setCopied] = useState(false);
  if (!me) return null;
  const text = inviteText(me.inviteLink, me.rewardAmount);
  return (
    <section className="rounded-3xl p-5 bg-ink border border-line">
      <h4 className="font-bold text-fg flex items-center gap-2">
        <Gift size={18} /> Invita y gana {me.rewardAmount} €
      </h4>
      <p className="text-sm text-mute mt-1 mb-3">
        Comparte tu enlace. Cuando alguien se registre, añada un cumpleaños y haga su primer pedido, los dos recibís un cheque regalo de Amazon.
      </p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <a {...whatsappLinkProps('', text)} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold bg-fg text-ink">
          <Send size={17} /> Invitar
        </a>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(me.inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-full px-4 py-3 text-[15px] font-semibold bg-surface active:bg-surface-2 flex items-center gap-1.5"
        >
          {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      {me.invited?.length > 0 && (
        <ul className="mt-4 divide-y divide-line">
          {me.invited.map((p) => (
            <li key={p.user} className="py-2.5 flex items-center justify-between gap-3">
              <span className="font-medium truncate">{p.name}</span>
              <span className={`text-[13px] whitespace-nowrap ${p.done ? 'text-accent font-semibold' : 'text-mute'}`}>
                {p.done ? 'Cheque conseguido' : p.birthday ? 'Falta su primer pedido' : 'Falta añadir un cumpleaños'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {me.rewards?.length > 0 && (
        <div className="mt-4 space-y-2.5">
          <p className="eyebrow">Tus cheques</p>
          {me.rewards.map((r) => (
            <RewardCode key={r.code} reward={r} />
          ))}
        </div>
      )}
      <p className="mt-4 text-[12px] text-mute">Versión de prueba: los códigos son simulados y no se pueden canjear todavía.</p>
    </section>
  );
}
