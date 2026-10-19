/**
 * A filled sparkline: the line in the current text colour over a wash that fades to nothing.
 * Scaled to its own range so the shape fills the box. `id` must be unique on the page, because
 * the wash is an SVG gradient. Decorative: the figures beside it carry the information.
 */
export function AreaSpark({
  values,
  id,
  width = 96,
  height = 32,
  className = "",
  strokeWidth = 1.6,
}: {
  values: number[];
  id: string;
  width?: number;
  height?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 2;
  const x = (i: number) => (i / (values.length - 1)) * width;
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const gid = `spark-${id}`;
  return (
    <svg aria-hidden viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={`block overflow-visible ${className}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.38" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
