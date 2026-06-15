import { useMemo } from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

/**
 * Stylized face-mesh overlay (the "3D scanner" look of Mogged / GlowUp Daily),
 * rose-pink. A grid of points clipped to a face ellipse, connected by edges.
 * Decorative (not real landmarks) but reads as a live mesh scan. Web + native.
 */
type Pt = { x: number; y: number; r: number; c: number };

function buildMesh(size: number, cols = 9, rows = 12) {
  const cx = 0.5, cy = 0.52, rx = 0.43, ry = 0.47;
  const grid: (Pt | null)[][] = [];
  const pts: Pt[] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      const nx = (c + 0.5) / cols, ny = (r + 0.5) / rows;
      const dx = (nx - cx) / rx, dy = (ny - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        const p = { x: nx * size, y: ny * size, r, c };
        grid[r][c] = p; pts.push(p);
      } else grid[r][c] = null;
    }
  }
  const edges: [Pt, Pt][] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const p = grid[r][c]; if (!p) continue;
    const right = grid[r][c + 1]; const down = grid[r + 1] && grid[r + 1][c]; const diag = grid[r + 1] && grid[r + 1][c + 1];
    if (right) edges.push([p, right]);
    if (down) edges.push([p, down]);
    if (diag) edges.push([p, diag]);
  }
  return { pts, edges };
}

export default function FaceMeshOverlay({ size, color = '#E0537A', opacity = 0.55 }: { size: number; color?: string; opacity?: number }) {
  const { pts, edges } = useMemo(() => buildMesh(size), [size]);
  return (
    <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, opacity }} pointerEvents="none">
      {edges.map(([a, b], i) => (
        <Line key={`e${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={0.6} strokeOpacity={0.5} />
      ))}
      {pts.map((p, i) => (
        <Circle key={`p${i}`} cx={p.x} cy={p.y} r={1.3} fill={color} fillOpacity={0.9} />
      ))}
    </Svg>
  );
}
