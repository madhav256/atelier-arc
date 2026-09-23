import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  Maximize2,
  ShieldCheck,
  Truck,
  Bell,
  RotateCcw,
} from "lucide-react";
import { useRef, useState } from "react";
import { RETURN_DAYS } from "../content/guarantee";
import { api, apiUrl, money, label } from "../lib/api";
import { ArtworkCard } from "../components/ArtworkCard";
import { InquiryForm } from "../components/InquiryForm";
import { AdvisorChat } from "../components/AdvisorChat";
import { MakeOffer } from "../components/Offers";
import { Loading, ErrorState } from "../components/States";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useCart } from "../hooks/useCart";
import { useCollection } from "../hooks/useCollection";
import { useSession } from "../hooks/useSession";

export default function ArtworkDetail() {
  const { slug } = useParams();
  const query = useQuery({
    queryKey: ["artwork", slug],
    queryFn: () => api(`/artworks/${slug}`),
    retry: 1,
  });
  const a = query.data;
  useDocumentMeta(
    a ? `${a.title} by ${a.artist?.name}` : "Artwork",
    a?.description?.slice(0, 160),
    { image: a?.images?.[0]?.url, type: "product", jsonLd: a?.jsonLd },
  );
  if (query.isLoading) return <Loading />;
  if (query.error)
    return <ErrorState error={query.error} retry={query.refetch} />;
  return <Detail artwork={a} />;
}

