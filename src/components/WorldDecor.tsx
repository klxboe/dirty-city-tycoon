import type { DecorKind } from '../game/worlds';
import './WorldDecor.css';

interface WorldDecorProps {
  decor: DecorKind;
}

/** Kleine Silhouette in einer Bühnen-Ecke – Baum, Kaktus, Eiszapfen oder Lavastein. */
function CornerShape({ decor }: { decor: Exclude<DecorKind, 'stars'> }) {
  switch (decor) {
    case 'trees':
      return (
        <svg viewBox="0 0 40 60" className="world-decor__shape">
          <path d="M20 4 L32 26 H26 L34 40 H6 L14 26 H8 Z" fill="currentColor" />
          <rect x="17" y="40" width="6" height="16" fill="currentColor" />
        </svg>
      );
    case 'cacti':
      return (
        <svg viewBox="0 0 40 60" className="world-decor__shape">
          <rect x="15" y="14" width="10" height="42" rx="5" fill="currentColor" />
          <rect x="4" y="24" width="9" height="20" rx="4.5" fill="currentColor" />
          <rect x="27" y="18" width="9" height="26" rx="4.5" fill="currentColor" />
        </svg>
      );
    case 'icicles':
      return (
        <svg viewBox="0 0 40 60" className="world-decor__shape">
          <path d="M2 2 L10 40 L14 12 L20 48 L25 8 L31 36 L38 2 Z" fill="currentColor" />
        </svg>
      );
    case 'lava':
      return (
        <svg viewBox="0 0 40 60" className="world-decor__shape">
          <path
            d="M2 56 C0 40 10 34 8 22 C16 30 14 14 22 10 C22 24 30 22 30 34 C38 32 38 46 32 56 Z"
            fill="currentColor"
          />
        </svg>
      );
  }
}

const STAR_DOTS = [
  { left: '10%', top: '8%', size: 3, delay: '0s' },
  { left: '22%', top: '18%', size: 2, delay: '0.6s' },
  { left: '78%', top: '10%', size: 3, delay: '1.1s' },
  { left: '88%', top: '22%', size: 2, delay: '0.3s' },
  { left: '15%', top: '32%', size: 2, delay: '1.6s' },
  { left: '85%', top: '35%', size: 2, delay: '0.9s' },
  { left: '50%', top: '6%', size: 2, delay: '1.9s' },
];

/**
 * Kleine, rein dekorative Weltraum-Note für die Kosmos-Welt: statische, leicht
 * funkelnde Sterne statt Ecken-Silhouetten (ein Baum/Kaktus-Silhouette hätte hier
 * keinen Sinn ergeben).
 */
function StarField() {
  return (
    <>
      {STAR_DOTS.map((s, i) => (
        <span
          key={i}
          className="world-decor__star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
          }}
        />
      ))}
    </>
  );
}

/** Rein atmosphärische Deko passend zur aktuellen Welt – trägt keine Spiellogik. */
export function WorldDecor({ decor }: WorldDecorProps) {
  if (decor === 'stars') {
    return (
      <div className="world-decor world-decor--stars" aria-hidden="true">
        <StarField />
      </div>
    );
  }

  return (
    <div className="world-decor" aria-hidden="true">
      <div className="world-decor__corner world-decor__corner--left">
        <CornerShape decor={decor} />
      </div>
      <div className="world-decor__corner world-decor__corner--right">
        <CornerShape decor={decor} />
      </div>
    </div>
  );
}
