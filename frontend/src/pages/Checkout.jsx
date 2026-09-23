import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, money } from '../lib/api';
import { mountStripe, openRazorpay } from '../lib/payments';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useCart } from '../hooks/useCart';
import { useSession } from '../hooks/useSession';
import { Field, FormError, COUNTRIES } from '../components/Form';
import { Loading, Empty } from '../components/States';

const STEPS = ['Contact', 'Delivery address', 'Delivery method', 'Review', 'Payment'];
const blankAddress = { name: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'IN', phone: '' };

export default function Checkout() {
  useDocumentMeta('Secure Checkout', 'Complete your acquisition securely.', { noindex: true });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useSession();
  const { cart, loading } = useCart();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(blankAddress);
  const [deliveryMethod, setDeliveryMethod] = useState('insured_courier');
  const [fieldErrors, setFieldErrors] = useState({});
  const [quote, setQuote] = useState(null);
  const [placed, setPlaced] = useState(null);
  const heading = useRef(null);
  const idempotencyKey = useMemo(() => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())), []);
  const methods = useQuery({ queryKey: ['delivery-methods'], queryFn: () => api('/checkout/delivery-methods') });

  useEffect(() => {
    if (user) {
      setEmail((e) => e || user.email);
      const saved = user.addresses?.[0];
      if (saved) setAddress((a) => (a.line1 ? a : { ...blankAddress, ...saved }));
      else setAddress((a) => ({ ...a, name: a.name || user.name || '' }));
    }
  }, [user]);
  useEffect(() => heading.current?.focus(), [step]);

  const quoteMutation = useMutation({
    mutationFn: () => api('/checkout/quote', { body: { address, deliveryMethod } }),
    onSuccess: (data) => {
      setQuote(data);
      setStep(3);
    },
    onError: (err) => {
      setFieldErrors(err.fieldErrors || {});
      if (err.code === 'INVALID_ADDRESS') setStep(1);
    },
  });
  const orderMutation = useMutation({
    mutationFn: () => api('/checkout/orders', { body: { email, address, deliveryMethod, quoteToken: quote.quoteToken, idempotencyKey } }),
    onSuccess: (data) => {
      setPlaced(data);
      setStep(4);
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => {
      if (['QUOTE_CHANGED', 'QUOTE_EXPIRED'].includes(err.code)) {
        setQuote(null);
        setStep(2);
      }
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  if (loading) return <Loading />;
  if (!cart.purchasableCount && !placed)
    return (
      <section className="plain-page checkout-page">
        <Empty title="Nothing to check out" text="Your acquisition bag has no works available to acquire online." action={<Link className="button" to="/artworks">Explore artworks</Link>} />
      </section>
    );

  const setField = (key) => (e) => setAddress({ ...address, [key]: e.target.value });
  const next = (e) => {
    e.preventDefault();
    if (step === 0) setStep(1);
    else if (step === 1) {
      setFieldErrors({});
      setStep(2);
    } else if (step === 2) quoteMutation.mutate();
    else if (step === 3) orderMutation.mutate();
  };
  const summary = placed?.order || quote;
  const lines = quote?.lines?.filter((l) => !l.issue) || cart.lines.filter((l) => !l.issue);

  return (
    <section className="plain-page checkout-page">
      <span className="eyebrow">SECURE ACQUISITION</span>
      <h1>Checkout</h1>
      <ol className="steps" aria-label="Checkout progress">
        {STEPS.map((x, i) => (
          <li className={i <= step ? 'active' : ''} key={x} aria-current={i === step ? 'step' : undefined}>
            <b>{i + 1}</b>
            {x}
          </li>
        ))}
      </ol>
      <div className="checkout-flow">
        <div>
          {step < 4 ? (
            <form onSubmit={next} noValidate={false}>
              <span className="eyebrow">
                STEP {step + 1} OF {STEPS.length}
              </span>
              <h2 tabIndex={-1} ref={heading}>
                {STEPS[step]}
              </h2>
              {step === 0 && (
                <>
                  <Field label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={Boolean(user)} hint={user ? 'Signed in' : 'We send your receipt and delivery updates here.'} />
                  {!user && (
                    <p className="muted">
                      Have an account? <Link to="/login?next=/checkout">Sign in</Link> to save this order to your collection history.
                    </p>
                  )}
                </>
              )}
              {step === 1 && (
                <>
                  <Field label="Full name" required autoComplete="name" value={address.name} onChange={setField('name')} error={fieldErrors.name} />
                  <Field label="Address line 1" required autoComplete="address-line1" value={address.line1} onChange={setField('line1')} error={fieldErrors.line1} />
                  <Field label="Address line 2 (optional)" autoComplete="address-line2" value={address.line2} onChange={setField('line2')} />
                  <div className="two">
                    <Field label="City" required autoComplete="address-level2" value={address.city} onChange={setField('city')} error={fieldErrors.city} />
                    <Field label="State or region" autoComplete="address-level1" value={address.state} onChange={setField('state')} />
                  </div>
                  <div className="two">
                    <Field label="Postal code" required autoComplete="postal-code" value={address.postalCode} onChange={setField('postalCode')} error={fieldErrors.postalCode} />
                    <Field label="Country" as="select" autoComplete="country" value={address.country} onChange={setField('country')} error={fieldErrors.country}>
                      {COUNTRIES.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <Field label="Phone for the courier" type="tel" autoComplete="tel" value={address.phone} onChange={setField('phone')} />
                </>
              )}
              {step === 2 && (
                <fieldset className="choices">
                  <legend className="sr-only">Delivery method</legend>
                  {(methods.data || []).map((m) => {
                    const unavailable = address.country !== 'IN' && m.international == null;
                    return (
                      <label className={`choice${unavailable ? ' disabled' : ''}`} key={m.id}>
                        <input type="radio" name="delivery" value={m.id} checked={deliveryMethod === m.id} disabled={unavailable} onChange={() => setDeliveryMethod(m.id)} />
                        <span>
                          {m.label}
                          <small>{unavailable ? 'Not available for this destination' : m.days}</small>
                        </span>
                        <b>{unavailable ? '—' : money(address.country === 'IN' ? m.domestic : m.international)}</b>
                      </label>
                    );
                  })}
                  <FormError error={quoteMutation.error} />
                </fieldset>
              )}
              {step === 3 && quote && (
                <div className="receipt">
                  <p>
                    Deliver to {address.name}, {address.line1}, {address.city} {address.postalCode}, {address.country}
                  </p>
                  <p>{quote.estimate}</p>
                  <p className="muted">
                    This total is held for you until {new Date(quote.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Placing the order reserves the works while you pay.
                  </p>
                  <label className="choice">
                    <input type="checkbox" required /> I have reviewed the works, delivery details and total.
                  </label>
                  <FormError error={orderMutation.error} />
                </div>
              )}
              <div className="form-nav">
                {step > 0 && (
                  <button type="button" className="button ghost" onClick={() => setStep(step - 1)}>
                    Back
                  </button>
                )}
                <button className="button" disabled={quoteMutation.isPending || orderMutation.isPending}>
                  {step === 2 ? (quoteMutation.isPending ? 'Calculating…' : 'Review total') : step === 3 ? (orderMutation.isPending ? 'Reserving…' : 'Place order and pay') : 'Continue'}
                </button>
              </div>
            </form>
          ) : (
            <PaymentStep placed={placed} email={email} name={address.name} onDone={(number) => navigate(`/checkout/complete/${number}?email=${encodeURIComponent(email)}`)} heading={heading} />
          )}
        </div>
        <aside className="order-summary" aria-label="Order summary">
          <h2>Your works</h2>
          {lines.map((l) => (
            <p key={l.artworkId}>
              <span>{l.title}</span>
              <b>{money(l.lineTotal ?? l.unitPrice * l.quantity)}</b>
            </p>
          ))}
          <hr />
          <p>
            <span>Subtotal</span>
            <b>{money(summary?.subtotal ?? cart.subtotal)}</b>
          </p>
          {summary && (
            <>
              <p>
                <span>Shipping</span>
                <b>{money(summary.shipping)}</b>
              </p>
              <p>
                <span>Insurance</span>
                <b>{money(summary.insurance)}</b>
              </p>
              <p>
                <span>{address.country === 'IN' ? 'GST' : 'Tax (export, zero-rated)'}</span>
                <b>{money(summary.tax)}</b>
              </p>
              <hr />
              <p className="total">
                <span>Total</span>
                <b>{money(summary.total)}</b>
              </p>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

export function PaymentStep({ placed, email, name, onDone, heading }) {
  const { order, payment } = placed;
  const mount = useRef(null);
  const [stripe, setStripe] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const emi = payment.emi?.available ? payment.emi : null;
  const [plan, setPlan] = useState('full');
  const [tenure, setTenure] = useState(emi?.tenures?.[1]?.months ?? emi?.tenures?.[0]?.months);
  const instalments = plan === 'emi' && emi;
  const returnUrl = `${location.origin}/checkout/complete/${order.number}?email=${encodeURIComponent(email)}`;

  useEffect(() => {
    heading.current?.focus();
    let handle;
    if (payment.mode === 'stripe' && mount.current) {
      mountStripe(mount.current, { publishableKey: payment.publishableKey, clientSecret: payment.clientSecret })
        .then((h) => {
          handle = h;
          setStripe(h);
        })
        .catch(setError);
    }
    return () => handle?.destroy();
  }, [payment, heading]);

  async function pay(outcome) {
    setBusy(true);
    setError(null);
    try {
      if (payment.mode === 'mock') {
        await api('/payments/mock/complete', { body: { intentId: order.payment.intentId, outcome, ...(instalments && { method: 'emi', tenure }) } });
        onDone(order.number);
      } else if (payment.mode === 'stripe') {
        const result = await stripe.confirm(returnUrl);
        if (result.error) throw result.error;
      } else if (payment.mode === 'razorpay') {
        await openRazorpay({ ...payment, instalments: Boolean(instalments), currency: order.currency, email, name, onSuccess: () => onDone(order.number), onDismiss: () => setBusy(false) });
        return;
      }
    } catch (err) {
      setError(err);
    }
    setBusy(false);
  }

  return (
    <div className="payment-step">
      <span className="eyebrow">STEP 5 OF 5</span>
      <h2 tabIndex={-1} ref={heading}>
        Payment
      </h2>
      <p>
        Order <b>{order.number}</b> is reserved for you until {new Date(order.holdExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
      </p>
      {payment.replayed && <p className="notice">This order was already placed. Complete payment below.</p>}
      {emi && (
        <fieldset className="emi-plan">
          <legend>How would you like to pay?</legend>
          <div className="emi-choice">
            <label className={plan === 'full' ? 'selected' : ''}>
              <input type="radio" name="plan" value="full" checked={plan === 'full'} onChange={() => setPlan('full')} />
              <span>
                <b>In full</b>
                <small>{money(order.total, order.currency)} today</small>
              </span>
            </label>
            <label className={plan === 'emi' ? 'selected' : ''}>
              <input type="radio" name="plan" value="emi" checked={plan === 'emi'} onChange={() => setPlan('emi')} />
              <span>
                <b>In monthly instalments</b>
                <small>From {money(emi.tenures[emi.tenures.length - 1].principalPerMonth, order.currency)} a month</small>
              </span>
            </label>
          </div>
          {instalments && (
            <div className="emi-detail">
              {payment.mode === 'mock' ? (
                <div className="emi-tenures" role="group" aria-label="Instalment plan">
                  {emi.tenures.map((t) => (
                    <button key={t.months} type="button" aria-pressed={tenure === t.months} onClick={() => setTenure(t.months)}>
                      <b>{t.months} months</b>
                      <span>{money(t.principalPerMonth, order.currency)} / month</span>
                    </button>
                  ))}
                </div>
              ) : (
                <ul className="emi-tenure-list">
                  {emi.tenures.map((t) => (
                    <li key={t.months}>
                      <b>{t.months} months</b> {money(t.principalPerMonth, order.currency)} / month
                    </li>
                  ))}
                </ul>
              )}
              <p>
                Monthly figures are the price divided evenly, before your bank&apos;s interest. You choose your bank and see its exact rate and plan before you confirm in the secure payment window. Available on most Indian credit cards and selected debit cards.
              </p>
              <p>The gallery is paid in full today and your work is prepared as usual. Your bank collects the instalments.</p>
            </div>
          )}
        </fieldset>
      )}
      {payment.mode === 'mock' && (
        <div className="provider-note">
          <h3>Test payment</h3>
          <p>This environment uses the built-in test gateway. No card is charged. The order is confirmed through the same signed webhook a real provider sends.</p>
          <div className="form-nav">
            <button className="button" onClick={() => pay('succeeded')} disabled={busy}>
              {busy ? 'Processing…' : instalments ? `Complete test payment over ${tenure} months` : 'Complete test payment'}
            </button>
            <button className="button ghost" onClick={() => pay('failed')} disabled={busy}>
              Simulate a declined card
            </button>
          </div>
        </div>
      )}
      {payment.mode === 'stripe' && (
        <>
          <div ref={mount} className="stripe-element" aria-label="Card details" />
          <button className="button" onClick={() => pay()} disabled={busy || !stripe}>
            {busy ? 'Processing…' : 'Pay securely'}
          </button>
        </>
      )}
      {payment.mode === 'razorpay' && (
        <button className="button" onClick={() => pay()} disabled={busy}>
          {busy ? 'Opening Razorpay…' : instalments ? 'Choose an instalment plan' : 'Pay with Razorpay'}
        </button>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error.message}
        </p>
      )}
      <small>Card details are entered with the payment provider and never reach Atelier Arc.</small>
    </div>
  );
}
