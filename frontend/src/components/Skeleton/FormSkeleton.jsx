export default function FormSkeleton({ fields = 3 }) {
  return (
    <div className="form-skeleton">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="form-skeleton-field">
          <div className="skeleton skeleton-label" />
          <div className="skeleton skeleton-input" />
        </div>
      ))}
      <div className="skeleton skeleton-button" />
    </div>
  );
}