function Detail({ artwork: a }) {
  const { add, cart } = useCart();
  const { isSaved, toggle } = useCollection();
  const { user } = useSession();
  const [room, setRoom] = useState(false);
  const [added, setAdded] = useState(false);
  const dialog = useRef(null);
  const fullscreen = useRef(null);
  const alert = useMutation({
    mutationFn: () => api("/me/alerts", { body: { artworkId: a._id } }),
  });
  const inBag = cart.lines.some((l) => String(l.artworkId) === String(a._id));
  const purchasable =
    !a.priceOnRequest && a.price != null && a.availability === "available";
  const saved = isSaved(a);
  return (
    <>
      <section className="detail">
        <div className="detail-gallery">
          <Link to="/artworks" className="back">
            <ArrowLeft aria-hidden="true" /> All artworks
          </Link>
          <button
            className="zoom"
            onClick={() => fullscreen.current?.showModal()}
          >
            <Maximize2 aria-hidden="true" /> View fullscreen
          </button>
          <img
            src={a.images?.[0]?.url}
            alt={a.images?.[0]?.alt || a.title}
            fetchpriority="high"
          />
        </div>
        <div className="detail-info">
          <span className="eyebrow">{a.category || "ORIGINAL WORK"}</span>
          <h1>{a.title}</h1>
          <Link to={`/artists/${a.artist?.slug}`} className="artist-name">
            {a.artist?.name}
          </Link>
          <dl>
            <div>
              <dt>Year</dt>
              <dd>{a.year}</dd>
            </div>
            <div>
              <dt>Medium</dt>
              <dd>{a.medium}</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>
                {a.dimensions?.width} × {a.dimensions?.height}
                {a.dimensions?.depth ? ` × ${a.dimensions.depth}` : ""}{" "}
                {a.dimensions?.unit}
              </dd>
            </div>
            {a.edition && (
              <div>
                <dt>Edition</dt>
                <dd>{a.edition}</dd>
              </div>
            )}
            <div>
              <dt>Availability</dt>
              <dd className={a.availability}>{label(a.availability)}</dd>
            </div>
          </dl>
          <p className="detail-price">
            {a.priceOnRequest ? "Price on request" : money(a.price, a.currency)}
          </p>
          {purchasable ? (
            inBag || added ? (
              <Link className="button" to="/cart">
                In your bag · Review
              </Link>
            ) : (
              <button
                className="button"
                onClick={() =>
                  add.mutate(a._id, { onSuccess: () => setAdded(true) })
                }
                disabled={add.isPending}
              >
                {add.isPending ? "Adding…" : "Add to acquisition bag"}
              </button>
            )
          ) : (
            <button
              className="button"
              onClick={() => dialog.current?.showModal()}
            >
              {a.availability === "sold"
                ? "Ask about similar works"
                : a.priceOnRequest
                  ? "Request price"
                  : "Inquire"}
            </button>
          )}
          {add.error && (
            <p className="form-error" role="alert">
              {add.error.message}
            </p>
          )}
          <button
            className="button ghost"
            onClick={() => toggle.mutate(a)}
            aria-pressed={saved}
          >
            <Heart aria-hidden="true" fill={saved ? "currentColor" : "none"} />{" "}
            {saved ? "Saved to My Collection" : "Add to My Collection"}
          </button>
          {a.availability !== "available" && user && (
            <button
              className="text-link"
              onClick={() => alert.mutate()}
              disabled={alert.isSuccess}
            >
              <Bell aria-hidden="true" />{" "}
              {alert.isSuccess
                ? "We will tell you if it becomes available"
                : "Notify me if this becomes available"}
            </button>
          )}
          <div className="enquiry-links">
            {purchasable && a.stock > 0 && (
              <MakeOffer artwork={a} user={user} />
            )}
            {purchasable && (
              <button
                className="text-link"
                onClick={() => dialog.current?.showModal()}
              >
                Speak with an advisor
              </button>
            )}
            <AdvisorChat artwork={a} />
          </div>
          <button
            className="text-link room-link"
            onClick={() => setRoom(!room)}
            aria-expanded={room}
          >
            View in your space <Maximize2 aria-hidden="true" />
          </button>
          <div className="assurances">
            <p>
              <ShieldCheck aria-hidden="true" />{" "}
              {a.certificate || "Certificate of authenticity"}
            </p>
            <p>
              <Truck aria-hidden="true" /> Insured specialist delivery
            </p>
            <p>
              <RotateCcw aria-hidden="true" /> {RETURN_DAYS}-day returns,
              lifetime authenticity guarantee.{" "}
              <Link to="/guarantee">Read the guarantee</Link>
            </p>
          </div>
        </div>
      </section>
      {room && <RoomViewer artwork={a} />}
      <section className="detail-story">
        <div>
          <span className="eyebrow">ABOUT THE WORK</span>
          <p className="dek">{a.description}</p>
        </div>
        <div>
          <details open>
            <summary>Provenance</summary>
            <p>
              {a.provenance?.join(" · ") || "Direct from the artist studio"}
            </p>
          </details>
          {a.exhibitionHistory?.length > 0 && (
            <details>
              <summary>Exhibition history</summary>
              <p>{a.exhibitionHistory.join(" · ")}</p>
            </details>
          )}
          <details>
            <summary>Condition and certificate</summary>
            <p>
              {a.condition || "Excellent"}.{" "}
              {a.certificate || "Certificate included"}. A numbered certificate
              of authenticity is issued to the collector on acquisition.
            </p>
          </details>
          <details>
            <summary>Shipping</summary>
            <p>
              {a.shipping ||
                "Specialist insured delivery is arranged after acquisition."}
            </p>
          </details>
          <a
            className="document-link"
            href={apiUrl(`/artworks/${a.slug}/provenance.pdf`)}
            download
          >
            <span className="document-link-mark" aria-hidden="true">
              PDF
            </span>
            <span>
              <b>Provenance dossier</b>
              <small>Details, provenance and condition, A4</small>
            </span>
          </a>
        </div>
      </section>
      {a.similar?.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">A CONSIDERED PAIRING</span>
              <h2>Similar works</h2>
            </div>
          </div>
          <div className="art-grid">
            {a.similar.slice(0, 4).map((x, i) => (
              <ArtworkCard key={x.slug} artwork={x} index={i} />
            ))}
          </div>
        </section>
      )}
      <dialog ref={dialog} aria-labelledby="inquiry-title">
        <button onClick={() => dialog.current.close()} aria-label="Close">
          ×
        </button>
        <span className="eyebrow">PRIVATE INQUIRY</span>
        <h2 id="inquiry-title">{a.title}</h2>
        <p>Our advisory team will respond within one business day.</p>
        <InquiryForm artwork={a} />
      </dialog>
      <dialog
        ref={fullscreen}
        className="fullscreen"
        aria-label={`${a.title}, full screen`}
      >
        <button
          onClick={() => fullscreen.current.close()}
          aria-label="Close full screen"
        >
          ×
        </button>
        <img src={a.images?.[0]?.url} alt={a.images?.[0]?.alt || a.title} />
      </dialog>
    </>
  );
}

// Scale simulation using the work's real dimensions against a 300 cm wide wall.
const FRAMES = [
  { id: "none", label: "Unframed", note: "As the artist presents it." },
  {
    id: "black",
    label: "Thin black",
    note: "Ebonised hardwood, 2 cm profile.",
  },
  { id: "oak", label: "Natural oak", note: "Solid oak, oiled, 3 cm profile." },
  { id: "gilt", label: "Gilt", note: "Water-gilded moulding, 4 cm profile." },
];
// Frame depth in cm, used so the framed work stays at true scale on the wall.
const FRAME_CM = { none: 0, black: 2, oak: 3, gilt: 4 };
const MAT_CM = 6;
const UNFRAMEABLE = ["Sculptures", "Ceramics"];

