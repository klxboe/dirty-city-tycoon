import { useId } from 'react';
import { DEFAULT_AXE_SKIN } from '../game/shop';

interface AxeProps {
  size?: number;
  className?: string;
  /** Skin-ID aus shop.ts. Ändert nur Farben/Glanz, nie die Form oder das Balancing. */
  skin?: string;
}

interface AxeStyle {
  /** Klinge: hell -> mittel -> dunkel. */
  steel: [string, string, string];
  /** Griff: hell -> mittel -> dunkel. */
  wood: [string, string, string];
  /** Kontur der Klinge. */
  steelStroke: string;
  /** Kontur/Wicklung am Griff. */
  woodStroke: string;
  /** Farbe des Auges (Schaftloch). */
  eye: string;
  /** Optionaler farbiger Schein um die Klinge (z.B. Glut, Frost). */
  glow?: string;
}

const AXE_STYLES: Record<string, AxeStyle> = {
  'axe-standard': {
    steel: ['#f3f6f8', '#c7d1d9', '#8b98a3'],
    wood: ['#a5713c', '#8a5a2b', '#6b4420'],
    steelStroke: '#5c6670',
    woodStroke: '#4d3016',
    eye: '#3a4149',
  },
  'axe-bronze': {
    steel: ['#ffe0a8', '#d99a4e', '#95561f'],
    wood: ['#6b4a30', '#513524', '#3a2417'],
    steelStroke: '#7a4415',
    woodStroke: '#2a1a10',
    eye: '#4a2c14',
  },
  'axe-frost': {
    steel: ['#f2fbff', '#a8dcf5', '#4d90b8'],
    wood: ['#8fa8b5', '#6b8391', '#4a5c68'],
    steelStroke: '#2f6c8f',
    woodStroke: '#33444e',
    eye: '#2c4652',
    glow: 'rgba(130, 215, 255, 0.85)',
  },
  'axe-ember': {
    steel: ['#fff0c4', '#ff8a3d', '#a32a10'],
    wood: ['#4a3a33', '#33261f', '#1e1512'],
    steelStroke: '#7a1e08',
    woodStroke: '#150e0b',
    eye: '#2b1410',
    glow: 'rgba(255, 138, 61, 0.9)',
  },
  'axe-gold': {
    steel: ['#fffbe0', '#ffd24a', '#b8860b'],
    wood: ['#8a6b3a', '#6b5129', '#4a361a'],
    steelStroke: '#8a6508',
    woodStroke: '#2f2210',
    eye: '#5c4408',
    glow: 'rgba(255, 210, 74, 0.7)',
  },
};

/**
 * Eine Tomahawk-Axt. Bei Rotation 0° zeigt die Klinge nach oben (= "voran"),
 * so wie sie in der Zielscheibe stecken soll. Rotation wird vom Aufrufer per CSS gesteuert.
 */
export function Axe({ size = 40, className, skin = DEFAULT_AXE_SKIN }: AxeProps) {
  // useId statt eines hochgezählten Moduls-Zählers: die Gradient-IDs müssen eindeutig sein,
  // wenn mehrere Äxte gleichzeitig im DOM hängen, und dürfen sich beim Re-Render nicht ändern.
  const uid = useId().replace(/:/g, '');
  const steelId = `axe-steel-${uid}`;
  const woodId = `axe-wood-${uid}`;
  const style = AXE_STYLES[skin] ?? AXE_STYLES[DEFAULT_AXE_SKIN];

  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 32 60"
      className={className}
      overflow="visible"
      style={style.glow ? { filter: `drop-shadow(0 0 5px ${style.glow})` } : undefined}
    >
      <defs>
        <linearGradient id={steelId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={style.steel[0]} />
          <stop offset="45%" stopColor={style.steel[1]} />
          <stop offset="100%" stopColor={style.steel[2]} />
        </linearGradient>
        <linearGradient id={woodId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={style.wood[0]} />
          <stop offset="50%" stopColor={style.wood[1]} />
          <stop offset="100%" stopColor={style.wood[2]} />
        </linearGradient>
      </defs>

      {/* Griff */}
      <rect x="12" y="20" width="8" height="36" rx="4" fill={`url(#${woodId})`} stroke={style.woodStroke} strokeWidth="1" />
      {/* Leder-Wicklung am Griffansatz */}
      <rect x="11.5" y="21" width="9" height="3" rx="1.2" fill={style.woodStroke} />
      <rect x="11.5" y="25.5" width="9" height="3" rx="1.2" fill={style.woodStroke} />
      {/* Lederschlaufe am Griffende */}
      <circle cx="16" cy="54" r="3" fill="none" stroke={style.woodStroke} strokeWidth="2" />

      {/* Axtkopf: Rückspitze links, geschwungene Klinge rechts */}
      <path
        d="M16 18 L7 15 C4.5 14 4 11 6 9 L9 6 C10.5 4.5 12.5 5 13 7 L16 18 Z"
        fill={`url(#${steelId})`}
        stroke={style.steelStroke}
        strokeWidth="1"
      />
      <path
        d="M16 2 C22 1 29 5 29.5 12 C30 18 24 22.5 17 21.5 L14.5 21 C13 20.5 12.5 18.5 13.5 17 L16 2 Z"
        fill={`url(#${steelId})`}
        stroke={style.steelStroke}
        strokeWidth="1.2"
      />
      {/* Glanzlicht auf der Klinge */}
      <path d="M18 5 C22 5 26 8 26.5 12" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
      {/* Auge/Schaftloch, verbindet Kopf und Griff optisch */}
      <rect x="12.5" y="15" width="7" height="8" rx="2.5" fill={style.eye} />
    </svg>
  );
}
