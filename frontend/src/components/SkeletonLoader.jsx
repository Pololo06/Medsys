export default function SkeletonLoader({ rows = 3 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {[200, 140, 70, 120].map((width, j) => (
            <td key={j} style={{ padding: '13px 16px' }}>
              <div className="skeleton" style={{ height: 14, width: width, borderRadius: 4 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
