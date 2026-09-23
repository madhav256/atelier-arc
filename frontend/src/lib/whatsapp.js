// Advisor chat over WhatsApp click-to-chat (https://wa.me). Free, no API account:
// set VITE_ADVISOR_WHATSAPP to the advisory line in international format, digits only.
// When it is not set, the link is not rendered and visitors use the inquiry form instead.
export const advisorNumber = (
  import.meta.env.VITE_ADVISOR_WHATSAPP || ""
).replace(/\D/g, "");

export function whatsappLink(message, number = advisorNumber) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!/^\d{8,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function artworkMessage(
  artwork,
  origin = typeof window !== "undefined" ? window.location.origin : "",
) {
  const by = artwork.artist?.name ? ` by ${artwork.artist.name}` : "";
  return `Hello, I would like to speak with an advisor about "${artwork.title}"${by}.\n${origin}/artworks/${artwork.slug}`;
}
