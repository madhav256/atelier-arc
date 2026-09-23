import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { InquiryForm } from '../components/InquiryForm';

export default function Advisory() {
  useDocumentMeta('Private Advisory', 'A discreet advisory service for first acquisitions, established collections and commissions.');
  return (
    <section className="advisory-page">
      <div>
        <span className="eyebrow">PRIVATE COLLECTOR SERVICES</span>
        <h1>
          Collect with
          <br />
          <em>clarity.</em>
        </h1>
        <p className="dek">A discreet, informed service for first acquisitions, established collections, and spaces that deserve a defining work.</p>
        <ol>
          <li>
            <b>01</b>
            <span>
              <h3>Private sourcing</h3>
              <p>Works selected around your eye, context, and preferred range.</p>
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              <h3>Viewings and placement</h3>
              <p>Private appointments, scale studies, and installation planning.</p>
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              <h3>Collection stewardship</h3>
              <p>Documentation, conservation guidance, and long-term strategy.</p>
            </span>
          </li>
        </ol>
      </div>
      <div className="advisory-form">
        <span className="eyebrow">BEGIN A CONVERSATION</span>
        <h2>Tell us what you are looking for.</h2>
        <InquiryForm type="advisory" submitLabel="Request a consultation" />
      </div>
    </section>
  );
}
