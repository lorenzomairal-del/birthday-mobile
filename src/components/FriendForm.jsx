import { useRef, useState } from 'react';
import { Sheet, Field, inputClass, Button, PhotoPicker } from './ui.jsx';
import CityInput from './CityInput.jsx';

const EMPTY = {
  name: '', lastName: '', birthday: '', gender: '', location: '', interests: '', hobbies: '',
  favoriteFood: '', style: '', budget: '', relationship: '', photo: '', phone: '', plans: '', wishes: '', avoid: '',
};

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const pad = (n) => String(n).padStart(2, '0');

// Fecha de cumpleaños con el año opcional: si no se sabe, se guarda como 0000-MM-DD.
export function BirthdayInput({ value, onChange }) {
  const [knowsYear, setKnowsYear] = useState(!value || !value.startsWith('0000'));
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  const day = m ? +m[3] : '';
  const month = m ? +m[2] : '';
  const daysIn = month ? new Date(2000, month, 0).getDate() : 31;

  // Recuerda el año para recuperarlo si se vuelve a desmarcar «No sé el año».
  const savedYear = useRef(m && m[1] !== '0000' ? m[1] : '');

  const toggle = () => {
    if (knowsYear) {
      if (m) savedYear.current = m[1];
      onChange(m ? `0000-${m[2]}-${m[3]}` : '');
    } else {
      const complete = m && m[2] !== '00' && m[3] !== '00';
      onChange(complete && savedYear.current ? `${savedYear.current}-${m[2]}-${m[3]}` : '');
    }
    setKnowsYear(!knowsYear);
  };

  return (
    <div>
      <Field label="Fecha de cumpleaños *">
        {knowsYear ? (
          <input type="date" className={`${inputClass} min-h-[50px]`} value={value} max={new Date().toISOString().slice(0, 10)} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <select className={inputClass} value={day} onChange={(e) => onChange(month ? `0000-${pad(month)}-${pad(e.target.value)}` : `0000-00-${pad(e.target.value)}`)}>
              <option value="">Día</option>
              {Array.from({ length: daysIn }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select
              className={inputClass}
              value={month}
              onChange={(e) => {
                const mo = +e.target.value;
                const d = day ? Math.min(day, new Date(2000, mo, 0).getDate()) : 0;
                onChange(`0000-${pad(mo)}-${pad(d)}`);
              }}
            >
              <option value="">Mes</option>
              {MONTHS.map((name, i) => (
                <option key={name} value={i + 1}>{name[0].toUpperCase() + name.slice(1)}</option>
              ))}
            </select>
          </div>
        )}
      </Field>
      <label className="mt-2 flex items-center gap-2 text-sm text-mute select-none">
        <input type="checkbox" checked={!knowsYear} onChange={toggle} className="w-4 h-4 accent-black" />
        No sé el año de nacimiento
      </label>
    </div>
  );
}

const STEPS = ['Información básica', 'Conócele mejor', 'Preferencias de regalo'];

const PLANS = ['Viajar', 'Salir a cenar', 'Deporte', 'Naturaleza', 'Leer', 'Series y cine', 'Música y conciertos', 'Cocinar', 'Videojuegos', 'Arte y museos', 'Fiesta', 'Estar en casa'];

function Chips({ value, onChange, options }) {
  const selected = value ? value.split(', ').filter(Boolean) : [];
  const toggle = (o) => onChange((selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]).join(', '));
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            aria-pressed={on}
            className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${on ? 'bg-fg text-ink' : 'bg-surface text-fg active:bg-surface-2'}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function FriendForm({ friend, onSave, onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ...EMPTY, ...(friend || {}) });
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });
  const canContinue = data.name.trim() && /^\d{4}-\d{2}-\d{2}$/.test(data.birthday);
  const last = step === STEPS.length - 1;

  return (
    <Sheet
      title={friend ? 'Editar persona' : 'Añadir persona'}
      subtitle={`Paso ${step + 1} de 3 · ${STEPS[step]}`}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" className="flex-1" onClick={() => setStep(step - 1)}>
              Atrás
            </Button>
          )}
          {/* Guardar está disponible desde el paso 1: el resto de datos es opcional */}
          {!last && !(step === 1 && !friend) && (
            <Button variant="soft" className="flex-1" disabled={!canContinue} onClick={() => onSave(data)}>
              Guardar
            </Button>
          )}
          <Button
            className="flex-1"
            disabled={!canContinue}
            onClick={() => (last ? onSave(data) : setStep(step + 1))}
          >
            {last ? 'Guardar' : 'Siguiente'}
          </Button>
        </div>
      }
    >
      <div className="flex gap-1.5 mb-5">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-fg' : 'bg-line'}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <PhotoPicker value={data.photo} onChange={(photo) => setData({ ...data, photo })} />
          <Field label="Nombre *">
            <input className={inputClass} value={data.name} onChange={set('name')} placeholder="Ej: María" autoComplete="off" />
          </Field>
          <Field label="Apellido">
            <input className={inputClass} value={data.lastName} onChange={set('lastName')} placeholder="Ej: García" autoComplete="off" />
          </Field>
          <BirthdayInput value={data.birthday} onChange={(birthday) => setData({ ...data, birthday })} />
          <Field label="Móvil" hint="(para felicitar por WhatsApp)">
            <input type="tel" inputMode="tel" className={inputClass} value={data.phone} onChange={set('phone')} placeholder="Ej: +34 612 345 678" autoComplete="off" />
          </Field>
          <Field label="Género">
            <select className={inputClass} value={data.gender} onChange={set('gender')}>
              <option value="">Seleccionar...</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
              <option value="other">Prefiero no especificarlo</option>
            </select>
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <Field label="¿Dónde vive?">
            <CityInput value={data.location} onChange={(location) => setData({ ...data, location })} />
          </Field>
          <Field group label="¿Cómo le gusta pasar el tiempo libre?">
            <Chips value={data.plans} onChange={(plans) => setData({ ...data, plans })} options={PLANS} />
          </Field>
          <Field label="¿Qué le apasiona?">
            <textarea className={inputClass} rows={2} value={data.interests} onChange={set('interests')} placeholder="Ej: la fotografía, el Barça, el café de especialidad..." />
          </Field>
          {data.hobbies && (
            <Field label="Hobbies">
              <textarea className={inputClass} rows={2} value={data.hobbies} onChange={set('hobbies')} />
            </Field>
          )}
          <Field label="¿Ha comentado algo que quiera o necesite?">
            <input className={inputClass} value={data.wishes} onChange={set('wishes')} placeholder="Ej: unos auriculares nuevos" />
          </Field>
          <Field label="¿Algo que no le guste o que ya tenga?">
            <input className={inputClass} value={data.avoid} onChange={set('avoid')} placeholder="Ej: no bebe alcohol, ya tiene Kindle" />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Field label="Comida favorita">
            <input className={inputClass} value={data.favoriteFood} onChange={set('favoriteFood')} placeholder="Ej: pizza, sushi, pasta..." />
          </Field>
          <Field label="Estilo personal">
            <select className={inputClass} value={data.style} onChange={set('style')}>
              <option value="">Seleccionar estilo...</option>
              {['casual', 'deportivo', 'elegante', 'formal', 'bohemio', 'minimalista', 'urbano', 'vintage'].map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Presupuesto habitual">
            <select className={inputClass} value={data.budget} onChange={set('budget')}>
              <option value="">Seleccionar presupuesto...</option>
              <option value="low">Hasta €20</option>
              <option value="medium-low">€20-€50</option>
              <option value="medium">€50-€100</option>
              <option value="medium-high">€100-€200</option>
              <option value="high">€200-€500</option>
              <option value="premium">Más de €500</option>
            </select>
          </Field>
          <Field label="Relación">
            <select className={inputClass} value={data.relationship} onChange={set('relationship')}>
              <option value="">Seleccionar relación...</option>
              <option value="family">Familiar</option>
              <option value="friend">Amigo/a</option>
              <option value="partner">Pareja</option>
              <option value="coworker">Compañero/a de trabajo</option>
              <option value="acquaintance">Conocido/a</option>
            </select>
          </Field>
        </div>
      )}
    </Sheet>
  );
}
