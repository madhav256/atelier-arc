// Loads provider scripts on demand. Card details go straight to the provider, never to our API.
const loaded = {};
export function loadScript(src) {
  loaded[src] ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('The payment provider could not be loaded. Check your connection and try again.'));
    document.head.append(s);
  });
  return loaded[src];
}

export async function mountStripe(el, { publishableKey, clientSecret }) {
  await loadScript('https://js.stripe.com/v3/');
  const stripe = window.Stripe(publishableKey);
  const elements = stripe.elements({ clientSecret, appearance: { theme: 'flat', variables: { colorPrimary: '#171715', fontFamily: 'DM Sans, Arial, sans-serif', borderRadius: '0px' } } });
  const payment = elements.create('payment');
  payment.mount(el);
  return {
    confirm: (returnUrl) => stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } }),
    destroy: () => payment.destroy(),
  };
}

export async function openRazorpay({ keyId, orderId, amount, currency, email, name, instalments, onSuccess, onDismiss }) {
  await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  const rzp = new window.Razorpay({
    key: keyId,
    order_id: orderId,
    amount,
    currency,
    name: 'Atelier Arc',
    prefill: { email, name },
    theme: { color: '#171715' },
    // Lead with EMI when the collector chose instalments; other methods stay available below.
    ...(instalments && {
      config: {
        display: {
          blocks: { emi: { name: 'Pay in monthly instalments', instruments: [{ method: 'emi' }, { method: 'cardless_emi' }] } },
          sequence: ['block.emi'],
          preferences: { show_default_blocks: true },
        },
      },
    }),
    handler: onSuccess,
    modal: { ondismiss: onDismiss },
  });
  rzp.open();
}
