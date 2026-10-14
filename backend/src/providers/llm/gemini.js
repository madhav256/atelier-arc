import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING' },
    picks: {
      type: 'ARRAY',
      items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, reason: { type: 'STRING' } }, required: ['id', 'reason'] },
    },
  },
  required: ['reply', 'picks'],
};

async function call(model, key, system, messages) {
  const res = await fetch(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    signal: AbortSignal.timeout(env.llm.timeoutMs),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.4, maxOutputTokens: 700, responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
    }),
  }).catch(() => null);
  if (res?.ok) return { res };
  const detail = res ? await res.json().catch(() => ({})) : {};
  const info = { model, upstreamStatus: res?.status ?? 'network', reason: detail.error?.status, message: String(detail.error?.message || '').slice(0, 160) };
  console.error(JSON.stringify({ level: 'error', msg: 'gemini request failed', ...info }));
  return { res, info };
}

// Gemini through the public REST API (free tier). No SDK, so the dependency tree is unchanged.
// Models are tried in order (GEMINI_MODEL, then GEMINI_FALLBACK_MODELS) when one is retired,
// rate limited or overloaded.
export const geminiProvider = {
  name: 'gemini',
  async generate({ system, messages }) {
    const key = env.llm.geminiApiKey;
    if (!key) throw new AppError(503, 'The advisor is not configured', 'ADVISOR_UNAVAILABLE');
    let last;
    for (const model of [env.llm.model, ...env.llm.fallbackModels]) {
      last = await call(model, key, system, messages);
      if (last.res?.ok) break;
      if (last.res && [400, 401, 403].includes(last.res.status)) break; // our request or key is wrong; another model will not help
    }
    const { res, info } = last;
    if (!res?.ok) {
      if (res?.status === 429) throw new AppError(429, 'The advisor is busy. Please try again in a minute.', 'ADVISOR_BUSY');
      throw new AppError(503, 'The advisor is resting. Please try again shortly.', 'ADVISOR_UNAVAILABLE', info);
    }
    const data = await res.json().catch(() => ({}));
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    try {
      return JSON.parse(text);
    } catch {
      throw new AppError(502, 'The advisor could not answer. Please rephrase.', 'ADVISOR_BAD_RESPONSE');
    }
  },
};
