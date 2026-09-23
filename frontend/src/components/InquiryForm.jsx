import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useSession } from '../hooks/useSession';
import { Field, FormError } from './Form';

export function InquiryForm({ artwork, type, onSent, submitLabel = 'Send inquiry' }) {
  const { user } = useSession();
  const m = useMutation({ mutationFn: (body) => api('/inquiries', { body }), onSuccess: (d) => onSent?.(d) });
  const errors = m.error?.fieldErrors || {};
  function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (!data.preferredViewingDate) delete data.preferredViewingDate;
    if (!data.budgetRange) delete data.budgetRange;
    if (!data.website) delete data.website;
    m.mutate({ ...data, ...(artwork && { artwork: artwork._id }), ...(type && { type }) });
  }
  if (m.isSuccess)
    return (
      <div className="inquiry-sent" role="status">
        <h3>Thank you.</h3>
        <p>
          Your reference is <b>{m.data.reference}</b>. An advisor will reply within one business day
          {user ? '. You can follow the conversation in your account.' : ' by email.'}
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} className="inquiry-form">
      <Field label="Name" name="name" required minLength={2} autoComplete="name" defaultValue={user?.name} error={errors.name} />
      <Field label="Email" name="email" type="email" required autoComplete="email" defaultValue={user?.email} error={errors.email} />
      <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" />
      <Field label="Preferred contact" name="preferredContact" as="select" defaultValue="email">
        <option value="email">Email</option>
        <option value="phone">Phone</option>
        <option value="whatsapp">WhatsApp</option>
      </Field>
      {!artwork && (
        <Field label="Budget range (optional)" name="budgetRange" as="select" defaultValue="">
          <option value="">Prefer not to say</option>
          <option>Under ₹5 lakh</option>
          <option>₹5–25 lakh</option>
          <option>₹25 lakh–1 crore</option>
          <option>Above ₹1 crore</option>
        </Field>
      )}
      <Field label="Preferred viewing date (optional)" name="preferredViewingDate" type="date" min={new Date().toISOString().slice(0, 10)} />
      <Field label="Message" name="message" as="textarea" rows={4} required minLength={10} error={errors.message} defaultValue={artwork ? `I would like to know more about ${artwork.title}.` : ''} />
      <div className="hp" aria-hidden="true">
        <label>
          Leave this empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <FormError error={m.error && !Object.keys(errors).length ? m.error : null} />
      <button className="button" disabled={m.isPending}>
        {m.isPending ? 'Sending…' : submitLabel}
      </button>
    </form>
  );
}
