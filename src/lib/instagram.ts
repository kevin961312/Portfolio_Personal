declare global {
  interface Window {
    instgrm?: {
      Embeds: { process(): void };
    };
  }
}

const SCRIPT_ID = 'instagram-embed-script';

/**
 * Convierte en iframe cada `<blockquote class="instagram-media">` del DOM.
 * La primera vez inyecta `embed.js`, que procesa solo al cargar; después
 * basta con volver a llamar a `process()` para los blockquotes nuevos.
 */
export function procesarEmbedsInstagram() {
  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  } else if (window.instgrm) {
    window.instgrm.Embeds.process();
  }
}

/** Quita query params y deja una sola `/` final, como espera el embed. */
export function limpiarUrlInstagram(url: string): string {
  return url.split('?')[0].replace(/\/$/, '') + '/';
}
