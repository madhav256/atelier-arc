import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import {
  STEPS,
  toPayload,
  scoreForTaste,
  PENDING_KEY,
  INVITE_KEY,
} from "../lib/taste";
import { useSession } from "../hooks/useSession";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { ArtworkCard } from "../components/ArtworkCard";

const store = {
  get: (k) => {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* private mode: the quiz still works for this visit */
    }
  },
  del: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

async function previewFor(payload, signedIn) {
  if (signedIn) {
    const res = await api("/me/recommendations?limit=4", { raw: true });
    return res.data;
  }
  const works = await api("/artworks?limit=48&availability=available");
  return [...works]
    .sort((a, b) => scoreForTaste(b, payload) - scoreForTaste(a, payload))
    .slice(0, 4);
}

export default function TasteQuiz() {
  useDocumentMeta(
    "Your eye",
    "Four quiet questions that help us show you works you will love.",
    { noindex: true },
  );
  const { user, loading } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const heading = useRef(null);
  const synced = useRef(false);

  const finish = async (payload) => {
    setError("");
    try {
      if (user) {
        await api("/me/taste", { method: "PUT", body: payload });
        store.del(PENDING_KEY);
        qc.invalidateQueries({ queryKey: ["session"] });
        qc.invalidateQueries({ queryKey: ["me", "recommendations"] });
      } else {
        store.set(PENDING_KEY, payload);
      }
      store.set(INVITE_KEY, "done");
      setResult({ payload, works: await previewFor(payload, Boolean(user)) });
    } catch (e) {
      setError(
        e.message || "We could not save your answers. Please try again.",
      );
    }
  };

  // A guest who took the quiz and then signed in: save their answers once.
  useEffect(() => {
    if (loading || !user || synced.current) return;
    const pending = store.get(PENDING_KEY);
    if (pending?.action === "complete") {
      synced.current = true;
      finish(pending);
    }
  }, [loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const mounted = useRef(false);
  useEffect(() => {
    // Move focus to the new question for screen readers, but not on first load.
    if (mounted.current) heading.current?.focus();
    mounted.current = true;
  }, [step, result]);

  const skip = async () => {
    store.set(INVITE_KEY, "skipped");
    if (user)
      await api("/me/taste", { method: "PUT", body: { action: "skip" } }).catch(
        () => {},
      );
    navigate("/artworks");
  };

  if (result) {
    const chosen = STEPS[0].options
      .filter((o) => result.payload.styles.includes(o.id))
      .map((o) => o.label.toLowerCase());
    return (
      <section className="taste taste-result">
        <span className="eyebrow">Your eye</span>
        <h1 ref={heading} tabIndex={-1}>
          You are drawn to <em>{chosen.join(" and ")}.</em>
        </h1>
        <p className="taste-lede">
          {user
            ? "Saved to your profile. Your recommendations now lead with works like these."
            : "Sign in or create an account and we will keep this profile and tune your recommendations."}
        </p>
        <div className="art-grid">
          {result.works.map((a, i) => (
            <ArtworkCard key={a.slug} artwork={a} index={i} />
          ))}
        </div>
        <div className="taste-actions">
          {user ? (
            <Link className="button" to="/account/recommendations">
              See all selected for you
            </Link>
          ) : (
            <Link className="button" to="/login?next=/taste">
              Sign in to keep this profile
            </Link>
          )}
          <button
            className="text-link"
            onClick={() => {
              setResult(null);
              setStep(0);
            }}
          >
            Retake
          </button>
        </div>
      </section>
    );
  }

  const s = STEPS[step];
  const picked = answers[s.key] || [];
  const toggle = (id) => {
    const multi = s.multi || 1;
    let next;
    if (multi === 1) next = [id];
    else if (picked.includes(id)) next = picked.filter((x) => x !== id);
    else next = [...picked, id].slice(-multi);
    setAnswers({ ...answers, [s.key]: next });
  };
  const canContinue = step === 0 ? picked.length > 0 : true;
  const last = step === STEPS.length - 1;
  const imagery = s.options.some((o) => o.image);

  return (
    <section className="taste" aria-labelledby="taste-q">
      <div className="taste-top">
        <span className="eyebrow">
          <i>{String(step + 1).padStart(2, "0")}</i> of{" "}
          {String(STEPS.length).padStart(2, "0")} · Your eye
        </span>
        <button className="text-link taste-skip" onClick={skip}>
          Skip for now
        </button>
      </div>
      <div className="taste-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${(step + 1) / STEPS.length})` }} />
      </div>
      <h1 id="taste-q" ref={heading} tabIndex={-1}>
        {s.question}
      </h1>
      <p className="taste-lede">{s.hint}</p>
      <div
        className={`taste-options ${imagery ? "is-imagery" : "is-text"}`}
        role="group"
        aria-labelledby="taste-q"
      >
        {s.options.map((o, i) => (
          <button
            key={o.id}
            type="button"
            className="taste-option"
            aria-pressed={picked.includes(o.id)}
            onClick={() => toggle(o.id)}
          >
            {o.image && (
              <img
                src={o.image}
                alt=""
                loading={i > 2 ? "lazy" : "eager"}
                width="500"
                height="625"
              />
            )}
            <span className="taste-label">
              <i>{String(i + 1).padStart(2, "0")}</i> {o.label}
            </span>
            {o.note && <span className="taste-note">{o.note}</span>}
          </button>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="taste-actions">
        {step > 0 && (
          <button className="text-link" onClick={() => setStep(step - 1)}>
            <ArrowLeft aria-hidden="true" /> Back
          </button>
        )}
        <button
          className="button"
          disabled={!canContinue}
          onClick={() =>
            last ? finish(toPayload(answers)) : setStep(step + 1)
          }
        >
          {last ? "See my selection" : "Continue"}{" "}
          {!last && <ArrowRight aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