function RoomViewer({ artwork }) {
  const [wall, setWall] = useState("stone");
  const [wallWidth, setWallWidth] = useState(300);
  const [frame, setFrame] = useState("none");
  const [mat, setMat] = useState(false);
  const frameable = !UNFRAMEABLE.includes(artwork.category);
  const toCm = (v) => (artwork.dimensions?.unit === "in" ? v * 2.54 : v);
  const w = toCm(artwork.dimensions?.width || 80);
  const h = toCm(artwork.dimensions?.height || w * 1.25);
  const f = frameable ? FRAME_CM[frame] : 0;
  const m = frameable && frame !== "none" && mat ? MAT_CM : 0;
  const outerW = w + 2 * (f + m);
  const outerH = h + 2 * (f + m);
  const pct = Math.min(90, Math.max(8, (outerW / wallWidth) * 100));
  const chosen = FRAMES.find((x) => x.id === frame);
  const framingNote =
    frame === "none"
      ? null
      : `Hello, I would like to discuss framing "${artwork.title}" in ${chosen.label.toLowerCase()}${m ? " with a white mount" : ""}.`;
  return (
    <section className={`room-view ${wall}`} aria-label="Room simulation">
      <div className="room-control">
        <span className="eyebrow">VIEW IN YOUR SPACE · SIMULATION</span>
        <h2>Place the work</h2>
        <label>
          Wall width: {wallWidth} cm
          <input
            type="range"
            min="150"
            max="600"
            step="10"
            value={wallWidth}
            onChange={(e) => setWallWidth(Number(e.target.value))}
          />
        </label>
        <div role="group" aria-label="Wall colour">
          {["stone", "warm", "charcoal"].map((x) => (
            <button
              key={x}
              onClick={() => setWall(x)}
              aria-pressed={wall === x}
            >
              {x === "warm" ? "Warm ivory" : x[0].toUpperCase() + x.slice(1)}
            </button>
          ))}
        </div>
        {frameable && (
          <fieldset className="frame-picker">
            <legend>Frame</legend>
            <div className="frame-options">
              {FRAMES.map((x) => (
                <label
                  key={x.id}
                  className={`frame-option ${frame === x.id ? "is-on" : ""}`}
                >
                  <input
                    type="radio"
                    name="frame"
                    value={x.id}
                    checked={frame === x.id}
                    onChange={() => setFrame(x.id)}
                  />
                  <span
                    className={`frame-swatch swatch-${x.id}`}
                    aria-hidden="true"
                  />
                  <span>{x.label}</span>
                </label>
              ))}
            </div>
            <p className="frame-note">{chosen.note}</p>
            {frame !== "none" && (
              <label className="mat-toggle">
                <input
                  type="checkbox"
                  checked={mat}
                  onChange={(e) => setMat(e.target.checked)}
                />
                White mount ({MAT_CM} cm)
              </label>
            )}
          </fieldset>
        )}
        <p>
          Shown at true scale for a {wallWidth} cm wall ({Math.round(outerW)} ×{" "}
          {Math.round(outerH)} cm{f ? " framed" : ""}). Confirm measurements
          with an advisor before acquisition.
          {frameable &&
            frame !== "none" &&
            " Bespoke framing is arranged by our advisory team and quoted separately."}
        </p>
        {framingNote && (
          <AdvisorChat message={framingNote}>
            Ask about this frame on WhatsApp
          </AdvisorChat>
        )}
      </div>
      <div className="room">
        <figure
          className={`framed frame-${frameable ? frame : "none"} ${m ? "has-mat" : ""}`}
          style={{
            width: `${pct}%`,
            "--aspect": (outerW / outerH).toFixed(4),
            "--frame": `${((f / outerW) * 100).toFixed(3)}cqw`,
            "--mat": `${((m / outerW) * 100).toFixed(3)}cqw`,
          }}
        >
          <div className="frame-body">
            <div className="frame-mat">
              <img
                src={artwork.images?.[0]?.url}
                alt={`${artwork.title} simulated on a wall${frameable && frame !== "none" ? `, ${chosen.label.toLowerCase()} frame` : ""}`}
              />
            </div>
          </div>
        </figure>
        <div className="console" />
        <div className="sofa" />
      </div>
    </section>
  );
}
