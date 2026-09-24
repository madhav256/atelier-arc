import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

// Privacy and terms, written in the gallery's voice. Structure mirrors the
// guarantee page so the same editorial styles apply.

const PRIVACY = [
  {
    n: "01",
    title: "What we keep",
    body: "Your account details (name, email, a one-way hash of your password - never the password itself), the works you save to My Collection, your orders and offers, conversations with our advisors, and viewing appointments. If you sign in with Google, we receive your name, email and Google profile ID from Google, and use them only to create and maintain your account.",
  },
  {
    n: "02",
    title: "What we use it for",
    body: "To run your collection and acquisitions, arrange viewings and insured delivery, respond to your inquiries and offers, and shape the works we recommend to you. That is the whole list.",
  },
  {
    n: "03",
    title: "What we never do",
    body: "We do not sell, rent or trade your personal information, and we do not run advertising trackers. There are no third-party ad cookies on this site.",
  },
  {
    n: "04",
    title: "Cookies and sessions",
    body: "A single session cookie keeps you signed in while you browse. It expires when you sign out and carries no information to anyone else.",
  },
  {
    n: "05",
    title: "When others see a little of it",
    body: "When you acquire a work, the specialists who pack, insure and deliver it receive only the details they need for that delivery. When you email an advisor, that conversation is also covered by your email provider's own privacy policy.",
  },
  {
    n: "06",
    title: "Your choices",
    body: "Ask us at any time for a copy of what we hold, to correct it, or to delete your account. Deleting your account removes your saved works and conversations; records of completed acquisitions are kept as the law requires for authenticity and tax.",
  },
];

const TERMS = [
  {
    n: "01",
    title: "The gallery",
    body: "Atelier Arc is a private gallery of original contemporary art, acquired directly from artists and their estates. We receive collectors by appointment in Mumbai and New Delhi.",
  },
  {
    n: "02",
    title: "Your account",
    body: "Keep your sign-in details to yourself and tell us if you think someone else is using them. You are responsible for what happens under your account until you do.",
  },
  {
    n: "03",
    title: "Works, images and prices",
    body: "Prices are in Indian rupees and may include framing where noted. A work can sell at any moment, so the site may briefly show it as available while an acquisition completes. We photograph every work carefully, but screens differ - the condition report and a private viewing are the true account.",
  },
  {
    n: "04",
    title: "Offers and acquisitions",
    body: "Making an offer is not a purchase. An acquisition exists only when the gallery accepts in writing, at which point payment, insured delivery and the certificate are arranged with you directly.",
  },
  {
    n: "05",
    title: "Authenticity and returns",
    body: "Every work carries our lifetime authenticity guarantee and a return window, set out in full on the guarantee page. Those terms are part of every sale we make.",
  },
  {
    n: "06",
    title: "Private viewings",
    body: "Viewings are by appointment. When a work is collected after a viewing, its condition is agreed on the day, as noted on the guarantee page.",
  },
  {
    n: "07",
    title: "What is ours",
    body: "The photographs, writing and design on this site belong to the gallery and the artists. Please do not reproduce them without written permission.",
  },
  {
    n: "08",
    title: "The fine print",
    body: "Our liability for anything connected with this site is limited to the price you paid for the work concerned. These terms are governed by Indian law, and the courts of Mumbai have jurisdiction.",
  },
];

function LegalPage({ eyebrow, title, em, dek, terms, aside }) {
  return (
    <article className="guarantee-page">
      <header className="guarantee-hero">
        <span className="eyebrow">{eyebrow}</span>
        <h1>
          {title}
          <br />
          <em>{em}</em>
        </h1>
        <p className="dek">{dek}</p>
      </header>
      <ol className="guarantee-terms">
        {terms.map((t) => (
          <li key={t.n}>
            <b>{t.n}</b>
            <div>
              <h2>{t.title}</h2>
              <p>{t.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="guarantee-aside">{aside}</section>
    </article>
  );
}

export function Privacy() {
  useDocumentMeta(
    "Privacy",
    "What Atelier Arc keeps about you, what we use it for, and what we never do with it.",
  );
  return (
    <LegalPage
      eyebrow="PRIVACY AT ATELIER ARC"
      title="Your information,"
      em="kept quietly."
      dek="A gallery should hold your confidence the way it holds a canvas - carefully, and only for as long as it should. This is the whole of what we keep and why."
      terms={PRIVACY}
      aside={
        <>
          <div>
            <span className="eyebrow">IN SHORT</span>
            <ul>
              <li>No selling or trading of personal information</li>
              <li>No advertising trackers, one session cookie only</li>
              <li>Export, correct or delete your details on request</li>
            </ul>
          </div>
          <div>
            <span className="eyebrow">QUESTIONS</span>
            <p>
              <Link to="/advisory">Speak with an advisor</Link> about anything on
              this page, and we will answer in plain language.
            </p>
            <p>
              For returns and authenticity, see{" "}
              <Link to="/guarantee">the guarantee</Link>.
            </p>
          </div>
        </>
      }
    />
  );
}

export function Terms() {
  useDocumentMeta(
    "Terms of collecting",
    "The terms on which Atelier Arc shows, offers and sells original works of art.",
  );
  return (
    <LegalPage
      eyebrow="TERMS OF COLLECTING"
      title="Clear terms,"
      em="like clear light."
      dek="The understandings between you and the gallery when you browse, offer, and acquire. Written to be read, not skimmed past."
      terms={TERMS}
      aside={
        <>
          <div>
            <span className="eyebrow">RELATED</span>
            <ul>
              <li>
                <Link to="/guarantee">Returns and authenticity guarantee</Link>
              </li>
              <li>
                <Link to="/verify">Verify a certificate</Link>
              </li>
              <li>
                <Link to="/privacy">How your information is kept</Link>
              </li>
            </ul>
          </div>
          <div>
            <span className="eyebrow">QUESTIONS</span>
            <p>
              Terms should never be the mysterious part of an acquisition.{" "}
              <Link to="/advisory">Ask an advisor</Link> and we will walk
              through any of them with you.
            </p>
          </div>
        </>
      }
    />
  );
}
