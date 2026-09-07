const DOT_A_POINTS = [
  [10, 4], [14, 4], [18, 4],
  [6, 8], [22, 8],
  [6, 12], [22, 12],
  [6, 16], [10, 16], [14, 16], [18, 16], [22, 16],
  [6, 20], [22, 20],
  [6, 24], [22, 24],
] as const;

export function AetheriaMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      {DOT_A_POINTS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.45" fill="currentColor" />
      ))}
    </svg>
  );
}
