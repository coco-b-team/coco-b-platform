// Filtro rápido y barato: detecta los intentos más obvios de manipular al
// asistente (pedirle que ignore sus instrucciones, revele su configuración,
// cambie de personaje) ANTES de gastar una llamada a Gemini. No reemplaza
// la defensa que ya vive en el system prompt — es una primera capa que
// ahorra cuota ante los intentos más evidentes, no ante los sutiles.

const SUSPICIOUS_PATTERNS = [
  /ignor[a-z]*.{0,25}instruccion/i,
  /olvid[a-z]*.{0,25}instruccion/i,
  /revela?.{0,25}(system\s*prompt|configuraci[oó]n|instruccion)/i,
  /act[uú]a\s+como\s+(si|un|otro)/i,
  /ignor[a-z]*.{0,25}instructions/i,
  /disregard.{0,25}instructions/i,
  /forget.{0,25}instructions/i,
  /reveal.{0,25}(system\s*prompt|instructions|configuration)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /you\s+are\s+now\s+a/i,
];

export function looksLikeInjectionAttempt(message: string): boolean {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(message));
}
