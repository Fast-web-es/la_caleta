
import React, { useEffect } from 'react';
import { CONFIG } from '../data';

const SEO: React.FC = () => {
  useEffect(() => {
    // 1. Dynamic Page Title (SEO propio)
    document.title = `${CONFIG.business.name} | Arrocería en ${CONFIG.business.address.city}`;

    // 2. Dynamic Meta Tags Injection
    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setProperty = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', CONFIG.business.description);
    setMeta('theme-color', CONFIG.theme.primaryColor);

    // Open Graph / Twitter for link previews.
    // TODO (FOTO): cuando haya una foto real de portada, apuntar aquí a /og-image.jpg.
    const ogImage = `${CONFIG.business.url}${CONFIG.business.logo}`;
    setProperty('og:title', `${CONFIG.business.name} | ${CONFIG.business.address.city}`);
    setProperty('og:description', CONFIG.business.description);
    setProperty('og:image', ogImage);
    setProperty('og:url', CONFIG.business.url);
    setProperty('og:type', 'restaurant.restaurant');
    setProperty('og:locale', 'es_ES');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${CONFIG.business.name} | ${CONFIG.business.address.city}`);
    setMeta('twitter:description', CONFIG.business.description);
    setMeta('twitter:image', ogImage);

    // 3. Schema.org JSON-LD (Restaurant/LocalBusiness)
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": CONFIG.business.name,
      "image": ogImage,
      "@id": CONFIG.business.url,
      "url": CONFIG.business.url,
      "telephone": CONFIG.business.telephone,
      "priceRange": CONFIG.business.priceRange,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": CONFIG.business.address.street,
        "addressLocality": CONFIG.business.address.city,
        "postalCode": CONFIG.business.address.postalCode,
        "addressCountry": CONFIG.business.address.country
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": CONFIG.business.geo.latitude,
        "longitude": CONFIG.business.geo.longitude
      },
      "openingHoursSpecification": (() => {
        // openingHours: "Mo-Su 13:00-16:30" → extraemos el rango horario con regex.
        const m = CONFIG.business.openingHours.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
        return {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
          ],
          "opens": m ? m[1] : undefined,
          "closes": m ? m[2] : undefined
        };
      })(),
      "servesCuisine": ["Mediterránea", "Arroces", "Paella", "Española"],
      "hasMap": CONFIG.business.googleMapsShortUrl,
      "sameAs": [
        CONFIG.business.social.instagram,
        CONFIG.business.social.facebook,
        CONFIG.business.social.tripadvisor
      ].filter(Boolean),
      "hasMenu": `${CONFIG.business.url}/#menu`,
      "menu": `${CONFIG.business.url}/#menu`,
      "acceptsReservations": CONFIG.business.reservations?.enabled ? "True" : "False",
      ...(CONFIG.business.reservations?.enabled && {
        "potentialAction": {
          "@type": "ReserveAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${CONFIG.business.url}/#reservas`,
            "actionPlatform": [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform"
            ]
          },
          "result": {
            "@type": "FoodEstablishmentReservation",
            "name": `Reserva en ${CONFIG.business.name}`
          }
        }
      })
    };

    let script = document.querySelector('#seo-json-ld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'seo-json-ld';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData);

  }, []);

  // 4. CSS Variables Injection for White-Label Theme
  // This allows Tailwind to use variables configured in data.ts
  const cssVariables = `
    :root {
      --theme-primary: ${CONFIG.theme.primaryColor};
      --theme-secondary: ${CONFIG.theme.secondaryColor};
      --font-display: '${CONFIG.theme.fontDisplay}', sans-serif;
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
  );
};

export default SEO;
