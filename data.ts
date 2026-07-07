
export interface Variation {
  name: string;
  price: number;
}

export interface Product {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number; // 0 = precio pendiente → la UI lo muestra como "—" (ver renderPrice)
  image: string;
  popular?: boolean;
  // Cada opción puede llevar un price modifier (0 = no cambia el precio).
  // Útil para variantes como Copa/Botella, ración/media, tamaños, etc.
  requiredChoice?: {
    name: string;
    options: Variation[];
  };
  extras?: Variation[];
}

// Ficha de un arroz/plato destacado con foto (galería "Nuestros arroces").
export interface Dish {
  name: string;
  description: string;
  image: string;
}

/**
 * =====================================================================
 * SINGLE SOURCE OF TRUTH — RESTAURANTE LA CALETA (Arrocería)
 * =====================================================================
 * Toda la configuración de la web reside aquí. Cambia este objeto y
 * cambia la web entera (marca, textos, SEO, JSON-LD, colores, carta).
 *
 * >>> PENDIENTE DE RELLENAR (buscar "TODO" / "PLACEHOLDER" / "FOTO"):
 *   · Dirección exacta y coordenadas del local.
 *   · Horario real (comidas / cenas / día de cierre).
 *   · Carta real: platos y precios (MENU_DATA).
 *   · Fotos reales (arroces, local) — ahora hay placeholders.
 *   · Redes sociales, si las tienen.
 */
