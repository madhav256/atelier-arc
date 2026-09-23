import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import {
  RETURN_DAYS,
  DAMAGE_REPORT_HOURS,
  REFUND_WORKING_DAYS,
} from "../content/guarantee";

// Returns and authenticity guarantee. The terms are DRAFT placeholders (see content/guarantee.js)
// and must be confirmed by the gallery owner before launch.
const TERMS = [
  {
    n: "01",
    title: "Authenticity, for the life of the work",
    body: "Every work is acquired directly from the artist or their estate and is documented before it is listed. If a work we sold you is ever shown not to be by the artist named on its certificate, we will take it back and refund the full purchase price. This guarantee has no time limit and passes to anyone you give the work to.",
  },
  {
    n: "02",
    title: `${RETURN_DAYS} days to live with it`,
    body: `Art looks different on your own wall. If a work is not right, tell us within ${RETURN_DAYS} days of delivery and we will collect it. It must be in the condition it arrived, in its original packing, with the certificate. We arrange and insure the return, and refund the price of the work.`,
  },
  {
    n: "03",
    title: "Condition on arrival",
    body: `Each work leaves us with a condition report. If anything has changed in transit, photograph it and write to us within ${DAMAGE_REPORT_HOURS} hours of delivery, before you unpack further. We handle the insurance claim, and you choose between restoration by a conservator we trust or a full refund.`,
  },
  {
    n: "04",
    title: "Refunds",
    body: `Refunds go back to the original payment method within ${REFUND_WORKING_DAYS} working days of the work reaching us. Delivery and insurance charges are refunded when a return is due to authenticity or transit damage.`,
  },
];

const EXCLUSIONS = [
  "Commissions and works made or framed to your order",
  "Works collected in person after a private viewing, where the condition was agreed on the day",
  "Works that have been altered, reframed or hung outdoors",
];

export default function Guarantee() {
  useDocumentMeta(
    "Returns and authenticity guarantee",
    "Every Atelier Arc work carries a lifetime authenticity guarantee, a return window, and insured delivery.",
  );
  return (
    <article className="guarantee-page">
      <header className="guarantee-hero">
        <span className="eyebrow">THE ATELIER ARC GUARANTEE</span>
        <h1>
          Acquire with
          <br />
          <em>certainty.</em>
        </h1>
        <p className="dek">
          A work of art should arrive as a pleasure, not a risk. These are the
          promises that come with every acquisition.
        </p>
      </header>
      <ol className="guarantee-terms">
        {TERMS.map((t) => (
          <li
            key={t.n}
            id={
              t.n === "01"
                ? "authenticity"
                : t.n === "02"
                  ? "returns"
                  : undefined
            }
          >
            <b>{t.n}</b>
            <div>
              <h2>{t.title}</h2>
              <p>{t.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="guarantee-aside">
        <div>
          <span className="eyebrow">NOT RETURNABLE</span>
          <ul>
            {EXCLUSIONS.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="muted">
            The authenticity guarantee still applies to all of these.
          </p>
        </div>
        <div>
          <span className="eyebrow">TO BEGIN A RETURN</span>
          <p>
            Open the order in <Link to="/account/orders">your account</Link> and
            write to us from it, or{" "}
            <Link to="/advisory">speak with an advisor</Link>. Include the order
            number and, for transit damage, your photographs.
          </p>
          <p>
            Every certificate can be checked at{" "}
            <Link to="/verify">the verification page</Link>.
          </p>
        </div>
      </section>
    </article>
  );
}
