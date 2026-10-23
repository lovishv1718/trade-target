// The facet motif, after the low-poly triangles of the bull in TradeTarget's mark: a fine-line
// mesh of triangles with a few faces filled in emerald and one or two in the bull's red. The mesh
// comes from a seeded generator, so a given seed draws the same picture on every build.

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = [number, number];

export function Facets({
  cols = 12,
  rows = 6,
  width = 1200,
  height = 600,
  seed = 7,
  fill = 0.12,
  red = 2,
  className = "",
}: {
  cols?: number;
  rows?: number;
  width?: number;
  height?: number;
  seed?: number;
  /** Share of faces filled in emerald */
  fill?: number;
  /** How many faces are filled in the bull's red */
  red?: number;
  className?: string;
}) {
  const rand = rng(seed);
  const cw = width / cols;
  const ch = height / rows;
  // Points on a grid, nudged off it; the outer edge stays straight
  const pts: Pt[][] = [];
  for (let r = 0; r <= rows; r++) {
    pts.push([]);
    for (let c = 0; c <= cols; c++) {
      const edgeX = c === 0 || c === cols;
      const edgeY = r === 0 || r === rows;
      const x = c * cw + (edgeX ? 0 : (rand() - 0.5) * cw * 0.7);
      const y = r * ch + (edgeY ? 0 : (rand() - 0.5) * ch * 0.7);
      pts[r].push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
    }
  }
  const tris: Pt[][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = pts[r][c];
      const b = pts[r][c + 1];
      const d = pts[r + 1][c];
      const e = pts[r + 1][c + 1];
      if (rand() < 0.5) tris.push([a, b, e], [a, e, d]);
      else tris.push([a, b, d], [b, e, d]);
    }
  }
  const path = (t: Pt[]) => `M${t[0][0]} ${t[0][1]}L${t[1][0]} ${t[1][1]}L${t[2][0]} ${t[2][1]}Z`;
  const filled = tris.filter(() => rand() < fill);
  const reds = Array.from({ length: red }, () => tris[Math.floor(rand() * tris.length)]);

  return (
    <svg aria-hidden viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" className={className}>
      {filled.map((t, i) => (
        <path key={i} d={path(t)} fill="currentColor" fillOpacity={0.05 + (i % 4) * 0.035} />
      ))}
      {reds.map((t, i) => (
        <path key={`r${i}`} d={path(t)} fill="var(--color-accent)" fillOpacity={0.5} />
      ))}
      <path d={tris.map(path).join("")} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={1} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
