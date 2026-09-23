import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, money, label } from '../lib/api';
import { useSession } from '../hooks/useSession';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Loading, ErrorState } from '../components/States';

// Payment confirmation arrives by webhook, so this page polls until the order leaves pending_payment.
export default function CheckoutComplete() {
  useDocumentMeta('Order status', undefined, { noindex: true });
  const { number } = useParams();
  const [params] = useSearchParams();
  const { user, loading } = useSession();
  const email = params.get('email');
  const query = useQuery({
    queryKey: ['order-status', number],
    queryFn: () => (user ? api(`/me/orders/${number}`) : api(`/orders/lookup?number=${encodeURIComponent(number)}&email=${encodeURIComponent(email || '')}`)),
    enabled: !loading,
    refetchInterval: (q) => (q.state.data?.status === 'pending_payment' ? 2000 : false),
  });
  if (query.isLoading || loading) return <Loading label="Confirming your payment" />;
  if (query.error) return <ErrorState error={query.error} />;
  const order = query.data;
  const confirmed = ['confirmed', 'preparing', 'shipped', 'delivered'].includes(order.status);
  return (
    <section className="plain-page checkout-page confirmation">
      <span className="eyebrow">ORDER {order.number}</span>
      <h1>{confirmed ? 'Thank you.' : order.status === 'pending_payment' ? 'Confirming payment…' : 'Payment not completed'}</h1>
      <p className="dek" role="status" aria-live="polite">
        {confirmed
          ? 'Your acquisition is confirmed. Our registrar will contact you to arrange specialist packing and insured delivery.'
          : order.status === 'pending_payment'
            ? 'We are waiting for the payment provider to confirm. This usually takes a few seconds.'
            : `This order is ${label(order.status)}. The works have been released. You can try again from your bag or contact an advisor.`}
      </p>
      <div className="receipt">
        {order.items.map((i) => (
          <p key={i.artwork}>
            {i.title} · {money(i.unitPrice, order.currency)}
          </p>
        ))}
        <h3>{money(order.total, order.currency)}</h3>
      </div>
      <div className="form-nav">
        {user ? (
          <Link className="button" to={`/account/orders/${order.number}`}>
            View order
          </Link>
        ) : (
          <Link className="button" to="/register">
            Create an account to track orders
          </Link>
        )}
        <Link className="button ghost" to="/artworks">
          Continue exploring
        </Link>
      </div>
    </section>
  );
}
