import { useEffect, useRef } from 'react';
import { LEVEL_COUNT } from '../game/constants';
import { WORLDS, WORLDS_LEVEL_COUNT, type DecorKind } from '../game/worlds';
import './WorldMap.css';

/** Kleines Schloss-Symbol für noch nicht erreichte Welten. */
function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="world-node__lock">
      <rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Ein Icon je Welt-Deko-Art, plus "endless" für den Endlos-Modus-Knoten. */
function WorldIcon({ kind }: { kind: DecorKind | 'endless' }) {
  switch (kind) {
    case 'trees':
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path d="M12 2 L18 12 H15 L19 18 H5 L9 12 H6 Z" fill="currentColor" />
          <rect x="10.5" y="18" width="3" height="4" fill="currentColor" />
        </svg>
      );
    case 'cacti':
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path
            d="M11 22V9a2 2 0 1 1 4 0v2h1a2 2 0 0 1 2 2v3M11 12H9a2 2 0 0 1-2-2V7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'icicles':
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path d="M4 4h16l-3 9-2-5-3 12-3-12-2 5Z" fill="currentColor" />
        </svg>
      );
    case 'lava':
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path
            d="M12 2c2 3-2 4-1 7 1-1.5 2.5-1.5 3 0 1 3-1 6-4 6s-5-3-4-6c.6-2 2-2 2-4 0-1.4-.6-2.2 0-3Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'stars':
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path d="M12 2l2.2 6.8H21l-5.6 4.1 2.2 6.8L12 15.6l-5.6 4.1 2.2-6.8L3 8.8h6.8Z" fill="currentColor" />
        </svg>
      );
    case 'endless':
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path
            d="M7 8a4 4 0 1 0 0 8c2.5 0 3.5-2 5-4s2.5-4 5-4a4 4 0 1 1 0 8c-2.5 0-3.5-2-5-4s-2.5-4-5-4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

interface MapNode {
  key: string;
  name: string;
  sublabel: string;
  accent: string;
  bgTop: string;
  icon: DecorKind | 'endless';
  startLevelIndex: number;
  unlocked: boolean;
  isCurrent: boolean;
  progress: number;
}

interface WorldMapProps {
  /** Höchstes je erreichtes Kampagnen-Level (1-basiert), für den Freischalt-Fortschritt. */
  bestLevel: number;
  currentLevelIndex: number;
  onSelectLevel: (levelIndex: number) => void;
  onClose: () => void;
}

/** Deterministischer Pseudo-Zufall (0..1) aus einer Ganzzahl – für Insel-Formen, die bei
 *  jedem Render gleich aussehen, statt bei jedem Öffnen neu zu würfeln. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** N Punkte unregelmäßig auf einem Kreis verteilt – die Ecken einer "Insel"-Blase. */
function blobPoints(cx: number, cy: number, r: number, seed: number, count = 10): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const jitter = 0.8 + seededRandom(seed * 97.3 + i * 13.7) * 0.4;
    pts.push([cx + Math.cos(angle) * r * jitter, cy + Math.sin(angle) * r * jitter]);
  }
  return pts;
}

/** Glatte geschlossene Kurve durch die Punkte (Catmull-Rom -> Bezier) – ergibt eine
 *  organische Insel-Silhouette statt eckiger Polygone, ganz ohne Zeichen-Tool. */
function smoothClosedPath(points: [number, number][]): string {
  const n = points.length;
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return `${d}Z`;
}

const ROW_HEIGHT = 92;
const TOP_PAD = 50;
const ISLAND_R = 25;
const NODE_X = [32, 68]; // Zickzack: gerader Index links, ungerader rechts.

function nodeCenter(i: number): { x: number; y: number } {
  return { x: NODE_X[i % 2], y: TOP_PAD + i * ROW_HEIGHT + ROW_HEIGHT / 2 };
}

