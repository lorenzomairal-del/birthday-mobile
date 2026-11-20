import { useEffect, useRef } from 'react';
import { X, User, Camera } from 'lucide-react';
import { fileToAvatar } from '../lib/image.js';

// Hoja inferior en móvil, diálogo centrado en pantallas grandes.
export function Sheet({ title, subtitle, onClose, children, footer, full = false }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full sm:max-w-lg bg-ink rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col animate-sheet ${
          full ? 'h-[94dvh] sm:h-[85vh]' : 'max-h-[92dvh] sm:max-h-[85vh]'
        }`}
      >
        <div className="sm:hidden mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line" />
        <div className="flex items-start justify-between gap-3 px-5 pt-3 sm:pt-5 pb-3">
          <div className="min-w-0">
            <h3 className="text-[22px] font-bold tracking-[-0.025em] leading-tight truncate">{title}</h3>
            {subtitle && <p className="text-sm text-mute mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="-mr-1 p-2 rounded-full text-mute hover:bg-fg/[0.06] active:bg-line">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-line px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</div>}
        {!footer && <div className="pb-safe" />}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block eyebrow mb-1.5">
        {label} {hint && <span className="text-accent">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full px-4 py-3 bg-surface border border-transparent rounded-2xl text-base text-fg placeholder:text-mute/70 focus:outline-none focus:border-fg/20 focus:bg-ink';

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-fg text-ink active:opacity-90',
    secondary: 'bg-surface text-fg active:bg-surface-2',
    soft: 'bg-pop text-pop-fg active:opacity-90',
    danger: 'bg-red-500/90 text-white active:bg-red-500',
    whatsapp: 'bg-[#25D366] text-ink',
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${className}`}
    />
  );
}

// Colores suaves para las iniciales: cada persona tiene siempre el mismo.
const AVATAR_COLORS = [
  ['#e4e1ff', '#4b45d6'],
  ['#ffe3cc', '#b8561a'],
  ['#d3f4e6', '#16805c'],
  ['#ffe0ea', '#c23a68'],
  ['#dceeff', '#1f6fc2'],
  ['#fff0bf', '#946800'],
];
function colorFor(text) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function Avatar({ src, name = '', lastName = '', size = 48, className = '' }) {
  const initials = `${name.trim()[0] || ''}${lastName.trim()[0] || ''}`.toUpperCase();
  const [bg, fg] = colorFor(`${name}${lastName}`);
  return src ? (
    <img src={src} alt="" style={{ width: size, height: size }} className={`rounded-full object-cover shrink-0 ${className}`} />
  ) : (
    <div
      style={{ width: size, height: size, fontSize: size * 0.32, background: initials ? bg : undefined, color: initials ? fg : undefined }}
      className={`rounded-full shrink-0 bg-surface flex items-center justify-center font-semibold ${className}`}
    >
      {initials || <User className="text-mute" size={size * 0.42} strokeWidth={1.6} />}
    </div>
  );
}

export function PhotoPicker({ value, onChange, size = 88 }) {
  const ref = useRef(null);
  return (
    <div className="flex justify-center">
      <button type="button" onClick={() => ref.current?.click()} className="relative" aria-label="Cambiar foto">
        <Avatar src={value} size={size} />
        <span className="absolute bottom-0 right-0 bg-fg text-ink p-1.5 rounded-full">
          <Camera size={15} />
        </span>
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) onChange(await fileToAvatar(file));
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-pop flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-2xl font-bold tracking-[-0.025em] mb-1.5">{title}</h2>
      {text && <p className="text-mute mb-6">{text}</p>}
      {action}
    </div>
  );
}

export function ConfirmSheet({ title, text, confirmLabel = 'Eliminar', requireWord, onConfirm, onClose }) {
  const inputRef = useRef(null);
  const check = () => !requireWord || inputRef.current?.value.trim().toLowerCase() === requireWord.toLowerCase();
  return (
    <Sheet
      title={title}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              if (check()) onConfirm();
              else inputRef.current?.focus();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-fg/70">{text}</p>
      {requireWord && (
        <div className="mt-4">
          <Field label={`Para confirmar, escribe "${requireWord}"`}>
            <input ref={inputRef} className={inputClass} autoCapitalize="none" autoComplete="off" placeholder={requireWord} />
          </Field>
        </div>
      )}
    </Sheet>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
            value === o.value ? 'bg-fg text-ink' : 'bg-surface text-fg/70'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
