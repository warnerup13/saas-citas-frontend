/**
 * Utilidades para decodificación y verificación de ciclo de vida de JWT (JSON Web Tokens)
 */

/**
 * Decodifica de forma segura la carga útil (payload) de un JWT en base64url
 * @param {string} token 
 * @returns {object|null} Payload decodificado o null si el token es inválido
 */
export function parseJwt(token) {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Decodificar base64 con soporte de caracteres UTF-8
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn("[tokenUtils] Error al decodificar token JWT:", error);
    return null;
  }
}

/**
 * Obtiene el payload del token almacenado o pasado como argumento
 * @param {string} token 
 * @returns {object|null}
 */
export function getTokenPayload(token) {
  return parseJwt(token);
}

/**
 * Verifica si un token JWT ya expiró o está a punto de expirar
 * @param {string} token - Token JWT a verificar
 * @param {number} bufferSeconds - Margen de seguridad en segundos antes del vencimiento (default: 10s)
 * @returns {boolean} true si expiró o es inválido, false si aún es vigente
 */
export function isTokenExpired(token, bufferSeconds = 10) {
  if (!token) return true;

  const payload = parseJwt(token);
  if (!payload) return true;

  // Si el token no tiene campo 'exp', no podemos determinar expiración por JWT estándar
  if (!payload.exp) return false;

  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= (currentTimeSeconds + bufferSeconds);
}

/**
 * Calcula los milisegundos restantes de vigencia de un token
 * @param {string} token 
 * @returns {number} Milisegundos restantes (0 si expiró o es inválido)
 */
export function getTokenRemainingMs(token) {
  if (!token) return 0;

  const payload = parseJwt(token);
  if (!payload || !payload.exp) return 0;

  const diffMs = (payload.exp * 1000) - Date.now();
  return diffMs > 0 ? diffMs : 0;
}

/**
 * Retorna la fecha exacta de expiración del token
 * @param {string} token 
 * @returns {Date|null}
 */
export function getTokenExpirationDate(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return null;
  return new Date(payload.exp * 1000);
}