export const CONFIG = {
  // 1. IDENTIDAD DEL NEGOCIO (SEO Local + JSON-LD)
  business: {
    name: "Restaurante La Caleta",
    // Meta description propia (aparece en Google y en previews de enlace)
    description: "Arrocería en el centro de Ciudad Real desde el año 2000. Paellas, arroces y cocina mediterránea. Menú del día, comida para llevar y grupos.",
    // Dominio deducido del email del cliente. Cambiar si el definitivo es otro.
    url: "https://restaurantearrocerialacaleta.com",
    logo: "/logo.svg",
    telephone: "+34 926 22 09 55",
    email: "info@restaurantearrocerialacaleta.com",
    priceRange: "€€",
    address: {
      street: "Calle Huertos, 3",
      city: "Ciudad Real",
      postalCode: "13001", // TODO: confirmar código postal exacto
      country: "ES"
    },
    geo: {
      // Coordenadas reales del local (Google Maps).
      latitude: 38.9871559,
      longitude: -3.926697
    },
    // Formato Schema.org. TODO: confirmar horario real (comidas, cenas y día de cierre).
    // Ahora: todos los días 13:00–16:30 (turno de comidas) como placeholder.
    openingHours: "Mo-Su 13:00-16:30", // PLACEHOLDER
    // Enlace real al negocio en Google Maps (para "Cómo llegar").
    googleMapsShortUrl: "https://www.google.com/maps/place/Restaurante+La+Caleta/@38.9871559,-3.926697,17z/data=!3m1!4b1!4m6!3m5!1s0xd6bc341d56b2e23:0x4611409779810a3a!8m2!3d38.9871559!4d-3.926697",
    social: {
      instagram: "https://www.instagram.com/rest.lacaleta/",
      facebook: "https://www.facebook.com/LaCaletaCiudadReal/",
      tripadvisor: "https://www.tripadvisor.es/Restaurant_Review-g187487-d1443729-Reviews-Restaurante_La_Caleta-Ciudad_Real_Province_of_Ciudad_Real_Castile_La_Mancha.html"
    },
    // Créditos de la agencia que construyó la web. Aparecen en el footer.
    credits: {
      label: "Creado por Fast Web",
      url: "https://www.fast-web.es"
    },
    // Reservas: formulario que compone un email + botón de llamada directa.
    reservations: {
      enabled: true,
      minHoursAhead: 2,
      maxDaysAhead: 60,
      slotIntervalMinutes: 30,
      maxPartySize: 10,
      closedDays: [] as number[] // TODO: día(s) de cierre. Ej: [1] = cierra lunes (0=Dom … 6=Sáb)
    }
  },

  // 2. SERVICIOS / CONTACTO SECUNDARIO
  store: {
    currency: "€",
    // FOTO: imágenes de secciones. Reemplazables por otras mejores cuando el
    // cliente pase fotos profesionales. Dejar "" para volver al marco placeholder.
    images: {
      hero: "/img/hero-comedor.jpg",      // Comedor del restaurante (portada)
      local: "/img/local-detalle.jpg",    // Interior del local, formato vertical (Sobre nosotros)
      takeaway: "/img/para-llevar.jpg",   // Pedidos de comida para llevar
      // Alternativa panorámica del interior disponible en /img/local-interior.jpg
    },
    // Teléfono para el pedido de comida para llevar (mismo fijo del local).
    orderPhone: "+34 926 22 09 55",
    services: [
      "Menú del día",
      "Comida para llevar",
      "Local climatizado",
      "Grupos y celebraciones"
    ]
  },

  // 3. TEMA VISUAL — paleta mediterránea (arena / terracota / verde olivo).
  // Se inyecta en Tailwind vía variables CSS (ver SEO.tsx + index.html).
  theme: {
    primaryColor: "#B23A2E",   // Terracota (acentos, títulos)
    secondaryColor: "#33261B", // Marrón espresso cálido (secciones oscuras)
    accentColor: "#6E7135",    // Verde olivo (detalles)
    fontDisplay: "Playfair Display", // Serif clásica de títulos (look tradicional)
  },

  // 4. TEXTOS DE LA INTERFAZ (UI LABELS) — tono cercano y acogedor.
  ui: {
    hero: {
      badge: "Arrocería · Desde el año 2000",
      // El H1 real se compone en el Hero (ver RestaurantTemplate) para cumplir:
      // "Arrocería en Ciudad Real — Restaurante La Caleta".
      titleTop: "Arrocería",
      titleMid: "en Ciudad Real",
      titleBrand: "Restaurante La Caleta",
      subtitle: "Paellas y arroces al fuego, cocina mediterránea.",
      ctaReserveLabel: "Reservar mesa",
      ctaReserveHref: "#reservas",
      ctaCallLabel: "Llamar"
    },
    marquee: [
      "Paellas", "Arroz del senyoret", "Cocina mediterránea", "Menú del día",
      "Comida para llevar", "Ciudad Real", "Desde el año 2000"
    ],
    arroces: {
      badge: "Nuestra especialidad",
      title: "Nuestros arroces",
      subtitle: "Arroces y paellas hechos al momento, como se han hecho siempre.",
      // TODO: confirmar con el cliente qué arroces ofrece exactamente.
      footnote: "¿Un arroz concreto para tu mesa o para llevar? Encárgalo por teléfono."
    },
    sections: {
      menuTitle: "La Carta"
    },
    takeaway: {
      badge: "Comida para llevar",
      title: "Llévatelo a casa",
      body: "Nuestros arroces, paellas y platos de la carta, listos para llevar. Haz tu pedido por teléfono y te lo preparamos a la hora que nos digas.",
      cta: "Pedir para llevar",
      note: "Ideal para comidas en casa, grupos y celebraciones."
    },
    nosotros: {
      badge: "Sobre nosotros",
      title: "Desde el año 2000\nen el centro de Ciudad Real",
      quote: "Abrimos La Caleta con una idea sencilla: buen arroz, producto de siempre y trato de familia.",
      body: "Más de dos décadas después seguimos con la misma cocina mediterránea, nuestras paellas y arroces al fuego, el menú del día de cada jornada y la comida para llevar. Un local climatizado y acogedor, pensado también para grupos y celebraciones.",
      locationLabel: "Centro de Ciudad Real",
      directionsLabel: "Cómo llegar"
    },
    contact: {
      badge: "Contacto",
      title: "Dónde estamos",
      subtitle: "Reservas, encargos, grupos o cualquier duda — te atendemos encantados.",
      hoursLabel: "Horario",
      // TODO: horario real y detallado (comidas / cenas / día de cierre).
      hoursText: "Todos los días · Comidas 13:00–16:30\n(Horario provisional — pendiente de confirmar)", // PLACEHOLDER
      fields: {
        name: "Tu nombre",
        email: "Tu email",
        message: "Tu mensaje"
      },
      cta: "Enviar mensaje",
      // PLACEHOLDER — cuando el cliente cree su cuenta en formspree.io, pegar aquí su endpoint.
      // Mientras siga con REPLACE_ME, el formulario cae a un mailto: al email del negocio.
      formspreeEndpoint: "https://formspree.io/f/REPLACE_ME"
    },
    reservations: {
      badge: "Reservas",
      title: "Reserva tu mesa",
      subtitle: "Rellena los datos y te confirmamos, o llámanos directamente.",
      fields: {
        date: "Fecha",
        time: "Hora",
        people: "Comensales",
        name: "Tu nombre",
        phone: "Teléfono",
        notes: "Notas: alergias, celebración, arroz por encargo… (opcional)"
      },
      cta: "Enviar solicitud de reserva",
      disclaimer: "La reserva no es automática: nos llega tu solicitud y te confirmamos. Para hoy mismo o grupos grandes, mejor llámanos.",
      largeGroupText: "¿Grupo grande o celebración?",
      largeGroupCtaText: "Llámanos",
      emailSubject: "Nueva solicitud de reserva · Web La Caleta",
      confirmation: {
        title: "¡Solicitud enviada!",
        body: "Se ha abierto tu correo con los datos de la reserva. Envíalo y te confirmamos lo antes posible. Si prefieres, llámanos.",
        cta: "Volver a la carta"
      }
    }
  }
};

