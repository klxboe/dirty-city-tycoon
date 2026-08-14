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

/**
 * Ein Icon je Welt-Deko-Art (siehe DecorKind in worlds.ts), plus "endless" für den
 * Endlos-Modus-Knoten. Bewusst simple, einfarbige Formen (currentColor) statt Fotos –
 * bei 44px Größe zählt nur die Silhouette, nicht das Detail.
 */
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
  bgBottom: string;
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

/** Höhe einer "Etappe" zwischen zwei Welten, in Prozent der Karten-Breite (siehe ROW_HEIGHT-Erklärung unten). */
const ROW_HEIGHT = 62;
const TOP_PAD = 34;
const NODE_X = [26, 74]; // Zickzack: gerader Index links, ungerader rechts.

function nodeCenter(i: number): { x: number; y: number } {
  return { x: NODE_X[i % 2], y: TOP_PAD + i * ROW_HEIGHT + ROW_HEIGHT / 2 };
}

/** Sanfte S-Kurve zwischen zwei Punkten: Kontrollpunkte auf halber Höhe, an der jeweiligen
 *  Start-/End-x – das ergibt bei alternierendem x automatisch einen fließenden Schlenker,
 *  ganz ohne Kurven-Bibliothek. */
function curveSegment(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const midY = (from.y + to.y) / 2;
  return `C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
}

/**
 * Weltkarte als echter, gewundener Reiseweg statt Karten-Liste: Vollbild-Ansicht mit
 * einer S-Kurve, die alle Welten zickzack verbindet, farbig getönten Etappen je Welt
 * und einem eigenen Endlos-Modus-Knoten ganz oben, sobald er erreicht ist.
 *
 * Alle Koordinaten sind PROZENT DER EIGENEN BREITE (nicht des Viewports) – Knoten
 * (per `left/top: %`) und der SVG-Pfad (`viewBox="0 0 100 H"`) nutzen dasselbe
 * Zahlensystem, dadurch bleiben sie bei jeder Bildschirmgröße exakt deckungsgleich,
 * ohne dass irgendetwas gemessen werden müsste (kein ResizeObserver nötig).
 */
export function WorldMap({ bestLevel, currentLevelIndex, onSelectLevel, onClose }: WorldMapProps) {
  const nodes: MapNode[] = WORLDS.map((world) => ({
    key: world.id,
    name: world.name,
    sublabel: `Level ${world.startLevelIndex + 1}–${world.startLevelIndex + WORLDS_LEVEL_COUNT}`,
    accent: world.colors.accent,
    bgTop: world.colors.bgTop,
    bgBottom: world.colors.bgBottom,
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
      bgBottom: '#040a0b',
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

  // Voller Pfad (gedimmt, immer sichtbar) + heller Pfad nur bis zur höchsten erreichten Welt.
  const fullPath = centers.reduce(
    (d, c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `${d} ${curveSegment(centers[i - 1], c)}`),
    '',
  );
  const litPath = centers
    .slice(0, reachedIndex + 1)
    .reduce((d, c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `${d} ${curveSegment(centers[i - 1], c)}`), '');

  // Farbverlauf der Bühne: jede Welt bekommt ihre eigene Zone im Hintergrund, sanft
  // ineinander übergehend – macht aus der Karte eine echte "Reise" statt einer Liste.
  const bgStops = nodes
    .map((n, i) => {
      const start = (((TOP_PAD + i * ROW_HEIGHT) / totalHeight) * 100).toFixed(1);
      const end = (((TOP_PAD + (i + 1) * ROW_HEIGHT) / totalHeight) * 100).toFixed(1);
      return `${n.bgTop} ${start}%, ${n.bgBottom} ${end}%`;
    })
    .join(', ');
  const trackBackground = `linear-gradient(180deg, ${nodes[0].bgTop} 0%, ${bgStops})`;

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Direkt zur aktuellen Welt scrollen, statt immer ganz oben (Wald) zu starten –
    // wer schon bei Level 70 steht, will nicht erst durch drei Welten scrollen müssen.
    const currentIndex = Math.max(0, nodes.findIndex((n) => n.isCurrent));
    const el = scrollRef.current;
    if (!el) return;
    const targetFraction = (TOP_PAD + currentIndex * ROW_HEIGHT + ROW_HEIGHT / 2) / totalHeight;
    requestAnimationFrame(() => {
      el.scrollTop = Math.max(0, targetFraction * el.scrollHeight - el.clientHeight / 2);
    });
    // Nur beim Öffnen einmalig scrollen, nicht bei jedem Re-Render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="world-path">
      <header className="world-path__head">
        <h2 className="world-path__title">Weltkarte</h2>
        <button className="world-path__close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
      </header>

      <div className="world-path__scroll" ref={scrollRef}>
        <div className="world-path__track" style={{ aspectRatio: `100 / ${totalHeight}`, background: trackBackground }}>
          <svg className="world-path__svg" viewBox={`0 0 100 ${totalHeight}`} preserveAspectRatio="none">
            <path d={fullPath} className="world-path__line world-path__line--dim" />
            <path d={litPath} className="world-path__line world-path__line--lit" />
          </svg>

          {nodes.map((node, i) => {
            const c = centers[i];
            const labelSide = i % 2 === 0 ? 'right' : 'left';
            const ringCircumference = 2 * Math.PI * 46;
            return (
              <div
                key={node.key}
                className={`world-node ${node.unlocked ? '' : 'world-node--locked'} ${
                  node.isCurrent ? 'world-node--current' : ''
                }`}
                style={{
                  left: `${c.x}%`,
                  top: `${(c.y / totalHeight) * 100}%`,
                  ['--node-accent' as string]: node.accent,
                }}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
