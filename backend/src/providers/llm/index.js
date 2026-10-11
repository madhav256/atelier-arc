import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { mockProvider } from './mock.js';
import { geminiProvider } from './gemini.js';

const providers = { mock: mockProvider, gemini: geminiProvider };

// 'gemini' needs GEMINI_API_KEY. With no key: mock outside production, unavailable in production
// (the UI then points visitors to the human advisory page instead of faking a model).
export function llmName() {
  const chosen = env.llm.provider;
  if (chosen === 'gemini' && !env.llm.geminiApiKey) return env.isProd ? null : 'mock';
  return chosen;
}

export function llmProvider() {
  const name = llmName();
  if (!name) throw new AppError(503, 'The advisor is not available at the moment', 'ADVISOR_UNAVAILABLE');
  const provider = providers[name];
  if (!provider) throw new AppError(500, `Unknown LLM provider ${name}`, 'CONFIG_ERROR');
  return provider;
}
