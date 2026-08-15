import type { DecorKind } from '../game/worlds';
import './WorldHorizon.css';

interface WorldHorizonProps {
  decor: DecorKind;
}

/** Deterministischer Pseudo-Zufall (0..1) – dieselbe Welt sieht bei jedem Laden gleich aus. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const VIEW_W = 400;
const VIEW_H = 150;

/** Einzelne, LOSGELÖSTE Zacken (Bäume/Berge mit sichtbaren Lücken dazwischen). */
function spikes(count: number, minH: number, maxH: number, seed: number, gapRatio: number): string {
  const step = VIEW_W / count;
  const halfW = (step * (1 - gapRatio)) / 2;
  let d = '';
  for (let i = 0; i < count; i++) {
    const cx = step * (i + 0.5) + (seededRandom(seed + i * 5.1) - 0.5) * step * 0.35;
    const h = minH + seededRandom(seed + i * 3.3) * (maxH - minH);
    d += `M${(cx - halfW).toFixed(1)},${VIEW_H} L${cx.toFixed(1)},${(VIEW_H - h).toFixed(1)} L${(cx + halfW).toFixed(1)},${VIEW_H} Z `;
  }
  return d;
}

/** Durchgehender Grat, jeder Punkt berührt den nächsten (Bergkette statt Einzelgipfel). */
function ridge(count: number, minH: number, maxH: number, seed: number): string {
  const step = VIEW_W / count;
  let d = `M0,${VIEW_H} `;
  for (let i = 0; i <= count; i++) {
    const x = i * step;
    const h = minH + seededRandom(seed + i * 4.7) * (maxH - minH);
    d += `L${x.toFixed(1)},${(VIEW_H - h).toFixed(1)} `;
  }
  d += `L${VIEW_W},${VIEW_H} Z`;
  return d;
}

/** Sanft geschwungene Dünen-Linie statt kantiger Zacken. */
function dunes(waves: number, minH: number, maxH: number, seed: number): string {
  const step = VIEW_W / waves;
  const startH = minH + seededRandom(seed) * (maxH - minH);
  let d = `M0,${VIEW_H} L0,${(VIEW_H - startH).toFixed(1)} `;
  for (let i = 0; i < waves; i++) {
    const cx = step * i + step * 0.5;
    const cy = VIEW_H - (minH + seededRandom(seed + i * 2 + 1) * (maxH - minH));
    const ex = step * (i + 1);
    const ey = VIEW_H - (minH + seededRandom(seed + i * 2 + 2) * (maxH - minH));
    d += `Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)} `;
  }
  d += `L${VIEW_W},${VIEW_H} Z`;
  return d;
}

/** Rechteckige Gebäude-Silhouette (Skyline) mit Fenster-Punkten fürs spätere Flackern. */
function buildings(count: number, minH: number, maxH: number, seed: number): { path: string; windows: { x: number; y: number }[] } {
  const step = VIEW_W / count;
  let path = '';
  const windows: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const w = step * (0.55 + seededRandom(seed + i * 6.1) * 0.35);
    const cx = step * (i + 0.5);
    const h = minH + seededRandom(seed + i * 2.9) * (maxH - minH);
    const left = cx - w / 2;
    path += `M${left.toFixed(1)},${VIEW_H} L${left.toFixed(1)},${(VIEW_H - h).toFixed(1)} L${(left + w).toFixed(1)},${(VIEW_H - h).toFixed(1)} L${(left + w).toFixed(1)},${VIEW_H} Z `;
    const rows = Math.max(1, Math.floor(h / 22));
    const cols = Math.max(1, Math.floor(w / 14));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (seededRandom(seed + i * 13 + r * 7 + c * 3) < 0.55) {
          windows.push({ x: left + 6 + c * 14, y: VIEW_H - h + 10 + r * 22 });
        }
      }
    }
  }
  return { path, windows };
}

/**
 * Welt-passende Horizont-Silhouette im Bühnenhintergrund – vorher war der Hintergrund
 * nur eine getönte Farbfläche mit abstraktem Streifenmuster, das mit "Wald" oder
 * "Wüste" nichts zu tun hatte. Zwei Ebenen (fern/nah) für einen einfachen Parallax-
 * Tiefeneindruck, wo es sich anbietet (Bäume, Berge, Skyline). Reine Silhouetten in
 * Schwarztönen (klassischer Trick, funktioniert vor jedem Himmel-Verlauf), oben ein
 * dünner Lichtsaum in der Welt-Akzentfarbe (--world-accent) für Atmosphäre.
 */
export function WorldHorizon({ decor }: WorldHorizonProps) {
  return (
    <div className={`world-horizon world-horizon--${decor}`} aria-hidden="true">
      <svg className="world-horizon__svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none">
        {decor === 'trees' && (
          <>
            <path className="world-horizon__layer world-horizon__layer--far" d={spikes(9, 40, 70, 11, 0.1)} />
            <path className="world-horizon__layer world-horizon__layer--near" d={spikes(12, 55, 100, 47, 0.06)} />
          </>
        )}

        {decor === 'cacti' && (
          <>
            <path className="world-horizon__layer world-horizon__layer--far" d={dunes(4, 20, 45, 5)} />
            <path className="world-horizon__layer world-horizon__layer--near" d={dunes(3, 10, 30, 23)} />
            <path
              className="world-horizon__layer world-horizon__layer--accent"
              d="M70,150 L70,88 a7,7 0 0 1 14,0 v8 h10 v20 h-10 v34 Z M290,150 L290,100 a6,6 0 0 1 12,0 v45 h9 v-24 h9 v40 h-30 Z"
            />
          </>
        )}

        {decor === 'icicles' && (
          <>
            <path className="world-horizon__layer world-horizon__layer--far" d={ridge(6, 45, 75, 9)} />
            <path className="world-horizon__layer world-horizon__layer--near" d={ridge(5, 65, 115, 31)} />
          </>
        )}

        {decor === 'lava' && (
          <>
            <path className="world-horizon__layer world-horizon__layer--far" d={spikes(3, 25, 45, 13, 0.25)} />
            <path
              className="world-horizon__layer world-horizon__layer--near"
              d="M140,150 L172,58 a10,10 0 0 1 16,0 L220,150 Z M158,150 L188,86 L200,110 L212,86 L242,150 Z"
            />
            <rect className="world-horizon__lava-line" x="0" y="146" width={VIEW_W} height="4" />
          </>
        )}

        {decor === 'city' && (() => {
          const far = buildings(7, 55, 95, 17);
          const near = buildings(10, 70, 135, 61);
          return (
            <>
              <path className="world-horizon__layer world-horizon__layer--far" d={far.path} />
              <path className="world-horizon__layer world-horizon__layer--near" d={near.path} />
              {near.windows.map((w, i) => (
                <rect
                  key={i}
                  className="world-horizon__window"
                  x={w.x}
                  y={w.y}
                  width="4"
                  height="6"
                  style={{ ['--flicker-delay' as string]: `${(seededRandom(i * 9 + 1) * 6).toFixed(2)}s` }}
                />
              ))}
            </>
          );
        })()}

        {decor === 'stars' && (
          <circle className="world-horizon__moon" cx="320" cy="118" r="46" />
        )}
      </svg>
    </div>
  );
}
