# Restaurante La Caleta — Web

Web oficial de **Restaurante La Caleta** — Arrocería en el centro de Ciudad Real (desde el año 2000).
Paellas, arroces y cocina mediterránea. Construida sobre un template de restaurante en React + Vite + Tailwind.

## 🛠 Características

*   **Landing de una página:** Hero · Nuestros arroces · Carta · Comida para llevar · Sobre nosotros · Reservas · Contacto · Footer.
*   **Reservas:** Formulario (fecha/hora/comensales) que compone un email + botón de llamada directa.
*   **Comida para llevar y grupos:** CTA directo al teléfono.
*   **SEO/AEO:** `title` y `meta description` propios, un único `H1`, headings correctos y datos estructurados **JSON-LD** tipo `Restaurant` (dirección, teléfono, horario, `servesCuisine`, `priceRange`, menú).
*   **Diseño responsive** y rápido (fuentes auto-hospedadas, anti-FOUC/FOUT).
*   **Configuración centralizada:** todo se edita desde `data.ts`.

## 🚀 Instalación y desarrollo

Proyecto React + Vite.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # genera /dist
```

Listo para desplegar en **Vercel** (ver `vercel.json`).

## 📁 Estructura

*   `data.ts`: **CEREBRO DE LA APP.** Nombre, contacto, colores, textos y carta (`MENU_DATA`, `ARROCES_DATA`).
*   `components/RestaurantTemplate.tsx`: interfaz principal (todas las secciones).
*   `components/SEO.tsx`: meta tags, Open Graph y JSON-LD.
*   `index.html`: fuentes, Tailwind (CDN) y title/canonical iniciales.

## ✅ Pendiente de rellenar (placeholders)

Busca `TODO`, `PLACEHOLDER` y `FOTO` en el código. En resumen:

*   **Fotos:** arroces/paellas (`ARROCES_DATA` y hero), interior/fachada del local (`Sobre nosotros`).
*   **Carta real:** platos y precios en `MENU_DATA` (todos marcados `// TODO: carta real`).
*   **Horario exacto:** `CONFIG.business.openingHours` y `CONFIG.ui.contact.hoursText`.
*   **Dirección y coordenadas exactas:** `CONFIG.business.address` y `CONFIG.business.geo`.
*   **Dominio, redes y Google Search Console** cuando estén disponibles.
