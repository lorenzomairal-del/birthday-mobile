import { useState } from 'react';
import { ChevronRight, Apple, CalendarDays } from 'lucide-react';
import { Sheet, Button } from './ui.jsx';
import { googleCalendarUrl, icsUrl } from '../lib/calendar.js';

function Option({ title, text, mark, ...props }) {
  const Tag = props.href ? 'a' : 'button';
  return (
    <Tag {...props} className="w-full flex items-center gap-3.5 py-3.5 text-left active:opacity-60">
      <span className="w-11 h-11 rounded-2xl bg-surface flex items-center justify-center text-[15px] font-bold shrink-0">{mark}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-base font-semibold">{title}</span>
        <span className="block text-[13px] text-mute">{text}</span>
      </span>
      <ChevronRight size={18} className="text-mute" />
    </Tag>
  );
}

// Elegir dónde guardar los cumpleaños: Google Calendar, Calendario de Apple u otro.
export default function CalendarSheet({ friends, onClose }) {
  const [googleSteps, setGoogleSteps] = useState(false);
  const one = friends.length === 1;

  if (googleSteps) {
    return (
      <Sheet
        title="Google Calendar"
        subtitle={`${friends.length} cumpleaños`}
        onClose={onClose}
        footer={
          <Button className="w-full" onClick={onClose}>
            Hecho
          </Button>
        }
      >
        <ol className="space-y-3 text-[15px]">
          <li>
            <span className="font-semibold">1.</span> Descarga el archivo con todos los cumpleaños.
            <a href={icsUrl(friends, true)} className="mt-2 flex items-center justify-center rounded-full bg-surface px-5 py-3 font-semibold active:bg-surface-2">
              Descargar archivo
            </a>
          </li>
          <li>
            <span className="font-semibold">2.</span> Abre Google Calendar en el ordenador, ve a Configuración y luego a «Importar y exportar».
            <a
              href="https://calendar.google.com/calendar/r/settings/export"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center rounded-full bg-surface px-5 py-3 font-semibold active:bg-surface-2"
            >
              Abrir Google Calendar
            </a>
          </li>
          <li>
            <span className="font-semibold">3.</span> Elige el archivo y pulsa «Importar». Se repetirán cada año.
          </li>
        </ol>
        <p className="mt-4 text-[13px] text-mute">Google no permite añadir varios a la vez desde el móvil. Si prefieres, abre la ficha de cada persona y añádela una a una.</p>
      </Sheet>
    );
  }

  return (
    <Sheet title="Añadir al calendario" subtitle={one ? `Cumpleaños de ${friends[0].name}` : `${friends.length} cumpleaños, cada año`} onClose={onClose}>
      <div className="divide-y divide-line">
        {one ? (
          <Option mark="G" title="Google Calendar" text="Se abre con el evento listo para guardar" href={googleCalendarUrl(friends[0])} target="_blank" rel="noopener noreferrer" onClick={() => setTimeout(onClose, 300)} />
        ) : (
          <Option mark="G" title="Google Calendar" text="Te explico cómo importarlos todos" onClick={() => setGoogleSteps(true)} />
        )}
        <Option mark={<Apple size={19} strokeWidth={1.8} />} title="Calendario de Apple" text="iPhone, iPad y Mac. Con aviso el día antes y el mismo día" href={icsUrl(friends)} onClick={() => setTimeout(onClose, 300)} />
        <Option mark={<CalendarDays size={19} strokeWidth={1.8} />} title="Otro calendario" text="Outlook y otros: descarga el archivo .ics" href={icsUrl(friends, true)} onClick={() => setTimeout(onClose, 300)} />
      </div>
    </Sheet>
  );
}
