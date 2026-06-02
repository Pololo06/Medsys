export default function TableSkeleton({ rows = 5, columns = 5 }) {
  const widths = [180, 140, 100, 120, 80];
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="skeleton-cell">
              <div className="skeleton skeleton-text" style={{ width: widths[j % widths.length] }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
