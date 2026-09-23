import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api, money, date } from "../lib/api";
import { FormError } from "./Form";

const FLOOR = 0.6;
const WORDS = {
  offered: "Offer made",
  revised: "Offer revised",
  countered: "Counter-offer",
  accepted: "Agreed",
  declined: "Declined",
  withdrawn: "Withdrawn",
};
const STAFF_STATUS = {
  pending: "Awaiting your response",
  countered: "Countered, awaiting the collector",
  accepted: "Agreed",
  declined: "Declined",
  withdrawn: "Withdrawn by the collector",
};
const STATUS = {
  pending: "Awaiting a response",
  countered: "Counter-offer received",
  accepted: "Agreed",
  declined: "Not accepted",
  withdrawn: "Withdrawn",
};

// Amount input that accepts "1,20,000" or "120000".
const parse = (v) => Number(String(v).replace(/[^\d.]/g, ""));

export function MakeOffer({ artwork, user }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const min = Math.ceil(artwork.price * FLOOR);
  const send = useMutation({
    mutationFn: () =>
      api("/me/offers", {
        body: {
          artworkId: artwork._id,
          amount: parse(amount),
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      }),
    onSuccess: (inq) => {
      ref.current?.close();
      navigate(`/account/inquiries/${inq._id}`);
    },
  });
  if (!user) {
    return (
      <Link
        className="text-link offer-trigger"
        to={`/login?next=/artworks/${artwork.slug}`}
      >
        Sign in to make an offer
      </Link>
    );
  }
  const value = parse(amount);
  const invalid = !value || value < min || value >= artwork.price;
  return (
    <>
      <button
        className="text-link offer-trigger"
        onClick={() => ref.current?.showModal()}
      >
        Make an offer
      </button>
      <dialog ref={ref} className="offer-dialog" aria-labelledby="offer-title">
        <button onClick={() => ref.current.close()} aria-label="Close">
          ×
        </button>
        <span className="eyebrow">A private offer</span>
        <h2 id="offer-title">{artwork.title}</h2>
        <p className="offer-meta">
          Listed at {money(artwork.price, artwork.currency)}. Offers from{" "}
          {money(min, artwork.currency)} are considered by the gallery and the
          artist, usually within two business days.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!invalid) send.mutate();
          }}
        >
          <label className="offer-amount">
            <span>Your offer ({artwork.currency || "INR"})</span>
            <input
              inputMode="numeric"
              autoComplete="off"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(Math.round(artwork.price * 0.9))}
              aria-describedby="offer-help"
              required
            />
          </label>
          <p id="offer-help" className="offer-help">
            {value
              ? value >= artwork.price
                ? "At the list price you can acquire the work directly."
                : value < min
                  ? `Offers start from ${money(min, artwork.currency)}.`
                  : `${Math.round((value / artwork.price) * 100)}% of the list price.`
              : "Enter an amount below the list price."}
          </p>
          <label>
            <span>A note for the gallery (optional)</span>
            <textarea
              rows="3"
              maxLength="1000"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <FormError error={send.error} />
          <button className="button" disabled={invalid || send.isPending}>
            {send.isPending ? "Sending" : "Submit offer"}
          </button>
          <p className="offer-fine">
            No payment is taken now. If your offer is accepted, you will have
            three days to complete the acquisition at the agreed price.
          </p>
        </form>
      </dialog>
    </>
  );
}

