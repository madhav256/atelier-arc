// Advisor contact over email: a mailto link with a prefilled note. Free, no account.
// Override the address at build time with VITE_ADVISOR_EMAIL.
export const advisorEmail =
  import.meta.env.VITE_ADVISOR_EMAIL || "maddynade7@gmail.com";

export function advisorMailto(
  message,
  { subject = "Advisor inquiry - Atelier Arc", email = advisorEmail } = {},
) {
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export function artworkMessage(
  artwork,
  origin = typeof window !== "undefined" ? window.location.origin : "",
) {
  const by = artwork.artist?.name ? ` by ${artwork.artist.name}` : "";
  return `Hello, I would like to speak with an advisor about "${artwork.title}"${by}.\n${origin}/artworks/${artwork.slug}`;
}
