export const Loading = ({ label = 'Preparing the gallery' }) => (
  <div className="loading" role="status" aria-live="polite">
    <i aria-hidden="true" />
    <span>{label}</span>
  </div>
);

export const ErrorState = ({ error, retry }) => (
  <div className="state" role="alert">
    <span className="eyebrow">SOMETHING WENT WRONG</span>
    <h2>{error?.status === 404 ? 'We could not find that.' : 'We could not open this view.'}</h2>
    <p>{error?.message || 'Please try again shortly.'}</p>
    {retry && (
      <button className="button ghost" onClick={retry}>
        Try again
      </button>
    )}
  </div>
);

export const Empty = ({ title = 'Nothing here yet', text = 'Adjust your filters or continue exploring the collection.', action }) => (
  <div className="state">
    <h2>{title}</h2>
    <p>{text}</p>
    {action}
  </div>
);