export function BidTimeline({ bid }) {
  return (
    <ol className="bid-timeline">
      {bid.events.map((e, k) => (
        <li key={k}>
          <span className="bid-when">{date(e.at)}</span>
          <span>
            {WORDS[e.action]} · <b>{money(e.amount, bid.currency)}</b>{" "}
            <em>{e.by === "staff" ? "Gallery" : "Collector"}</em>
            {e.note && <span className="bid-note">{e.note}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ClientBid({ inquiry, onChange }) {
  const b = inquiry.bid;
  const [revising, setRevising] = useState(false);
  const [amount, setAmount] = useState("");
  const act = useMutation({
    mutationFn: ({ path, body }) =>
      api(`/me/inquiries/${inquiry._id}/bid/${path}`, { method: "POST", body }),
    onSuccess: () => {
      setRevising(false);
      setAmount("");
      onChange();
    },
  });
  const open = b.status === "pending" || b.status === "countered";
  return (
    <section className="offer-card bid-card" aria-labelledby="bid-h">
      <span className="eyebrow">Your offer</span>
      <h2 id="bid-h">
        {money(
          b.status === "countered" ? b.counterAmount : b.amount,
          b.currency,
        )}
      </h2>
      <p className="bid-status">
        {b.status === "countered"
          ? `The gallery proposes ${money(b.counterAmount, b.currency)} (you offered ${money(b.amount, b.currency)}).`
          : STATUS[b.status]}
      </p>
      {b.status === "accepted" && (
        <p>Agreed. Complete the acquisition from the private offer below.</p>
      )}
      {open && !revising && (
        <p className="bid-actions">
          {b.status === "countered" && (
            <button
              className="button"
              onClick={() => act.mutate({ path: "accept-counter" })}
              disabled={act.isPending}
            >
              Accept {money(b.counterAmount, b.currency)}
            </button>
          )}
          <button className="button ghost" onClick={() => setRevising(true)}>
            Revise offer
          </button>
          <button
            className="text-link"
            onClick={() =>
              confirm("Withdraw your offer?") &&
              act.mutate({ path: "withdraw" })
            }
            disabled={act.isPending}
          >
            Withdraw
          </button>
        </p>
      )}
      {revising && (
        <form
          className="bid-revise"
          onSubmit={(e) => {
            e.preventDefault();
            act.mutate({ path: "revise", body: { amount: parse(amount) } });
          }}
        >
          <label>
            <span>New offer ({b.currency})</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
          <button className="button small" disabled={act.isPending}>
            Send revised offer
          </button>
          <button
            type="button"
            className="text-link"
            onClick={() => setRevising(false)}
          >
            Cancel
          </button>
        </form>
      )}
      <FormError error={act.error} />
      <BidTimeline bid={b} />
    </section>
  );
}

export function StaffBid({ inquiry, onChange }) {
  const b = inquiry.bid;
  const [counter, setCounter] = useState("");
  const [note, setNote] = useState("");
  const act = useMutation({
    mutationFn: ({ path, body }) =>
      api(`/admin/inquiries/${inquiry._id}/bid/${path}`, {
        method: "POST",
        body,
      }),
    onSuccess: (data) => {
      setCounter("");
      setNote("");
      onChange(data);
    },
  });
  const open = b.status === "pending" || b.status === "countered";
  const list = inquiry.artwork?.price;
  const withNote = note.trim() ? { note: note.trim() } : {};
  return (
    <section className="admin-card bid-card" aria-labelledby="staff-bid-h">
      <h2 id="staff-bid-h">Collector offer</h2>
      <p>
        <b>{money(b.amount, b.currency)}</b>
        {list
          ? ` · ${Math.round((b.amount / list) * 100)}% of ${money(list, b.currency)} list`
          : ""}{" "}
        · {STAFF_STATUS[b.status]}
        {b.status === "countered" &&
          ` (countered at ${money(b.counterAmount, b.currency)})`}
      </p>
      {open && (
        <div className="bid-staff-actions">
          <label>
            <span>Note to the collector (optional)</span>
            <textarea
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          {b.status === "pending" && (
            <button
              className="button small"
              onClick={() => act.mutate({ path: "accept", body: withNote })}
              disabled={act.isPending}
            >
              Accept {money(b.amount, b.currency)}
            </button>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              act.mutate({
                path: "counter",
                body: { amount: parse(counter), ...withNote },
              });
            }}
          >
            <label>
              <span>Counter at</span>
              <input
                inputMode="numeric"
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
                required
              />
            </label>
            <button className="button small ghost" disabled={act.isPending}>
              Send counter-offer
            </button>
          </form>
          <button
            className="text-link"
            onClick={() =>
              confirm("Decline this offer?") &&
              act.mutate({ path: "decline", body: withNote })
            }
            disabled={act.isPending}
          >
            Decline
          </button>
        </div>
      )}
      <FormError error={act.error} />
      <BidTimeline bid={b} />
    </section>
  );
}
