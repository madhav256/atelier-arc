// Shared by the taste quiz (guest preview) and its tests. The server applies the same weights.
export const STEPS = [
  {
    key: "styles",
    multi: 2,
    question: "Which of these speaks to you?",
    hint: "Choose one or two.",
    options: [
      { id: "colour-field", label: "Colour field", image: "/art/work-01.jpg" },
      { id: "horizon", label: "Horizon", image: "/art/work-02.jpg" },
      { id: "geometric", label: "Geometry", image: "/art/work-03.jpg" },
      { id: "arch", label: "The arch", image: "/art/work-19.jpg" },
      { id: "strata", label: "Strata", image: "/art/work-05.jpg" },
    ],
  },
  {
    key: "palettes",
    multi: 2,
    question: "Which palette would you live with?",
    hint: "Choose one or two.",
    options: [
      { id: "warm", label: "Earth and ochre", image: "/art/work-20.jpg" },
      { id: "cool", label: "Indigo and sky", image: "/art/work-06.jpg" },
      { id: "verdant", label: "Sage and olive", image: "/art/work-10.jpg" },
      {
        id: "monochrome",
        label: "Quiet monochrome",
        image: "/art/work-12.jpg",
      },
    ],
  },
  {
    key: "scale",
    question: "Where will it live?",
    hint: "Choose one.",
    options: [
      { id: "intimate", label: "An intimate corner", note: "Up to 60 cm wide" },
      { id: "considered", label: "A considered wall", note: "60 to 100 cm" },
      { id: "statement", label: "A statement room", note: "100 cm and beyond" },
    ],
  },
  {
    key: "budget",
    question: "A comfortable range.",
    hint: "Private, and only used to tune what we show you.",
    options: [
      { id: "b1", label: "Under ₹50,000", max: 50000 },
      { id: "b2", label: "₹50,000 – ₹1 lakh", min: 50000, max: 100000 },
      { id: "b3", label: "₹1 – 5 lakh", min: 100000, max: 500000 },
      { id: "b4", label: "₹5 – 10 lakh", min: 500000, max: 1000000 },
      { id: "b5", label: "₹10 lakh and above", min: 1000000 },
      { id: "open", label: "Prefer not to say" },
    ],
  },
];

export function toPayload(answers) {
  const budget = STEPS[3].options.find((o) => o.id === answers.budget?.[0]);
  return {
    action: "complete",
    styles: answers.styles || [],
    palettes: answers.palettes || [],
    ...(answers.scale?.[0] ? { scale: answers.scale[0] } : {}),
    ...(budget?.min != null ? { priceMin: budget.min } : {}),
    ...(budget?.max != null ? { priceMax: budget.max } : {}),
  };
}

export function scaleOf(artwork) {
  const d = artwork.dimensions || {};
  const w = d.unit === "in" ? (d.width || 0) * 2.54 : d.width || 0;
  if (!w) return null;
  return w <= 60 ? "intimate" : w >= 100 ? "statement" : "considered";
}

export function scoreForTaste(artwork, p) {
  let s = 0;
  if (p.styles?.some((x) => artwork.style?.includes(x))) s += 4;
  if (p.palettes?.some((x) => artwork.tags?.includes(x))) s += 2.5;
  if (p.scale && scaleOf(artwork) === p.scale) s += 1.5;
  if (p.priceMax && artwork.price > p.priceMax) s -= 5;
  if (p.priceMin && artwork.price && artwork.price < p.priceMin) s -= 2;
  return s;
}

export const PENDING_KEY = "aa-taste-pending";
export const INVITE_KEY = "aa-taste-invite";
