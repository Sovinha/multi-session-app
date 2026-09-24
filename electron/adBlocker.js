/**
 * Filtro de Otimização de Recursos e Bloqueador Pasivo
 * Garante que NENHUMA requisição do Cloudflare, Captchas ou scripts de verificação
 * seja cancelada com ERR_BLOCKED_BY_CLIENT.
 */

function setupAdAndResourceFilter(sessionInstance) {
  if (!sessionInstance || !sessionInstance.webRequest || sessionInstance.__adBlockerSetup) return;
  sessionInstance.__adBlockerSetup = true;

  try {
    sessionInstance.webRequest.onBeforeRequest(
      { urls: ['<all_urls>'] },
      (details, callback) => {
        // NUNCA cancela requisições para evitar ERR_BLOCKED_BY_CLIENT no Cloudflare
        return callback({ cancel: false });
      }
    );
  } catch (e) {
    console.error('Erro ao configurar adBlocker:', e);
  }
}

module.exports = { setupAdAndResourceFilter };
