/**
 * Preload Script Furtivo Nátivo para Google Login & Cloudflare
 * Não modifica prototypes de funções nativas para passar na verificação do Google Botguard.
 */

try {
  if (Object.prototype.hasOwnProperty.call(navigator, 'webdriver') || 'webdriver' in navigator) {
    delete Object.getPrototypeOf(navigator).webdriver;
  }
} catch (e) {}

try {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
    configurable: true,
    enumerable: true
  });
} catch (e) {}