function curveSegment(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const midY = (from.y + to.y) / 2;
  return `C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
}

/** Kleine Deko-Sprites im Insel-Innern, an drei festen Punkten um die Mitte gestreut. */
const DECOR_OFFSETS: [number, number][] = [
  [-0.55, -0.25],
  [0.5, 0.3],
  [-0.15, 0.5],
];

/**
 * Weltkarte im Cartoon-Draufsicht-Stil: verbundene Inseln im Ozean statt einer
 * schlichten Knoten-Kette. Jede Insel ist eine per Seed erzeugte, unregelmäßige
 * Blase (organischer als ein Kreis) mit einer dunkleren "Klippen"-Ebene darunter für
 * Tiefe, dazu ein paar verstreute Deko-Icons und der eigentliche antippbare
 * Marker mit Fortschrittsring. Ein Sandpfad in zwei Tönen windet sich zwischen den
 * Inseln hindurch, wie ein eingelaufener Trampelpfad.
 *
 * Koordinatensystem wie zuvor: alles in Prozent der EIGENEN Breite der Karte (nicht
 * des Viewports), damit Inseln, Pfad und Marker bei jeder Bildschirmgröße ohne
 * Messen exakt deckungsgleich bleiben.
 */
export function WorldMap({ bestLevel, currentLevelIndex, onSelectLevel, onClose }: WorldMapProps) {
  const nodes: MapNode[] = WORLDS.map((world) => ({
    key: world.id,
    name: world.name,
    sublabel: `Level ${world.startLevelIndex + 1}–${world.startLevelIndex + WORLDS_LEVEL_COUNT}`,
    accent: world.colors.accent,
    bgTop: world.colors.bgTop,
    icon: world.decor,
    startLevelIndex: world.startLevelIndex,
    unlocked: bestLevel > world.startLevelIndex,
    isCurrent: currentLevelIndex >= world.startLevelIndex && currentLevelIndex < world.startLevelIndex + WORLDS_LEVEL_COUNT,
    progress: Math.max(0, Math.min(1, (bestLevel - world.startLevelIndex) / WORLDS_LEVEL_COUNT)),
  }));

  if (bestLevel > LEVEL_COUNT) {
    nodes.push({
      key: 'endless',
      name: 'Endlos-Modus',
      sublabel: `Bestmarke Level ${bestLevel}`,
      accent: '#2ec4b6',
      bgTop: '#0d1a1c',
      icon: 'endless',
      startLevelIndex: LEVEL_COUNT,
      unlocked: true,
      isCurrent: currentLevelIndex >= LEVEL_COUNT,
      progress: 1,
    });
  }

  const reachedIndex = nodes.reduce((max, n, i) => (n.unlocked ? i : max), 0);
  const centers = nodes.map((_, i) => nodeCenter(i));
  const totalHeight = TOP_PAD * 2 + ROW_HEIGHT * nodes.length;

  const fullPath = centers.reduce(
    (d, c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `${d} ${curveSegment(centers[i - 1], c)}`),
    '',
  );
  const litPath = centers
    .slice(0, reachedIndex + 1)
    .reduce((d, c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `${d} ${curveSegment(centers[i - 1], c)}`), '');

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const currentIndex = Math.max(0, nodes.findIndex((n) => n.isCurrent));
    const el = scrollRef.current;
    if (!el) return;
    const targetFraction = (TOP_PAD + currentIndex * ROW_HEIGHT + ROW_HEIGHT / 2) / totalHeight;
    requestAnimationFrame(() => {
      el.scrollTop = Math.max(0, targetFraction * el.scrollHeight - el.clientHeight / 2);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ein paar treibende Wolken über dem Wasser, an festen (nicht zufälligen) Stellen
  // zwischen den Inseln – reine Atmosphäre, per Seed positioniert statt Hand für Hand.
  const cloudCount = Math.max(3, Math.round(nodes.length * 1.3));
  const clouds = Array.from({ length: cloudCount }, (_, i) => ({
    x: 10 + seededRandom(i * 7 + 3) * 80,
    y: (seededRandom(i * 11 + 1) * totalHeight * 0.94) + 10,
    scale: 0.7 + seededRandom(i * 5 + 9) * 0.6,
    delay: (seededRandom(i * 3 + 2) * 6).toFixed(1),
  }));

  return (
    <div className="world-atlas">
      <header className="world-atlas__head">
        <h2 className="world-atlas__title">Weltkarte</h2>
        <button className="world-atlas__close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
      </header>

      <div className="world-atlas__scroll" ref={scrollRef}>
        <div className="world-atlas__ocean" style={{ aspectRatio: `100 / ${totalHeight}` }}>
          <svg className="world-atlas__svg" viewBox={`0 0 100 ${totalHeight}`} preserveAspectRatio="none">
            <defs>
              <pattern id="ocean-waves" width="16" height="12" patternUnits="userSpaceOnUse">
                <path
                  d="M0 6 Q4 2 8 6 T16 6"
                  fill="none"
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth="1"
                />
              </pattern>
              {nodes.map((n, i) => (
                <radialGradient key={n.key} id={`island-fill-${i}`} cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor={n.bgTop} stopOpacity="1" />
                  <stop offset="100%" stopColor={n.accent} stopOpacity="1" />
                </radialGradient>
              ))}
            </defs>

            <rect x="0" y="0" width="100" height={totalHeight} fill="#1c6fb5" />
            <rect x="0" y="0" width="100" height={totalHeight} fill="url(#ocean-waves)" />

            {/* Wolken */}
            {clouds.map((c, i) => (
              <g key={i} className="world-atlas__cloud" style={{ ['--cloud-delay' as string]: `${c.delay}s` }}>
                <g transform={`translate(${c.x}, ${c.y}) scale(${c.scale})`} opacity="0.8">
                  <ellipse cx="0" cy="0" rx="7" ry="3.2" fill="#fff" />
                  <ellipse cx="4.5" cy="-1.4" rx="4.5" ry="2.6" fill="#fff" />
                  <ellipse cx="-4.5" cy="-1" rx="4" ry="2.2" fill="#fff" />
                </g>
              </g>
            ))}

            {/* Sandpfad: breiter dunkler Untergrund + schmalerer heller "Trampelpfad" obendrauf. */}
            <path d={fullPath} className="world-atlas__path world-atlas__path--dim" />
            <path d={litPath} className="world-atlas__path world-atlas__path--base" />
            <path d={litPath} className="world-atlas__path world-atlas__path--top" />

            {/* Inseln: dunklere Klippen-Ebene versetzt darunter, helle Deckfläche obendrauf. */}
            {nodes.map((n, i) => {
              const c = centers[i];
              const cliffPts = blobPoints(c.x, c.y + 2.6, ISLAND_R * 1.1, i * 31 + 7);
              const topPts = blobPoints(c.x, c.y, ISLAND_R, i * 31 + 7);
              return (
                <g key={n.key} className={n.unlocked ? '' : 'world-atlas__island--locked'}>
                  <path d={smoothClosedPath(cliffPts)} className="world-atlas__island-cliff" />
                  <path d={smoothClosedPath(topPts)} fill={`url(#island-fill-${i})`} className="world-atlas__island-top" />
                </g>
              );
            })}
          </svg>

          {/* Deko-Sprites + Marker liegen als HTML-Layer über dem SVG, an denselben
              Prozent-Koordinaten – einfacher zu stylen/animieren als verschachteltes SVG. */}
          {nodes.map((node, i) => {
            const c = centers[i];
            const labelSide = i % 2 === 0 ? 'right' : 'left';
            const ringCircumference = 2 * Math.PI * 46;
            return (
              <div key={node.key} className="world-atlas__spot" style={{ left: `${c.x}%`, top: `${(c.y / totalHeight) * 100}%` }}>
                {node.unlocked &&
                  DECOR_OFFSETS.map(([dx, dy], di) => (
                    <span
                      key={di}
                      className="world-atlas__decor"
                      style={{
                        left: `${dx * ISLAND_R * 1.5}px`,
                        top: `${dy * ISLAND_R * 1.5}px`,
                        color: node.accent,
                      }}
                    >
                      <WorldIcon kind={node.icon} />
                    </span>
                  ))}

                <div
                  className={`world-node ${node.unlocked ? '' : 'world-node--locked'} ${
                    node.isCurrent ? 'world-node--current' : ''
                  }`}
                  style={{ ['--node-accent' as string]: node.accent }}
                >
                  {node.isCurrent && <span className="world-node__pin">Du bist hier</span>}

                  <button
                    className="world-node__badge"
                    disabled={!node.unlocked}
                    onClick={() => {
                      onSelectLevel(node.startLevelIndex);
                      onClose();
                    }}
                    aria-label={`${node.name}, ${node.sublabel}`}
                  >
                    <svg className="world-node__ring" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="46" className="world-node__ring-track" />
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        className="world-node__ring-fill"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringCircumference * (1 - node.progress)}
                      />
                    </svg>
                    <span className="world-node__icon">{node.unlocked ? <WorldIcon kind={node.icon} /> : <LockIcon />}</span>
                  </button>

                  <div className={`world-node__label world-node__label--${labelSide}`}>
                    <span className="world-node__name">{node.name}</span>
                    <span className="world-node__sub">
                      {node.unlocked ? node.sublabel : `Ab Level ${node.startLevelIndex}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