// 3 pestañas de la carta + subcategorías (secciones dentro de cada pestaña).
// El orden importa: así aparecen en la UI.
export const SUPERCATEGORIES = {
  CARTA: [
    "Para empezar",
    "Arroces",
    "De la brasa",
    "Del mar",
    "Postres"
  ],
  BEBIDAS: [
    "Refrescos & aguas",
    "Cervezas",
    "Aperitivos"
  ],
  VINOS: [
    "Vinos blancos",
    "Vinos tintos",
    "Vinos rosados"
  ]
} as const;

export type SuperCategory = keyof typeof SUPERCATEGORIES;

// Notas junto al título de una subcategoría (opcional).
export const SUBCATEGORY_NOTES: Record<string, string> = {
  "Arroces": "Mínimo 2 personas · precio por persona",
};

export const CATEGORIES: string[] = [
  ...SUPERCATEGORIES.CARTA,
  ...SUPERCATEGORIES.BEBIDAS,
  ...SUPERCATEGORIES.VINOS
];

/**
 * =====================================================================
 * CARTA — DATOS PROVISIONALES (PLACEHOLDERS)
 * =====================================================================
 * TODO: carta real — sustituir platos y precios por los del cliente.
 * Los platos de abajo son ejemplos típicos de una arrocería para mostrar
 * el diseño. NO son la carta definitiva. Precio 0 → se muestra como "—".
 */
