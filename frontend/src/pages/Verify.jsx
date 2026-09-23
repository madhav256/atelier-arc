import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, date } from "../lib/api";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { Loading, ErrorState } from "../components/States";

// Public certificate check: the code printed on each certificate is an HMAC tied to the
// order and work, so a valid result means the gallery issued it.
export default function Verify() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(code);
  useDocumentMeta(
    "Verify a certificate",
    "Check that an Atelier Arc certificate of authenticity was issued by the gallery.",
    { noindex: true },
  );
  const q = useQuery({
    queryKey: ["certificate", code],
    queryFn: () => api(`/certificates/${encodeURIComponent(code)}`),
    enabled: Boolean(code),
  });
  return (
    <section className="plain-page verify-page">
      <span className="eyebrow">CERTIFICATE OF AUTHENTICITY</span>
      <h1>Verify</h1>
      <p className="lede">
        Enter the code printed at the foot of an Atelier Arc certificate.
      </p>
      <form
        className="verify-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) navigate(`/verify/${value.trim()}`);
        }}
      >
        <label htmlFor="verify-code">Certificate code</label>
        <input
          id="verify-code"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AA-2026-0001.x1y2z3a4b5"
          autoComplete="off"
          spellCheck="false"
        />
        <button className="button" type="submit">
          Verify
        </button>
      </form>
      <div aria-live="polite">
        {code && q.isLoading && <Loading />}
        {q.error && <ErrorState error={q.error} retry={q.refetch} />}
        {q.data?.valid && (
          <div className="verify-result is-valid">
            <span className="eyebrow">ISSUED BY ATELIER ARC</span>
            <h2>{q.data.title}</h2>
            <p>
              <i>{q.data.artist}</i>
              <br />
              Issued {date(q.data.issuedAt, { dateStyle: "long" })}
            </p>
          </div>
        )}
        {q.data && !q.data.valid && (
          <div className="verify-result is-invalid">
            <span className="eyebrow">NOT RECOGNISED</span>
            <p>
              This code does not match a certificate we have issued. Check the
              characters, or write to the gallery and we will look into it.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
