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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full sm:max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-sheet ${
          full ? 'h-[94dvh] sm:h-[85vh]' : 'max-h-[92dvh] sm:max-h-[85vh]'
        }`}
      >
        <div className="sm:hidden mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line" />
        <div className="flex items-start justify-between gap-3 px-5 pt-3 sm:pt-5 pb-3">
          <div className="min-w-0">
            <h3 className="font-display text-[26px] leading-tight truncate">{title}</h3>
            {subtitle && <p className="text-sm text-mute mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="-mr-1 p-2 rounded-full text-mute hover:bg-white/[0.06] active:bg-line">
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
      <span className="block eyebrow mb-2">
        {label} {hint && <span className="normal-case tracking-normal text-gold">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full px-4 py-3 bg-white/[0.03] border border-line rounded-xl text-base text-fg placeholder:text-mute/60 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05]';

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-fg text-ink active:opacity-90',
    secondary: 'border border-line text-fg active:bg-white/[0.04]',
    soft: 'bg-white/[0.06] text-fg active:bg-white/10',
    danger: 'bg-red-500/90 text-white active:bg-red-500',
    whatsapp: 'bg-[#25D366] text-ink',
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${className}`}
    />
  );
}

export function Avatar({ src, name = '', lastName = '', size = 48, className = '' }) {
  const initials = `${name.trim()[0] || ''}${lastName.trim()[0] || ''}`.toUpperCase();
  return src ? (
    <img src={src} alt="" style={{ width: size, height: size }} className={`rounded-full object-cover shrink-0 ${className}`} />
  ) : (
    <div
      style={{ width: size, height: size, fontSize: size * 0.3 }}
      className={`rounded-full shrink-0 border border-line bg-surface flex items-center justify-center text-fg/75 tracking-wide ${className}`}
    >
      {initials || <User className="text-mute" size={size * 0.42} strokeWidth={1.5} />}
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
      <div className="w-20 h-20 mx-auto mb-6 rounded-full border border-line flex items-center justify-center">
        {icon}
      </div>
      <h2 className="font-display text-3xl mb-2">{title}</h2>
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
    <div className="flex gap-5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`eyebrow !text-[11px] py-2 border-b transition whitespace-nowrap ${
            value === o.value ? '!text-fg border-fg' : 'border-transparent'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
