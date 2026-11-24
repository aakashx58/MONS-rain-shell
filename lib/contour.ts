function hash(ix: number, iy: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function vnoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function field(x: number, y: number): number {
  return (
    0.65 * vnoise(x / 260, y / 260) +
    0.25 * vnoise(x / 120 + 13.7, y / 120 + 7.3) +
    0.1 * vnoise(x / 55 + 31.1, y / 55 + 19.4)
  );
}

function interp(v1: number, v2: number, iso: number): number {
  const d = v2 - v1;
  return Math.abs(d) < 1e-6 ? 0.5 : (iso - v1) / d;
}

export function generateContourSvgDataUrl(): string {
  const step = 12;
  const W = 1440;
  const H = 900;
  const cols = W / step;
  const rows = H / step;

  const grid: number[][] = [];
  for (let r = 0; r <= rows; r++) {
    const row: number[] = [];
    for (let c = 0; c <= cols; c++) {
      row.push(field(c * step, r * step));
    }
    grid.push(row);
  }

  const groups: string[][] = [[], [], [], []];

  for (let iso = 0.3; iso <= 0.8001; iso += 0.03) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * step;
        const y = r * step;
        const dx = (x + step * 0.5 - 720) / 720;
        const dy = (y + step * 0.5 - 450) / 450;
        const raw = (Math.max(Math.abs(dx) * 1.05, Math.abs(dy) * 0.6) - 0.35) / 0.5;
        const w = Math.max(0, Math.min(1, raw));
        if (w <= 0.05) continue;

        const v0 = grid[r][c];
        const v1 = grid[r][c + 1];
        const v2 = grid[r + 1][c + 1];
        const v3 = grid[r + 1][c];
        const idx =
          (v0 >= iso ? 8 : 0) |
          (v1 >= iso ? 4 : 0) |
          (v2 >= iso ? 2 : 0) |
          (v3 >= iso ? 1 : 0);

        if (idx === 0 || idx === 15) continue;

        const top: [number, number] = [x + step * interp(v0, v1, iso), y];
        const right: [number, number] = [x + step, y + step * interp(v1, v2, iso)];
        const bottom: [number, number] = [x + step * interp(v3, v2, iso), y + step];
        const left: [number, number] = [x, y + step * interp(v0, v3, iso)];

        const segs: [[number, number], [number, number]][] = [];
        if (idx === 1 || idx === 14) segs.push([left, bottom]);
        else if (idx === 2 || idx === 13) segs.push([bottom, right]);
        else if (idx === 3 || idx === 12) segs.push([left, right]);
        else if (idx === 4 || idx === 11) segs.push([top, right]);
        else if (idx === 5) {
          segs.push([left, top]);
          segs.push([bottom, right]);
        } else if (idx === 6 || idx === 9) segs.push([top, bottom]);
        else if (idx === 7 || idx === 8) segs.push([left, top]);
        else if (idx === 10) {
          segs.push([top, right]);
          segs.push([left, bottom]);
        }

        const gi = Math.min(3, Math.floor(w * 4));
        for (const [p1, p2] of segs) {
          groups[gi].push(
            `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
          );
        }
      }
    }
  }

  const opacities = ['.18', '.36', '.55', '.75'];
  const paths = groups
    .map(
      (g, i) =>
        `<path d="${g.join('')}" stroke="#9AA0A6" stroke-width="1" stroke-linecap="round" fill="none" stroke-opacity="${opacities[i]}"/>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="none">${paths}</svg>`;
  const base64 = Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
