import { advisorMailto, artworkMessage } from "../lib/advisor";

// A quiet text link, not a widget: the note opens in the visitor's mail client.
export function AdvisorChat({
  artwork,
  message,
  subject,
  children = "Email an advisor",
  className = "text-link advisor-chat",
}) {
  const href = advisorMailto(
    message ||
      (artwork
        ? artworkMessage(artwork)
        : "Hello, I would like to speak with an Atelier Arc advisor."),
    { subject: subject || (artwork ? `About "${artwork.title}"` : undefined) },
  );
  if (!href) return null;
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}