export const MENU_DATA: Product[] = [
  // ---------------- PARA EMPEZAR ----------------
  { id: 101, category: "Para empezar", name: "Ensalada de La Caleta", description: "Brotes tiernos, tomate, atún, huevo y aceitunas", price: 9.5, image: "" },
  { id: 102, category: "Para empezar", name: "Croquetas caseras", description: "De jamón ibérico, hechas al día (8 uds.)", price: 8.0, image: "" },
  { id: 103, category: "Para empezar", name: "Pimientos de Padrón", description: "Fritos con sal en escamas", price: 7.5, image: "" },
  { id: 104, category: "Para empezar", name: "Gambas al ajillo", description: "Salteadas con ajo, guindilla y aceite de oliva", price: 12.5, image: "" },

  // ---------------- ARROCES (especialidad · precio por persona, mínimo 2) ----------------
  { id: 201, category: "Arroces", name: "Paella valenciana", description: "Pollo, conejo, judía verde y garrofó", price: 15.0, image: "", popular: true },
  { id: 202, category: "Arroces", name: "Arroz del senyoret", description: "Pescado, marisco pelado y pimientos rojos", price: 17.0, image: "", popular: true },
  { id: 203, category: "Arroces", name: "Arroz negro", description: "Calamar, su tinta y pimiento verde", price: 16.0, image: "" },
  { id: 204, category: "Arroces", name: "Arroz caldoso de bogavante", description: "Medio bogavante por comensal", price: 22.0, image: "", popular: true },
  { id: 205, category: "Arroces", name: "Arroz a banda", description: "Trocitos de calamar y pimientos rojos", price: 16.0, image: "" },
  { id: 206, category: "Arroces", name: "Paella de verduras", description: "Verduras de temporada a la brasa", price: 14.0, image: "" },

  // ---------------- DE LA BRASA ----------------
  { id: 301, category: "De la brasa", name: "Solomillo de ternera", description: "A la brasa con guarnición", price: 19.5, image: "" },
  { id: 302, category: "De la brasa", name: "Entrecot", description: "Con patatas y pimientos", price: 21.0, image: "" },
  { id: 303, category: "De la brasa", name: "Costillas de cerdo", description: "Adobadas y hechas al fuego", price: 15.5, image: "" },

  // ---------------- DEL MAR ----------------
  { id: 401, category: "Del mar", name: "Pescado del día", description: "Según lonja — consúltanos", price: 18.0, image: "" },
  { id: 402, category: "Del mar", name: "Calamares a la andaluza", description: "Rebozados y fritos con limón", price: 14.5, image: "" },

  // ---------------- POSTRES ----------------
  { id: 501, category: "Postres", name: "Flan casero", description: "Con nata montada", price: 5.0, image: "" },
  { id: 502, category: "Postres", name: "Tarta del día", description: "Pregunta por la elaboración de hoy", price: 5.5, image: "" },

  // ---------------- BEBIDAS ----------------
  { id: 601, category: "Refrescos & aguas", name: "Agua / Refresco", description: "Agua mineral, refrescos y zumos", price: 2.5, image: "" },
  {
    id: 602, category: "Cervezas", name: "Cerveza", description: "De barril y en botella", price: 2.2, image: "",
    requiredChoice: { name: "Formato", options: [{ name: "Caña", price: 0 }, { name: "Botellín", price: 0.3 }] }
  },
  { id: 603, category: "Aperitivos", name: "Vermut de la casa", description: "Rojo con hielo, naranja y aceituna", price: 3.5, image: "" },

  // ---------------- VINOS ----------------
  {
    id: 701, category: "Vinos blancos", name: "Blanco de la casa", description: "D.O. La Mancha", price: 2.5, image: "",
    requiredChoice: { name: "Formato", options: [{ name: "Copa", price: 0 }, { name: "Botella", price: 9.5 }] }
  },
  {
    id: 702, category: "Vinos tintos", name: "Tinto de la casa", description: "Crianza D.O. Valdepeñas", price: 2.7, image: "",
    requiredChoice: { name: "Formato", options: [{ name: "Copa", price: 0 }, { name: "Botella", price: 10.3 }] }
  },
  {
    id: 703, category: "Vinos rosados", name: "Rosado de la casa", description: "Fresco y afrutado", price: 2.5, image: "",
    requiredChoice: { name: "Formato", options: [{ name: "Copa", price: 0 }, { name: "Botella", price: 9.5 }] }
  },
];

/**
 * GALERÍA "NUESTROS ARROCES" — fichas con foto.
 * FOTO: sube aquí las fotos reales (paella/arroz). Mientras image === ""
 * la web muestra un marco placeholder con el nombre del plato.
 * TODO: confirmar qué arroces se destacan.
 */
// Arroces reales de La Caleta (tomados de su carta). Precio por ración, mínimo 2.
// FOTO: su web no tiene fotos individuales buenas de cada arroz → siguen en placeholder.
// Recomendación: una foto cenital de cada arroz en la paella mejoraría mucho esta sección.
export const ARROCES_DATA: Dish[] = [
  { name: "Arroz del senyoret", description: "Pescado, marisco pelado y pimientos rojos", image: "/img/arroz-1.jpg" /* FOTO template (stock) — sustituir por foto real del plato */ },
  { name: "Paella de marisco", description: "Gambas, mejillones y almejas al azafrán", image: "/img/arroz-2.jpg" /* FOTO template (stock) — sustituir por foto real del plato */ },
  { name: "Arroz a banda", description: "Sofrito, pimiento rojo y marisco", image: "/img/arroz-3.jpg" /* FOTO template (stock) — sustituir por foto real del plato */ },
  { name: "Arroz caldoso de marisco", description: "Meloso, con gambas y verduras", image: "/img/arroz-4.jpg" /* FOTO template (stock) — sustituir por foto real del plato */ },
];
