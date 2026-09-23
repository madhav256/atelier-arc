import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthActions, useSession } from '../hooks/useSession';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Field, FormError } from '../components/Form';

const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);

export default function Auth() {
  const location = useLocation();
  const [params] = useSearchParams();
  const mode = location.pathname === '/register' ? 'register' : 'login';
  useDocumentMeta(mode === 'login' ? 'Sign in' : 'Create an account', 'Collector access to saved works, orders and private advisory.', { noindex: true });
  const navigate = useNavigate();
  const { user } = useSession();
  const { login, register } = useAuthActions();
  const action = mode === 'login' ? login : register;
  const errors = action.error?.fieldErrors || {};
  useEffect(() => {
    if (user) navigate(safeNext(params.get('next')) || (['admin', 'advisor'].includes(user.role) ? '/admin' : '/account'), { replace: true });
  }, [user, navigate, params]);
  function submit(e) {
    e.preventDefault();
    action.mutate(Object.fromEntries(new FormData(e.currentTarget)));
  }
  return (
    <section className="auth-page">
      <div>
        <span className="eyebrow">COLLECTOR ACCESS</span>
        <h1>
          Your private
          <br />
          <em>viewing room.</em>
        </h1>
        <p>Save works across devices, follow artists, track acquisitions and speak with your advisor.</p>
      </div>
      <form onSubmit={submit} noValidate={false}>
        <nav className="auth-tabs" aria-label="Account access">
          <Link aria-current={mode === 'login' ? 'page' : undefined} to={`/login${location.search}`} className={mode === 'login' ? 'active' : ''}>
            Sign in
          </Link>
          <Link aria-current={mode === 'register' ? 'page' : undefined} to={`/register${location.search}`} className={mode === 'register' ? 'active' : ''}>
            Register
          </Link>
        </nav>
        {params.get('changed') && <p className="notice" role="status">Your password was changed. Please sign in again.</p>}
        {mode === 'register' && <Field label="Full name" name="name" required minLength={2} autoComplete="name" error={errors.name} />}
        <Field label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <Field label="Password" name="password" type="password" required minLength={mode === 'register' ? 10 : 1} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} error={errors.password} hint={mode === 'register' ? 'At least 10 characters, with letters and a number.' : undefined} />
        <FormError error={action.error && !Object.keys(errors).length ? action.error : null} />
        <button className="button" disabled={action.isPending}>
          {action.isPending ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        {mode === 'login' && (
          <Link className="text-link" to="/forgot-password">
            Forgot your password?
          </Link>
        )}
      </form>
    </section>
  );
}

export function ForgotPassword() {
  useDocumentMeta('Reset password', undefined, { noindex: true });
  const m = useMutation({ mutationFn: (body) => api('/auth/forgot-password', { body }) });
  return (
    <section className="auth-page">
      <div>
        <span className="eyebrow">ACCOUNT</span>
        <h1>Reset your password</h1>
      </div>
      {m.isSuccess ? (
        <p role="status">{m.data.message}</p>
      ) : (
        <form onSubmit={(e) => (e.preventDefault(), m.mutate(Object.fromEntries(new FormData(e.currentTarget))))}>
          <Field label="Email" name="email" type="email" required autoComplete="email" />
          <FormError error={m.error} />
          <button className="button" disabled={m.isPending}>
            Send reset link
          </button>
        </form>
      )}
    </section>
  );
}

export function ResetPassword() {
  useDocumentMeta('Choose a new password', undefined, { noindex: true });
  const [params] = useSearchParams();
  const m = useMutation({ mutationFn: (body) => api('/auth/reset-password', { body }) });
  return (
    <section className="auth-page">
      <div>
        <span className="eyebrow">ACCOUNT</span>
        <h1>Choose a new password</h1>
      </div>
      {m.isSuccess ? (
        <p role="status">
          {m.data.message} <Link to="/login">Sign in</Link>
        </p>
      ) : (
        <form onSubmit={(e) => (e.preventDefault(), m.mutate({ token: params.get('token'), password: new FormData(e.currentTarget).get('password') }))}>
          <Field label="New password" name="password" type="password" required minLength={10} autoComplete="new-password" error={m.error?.fieldErrors?.password} hint="At least 10 characters, with letters and a number." />
          <FormError error={m.error && !m.error.fieldErrors?.password ? m.error : null} />
          <button className="button" disabled={m.isPending}>
            Update password
          </button>
        </form>
      )}
    </section>
  );
}

export function VerifyEmail() {
  useDocumentMeta('Confirm email', undefined, { noindex: true });
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const m = useMutation({ mutationFn: () => api('/auth/verify-email', { body: { token: params.get('token') } }), onSuccess: () => qc.invalidateQueries({ queryKey: ['session'] }) });
  const { mutate } = m;
  useEffect(() => mutate(), [mutate]);
  return (
    <section className="plain-page">
      <span className="eyebrow">ACCOUNT</span>
      <h1>{m.isSuccess ? 'Email confirmed' : m.isError ? 'Link expired' : 'Confirming…'}</h1>
      <p role="status">{m.isSuccess ? 'Thank you. Your account is fully set up.' : m.error?.message}</p>
      <Link className="button" to="/account">
        Go to your account
      </Link>
    </section>
  );
}

export function OrderStatus() {
  useDocumentMeta('Order status', 'Check the status of an Atelier Arc order.');
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  async function submit(e) {
    e.preventDefault();
    const { number, email } = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(`/orders/lookup?number=${encodeURIComponent(number)}&email=${encodeURIComponent(email)}`);
      navigate(`/checkout/complete/${number}?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err);
    }
  }
  return (
    <section className="auth-page">
      <div>
        <span className="eyebrow">ORDERS</span>
        <h1>Order status</h1>
        <p>Enter the order number from your confirmation email.</p>
      </div>
      <form onSubmit={submit}>
        <Field label="Order number" name="number" required placeholder="AA-2026-000001" />
        <Field label="Email used at checkout" name="email" type="email" required autoComplete="email" />
        <FormError error={error} />
        <button className="button">Find order</button>
      </form>
    </section>
  );
}
