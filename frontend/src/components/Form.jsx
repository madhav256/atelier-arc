import { useId } from 'react';

export function Field({ label, error, hint, as = 'input', children, ...props }) {
  const id = useId();
  const Tag = as;
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {as === 'select' ? (
        <select id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props}>
          {children}
        </select>
      ) : (
        <Tag id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      )}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
      {error && (
        <small className="field-error" id={`${id}-error`} role="alert">
          {Array.isArray(error) ? error[0] : error}
        </small>
      )}
    </div>
  );
}

export function FormError({ error }) {
  if (!error) return null;
  return (
    <p className="form-error" role="alert">
      {error.message}
    </p>
  );
}

export const COUNTRIES = [
  ['IN', 'India'],
  ['AE', 'United Arab Emirates'],
  ['GB', 'United Kingdom'],
  ['US', 'United States'],
  ['SG', 'Singapore'],
  ['FR', 'France'],
  ['DE', 'Germany'],
  ['HK', 'Hong Kong'],
];
