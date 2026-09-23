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
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <path
          d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.4 18.6z"
          strokeLinejoin="round"
        />
      </svg>
      {children}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}
