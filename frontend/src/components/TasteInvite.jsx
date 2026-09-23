import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useSession } from "../hooks/useSession";
import { INVITE_KEY } from "../lib/taste";

const seen = () => {
  try {
    return Boolean(localStorage.getItem(INVITE_KEY));
  } catch {
    return true;
  }
};

// A small, dismissible invitation on a first visit to the home page. Never modal.
export function TasteInvite() {
  const { pathname } = useLocation();
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (
      pathname !== "/" ||
      loading ||
      seen() ||
      user?.tasteQuiz?.completedAt ||
      user?.tasteQuiz?.skippedAt
    )
      return setOpen(false);
    const t = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(t);
  }, [pathname, loading, user]);
  const close = (value) => {
    try {
      localStorage.setItem(INVITE_KEY, JSON.stringify(value));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };
  if (!open) return null;
  return (
    <aside className="taste-invite" aria-label="Taste profile invitation">
      <button
        className="taste-invite-close"
        onClick={() => close("dismissed")}
        aria-label="Dismiss"
      >
        <X aria-hidden="true" />
      </button>
      <span className="eyebrow">A minute, four questions</span>
      <p>
        Tell us what you are drawn to, and we will show you the works you are
        most likely to love.
      </p>
      <Link className="text-link" to="/taste" onClick={() => close("started")}>
        Discover your eye
      </Link>
    </aside>
  );
}
