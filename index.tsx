
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// === Anti-glitch de arranque ===
// Mostramos el contenido (fade-in) solo cuando las fuentes están cargadas y
// Tailwind ya aplicó estilos, para evitar el salto de tipografía (FOUT) y el
// flash de estilos (FOUC). Un timeout de seguridad lo revela igualmente si las
// fuentes tardan o fallan, para no dejar la web oculta nunca.
const revealApp = () => {
  document.documentElement.classList.remove('fonts-loading');
  document.documentElement.classList.add('fonts-loaded');
};

const safety = window.setTimeout(revealApp, 2000);

const fontSet: any = (document as any).fonts;
const fontsReady: Promise<unknown> = fontSet?.load
  ? Promise.all([
      fontSet.load('400 1em "Inter"'),
      fontSet.load('600 1em "Playfair Display"'),
      fontSet.load('700 1em "Playfair Display"'),
    ]).catch(() => {})
  : Promise.resolve();

fontsReady.then(() => {
  // Doble requestAnimationFrame: da un frame para que Tailwind (CDN) pinte los
  // estilos de los nodos ya montados antes de mostrar.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      window.clearTimeout(safety);
      revealApp();
    })
  );
});
