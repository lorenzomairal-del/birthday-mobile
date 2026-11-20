import { useState } from 'react';
import { Sheet, Field, inputClass, Button, PhotoPicker } from './ui.jsx';

const EMPTY = {
  name: '', lastName: '', birthday: '', gender: '', location: '', interests: '', hobbies: '',
  favoriteFood: '', style: '', budget: '', relationship: '', photo: '',
};

const STEPS = ['Información básica', 'Gustos e intereses', 'Preferencias de regalo'];

export default function FriendForm({ friend, onSave, onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ...EMPTY, ...(friend || {}) });
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });
  const canContinue = data.name.trim() && data.birthday;
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
          {!last && (
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
          <Field label="Fecha de cumpleaños *">
            <input type="date" className={`${inputClass} min-h-[50px]`} value={data.birthday} onChange={set('birthday')} />
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
        <div className="space-y-4">
          <Field label="Ciudad">
            <input className={inputClass} value={data.location} onChange={set('location')} placeholder="Ej: Madrid" />
          </Field>
          <Field label="Intereses">
            <textarea className={inputClass} rows={3} value={data.interests} onChange={set('interests')} placeholder="Ej: tecnología, fotografía, viajes..." />
          </Field>
          <Field label="Hobbies">
            <textarea className={inputClass} rows={3} value={data.hobbies} onChange={set('hobbies')} placeholder="Ej: leer, hacer deporte, cocinar..." />
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
