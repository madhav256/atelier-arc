import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, label } from "../lib/api";
import { useSession } from "../hooks/useSession";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { Loading, ErrorState, Empty } from "../components/States";
import { FormError } from "../components/Form";

const TZ = "Asia/Kolkata";
const dayKey = (iso) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const fmt = (iso, opts) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...opts }).format(
    new Date(iso),
  );
export const viewingWhen = (iso) =>
  fmt(iso, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });

const PLACES = [
  ["mumbai", "Mumbai", "Colaba gallery"],
  ["new-delhi", "New Delhi", "Lodhi Colony gallery"],
  ["virtual", "Virtual", "Video call with an advisor"],
];

export default function BookViewing() {
  useDocumentMeta(
    "Book a private viewing",
    "Choose a time to see a work in person at our Mumbai or New Delhi gallery, or with an advisor on a video call.",
  );
  const [params] = useSearchParams();
  const loc = useLocation();
  const artworkSlug = params.get("artwork");
  const { user } = useSession();
  const qc = useQueryClient();
  const [location, setLocation] = useState("mumbai");
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [notes, setNotes] = useState("");
  const artwork = useQuery({
    queryKey: ["artwork", artworkSlug],
    queryFn: () => api(`/artworks/${artworkSlug}`),
    enabled: Boolean(artworkSlug),
  });
  const slots = useQuery({
    queryKey: ["viewing-slots", location],
    queryFn: () => api(`/viewings/slots?location=${location}`),
  });
  const days = useMemo(() => {
    const map = new Map();
    for (const s of slots.data?.slots || []) {
      const k = dayKey(s.startsAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(s);
    }
    return [...map.entries()];
  }, [slots.data]);
  const activeDay =
    days.find(([k]) => k === day) ||
    days.find(([, list]) => list.some((s) => s.available));
  const book = useMutation({
    mutationFn: () =>
      api("/me/viewings", {
        body: {
          location,
          startsAt: slot,
          ...(artwork.data?._id && { artworkId: artwork.data._id }),
          ...(notes.trim() && { notes: notes.trim() }),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["viewing-slots"] });
      qc.invalidateQueries({ queryKey: ["me", "viewings"] });
    },
    onError: () => qc.invalidateQueries({ queryKey: ["viewing-slots"] }),
  });

  useEffect(() => {
    if (book.isSuccess) window.scrollTo({ top: 0 });
  }, [book.isSuccess]);

  if (book.isSuccess) {
    const v = book.data;
    const place = PLACES.find((p) => p[0] === v.location);
    return (
      <section className="plain-page viewing-page viewing-done">
        <span className="eyebrow">CONFIRMED · {v.reference}</span>
        <h1>
          We look forward
          <br />
          <em>to seeing you.</em>
        </h1>
        <dl className="viewing-summary">
          <div>
            <dt>When</dt>
            <dd>{viewingWhen(v.startsAt)} IST</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>
              {place?.[1]} · {place?.[2]}
            </dd>
          </div>
          {artwork.data && (
            <div>
              <dt>The work</dt>
              <dd>{artwork.data.title}</dd>
            </div>
          )}
        </dl>
        <p className="muted">
          A confirmation with a calendar invitation is on its way to{" "}
          {user?.email}.
        </p>
        <p className="viewing-actions">
          <Link className="button" to="/account/viewings">
            Your viewings
          </Link>
          <Link className="text-link" to="/artworks">
            Continue browsing
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="plain-page viewing-page">
      <span className="eyebrow">PRIVATE VIEWING</span>
      <h1>
        See it
        <br />
        <em>in person.</em>
      </h1>
      <p className="dek">
        Forty-five minutes with the work, hung and lit, and an advisor to answer
        questions. There is no charge and no obligation.
      </p>
      {artwork.data && (
        <div className="viewing-work">
          <img src={artwork.data.images?.[0]?.url} alt="" />
          <div>
            <span className="eyebrow">THE WORK</span>
            <b>{artwork.data.title}</b>
            <i>{artwork.data.artist?.name}</i>
          </div>
        </div>
      )}
      <fieldset className="viewing-step">
        <legend>
          <i>01</i> Where
        </legend>
        <div className="viewing-places">
          {PLACES.map(([key, name, note]) => (
            <label key={key} className={location === key ? "is-on" : ""}>
              <input
                type="radio"
                name="location"
                value={key}
                checked={location === key}
                onChange={() => {
                  setLocation(key);
                  setSlot(null);
                  setDay(null);
                }}
              />
              <b>{name}</b>
              <small>{note}</small>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="viewing-step">
        <legend>
          <i>02</i> When <small>India Standard Time</small>
        </legend>
        {slots.isLoading ? (
          <Loading />
        ) : slots.error ? (
          <ErrorState error={slots.error} retry={slots.refetch} />
        ) : (
          <>
            <div className="viewing-days" role="group" aria-label="Day">
              {days.map(([k, list]) => {
                const free = list.some((s) => s.available);
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={activeDay?.[0] === k}
                    disabled={!free}
                    onClick={() => {
                      setDay(k);
                      setSlot(null);
                    }}
                  >
                    <small>{fmt(list[0].startsAt, { weekday: "short" })}</small>
                    <b>{fmt(list[0].startsAt, { day: "numeric" })}</b>
                    <small>{fmt(list[0].startsAt, { month: "short" })}</small>
                  </button>
                );
              })}
            </div>
            <div className="viewing-times" role="group" aria-label="Time">
              {(activeDay?.[1] || []).map((s) => (
                <button
                  key={s.startsAt}
                  type="button"
                  aria-pressed={slot === s.startsAt}
                  disabled={!s.available}
                  onClick={() => setSlot(s.startsAt)}
                >
                  {fmt(s.startsAt, { hour: "numeric", minute: "2-digit" })}
                  {!s.available && <span className="sr-only"> (taken)</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </fieldset>
      <fieldset className="viewing-step">
        <legend>
          <i>03</i> Anything we should know
        </legend>
        <label className="sr-only" htmlFor="viewing-notes">
          Notes for the advisor
        </label>
        <textarea
          id="viewing-notes"
          rows={3}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Other works you would like to see, access needs, who is coming with you"
        />
      </fieldset>
      <div className="viewing-confirm">
        <p aria-live="polite">
          {slot
            ? `${viewingWhen(slot)} IST · ${PLACES.find((p) => p[0] === location)[1]}`
            : "Choose a day and a time."}
        </p>
        {user ? (
          <button
            type="button"
            className="button"
            disabled={!slot || book.isPending}
            onClick={() => book.mutate()}
          >
            {book.isPending ? "Confirming…" : "Confirm viewing"}
          </button>
        ) : (
          <Link
            className="button"
            to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`}
          >
            Sign in to confirm
          </Link>
        )}
        <FormError error={book.error} />
      </div>
    </section>
  );
}

export function AccountViewings() {
  useDocumentMeta("Your viewings", undefined, { noindex: true });
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["me", "viewings"],
    queryFn: () => api("/me/viewings"),
  });
  const cancel = useMutation({
    mutationFn: (id) => api(`/me/viewings/${id}/cancel`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "viewings"] }),
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  const now = Date.now();
  return (
    <>
      <div className="section-head">
        <h1>Viewings</h1>
        <Link className="button ghost small" to="/viewings/book">
          Book a viewing
        </Link>
      </div>
      {q.data.length ? (
        <ul className="row-list viewing-list">
          {q.data.map((v) => {
            const place = PLACES.find((p) => p[0] === v.location);
            const upcoming =
              v.status === "confirmed" && new Date(v.startsAt) > now;
            return (
              <li key={v._id}>
                <span>
                  <b>{viewingWhen(v.startsAt)}</b>
                  <br />
                  {place?.[1]} · {place?.[2]}
                  {v.artwork && (
                    <>
                      <br />
                      <Link to={`/artworks/${v.artwork.slug}`}>
                        {v.artwork.title}
                      </Link>
                    </>
                  )}
                </span>
                <span className="muted">{v.reference}</span>
                <span className={`pill pill-${v.status}`}>
                  {label(v.status)}
                </span>
                {upcoming ? (
                  <button
                    type="button"
                    className="link-button"
                    disabled={cancel.isPending}
                    onClick={() => cancel.mutate(v._id)}
                    aria-label={`Cancel viewing ${v.reference}`}
                  >
                    Cancel
                  </button>
                ) : (
                  <span />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty
          title="No viewings yet"
          text="Book a private viewing to see a work in person or with an advisor on a call."
        />
      )}
      <FormError error={cancel.error} />
    </>
  );
}
