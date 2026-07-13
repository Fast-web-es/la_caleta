
import React, { useState, useEffect, useRef } from 'react';
import {
  Instagram, Facebook, MapPin, Mail, Phone,
  X, Menu, ImageIcon, Clock, ShoppingBag
} from 'lucide-react';
import { CONFIG, MENU_DATA, ARROCES_DATA, SUPERCATEGORIES, SUBCATEGORY_NOTES, SuperCategory, Product, Dish } from '../data';

/* =====================================================================
 * IDENTIDAD VISUAL — Arrocería tradicional (cálida, serif, sin durezas).
 * Paleta: crema / terracota / olivo / marrón espresso. Bordes finos,
 * sombras suaves, tipografía serif (Playfair) en los títulos.
 * ===================================================================== */

const CREAM = '#F6EEDD';

// Tokens de estilo reutilizables (Tailwind vía CDN, sin @apply).
const btnPrimary =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-brand-red text-[#F6EEDD] px-6 py-3 font-sans font-semibold tracking-wide shadow-[0_12px_26px_-14px_rgba(178,58,46,0.85)] hover:bg-[#8f2c23] transition-colors';
const btnOutline =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-brand-red text-brand-red px-6 py-3 font-sans font-semibold tracking-wide hover:bg-brand-red hover:text-[#F6EEDD] transition-colors';
const cardCls =
  'rounded-lg border border-[#E4D5B4] bg-[#FCF7EC] shadow-[0_18px_44px_-24px_rgba(58,44,32,0.45)]';
const inputCls =
  'w-full rounded-md border border-[#D8C4A0] bg-white px-4 py-3 font-sans text-[#3A2C20] placeholder:text-[#9A8A73] focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/25 transition';

const telHref = `tel:${CONFIG.business.telephone.replace(/\s/g, '')}`;

// TripAdvisor no está en lucide: mini-glifo del "búho" (dos ojos) en currentColor.
const TripAdvisorIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
    <circle cx="7.5" cy="13" r="4.2" />
    <circle cx="16.5" cy="13" r="4.2" />
    <circle cx="7.5" cy="13" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="13" r="1.4" fill="currentColor" stroke="none" />
    <path d="M8.6 7.3c1.1-.7 2.3-1.1 3.4-1.1s2.3.4 3.4 1.1" strokeLinecap="round" />
  </svg>
);

// --- NAV SCROLL (HashRouter: hacemos scroll a mano para no disparar el router) ---
const scrollToSection = (e: React.MouseEvent, id: string) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

// Etiqueta "eyebrow": versalita terracota con una regla corta (sustituye a los
// badges rotados con borde negro del diseño anterior).
const Eyebrow: React.FC<{ children: React.ReactNode; center?: boolean; light?: boolean }> = ({ children, center, light }) => (
  <p className={`flex items-center gap-3 text-[11px] md:text-xs uppercase tracking-[0.3em] font-sans font-semibold mb-5 ${light ? 'text-brand-red' : 'text-brand-red'} ${center ? 'justify-center' : ''}`}>
    <span className="h-px w-8 bg-brand-red/50" />
    {children}
    {center && <span className="h-px w-8 bg-brand-red/50" />}
  </p>
);

// Título de sección: serif elegante + regla corta terracota.
const SectionTitle: React.FC<{ title: string; light?: boolean; center?: boolean }> = ({ title, light, center }) => (
  <div className={`mb-8 ${center ? 'text-center' : ''}`}>
    <h2 className={`font-display text-4xl md:text-6xl leading-[1.05] ${light ? 'text-[#F6EEDD]' : 'text-[#3A2C20]'} whitespace-pre-line`}>{title}</h2>
    <span className={`block h-[3px] w-16 bg-brand-red rounded-full mt-5 ${center ? 'mx-auto' : ''}`} />
  </div>
);

// Divisor ornamental tipo azulejo: dos reglas finas y un rombo terracota central.
const OrnamentDivider: React.FC = () => (
  <div className="flex items-center justify-center gap-4 py-9 bg-[#F6EEDD]">
    <span className="h-px w-16 md:w-28 bg-[#C9B48C]" />
    <span className="relative inline-block w-3.5 h-3.5 rotate-45 bg-brand-red">
      <span className="absolute inset-[3px] bg-[#F6EEDD]" />
    </span>
    <span className="h-px w-16 md:w-28 bg-[#C9B48C]" />
  </div>
);

// Marco de foto (placeholder). FOTO: mientras no haya imagen real, mostramos
// este recuadro cálido con el nombre para saber qué foto va en cada hueco.
const PhotoPlaceholder: React.FC<{ label?: string; className?: string }> = ({ label, className = '' }) => (
  <div
    className={`flex flex-col items-center justify-center gap-2 bg-[#EFE3C9] text-[#A08A63] text-center px-4 ${className}`}
    aria-hidden="true"
  >
    <ImageIcon size={38} strokeWidth={1.25} className="opacity-70" />
    <span className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.25em]">Foto</span>
    {label && <span className="font-display italic text-sm md:text-base max-w-[16rem] leading-snug text-[#8A7550]">{label}</span>}
  </div>
);

