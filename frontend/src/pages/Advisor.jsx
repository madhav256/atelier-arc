import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, money } from "../lib/api";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const OPENERS = [
  "Something quiet for a study, warm tones, under 2 lakh",
  "A statement piece for a double-height living room",
  "Cool blues for a bedroom, nothing busy",
];

function Pick({ pick }) {
  const { artwork: a, reason } = pick;
  const image = a.images?.[0];
  return (
    <li className="advisor-pick">
      <Link to={`/artworks/${a.slug}`} className="advisor-pick-image" tabIndex={-1} aria-hidden="true">
        <img src={image?.url} alt="" loading="lazy" width="360" height="440" />
      </Link>
      <div>
        <h3>
          <Link to={`/artworks/${a.slug}`}>{a.title}</Link>
        </h3>
        <p className="advisor-pick-meta">
          {[a.artist?.name, a.medium].filter(Boolean).join(" · ")}
        </p>
        <p className="advisor-pick-price">
          {a.priceOnRequest ? "Price on request" : money(a.price, a.currency)}
        </p>
        <p className="advisor-pick-reason">{reason}</p>
      </div>
    </li>
  );
}

export default function Advisor() {
  useDocumentMeta(
    "Private Advisor",
    "Describe the room, the mood and what you wish to spend. The Private Advisor suggests works from the collection.",
  );
  const status = useQuery({
    queryKey: ["advisor", "status"],
    queryFn: () => api("/advisor/status"),
    staleTime: 5 * 60_000,
  });
  const [turns, setTurns] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef(null);
  const field = useRef(null);
  const sent = useRef(0);

  useEffect(() => {
    if (sent.current && turns.length) end.current?.scrollIntoView?.({ block: "nearest" });
  }, [turns, busy]);

  const send = async (content) => {
    const value = content.trim();
    if (!value || busy) return;
    const next = [...turns, { role: "user", content: value }];
    sent.current += 1;
    setTurns(next);
    setText("");
    setError("");
    setBusy(true);
    try {
      const res = await api("/advisor/chat", {
        body: { messages: next.map(({ role, content: c }) => ({ role, content: c })) },
      });
      setTurns([...next, { role: "assistant", content: res.reply, picks: res.picks }]);
    } catch (e) {
      setError(e.message || "The advisor could not answer. Please try again.");
    } finally {
      setBusy(false);
      field.current?.focus();
    }
  };

  const unavailable = status.data && !status.data.enabled;

  return (
    <section className="advisor">
      <header className="advisor-head">
        <span className="eyebrow">
          <i>01</i> Private Advisor
        </span>
        <h1>
          Tell us about <em>the wall.</em>
        </h1>
        <p className="lede">
          Describe the room, the mood, the palette, what you wish to spend. We
          will suggest works from the collection, and only from the collection.
        </p>
      </header>

      <div className="advisor-room">
        {unavailable ? (
          <div className="advisor-closed">
            <p>The Private Advisor is not receiving visitors at the moment.</p>
            <Link className="button" to="/advisory">
              Speak with a person
            </Link>
          </div>
        ) : (
          <>
            <ol className="advisor-log" aria-live="polite" aria-label="Conversation">
              {turns.length === 0 && (
                <li className="advisor-openers">
                  <p className="advisor-hint">Begin with a sentence, or try</p>
                  {OPENERS.map((o) => (
                    <button key={o} type="button" className="advisor-opener" onClick={() => send(o)}>
                      {o}
                    </button>
                  ))}
                </li>
              )}
              {turns.map((t, i) => (
                <li key={i} className={`advisor-turn is-${t.role}`}>
                  <span className="advisor-who">{t.role === "user" ? "You" : "Advisor"}</span>
                  <p>{t.content}</p>
                  {t.picks?.length > 0 && (
                    <ul className="advisor-picks">
                      {t.picks.map((p) => (
                        <Pick key={p.artwork._id} pick={p} />
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              {busy && (
                <li className="advisor-turn is-assistant is-waiting">
                  <span className="advisor-who">Advisor</span>
                  <p>Considering the collection</p>
                </li>
              )}
              <li ref={end} aria-hidden="true" />
            </ol>
            {error && (
              <p className="advisor-error" role="alert">
                {error}{" "}
                <Link to="/advisory" className="text-link">
                  Speak with a person
                </Link>
              </p>
            )}
            <form
              className="advisor-form"
              onSubmit={(e) => {
                e.preventDefault();
                send(text);
              }}
            >
              <label htmlFor="advisor-input" className="sr-only">
                Describe what you are looking for
              </label>
              <textarea
                id="advisor-input"
                ref={field}
                rows={1}
                maxLength={1000}
                value={text}
                placeholder="A calm piece for the study, warm tones, under 2 lakh"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(text);
                  }
                }}
              />
              <button className="text-link" type="submit" disabled={busy || !text.trim()}>
                Send
              </button>
            </form>
            <p className="advisor-note">
              Suggestions come from an AI model and may miss nuance. A human
              advisor confirms every acquisition.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
