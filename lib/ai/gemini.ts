const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

// Los errores 503 ("modelo con mucha demanda") son comunes en el nivel
// gratuito de Gemini y normalmente pasan solos en unos segundos — vale la
// pena reintentar una vez antes de darnos por vencidos.
const RETRYABLE_STATUS = new Set([503, 429]);
const RETRY_DELAY_MS = 1500;

async function callGemini(apiKey: string, systemInstruction: string, history: ChatMessage[]) {
  return fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: history.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
      // maxOutputTokens debe cubrir tanto el "pensamiento" interno del
      // modelo como el texto visible de la respuesta — con un límite bajo,
      // la respuesta visible puede salir cortada a mitad de frase.
      generationConfig: { maxOutputTokens: 1024, temperature: 0.6 },
    }),
  });
}

export async function generateChatReply(
  systemInstruction: string,
  history: ChatMessage[],
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada');
  }

  let res = await callGemini(apiKey, systemInstruction, history);

  if (!res.ok && RETRYABLE_STATUS.has(res.status)) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    res = await callGemini(apiKey, systemInstruction, history);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini respondió ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini no devolvió una respuesta utilizable');
  }
  return text;
}
