import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { money, label } from '../lib/api';
import { Empty, Loading } from '../components/States';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  useDocumentMeta('Acquisition Bag', 'Review the works you have selected.', { noindex: true });
  const { cart, loading, remove } = useCart();
  if (loading) return <Loading />;
  return (
    <section className="plain-page checkout-page">
      <span className="eyebrow">ACQUISITION BAG</span>
      <h1>Your selection</h1>
      {!cart.lines.length ? (
        <Empty title="No works selected" action={<Link className="button" to="/artworks">Explore artworks</Link>} />
      ) : (
        <div className="cart-layout">
          <div>
            {cart.lines.map((line) => (
              <article className={`cart-row${line.issue ? ' has-issue' : ''}`} key={line.artworkId}>
                <img src={line.image} alt="" width="120" height="150" />
                <div>
                  <h3>
                    <Link to={`/artworks/${line.slug}`}>{line.title}</Link>
                  </h3>
                  <p>
                    {line.artistName}
                    <br />
                    {line.medium}
                    {line.quantity > 1 ? ` · ${line.quantity} editions` : ''}
                  </p>
                  {line.issue && (
                    <p className="notice" role="status">
                      {line.issue === 'price_on_request' ? 'Offered by private inquiry' : `Currently ${label(line.issue)}. It will not be included in checkout.`}
                    </p>
                  )}
                </div>
                <b>{line.issue ? '—' : money(line.lineTotal, line.currency)}</b>
                <button onClick={() => remove.mutate(line.artworkId)} aria-label={`Remove ${line.title}`} disabled={remove.isPending}>
                  <Trash2 aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
          <aside className="order-summary" aria-label="Acquisition summary">
            <h2>Summary</h2>
            <p>
              <span>Subtotal</span>
              <b>{money(cart.subtotal)}</b>
            </p>
            <p>
              <span>Specialist shipping and insurance</span>
              <b>At checkout</b>
            </p>
            <p>
              <span>Tax</span>
              <b>At checkout</b>
            </p>
            <hr />
            <p className="total">
              <span>Subtotal</span>
              <b>{money(cart.subtotal)}</b>
            </p>
            {cart.purchasableCount ? (
              <Link className="button" to="/checkout">
                Continue to checkout
              </Link>
            ) : (
              <p className="notice">None of these works can be acquired online right now.</p>
            )}
            <small>Works are reserved for you only once you place the order. No payment is taken before the final step.</small>
          </aside>
        </div>
      )}
    </section>
  );
}
