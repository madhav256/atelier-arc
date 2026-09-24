import { whatsappLink, artworkMessage } from "../lib/whatsapp";

// A quiet text link, not a green widget: the chat opens in WhatsApp with a prefilled note.
export function AdvisorChat({
  artwork,
  message,
  children = "Message an advisor on WhatsApp",
  className = "text-link advisor-chat",
}) {
  const href = whatsappLink(
    message ||
      (artwork
        ? artworkMessage(artwork)
        : "Hello, I would like to speak with an Atelier Arc advisor."),
  );
  if (!href) return null;
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}