// --- COMPONENT ---
const RestaurantTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SuperCategory>('CARTA');
  const [expandedSubcats, setExpandedSubcats] = useState<Set<string>>(new Set(['Arroces']));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Sección a la que navegar cuando se cierre el drawer (los enlaces del menú
  // móvil la apuntan aquí; el scroll se hace en el cleanup del scroll-lock,
  // cuando el body ya no está fijado).
  const pendingSection = useRef<string | null>(null);

  // Scroll lock del drawer mobile (position:fixed para no resetear scroll en iOS).
  useEffect(() => {
    if (!mobileNavOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileNavOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      // Restauración instantánea: con html{scroll-behavior:smooth} un scrollTo
      // animado compite con el scrollIntoView del enlace pulsado y puede dejar
      // la página en una posición aleatoria (a veces arriba del todo).
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
      if (pendingSection.current) {
        const id = pendingSection.current;
        pendingSection.current = null;
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileNavOpen]);

  const toggleSubcat = (sub: string) => {
    setExpandedSubcats(prev => {
      const next = new Set(prev);
      if (next.has(sub)) next.delete(sub); else next.add(sub);
      return next;
    });
  };

  const expandAll = () => setExpandedSubcats(new Set(SUPERCATEGORIES[activeTab]));
  const collapseAll = () => setExpandedSubcats(new Set());
  const allExpanded = SUPERCATEGORIES[activeTab].every(s => expandedSubcats.has(s));

  const renderPrice = (p: Product): string => {
    if (p.requiredChoice && p.requiredChoice.options.some(o => o.price > 0)) {
      return p.requiredChoice.options
        .map(o => `${(p.price + o.price).toFixed(2)}€`)
        .join(' / ');
    }
    if (!p.price) return '—';
    return `${p.price.toFixed(2)}€`;
  };

  const NAV_LINKS = [
    { href: '#arroces', label: 'Arroces' },
    { href: '#menu', label: 'Carta' },
    { href: '#para-llevar', label: 'Para llevar' },
    { href: '#nosotros', label: 'Nosotros' },
    ...(CONFIG.business.reservations?.enabled ? [{ href: '#reservas', label: 'Reservar' }] : []),
    { href: '#contacto', label: 'Contacto' },
  ];

  // Franja estática bajo el header con las señas de identidad — una sola fila.
  // Curada y corta; en móvil se ocultan los dos últimos ítems para no partir línea.
  const STRIP_ITEMS = ['Paellas y arroces', 'Cocina mediterránea', 'Menú del día', 'Desde el año 2000'];
  const TaglineStrip = () => (
    <div className="bg-[#33261B] text-[#F6EEDD] border-y border-[#4A3A2A]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-nowrap items-center justify-center gap-x-4 md:gap-x-6 overflow-hidden">
        {STRIP_ITEMS.map((text, i) => (
          <span key={i} className={`inline-flex items-center gap-4 md:gap-6 ${i >= 2 ? 'hidden md:inline-flex' : ''}`}>
            {i > 0 && <span className="text-brand-red text-[9px]" aria-hidden="true">◆</span>}
            <span className="font-display italic text-[13px] md:text-[15px] tracking-wide text-[#F0E4CC] whitespace-nowrap">{text}</span>
          </span>
        ))}
      </div>
    </div>
  );

  // ============== ARROCES (especialidad + fotos) ==============
  const ArrocesSection = () => (
    <section id="arroces" className="bg-[#F6EEDD] py-20 md:py-28 px-6 md:px-12 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <Eyebrow>{CONFIG.ui.arroces.badge}</Eyebrow>
        <SectionTitle title={CONFIG.ui.arroces.title} />
        <p className="font-sans text-[15px] md:text-base text-[#7A6A57] max-w-2xl -mt-3 mb-10 leading-relaxed">
          {CONFIG.ui.arroces.subtitle}
        </p>

        {/* FOTO: paella/arroz — cada tarjeta muestra su foto cuando dish.image tenga ruta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARROCES_DATA.map((dish: Dish, i) => (
            <article key={i} className={`group overflow-hidden ${cardCls} transition-transform hover:-translate-y-1`}>
              <div className="relative aspect-[4/3] overflow-hidden border-b border-[#E4D5B4]">
                {dish.image ? (
                  <img src={dish.image} alt={dish.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <PhotoPlaceholder label={dish.name} className="w-full h-full" />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl md:text-2xl text-[#3A2C20] leading-snug">{dish.name}</h3>
                <p className="font-sans text-[13px] text-[#7A6A57] mt-2 leading-relaxed">{dish.description}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="font-sans text-sm text-[#7A6A57] italic mt-8 flex items-center gap-2">
          <Phone size={15} className="text-brand-red shrink-0" /> {CONFIG.ui.arroces.footnote}
        </p>
      </div>
    </section>
  );

  // ============== CARTA ==============
  const MenuSection = () => (
    <section id="menu" className="max-w-4xl mx-auto px-5 md:px-8 py-20 md:py-28 scroll-mt-24">
      <div className="text-center">
        <Eyebrow center>La Carta</Eyebrow>
        <SectionTitle title={CONFIG.ui.sections.menuTitle} center />
        <p className="font-sans text-[13px] italic text-[#8A7550] -mt-3 mb-10">
          Carta orientativa · precios sujetos a variación
        </p>
      </div>

      {/* Tabs: CARTA / BEBIDAS / VINOS */}
      <div className="flex justify-center gap-6 md:gap-10 mb-10 border-b border-[#D8C4A0]">
        {(Object.keys(SUPERCATEGORIES) as SuperCategory[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 pb-3 -mb-px font-display text-xl md:text-2xl tracking-wide border-b-2 transition-colors ${
                isActive ? 'text-brand-red border-brand-red' : 'text-[#8A7550] border-transparent hover:text-brand-red'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mb-5">
        <button
          onClick={allExpanded ? collapseAll : expandAll}
          className="font-sans text-xs uppercase tracking-[0.2em] text-[#9A8A73] hover:text-brand-red transition-colors"
        >
          {allExpanded ? 'Cerrar todo' : 'Abrir todo'}
        </button>
      </div>

      <div className="space-y-2">
        {SUPERCATEGORIES[activeTab].map(subcat => {
          const items = MENU_DATA.filter(p => p.category === subcat);
          if (items.length === 0) return null;
          const isOpen = expandedSubcats.has(subcat);
          return (
            <div key={subcat} className="border-b border-[#E0CDA8]">
              <button
                onClick={() => toggleSubcat(subcat)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between py-5 text-left group gap-3"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
                  <h3 className="font-display text-2xl md:text-3xl text-[#3A2C20] group-hover:text-brand-red transition-colors">
                    {subcat}
                  </h3>
                  {SUBCATEGORY_NOTES[subcat] && (
                    <span className="font-sans text-[11px] italic tracking-wide text-brand-red whitespace-nowrap">
                      · {SUBCATEGORY_NOTES[subcat]}
                    </span>
                  )}
                </div>
                <span className="font-display text-3xl text-brand-red leading-none w-8 text-center shrink-0">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <ul className="space-y-5 pb-7 pt-1">
                  {items.map(p => (
                    <li key={p.id}>
                      <div className="flex items-baseline gap-3">
                        <h4 className="font-display text-lg md:text-xl text-[#3A2C20] min-w-0">
                          {p.name}
                        </h4>
                        <span className="flex-1 border-b border-dotted border-[#C9B48C] mb-[6px] min-w-[20px]" aria-hidden="true" />
                        <span className="font-display text-lg md:text-xl text-brand-red shrink-0 tabular-nums">
                          {renderPrice(p)}
                        </span>
                      </div>
                      {p.description && (
                        <p className="font-sans text-[13px] text-[#8A7550] italic mt-1 max-w-3xl leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  // ============== COMIDA PARA LLEVAR ==============
  const TakeawaySection = () => (
    <section id="para-llevar" className="bg-[#33261B] text-[#F6EEDD] py-20 md:py-28 px-6 scroll-mt-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div className="flex flex-col items-start gap-5">
          <Eyebrow light>{CONFIG.ui.takeaway.badge}</Eyebrow>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-[#F6EEDD]">
            {CONFIG.ui.takeaway.title}
          </h2>
          <span className="block h-[3px] w-16 bg-brand-red rounded-full" />
          <p className="font-sans text-[15px] md:text-lg leading-relaxed text-[#E7D9BE] mt-1">
            {CONFIG.ui.takeaway.body}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
            <a href={telHref} className={btnPrimary}>
              <ShoppingBag size={20} /> {CONFIG.ui.takeaway.cta}
            </a>
            <span className="font-display text-2xl text-[#F6EEDD]">{CONFIG.business.telephone}</span>
          </div>
          <p className="font-sans text-[13px] italic text-[#C9B48C]">{CONFIG.ui.takeaway.note}</p>
        </div>

        {CONFIG.store.images.takeaway && (
          <div className="relative rounded-lg overflow-hidden border border-[#5A4835] shadow-[0_22px_50px_-24px_rgba(0,0,0,0.7)] min-h-[280px] md:min-h-[380px]">
            <img src={CONFIG.store.images.takeaway} alt={`Comida para llevar de ${CONFIG.business.name}`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );

  // ============== SOBRE NOSOTROS (desde el año 2000) ==============
  const NosotrosSection = () => (
    <section id="nosotros" className="bg-[#F6EEDD] overflow-hidden scroll-mt-24">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 md:p-14 lg:p-20 flex flex-col justify-center">
          <Eyebrow>{CONFIG.ui.nosotros.badge}</Eyebrow>
          <h2 className="font-display text-3xl md:text-5xl leading-tight text-[#3A2C20] mb-7 whitespace-pre-line">
            {CONFIG.ui.nosotros.title}
          </h2>
          <p className="font-display italic text-lg md:text-xl text-[#5C4A38] leading-relaxed max-w-xl mb-6 border-l-2 border-brand-red pl-5">
            {CONFIG.ui.nosotros.quote}
          </p>
          <p className="font-sans text-[15px] text-[#7A6A57] leading-relaxed max-w-xl">
            {CONFIG.ui.nosotros.body}
          </p>
          <div className="mt-9">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-[#E0CDA8] px-4 py-2">
              <MapPin size={16} className="text-brand-red shrink-0" />
              <span className="font-sans text-sm text-[#3A2C20]">{CONFIG.ui.nosotros.locationLabel}</span>
            </span>
          </div>
        </div>

        {/* Foto: interior del local */}
        <div className="relative min-h-[340px] md:min-h-[520px]">
          {CONFIG.store.images.local ? (
            <img src={CONFIG.store.images.local} alt={`Interior de ${CONFIG.business.name}`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <PhotoPlaceholder label="Interior del local / fachada" className="absolute inset-0" />
          )}
        </div>
      </div>
    </section>
  );

  // ============== RESERVAS ==============
  const ReservationsSection = () => {
    // Fecha en horario LOCAL ('en-CA' da YYYY-MM-DD): con toISOString (UTC),
    // entre las 00:00 y las 02:00 hora peninsular la fecha por defecto y el
    // mínimo del calendario marcaban el día anterior.
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    const maxDate = new Date(today.getTime() + CONFIG.business.reservations.maxDaysAhead * 86400000)
      .toLocaleDateString('en-CA');

    const [date, setDate] = useState(todayStr);
    const [time, setTime] = useState('');
    const [people, setPeople] = useState(2);
    const [resName, setResName] = useState('');
    const [resPhone, setResPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [sent, setSent] = useState(false);

    const parseHours = () => {
      const m = CONFIG.business.openingHours.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
      if (!m) return [];
      const [sh, sm] = m[1].split(':').map(Number);
      const [eh, em] = m[2].split(':').map(Number);
      const interval = CONFIG.business.reservations.slotIntervalMinutes;
      const slots: string[] = [];
      let cur = sh * 60 + sm;
      const stop = eh * 60 + em;
      while (cur <= stop) {
        slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`);
        cur += interval;
      }
      return slots;
    };
    const allSlots = parseHours();

    const sel = new Date(date + 'T00:00:00');
    const dayOfWeek = sel.getDay();
    const isClosed = CONFIG.business.reservations.closedDays.includes(dayOfWeek);
    const availableSlots = (() => {
      if (isClosed) return [];
      if (date !== todayStr) return allSlots;
      const minMillis = Date.now() + CONFIG.business.reservations.minHoursAhead * 3600000;
      return allSlots.filter(slot => {
        const [h, m] = slot.split(':').map(Number);
        const d = new Date(date + 'T00:00:00');
        d.setHours(h, m, 0, 0);
        return d.getTime() >= minMillis;
      });
    })();

    const noSlots = availableSlots.length === 0;
    const canSubmit = resName.trim() && resPhone.trim() && date && time && !noSlots;

    // Sin WhatsApp (fijo): la solicitud se envía por email.
    const handleReserve = (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      const peopleStr = people === 1 ? '1 persona' : `${people} personas`;
      const displayDate = sel.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      const lines = [
        `Nombre: ${resName}`,
        `Teléfono: ${resPhone}`,
        `Fecha: ${displayDate}`,
        `Hora: ${time}`,
        `Comensales: ${peopleStr}`,
      ];
      if (notes.trim()) lines.push(`Notas: ${notes.trim()}`);
      const subject = encodeURIComponent(CONFIG.ui.reservations.emailSubject);
      const body = encodeURIComponent(lines.join('\n') + '\n\n¿Me confirmáis la disponibilidad? ¡Gracias!');
      window.location.href = `mailto:${CONFIG.business.email}?subject=${subject}&body=${body}`;
      setSent(true);
    };

    const reset = () => {
      setSent(false);
      setResName(''); setResPhone(''); setNotes(''); setTime(''); setPeople(2);
    };

    const backToMenu = () => {
      reset();
      setTimeout(() => {
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    };

    if (sent) {
      return (
        <section id="reservas" className="bg-[#FCF7EC] py-16 md:py-24 px-6 scroll-mt-24 border-y border-[#E4D5B4]">
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
            <span className="inline-block w-4 h-4 rotate-45 bg-brand-red" />
            <h2 className="font-display text-4xl md:text-6xl text-brand-red leading-tight">{CONFIG.ui.reservations.confirmation.title}</h2>
            <p className="font-sans text-[15px] max-w-md text-[#7A6A57] leading-relaxed">{CONFIG.ui.reservations.confirmation.body}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <a href={telHref} className={btnOutline}><Phone size={18} /> Llamar</a>
              <button onClick={backToMenu} className={btnPrimary}>{CONFIG.ui.reservations.confirmation.cta}</button>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section id="reservas" className="bg-[#F6EEDD] py-20 md:py-28 px-6 scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <Eyebrow center>{CONFIG.ui.reservations.badge}</Eyebrow>
            <SectionTitle title={CONFIG.ui.reservations.title} center />
            <p className="font-sans text-[15px] text-[#7A6A57] -mt-3 mb-10">
              {CONFIG.ui.reservations.subtitle}
            </p>
          </div>

          <form onSubmit={handleReserve} className={`${cardCls} p-6 md:p-10 space-y-6`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm font-semibold text-[#5C4A38]">{CONFIG.ui.reservations.fields.date}</span>
                <input type="date" value={date} onChange={e => { setDate(e.target.value); setTime(''); }} min={todayStr} max={maxDate} required className={inputCls} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm font-semibold text-[#5C4A38]">{CONFIG.ui.reservations.fields.time}</span>
                <select value={time} onChange={e => setTime(e.target.value)} required disabled={noSlots} className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  <option value="">--:--</option>
                  {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm font-semibold text-[#5C4A38]">{CONFIG.ui.reservations.fields.people}</span>
                <select value={people} onChange={e => setPeople(Number(e.target.value))} className={inputCls}>
                  {Array.from({ length: CONFIG.business.reservations.maxPartySize }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n === 1 ? '1 persona' : `${n} personas`}</option>
                  ))}
                </select>
              </label>
            </div>

            {noSlots && (
              <p className="font-sans text-sm text-brand-red bg-brand-red/5 border border-brand-red/30 rounded-md px-4 py-3">
                {isClosed ? 'Ese día está cerrado. Elige otra fecha.' : 'No quedan horas para hoy. Prueba otro día o llámanos.'}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder={CONFIG.ui.reservations.fields.name} value={resName} onChange={e => setResName(e.target.value)} required className={inputCls} />
              <input type="tel" placeholder={CONFIG.ui.reservations.fields.phone} value={resPhone} onChange={e => setResPhone(e.target.value)} required className={inputCls} />
            </div>

            <textarea placeholder={CONFIG.ui.reservations.fields.notes} value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inputCls} />

            <button type="submit" disabled={!canSubmit} className={`${btnPrimary} !whitespace-normal w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-red`}>
              {CONFIG.ui.reservations.cta}
            </button>

            <p className="font-sans text-[13px] italic text-[#8A7550]">{CONFIG.ui.reservations.disclaimer}</p>

            <div className="border-t border-[#E0CDA8] pt-5 flex flex-col md:flex-row items-start md:items-center gap-2 text-sm">
              <span className="font-sans text-[#7A6A57]">{CONFIG.ui.reservations.largeGroupText}</span>
              <a href={telHref} className="font-sans font-semibold text-brand-red hover:underline">
                {CONFIG.ui.reservations.largeGroupCtaText} · {CONFIG.business.telephone} →
              </a>
            </div>
          </form>
        </div>
      </section>
    );
  };

  // ============== CONTACTO (teléfono, email, horario, mapa + formulario) ==============
  const ContactSection = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const formspreeEndpoint = CONFIG.ui.contact.formspreeEndpoint;
    const usesFormspree = formspreeEndpoint && !formspreeEndpoint.includes('REPLACE_ME');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !email.trim() || !message.trim()) return;
      if (!usesFormspree) {
        const subject = encodeURIComponent(`[Web La Caleta] Mensaje de ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
        window.location.href = `mailto:${CONFIG.business.email}?subject=${subject}&body=${body}`;
        return;
      }
      try {
        const res = await fetch(formspreeEndpoint, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });
        if (res.ok) setSent(true);
      } catch (err) {
        console.error('Contact form error', err);
      }
    };

    return (
      <section id="contacto" className="bg-[#F6EEDD] py-20 md:py-28 px-6 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Eyebrow center>{CONFIG.ui.contact.badge}</Eyebrow>
            <SectionTitle title={CONFIG.ui.contact.title} center />
            <p className="font-sans text-[15px] text-[#7A6A57] -mt-3 mb-10">
              {CONFIG.ui.contact.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <div className={`${cardCls} p-6 md:p-7 space-y-4`}>
                <a href={telHref} className="flex items-center gap-3 font-display text-xl text-[#3A2C20] hover:text-brand-red transition-colors">
                  <Phone size={18} className="text-brand-red shrink-0" /> {CONFIG.business.telephone}
                </a>
                <a href={`mailto:${CONFIG.business.email}`} className="flex items-center gap-3 font-sans text-[15px] break-all text-[#3A2C20] hover:text-brand-red transition-colors">
                  <Mail size={18} className="text-brand-red shrink-0" /> {CONFIG.business.email}
                </a>
                <div className="flex items-start gap-3 font-sans text-[15px] text-[#3A2C20]">
                  <MapPin size={18} className="text-brand-red shrink-0 mt-0.5" />
                  <span>
                    {CONFIG.business.address.street} · {CONFIG.business.address.city}
                    <a href={CONFIG.business.googleMapsShortUrl} target="_blank" rel="noopener noreferrer" className="block font-semibold text-brand-red hover:underline mt-1">
                      Cómo llegar →
                    </a>
                  </span>
                </div>
                <div className="flex items-start gap-3 border-t border-[#E0CDA8] pt-4">
                  <Clock size={18} className="text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans font-semibold text-sm text-[#5C4A38] mb-1">{CONFIG.ui.contact.hoursLabel}</p>
                    <p className="font-sans text-[13px] text-[#7A6A57] whitespace-pre-line leading-relaxed">{CONFIG.ui.contact.hoursText}</p>
                  </div>
                </div>
              </div>

              {/* Mapa de Ciudad Real. TODO: al fijar dirección/coordenadas se centra solo. */}
              <div className="relative rounded-lg overflow-hidden border border-[#E4D5B4] shadow-[0_18px_44px_-24px_rgba(58,44,32,0.45)] min-h-[260px] bg-white">
                <iframe
                  title={`Ubicación de ${CONFIG.business.name} en ${CONFIG.business.address.city}`}
                  src={`https://www.google.com/maps?q=${CONFIG.business.geo.latitude},${CONFIG.business.geo.longitude}&z=15&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>

            {sent ? (
              <div className={`${cardCls} p-8 flex flex-col items-center justify-center text-center gap-4`}>
                <span className="inline-block w-4 h-4 rotate-45 bg-brand-red" />
                <h3 className="font-display text-3xl md:text-4xl text-[#3A2C20]">¡Mensaje enviado!</h3>
                <p className="font-sans text-[15px] max-w-md text-[#7A6A57] leading-relaxed">
                  Te contestamos lo antes posible al email que nos dejaste.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={`${cardCls} p-6 md:p-8 space-y-4`}>
                <input type="text" placeholder={CONFIG.ui.contact.fields.name} value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
                <input type="email" placeholder={CONFIG.ui.contact.fields.email} value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
                <textarea placeholder={CONFIG.ui.contact.fields.message} value={message} onChange={e => setMessage(e.target.value)} rows={6} required className={inputCls} />
                <button type="submit" className={`${btnPrimary} w-full text-lg py-4`}>
                  {CONFIG.ui.contact.cta}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    );
  };

  // ============== FOOTER ==============
  const hasSocial = CONFIG.business.social.instagram || CONFIG.business.social.facebook || CONFIG.business.social.tripadvisor;
  const AppFooter = () => (
    <footer className="bg-[#33261B] text-[#F6EEDD] py-14 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-display text-4xl md:text-5xl text-[#F6EEDD] leading-none">La Caleta</span>
          <span className="font-sans text-[11px] uppercase tracking-[0.35em] text-brand-red mt-1">Arrocería · Ciudad Real</span>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <a href={telHref} className="font-display text-2xl md:text-3xl text-[#F6EEDD] hover:text-brand-red transition-colors">
            {CONFIG.business.telephone}
          </a>
          <a href={`mailto:${CONFIG.business.email}`} className="font-sans text-[13px] text-[#C9B48C] hover:text-brand-red transition-colors break-all">
            {CONFIG.business.email}
          </a>
          {hasSocial && (
            <div className="flex gap-3 mt-2">
              {CONFIG.business.social.instagram && (
                <a href={CONFIG.business.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full border border-[#5A4835] flex items-center justify-center text-[#F6EEDD] hover:bg-brand-red hover:border-brand-red transition-colors"><Instagram size={18} /></a>
              )}
              {CONFIG.business.social.facebook && (
                <a href={CONFIG.business.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full border border-[#5A4835] flex items-center justify-center text-[#F6EEDD] hover:bg-brand-red hover:border-brand-red transition-colors"><Facebook size={18} /></a>
              )}
              {CONFIG.business.social.tripadvisor && (
                <a href={CONFIG.business.social.tripadvisor} target="_blank" rel="noopener noreferrer" aria-label="TripAdvisor" className="w-10 h-10 rounded-full border border-[#5A4835] flex items-center justify-center text-[#F6EEDD] hover:bg-brand-red hover:border-brand-red transition-colors"><TripAdvisorIcon size={20} /></a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-[#5A4835]" />
        <span className="inline-block w-2.5 h-2.5 rotate-45 bg-brand-red" />
        <span className="h-px w-10 bg-[#5A4835]" />
      </div>

      <div className="max-w-7xl mx-auto mt-8 text-[12px] font-sans text-[#A8916F] flex flex-col md:flex-row flex-wrap justify-between items-center gap-3">
        <p className="flex items-center gap-2"><MapPin size={12} className="text-brand-red" /> {CONFIG.business.address.city} · {CONFIG.business.address.country}</p>
        <p>© {new Date().getFullYear()} {CONFIG.business.name}</p>
        <a href={CONFIG.business.credits.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors">
          {CONFIG.business.credits.label} →
        </a>
      </div>
    </footer>
  );

  return (
    <div className="min-h-[100dvh] w-full bg-[#F6EEDD] text-[#3A2C20] font-sans selection:bg-brand-red selection:text-[#F6EEDD]">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-[#F6EEDD]/95 backdrop-blur border-b border-[#D8C4A0] h-16 md:h-20 flex items-center justify-between px-4 md:px-8">
        <a
          href="#arroces"
          onClick={(e) => scrollToSection(e, 'arroces')}
          className="shrink-0 hover:opacity-80 transition-opacity flex items-center"
          aria-label="Inicio Restaurante La Caleta"
        >
          <img
            src="/logo.png"
            alt="La Caleta · Arrocería"
            width={265}
            height={128}
            className="h-10 md:h-12 w-auto"
          />
        </a>

        <nav className="hidden lg:flex items-center gap-7 shrink-0 font-sans text-[13px] uppercase tracking-[0.15em]">
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} onClick={(e) => scrollToSection(e, link.href.slice(1))} className="text-[#5C4A38] hover:text-brand-red transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setMobileNavOpen(true)}
          className="lg:hidden w-11 h-11 rounded-md bg-brand-red text-[#F6EEDD] flex items-center justify-center shadow-[0_8px_18px_-8px_rgba(178,58,46,0.9)]"
          aria-label="Abrir menú"
          aria-expanded={mobileNavOpen}
        >
          <Menu size={22} strokeWidth={2} />
        </button>
      </header>

      {/* ============ MOBILE NAV DRAWER ============ */}
      {mobileNavOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden fixed inset-0 z-[90] bg-[#33261B]/50 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="absolute top-0 right-0 h-full w-[86%] max-w-sm bg-[#F6EEDD] border-l border-[#D8C4A0] flex flex-col animate-in slide-in-from-right"
          >
            <div className="flex items-center justify-between h-16 px-5 border-b border-[#D8C4A0]">
              <span className="font-display text-2xl text-brand-red leading-none">La Caleta</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-10 h-10 rounded-md border border-[#D8C4A0] flex items-center justify-center text-[#5C4A38] hover:bg-brand-red hover:text-[#F6EEDD] hover:border-brand-red transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col px-6 pt-4">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    pendingSection.current = link.href.slice(1);
                    setMobileNavOpen(false);
                  }}
                  className="group flex items-center justify-between font-display text-3xl text-[#3A2C20] border-b border-[#E0CDA8] py-4 hover:text-brand-red transition-colors"
                >
                  <span>{link.label}</span>
                  <span className="text-brand-red text-xl opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
                </a>
              ))}
            </nav>

            <div className="mt-auto p-6 border-t border-[#D8C4A0] space-y-4">
              <a href={telHref} className={`${btnPrimary} w-full`}>
                <Phone size={18} /> {CONFIG.business.telephone}
              </a>
              {hasSocial && (
                <div className="flex gap-3 justify-center">
                  {CONFIG.business.social.instagram && (
                    <a href={CONFIG.business.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 rounded-full border border-[#D8C4A0] flex items-center justify-center text-[#5C4A38] hover:bg-brand-red hover:text-[#F6EEDD] hover:border-brand-red transition-colors"><Instagram size={18} /></a>
                  )}
                  {CONFIG.business.social.facebook && (
                    <a href={CONFIG.business.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 rounded-full border border-[#D8C4A0] flex items-center justify-center text-[#5C4A38] hover:bg-brand-red hover:text-[#F6EEDD] hover:border-brand-red transition-colors"><Facebook size={18} /></a>
                  )}
                  {CONFIG.business.social.tripadvisor && (
                    <a href={CONFIG.business.social.tripadvisor} target="_blank" rel="noopener noreferrer" aria-label="TripAdvisor" className="w-11 h-11 rounded-full border border-[#D8C4A0] flex items-center justify-center text-[#5C4A38] hover:bg-brand-red hover:text-[#F6EEDD] hover:border-brand-red transition-colors"><TripAdvisorIcon size={20} /></a>
                  )}
                </div>
              )}
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#9A8A73] text-center">
                {CONFIG.business.address.city} · {CONFIG.business.address.country}
              </p>
            </div>
          </div>
        </div>
      )}

      {TaglineStrip()}

      <main>
        {/* ================= HERO ================= */}
        {/* Rejilla de 2 columnas: texto a la izquierda, imagen a sangre (alto completo)
            a la derecha. En móvil solo texto. FOTO: sustituir el placeholder por una
            foto real de paella/arroz — ocupará el panel entero. */}
        <div className="grid md:grid-cols-2 items-stretch bg-gradient-to-b from-[#F8F1E1] to-[#F0E4CB]">
          <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-14 md:py-20">
            <div className="flex flex-col items-start text-left max-w-xl w-full">
              <Eyebrow>{CONFIG.ui.hero.badge}</Eyebrow>

              {/* H1 ÚNICO (SEO/AEO): "Arrocería en Ciudad Real — Restaurante La Caleta" */}
              <h1 className="w-full">
                <span className="block font-display text-[clamp(3.2rem,11vw,5.5rem)] leading-[0.95] text-[#3A2C20]">
                  {CONFIG.ui.hero.titleTop}
                </span>
                <span className="block font-display italic text-[clamp(1.6rem,6vw,2.6rem)] leading-tight text-brand-red mt-1">
                  {CONFIG.ui.hero.titleMid}
                </span>
                <span className="sr-only"> — </span>
                <span className="block font-sans text-sm md:text-base uppercase tracking-[0.28em] text-[#7A6A57] mt-5">
                  {CONFIG.ui.hero.titleBrand}
                </span>
              </h1>

              <span className="block h-[3px] w-16 bg-brand-red rounded-full mt-6" />
              <p className="font-sans text-[15px] md:text-base text-[#5C4A38] mt-5 leading-relaxed max-w-md">
                {CONFIG.ui.hero.subtitle}
              </p>

              <div className="flex flex-row flex-wrap gap-3 mt-8">
                <a href={CONFIG.ui.hero.ctaReserveHref} className={btnPrimary}>
                  <span>{CONFIG.ui.hero.ctaReserveLabel}</span>
                  <span aria-hidden="true">→</span>
                </a>
                <a href={telHref} className={btnOutline}>
                  <Phone size={18} />
                  <span>{CONFIG.ui.hero.ctaCallLabel}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Foto de portada — panel a sangre, alto completo (solo desktop) */}
          <div className="relative hidden md:block min-h-[440px]">
            {CONFIG.store.images.hero ? (
              <img src={CONFIG.store.images.hero} alt={`Comedor de ${CONFIG.business.name}`} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <PhotoPlaceholder label="Paella / arroz" className="absolute inset-0" />
            )}
          </div>
        </div>

        <OrnamentDivider />

        {/* Orden: Arroces → Carta → Para llevar → Nosotros → Reservas → Contacto → Footer.
            OrnamentDivider solo entre secciones crema consecutivas (el cambio de color
            crema↔espresso ya separa por sí mismo). */}
        {ArrocesSection()}

        {OrnamentDivider()}

        {MenuSection()}

        {TakeawaySection()}

        {NosotrosSection()}

        {OrnamentDivider()}

        {CONFIG.business.reservations?.enabled && <ReservationsSection />}

        {OrnamentDivider()}

        <ContactSection />

        {AppFooter()}
      </main>
    </div>
  );
};

export default RestaurantTemplate;
