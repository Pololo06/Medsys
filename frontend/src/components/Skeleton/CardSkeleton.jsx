export default function CardSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-icon" />
          <div className="skeleton skeleton-stat-value" />
          <div className="skeleton skeleton-stat-label" />
        </div>
      ))}
    </>
  );
}
