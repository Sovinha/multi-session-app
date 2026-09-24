/**
 * Utilitários do Modo Anti-AFK e Proteção Anti-Ban
 */

// Intervalo base de 3 minutos e 25 segundos = 205 segundos = 205.000ms
export const BASE_AFK_INTERVAL_SECONDS = 205; 

/**
 * Gera uma variação humanizada aleatória de tempo (+2 a +6 segundos)
 * Evita que o tempo entre toques seja idêntico e seja detectado por scripts anti-bot.
 */
export function getHumanizedAfkDelaySeconds() {
  const randomJitter = Math.floor(Math.random() * 5) + 2; // +2s a +6s
  return BASE_AFK_INTERVAL_SECONDS + randomJitter;
}

/**
 * User-Agents autênticos de navegadores Desktop (Windows/Mac Chrome & Edge)
 */
export const DESKTOP_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
];

export function getRandomUserAgent() {
  const index = Math.floor(Math.random() * DESKTOP_USER_AGENTS.length);
  return DESKTOP_USER_AGENTS[index];
}
