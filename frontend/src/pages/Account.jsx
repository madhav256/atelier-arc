import { useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, money, date, label } from '../lib/api';
import { useSession, useAuthActions } from '../hooks/useSession';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Loading, ErrorState, Empty } from '../components/States';
import { Field, FormError, COUNTRIES } from '../components/Form';
import { ArtworkCard } from '../components/ArtworkCard';
import { PaymentStep } from './Checkout';

const when = (v) => date(v, { dateStyle: 'medium', timeStyle: 'short' });

export function AccountLayout() {
  const { user, loading } = useSession();
  const loc = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  const links = [
    ['/account', 'Overview', true],
    ['/account/orders', 'Orders'],
    ['/account/inquiries', 'Inquiries'],
    ['/account/notifications', 'Notifications'],
    ['/account/recommendations', 'For you'],
    ['/my-collection', 'My Collection'],
    ['/account/settings', 'Settings'],
  ];
  return (
    <section className="plain-page account">
      <span className="eyebrow">YOUR ACCOUNT</span>
      <nav className="account-nav" aria-label="Account">
        {links.map(([to, text, end]) => (
          <NavLink key={to} to={to} end={end}>
            {text}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </section>
  );
}

const StatusPill = ({ status }) => <span className={`pill pill-${status}`}>{label(status)}</span>;

export function AccountOverview() {
  const { user } = useSession();
  useDocumentMeta('Your account', undefined, { noindex: true });
  const orders = useQuery({ queryKey: ['me', 'orders'], queryFn: () => api('/me/orders') });
  const inquiries = useQuery({ queryKey: ['me', 'inquiries'], queryFn: () => api('/me/inquiries') });
  const openOffers = (inquiries.data || []).filter((i) => i.offer?.status === 'open');
  const proposed = (inquiries.data || []).filter((i) => i.appointments?.some((a) => a.status === 'proposed'));
  return (
    <>
      <h1>Welcome, {user.name?.split(' ')[0] || 'collector'}</h1>
      {!user.verified && <ResendVerification />}
      {(openOffers.length > 0 || proposed.length > 0) && (
        <div className="notice" role="status">
          {openOffers.map((i) => (
            <p key={i._id}>
              Your advisor has made an offer on {i.artwork?.title || 'an inquiry'}. <Link to={`/account/inquiries/${i._id}`}>Review the offer</Link>
            </p>
          ))}
          {proposed.map((i) => (
            <p key={i._id}>
              A viewing has been proposed for {i.reference}. <Link to={`/account/inquiries/${i._id}`}>Confirm or decline</Link>
            </p>
          ))}
        </div>
      )}
      <div className="account-cards">
        <article>
          <h2>Recent orders</h2>
          {orders.isLoading ? <Loading /> : orders.data?.length ? <OrderList orders={orders.data.slice(0, 3)} /> : <p className="muted">No orders yet.</p>}
          <Link to="/account/orders">All orders</Link>
        </article>
        <article>
          <h2>Conversations</h2>
          {inquiries.isLoading ? <Loading /> : inquiries.data?.length ? <InquiryList items={inquiries.data.slice(0, 3)} /> : <p className="muted">No inquiries yet.</p>}
          <Link to="/account/inquiries">All inquiries</Link>
        </article>
      </div>
    </>
  );
}

function ResendVerification() {
  const m = useMutation({ mutationFn: () => api('/auth/resend-verification', { method: 'POST' }) });
  return (
    <p className="notice">
      Please confirm your email address to receive order and inquiry updates.{' '}
      {m.isSuccess ? (
        'We sent a new link.'
      ) : (
        <button className="text-button" onClick={() => m.mutate()} disabled={m.isPending}>
          Send a new link
        </button>
      )}
    </p>
  );
}

function OrderList({ orders }) {
  return (
    <ul className="row-list">
      {orders.map((o) => (
        <li key={o._id}>
          <Link to={`/account/orders/${o.number}`}>
            <b>{o.number}</b>
            <span>{date(o.createdAt)}</span>
            <span>{o.items.map((i) => i.title).join(', ')}</span>
            <span>{money(o.total, o.currency)}</span>
            <StatusPill status={o.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AccountOrders() {
  useDocumentMeta('Orders', undefined, { noindex: true });
  const q = useQuery({ queryKey: ['me', 'orders'], queryFn: () => api('/me/orders') });
  return (
    <>
      <h1>Orders</h1>
      {q.isLoading ? <Loading /> : q.error ? <ErrorState error={q.error} retry={q.refetch} /> : q.data.length ? <OrderList orders={q.data} /> : <Empty title="No orders yet" action={<Link className="button ghost" to="/artworks">Browse works</Link>} />}
    </>
  );
}

export function AccountOrder() {
  const { number } = useParams();
  useDocumentMeta(`Order ${number}`, undefined, { noindex: true });
  const q = useQuery({ queryKey: ['me', 'orders', number], queryFn: () => api(`/me/orders/${number}`) });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  const o = q.data;
  const a = o.shippingAddress || {};
  return (
    <>
      <Link to="/account/orders">← All orders</Link>
      <h1>
        Order {o.number} <StatusPill status={o.status} />
      </h1>
      <p className="muted">Placed {when(o.createdAt)}</p>
      <div className="order-detail">
        <ul className="row-list">
          {o.items.map((i) => (
            <li key={String(i.artwork)}>
              {i.image && <img src={i.image} alt="" width="80" height="80" />}
              <span>
                <b>{i.title}</b>
                <br />
                {i.artistName}
              </span>
              <span>× {i.quantity}</span>
              <span>{money(i.unitPrice * i.quantity, o.currency)}</span>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <dt>Subtotal</dt>
          <dd>{money(o.subtotal, o.currency)}</dd>
          <dt>Shipping</dt>
          <dd>{money(o.shipping, o.currency)}</dd>
          <dt>Insurance</dt>
          <dd>{money(o.insurance, o.currency)}</dd>
          <dt>Tax</dt>
          <dd>{money(o.tax, o.currency)}</dd>
          {o.discount > 0 && (
            <>
              <dt>Discount</dt>
              <dd>−{money(o.discount, o.currency)}</dd>
            </>
          )}
          <dt>
            <b>Total</b>
          </dt>
          <dd>
            <b>{money(o.total, o.currency)}</b>
          </dd>
        </dl>
        <div>
          <h2>Delivery</h2>
          <p>
            {label(o.deliveryMethod)}
            <br />
            {[a.name, a.line1, a.line2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(', ')}
          </p>
          {o.tracking?.number && (
            <p>
              Tracking: {o.tracking.carrier} {o.tracking.url ? <a href={o.tracking.url} rel="noopener noreferrer" target="_blank">{o.tracking.number}</a> : o.tracking.number}
            </p>
          )}
          <h2>History</h2>
          <ol className="timeline-list">
            {(o.history || []).map((h, i) => (
              <li key={i}>
                <b>{label(h.status)}</b> · {when(h.at)}
                {h.note && ` — ${h.note}`}
              </li>
            ))}
          </ol>
          <p>
            Questions about this order? <Link to="/advisory">Contact your advisor</Link>
          </p>
        </div>
      </div>
    </>
  );
}

function InquiryList({ items }) {
  return (
    <ul className="row-list">
      {items.map((i) => (
        <li key={i._id}>
          <Link to={`/account/inquiries/${i._id}`}>
            <b>{i.reference}</b>
            <span>{i.artwork?.title || label(i.type)}</span>
            <span>{when(i.lastActivityAt)}</span>
            <StatusPill status={i.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AccountInquiries() {
  useDocumentMeta('Inquiries', undefined, { noindex: true });
  const q = useQuery({ queryKey: ['me', 'inquiries'], queryFn: () => api('/me/inquiries') });
  return (
    <>
      <h1>Inquiries</h1>
      {q.isLoading ? <Loading /> : q.error ? <ErrorState error={q.error} retry={q.refetch} /> : q.data.length ? <InquiryList items={q.data} /> : <Empty title="No conversations yet" text="Ask about a work or book a private viewing." action={<Link className="button ghost" to="/advisory">Speak with an advisor</Link>} />}
    </>
  );
}

function OfferCheckout({ inquiry, onClose }) {
  const { user } = useSession();
  const heading = useRef(null);
  const navigate = useNavigate();
  const [address, setAddress] = useState({ name: user.name || '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'IN', phone: '' });
  const [deliveryMethod, setDeliveryMethod] = useState('insured_courier');
  const accept = useMutation({ mutationFn: () => api(`/me/inquiries/${inquiry._id}/offer/accept`, { body: { email: user.email, address, deliveryMethod } }) });
  const set = (k) => (e) => setAddress((a) => ({ ...a, [k]: e.target.value }));
  const fe = accept.error?.fieldErrors || {};
  if (accept.data)
    return <PaymentStep placed={accept.data} email={user.email} name={address.name} heading={heading} onDone={(number) => navigate(`/checkout/complete/${number}?email=${encodeURIComponent(user.email)}`)} />;
  return (
    <form
      className="offer-form"
      onSubmit={(e) => {
        e.preventDefault();
        accept.mutate();
      }}
    >
      <h3 ref={heading} tabIndex={-1}>
        Accept offer of {money(inquiry.offer.amount, inquiry.offer.currency)}
      </h3>
      <Field label="Full name" value={address.name} onChange={set('name')} required autoComplete="name" error={fe['address.name']} />
      <Field label="Address" value={address.line1} onChange={set('line1')} required autoComplete="address-line1" />
      <Field label="Apartment, suite (optional)" value={address.line2} onChange={set('line2')} autoComplete="address-line2" />
      <Field label="City" value={address.city} onChange={set('city')} required autoComplete="address-level2" />
      <Field label="State / region" value={address.state} onChange={set('state')} autoComplete="address-level1" />
      <Field label="Postal code" value={address.postalCode} onChange={set('postalCode')} required autoComplete="postal-code" />
      <Field label="Country" as="select" value={address.country} onChange={set('country')} autoComplete="country">
        {COUNTRIES.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </Field>
      <Field label="Phone" value={address.phone} onChange={set('phone')} autoComplete="tel" type="tel" />
      <Field label="Delivery" as="select" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
        <option value="insured_courier">Insured courier</option>
        <option value="white_glove">White-glove delivery and installation</option>
        <option value="collect">Collect from the gallery</option>
      </Field>
      <FormError error={accept.error} />
      <button className="button" disabled={accept.isPending}>
        Continue to payment
      </button>{' '}
      <button type="button" className="text-button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}

export function AccountInquiry() {
  const { id } = useParams();
  const qc = useQueryClient();
  const key = ['me', 'inquiries', id];
  const q = useQuery({ queryKey: key, queryFn: () => api(`/me/inquiries/${id}`) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['me', 'inquiries'] });
  const [text, setText] = useState('');
  const [accepting, setAccepting] = useState(false);
  const reply = useMutation({ mutationFn: () => api(`/me/inquiries/${id}/messages`, { body: { text } }), onSuccess: () => (setText(''), refresh()) });
  const respond = useMutation({ mutationFn: ({ appointmentId, status }) => api(`/me/inquiries/${id}/appointments/${appointmentId}`, { body: { status } }), onSuccess: refresh });
  const decline = useMutation({ mutationFn: () => api(`/me/inquiries/${id}/offer/decline`, { method: 'POST' }), onSuccess: refresh });
  useDocumentMeta(q.data ? `Inquiry ${q.data.reference}` : 'Inquiry', undefined, { noindex: true });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  const i = q.data;
  const offerOpen = i.offer?.status === 'open' && new Date(i.offer.expiresAt) > new Date();
  return (
    <>
      <Link to="/account/inquiries">← All inquiries</Link>
      <h1>
        {i.reference} <StatusPill status={i.status} />
      </h1>
      <p className="muted">
        {label(i.type)} inquiry{i.artwork && <> about <Link to={`/artworks/${i.artwork.slug}`}>{i.artwork.title}</Link></>}
        {i.advisor?.name && ` · Advisor: ${i.advisor.name}`}
      </p>
      {i.offer?.status && (
        <section className="offer-card" aria-labelledby="offer-h">
          <h2 id="offer-h">Private offer</h2>
          <p>
            <b>{money(i.offer.amount, i.offer.currency)}</b> · {offerOpen ? `valid until ${when(i.offer.expiresAt)}` : label(i.offer.status)}
          </p>
          {offerOpen &&
            (accepting ? (
              <OfferCheckout inquiry={i} onClose={() => setAccepting(false)} />
            ) : (
              <p>
                <button className="button" onClick={() => setAccepting(true)}>
                  Accept and pay
                </button>{' '}
                <button className="button ghost" onClick={() => confirm('Decline this offer?') && decline.mutate()} disabled={decline.isPending}>
                  Decline
                </button>
              </p>
            ))}
          <FormError error={decline.error} />
        </section>
      )}
      {i.appointments?.length > 0 && (
        <section aria-labelledby="appt-h">
          <h2 id="appt-h">Viewings</h2>
          <ul className="row-list">
            {i.appointments.map((a) => (
              <li key={a._id}>
                <span>
                  <b>{when(a.startsAt)}</b> · {label(a.mode)}
                  {a.location && ` · ${a.location}`}
                </span>
                <StatusPill status={a.status} />
                {a.status === 'proposed' && (
                  <span>
                    <button className="button small" onClick={() => respond.mutate({ appointmentId: a._id, status: 'confirmed' })}>
                      Confirm
                    </button>{' '}
                    <button className="button ghost small" onClick={() => respond.mutate({ appointmentId: a._id, status: 'cancelled' })}>
                      Decline
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <FormError error={respond.error} />
        </section>
      )}
      <section aria-labelledby="conv-h">
        <h2 id="conv-h">Conversation</h2>
        <ol className="messages">
          <li className="from-client">
            <p>{i.message}</p>
            <small>You · {when(i.createdAt)}</small>
          </li>
          {i.messages.map((m) => (
            <li key={m._id} className={`from-${m.from}`}>
              <p>{m.text}</p>
              <small>
                {m.from === 'client' ? 'You' : i.advisor?.name || 'Your advisor'} · {when(m.createdAt)}
              </small>
            </li>
          ))}
        </ol>
        {i.status !== 'closed' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reply.mutate();
            }}
          >
            <Field label="Reply" as="textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)} required maxLength={4000} />
            <FormError error={reply.error} />
            <button className="button" disabled={reply.isPending || !text.trim()}>
              Send
            </button>
          </form>
        ) : (
          <p className="muted">This conversation is closed.</p>
        )}
      </section>
    </>
  );
}

export function AccountNotifications() {
  useDocumentMeta('Notifications', undefined, { noindex: true });
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['notifications', 'list'], queryFn: () => api('/me/notifications?limit=50') });
  const done = () => qc.invalidateQueries({ queryKey: ['notifications'] });
  const read = useMutation({ mutationFn: (id) => api(`/me/notifications/${id}/read`, { method: 'POST' }), onSuccess: done });
  const readAll = useMutation({ mutationFn: () => api('/me/notifications/read-all', { method: 'POST' }), onSuccess: done });
  const remove = useMutation({ mutationFn: (id) => api(`/me/notifications/${id}`, { method: 'DELETE' }), onSuccess: done });
  return (
    <>
      <div className="section-head">
        <h1>Notifications</h1>
        <button className="button ghost small" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
          Mark all as read
        </button>
      </div>
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : q.data.length ? (
        <ul className="row-list notifications">
          {q.data.map((n) => (
            <li key={n._id} className={n.readAt ? '' : 'unread'}>
              <span>
                {!n.readAt && <span className="sr-only">Unread: </span>}
                <b>{n.title}</b>
                <br />
                {n.message}
                <br />
                <small>{when(n.createdAt)}</small>
              </span>
              <span>
                {n.link && (
                  <Link to={n.link} onClick={() => !n.readAt && read.mutate(n._id)}>
                    Open
                  </Link>
                )}{' '}
                {!n.readAt && (
                  <button className="text-button" onClick={() => read.mutate(n._id)}>
                    Mark read
                  </button>
                )}{' '}
                <button className="text-button" onClick={() => remove.mutate(n._id)} aria-label={`Dismiss ${n.title}`}>
                  Dismiss
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty title="You're all caught up" text="Order, inquiry and availability updates will appear here." />
      )}
    </>
  );
}

export function AccountRecommendations() {
  useDocumentMeta('Recommended for you', undefined, { noindex: true });
  const q = useQuery({ queryKey: ['me', 'recommendations'], queryFn: () => api('/me/recommendations?limit=12', { raw: true }) });
  return (
    <>
      <h1>Selected for you</h1>
      {q.data?.meta?.reason && <p className="muted">{q.data.meta.reason}</p>}
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : q.data.data.length ? (
        <div className="art-grid">
          {q.data.data.map((a, i) => (
            <ArtworkCard key={a.slug} artwork={a} index={i} />
          ))}
        </div>
      ) : (
        <Empty title="Save or view a few works" text="Recommendations follow what you look at, save and follow." />
      )}
    </>
  );
}

const NOTIFY = [
  ['email', 'Email me updates (turn off to keep them in the app only)'],
  ['orders', 'Order and delivery updates'],
  ['inquiries', 'Replies from my advisor'],
  ['availability', 'When a work I asked about becomes available'],
  ['recommendations', 'New works picked for me'],
  ['marketing', 'Exhibitions and gallery news'],
];

export function AccountSettings() {
  useDocumentMeta('Settings', undefined, { noindex: true });
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuthActions();
  const q = useQuery({ queryKey: ['me', 'profile'], queryFn: () => api('/me/profile') });
  const save = useMutation({
    mutationFn: (body) => api('/me/profile', { method: 'PATCH', body }),
    onSuccess: (user) => {
      qc.setQueryData(['me', 'profile'], user);
      qc.invalidateQueries({ queryKey: ['session'] });
    },
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const change = useMutation({
    mutationFn: () => api('/auth/change-password', { body: pw }),
    onSuccess: () => {
      qc.setQueryData(['session'], null);
      navigate('/login?changed=1');
    },
  });
  const logoutAll = useMutation({
    mutationFn: () => api('/auth/logout-all', { method: 'POST' }),
    onSuccess: () => logout.mutate(undefined, { onSettled: () => navigate('/login') }),
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  const p = q.data;
  return (
    <>
      <h1>Settings</h1>
      <form
        className="settings-block"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const num = (k) => (f.get(k) ? Number(f.get(k)) : undefined);
          save.mutate({
            name: f.get('name'),
            phone: f.get('phone') || undefined,
            preferences: {
              categories: String(f.get('categories') || '').split(',').map((s) => s.trim()).filter(Boolean),
              mediums: String(f.get('mediums') || '').split(',').map((s) => s.trim()).filter(Boolean),
              priceMin: num('priceMin'),
              priceMax: num('priceMax'),
            },
          });
        }}
      >
        <h2>Profile and taste</h2>
        <Field label="Name" name="name" defaultValue={p.name} required minLength={2} autoComplete="name" error={save.error?.fieldErrors?.name} />
        <Field label="Email" value={p.email} readOnly hint={p.verified ? 'Verified' : 'Not verified yet'} />
        <Field label="Phone" name="phone" type="tel" defaultValue={p.phone} autoComplete="tel" />
        <Field label="Categories you collect" name="categories" defaultValue={p.preferences?.categories?.join(', ')} hint="Comma separated, e.g. Painting, Sculpture" />
        <Field label="Mediums" name="mediums" defaultValue={p.preferences?.mediums?.join(', ')} hint="Comma separated" />
        <Field label="Budget from (INR)" name="priceMin" type="number" min="0" defaultValue={p.preferences?.priceMin} />
        <Field label="Budget to (INR)" name="priceMax" type="number" min="0" defaultValue={p.preferences?.priceMax} />
        <FormError error={save.error} />
        {save.isSuccess && <p role="status">Saved.</p>}
        <button className="button" disabled={save.isPending}>
          Save profile
        </button>
      </form>
      <fieldset className="settings-block">
        <legend>
          <h2>Notifications</h2>
        </legend>
        {NOTIFY.map(([k, text]) => (
          <label key={k} className="switch">
            <input type="checkbox" checked={Boolean(p.notificationSettings?.[k])} onChange={(e) => save.mutate({ notificationSettings: { [k]: e.target.checked } })} /> {text}
          </label>
        ))}
      </fieldset>
      {p.followedArtists?.length > 0 && (
        <section className="settings-block">
          <h2>Artists you follow</h2>
          <ul className="row-list">
            {p.followedArtists.map((a) => (
              <li key={a._id}>
                <Link to={`/artists/${a.slug}`}>{a.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <form
        className="settings-block"
        onSubmit={(e) => {
          e.preventDefault();
          change.mutate();
        }}
      >
        <h2>Change password</h2>
        <p className="muted">You will be signed out everywhere and asked to sign in again.</p>
        <Field label="Current password" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
        <Field label="New password" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required minLength={10} hint="At least 10 characters with letters and a number" error={change.error?.fieldErrors?.newPassword} />
        <FormError error={change.error} />
        <button className="button" disabled={change.isPending}>
          Change password
        </button>
      </form>
      <section className="settings-block">
        <h2>Sessions</h2>
        <p>Sign out everywhere, including this device.</p>
        <button className="button ghost" onClick={() => logoutAll.mutate()} disabled={logoutAll.isPending}>
          Sign out of all devices
        </button>
      </section>
    </>
  );
}
