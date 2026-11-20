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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-sheet ${
          full ? 'h-[94dvh] sm:h-[85vh]' : 'max-h-[92dvh] sm:max-h-[85vh]'
        }`}
      >
        <div className="sm:hidden mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-gray-200" />
        <div className="flex items-start justify-between gap-3 px-5 pt-3 sm:pt-5 pb-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-tight">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="-mr-1 p-2 rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-gray-100 px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</div>}
        {!footer && <div className="pb-safe" />}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-semibold text-gray-600 mb-1.5">
        {label} {hint && <span className="font-normal text-violet-600">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100';

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand text-white shadow-sm shadow-violet-200 active:opacity-90',
    secondary: 'bg-white border border-gray-200 text-gray-700 active:bg-gray-50',
    soft: 'bg-violet-50 text-violet-700 active:bg-violet-100',
    danger: 'bg-red-600 text-white active:bg-red-700',
    whatsapp: 'bg-green-500 text-white active:bg-green-600',
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${className}`}
    />
  );
}

export function Avatar({ src, size = 48, className = '' }) {
  return src ? (
    <img src={src} alt="" style={{ width: size, height: size }} className={`rounded-full object-cover shrink-0 ${className}`} />
  ) : (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full shrink-0 bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center ${className}`}
    >
      <User className="text-violet-400" size={size * 0.45} />
    </div>
  );
}

export function PhotoPicker({ value, onChange, size = 88 }) {
  const ref = useRef(null);
  return (
    <div className="flex justify-center">
      <button type="button" onClick={() => ref.current?.click()} className="relative" aria-label="Cambiar foto">
        <Avatar src={value} size={size} className="ring-4 ring-violet-100" />
        <span className="absolute bottom-0 right-0 bg-violet-600 text-white p-1.5 rounded-full shadow-md">
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
      <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1.5">{title}</h2>
      {text && <p className="text-gray-500 mb-6">{text}</p>}
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
      <p className="text-gray-600">{text}</p>
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
    <div className="flex p-1 bg-white/80 border border-gray-200 rounded-xl">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
            value === o.value ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-600'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
