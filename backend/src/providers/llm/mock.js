// Deterministic stand-in for the language model. It reads the same prompt contract as a real
// provider and answers in the same JSON shape, so the advisor service, routes, tests and the
// UI all behave identically with or without an API key. It is not used for real visitors in
// production unless LLM_PROVIDER=mock is set on purpose.
const WORDS = {
  warm: ['warm', 'ochre', 'earth', 'amber', 'terracotta', 'sand', 'golden', 'gold', 'rust'],
  cool: ['cool', 'blue', 'indigo', 'sky', 'sea', 'ocean', 'teal', 'moody'],
  verdant: ['green', 'sage', 'olive', 'verdant', 'forest', 'moss'],
  monochrome: ['monochrome', 'black', 'white', 'grey', 'gray', 'ink', 'charcoal'],
  calm: ['quiet', 'calm', 'serene', 'still', 'soft', 'gentle', 'restful', 'minimal'],
};

const tokens = (s) => String(s || '').toLowerCase().match(/[a-z]+/g) || [];

function scoreWork(work, wanted) {
  const haystack = new Set(tokens([work.title, work.medium, work.category, work.description, ...(work.tags || []), ...(work.style || []), ...(work.colors || [])].join(' ')));
  let score = 0;
  for (const word of wanted) if (haystack.has(word)) score += 2;
  return score;
}

export const mockProvider = {
  name: 'mock',
  async generate({ messages, catalogue }) {
    const said = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' ');
    const wanted = new Set(tokens(said));
    for (const group of Object.values(WORDS)) if (group.some((w) => wanted.has(w))) group.forEach((w) => wanted.add(w));
    const ranked = catalogue
      .map((w) => ({ w, s: scoreWork(w, wanted) }))
      .sort((a, b) => b.s - a.s || a.w.price - b.w.price)
      .slice(0, 3);
    const picks = ranked.map(({ w }) => ({
      id: w.id,
      reason: `A match for your brief: ${[w.medium, w.style?.[0], w.tags?.[0]].filter(Boolean).join(', ') || 'a considered piece'}.`,
    }));
    return {
      reply: picks.length
        ? 'These are the works I would put in front of you first. Tell me about the wall or the light and I will narrow them further.'
        : 'I could not find a work that fits yet. Tell me a little more about the room, the palette or what you wish to spend.',
      picks,
    };
  },
};
