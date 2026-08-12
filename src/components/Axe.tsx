import { useId } from 'react';
import { DEFAULT_AXE_SKIN } from '../game/shop';

interface AxeProps {
  size?: number;
  className?: string;
  /** Skin-ID aus shop.ts. Ändert nur Farben/Glanz, nie die Form oder das Balancing. */
  skin?: string;
}

interface AxeStyle {
  /** Klinge: Glanzkante -> Fläche -> Schattenseite. */
  steel: [string, string, string];
  /** Griff: hell -> dunkel. */
  wood: [string, string];
  /** Farbe der Wicklungs-Ringe am Griff. */
  wrap: string;
  /** Kontur, hebt die Silhouette vom dunklen Hintergrund ab. */
  outline: string;
  /** Optionaler farbiger Schein um die Klinge (z.B. Glut, Frost). */
  glow?: string;
}

const AXE_STYLES: Record<string, AxeStyle> = {
  'axe-standard': {
    steel: ['#ffffff', '#dbe4ec', '#9aa6b2'],
    wood: ['#a5713c', '#6b4420'],
    wrap: '#4a2c14',
    outline: '#141820',
  },
  'axe-bronze': {
    steel: ['#ffeec2', '#e0a959', '#9d5f24'],
    wood: ['#6b4a30', '#3a2417'],
    wrap: '#241509',
    outline: '#140d06',
  },
  'axe-frost': {
    steel: ['#ffffff', '#bfe7f8', '#5b9dc4'],
    wood: ['#8fa8b5', '#4a5c68'],
    wrap: '#2c3f49',
    outline: '#0e1d26',
    glow: 'rgba(130, 215, 255, 0.9)',
  },
  'axe-ember': {
    steel: ['#fff4d0', '#ff9a4d', '#b23412'],
    wood: ['#4a3a33', '#1e1512'],
    wrap: '#150e0b',
    outline: '#180a04',
    glow: 'rgba(255, 138, 61, 0.95)',
  },
  'axe-gold': {
    steel: ['#fffce8', '#ffd756', '#bf8c0d'],
    wood: ['#8a6b3a', '#4a361a'],
    wrap: '#2f2210',
    outline: '#17110a',
    glow: 'rgba(255, 210, 74, 0.8)',
  },
};

/**
 * Die Wurf-Axt. Bei Rotation 0° zeigt die Klinge nach oben (= "voran"), so wie sie in
 * der Zielscheibe stecken soll; die Rotation steuert der Aufrufer per CSS.
 *
 * Zeichenstil: flach und kontraststark statt fein schattiert. Jede Form hat eine
 * dunkle Kontur, damit die Axt auch klein (22px im Vorrat) und vor dem fast schwarzen
 * Hintergrund noch klar lesbar ist.
 */
export function Axe({ size = 40, className, skin = DEFAULT_AXE_SKIN }: AxeProps) {
  // useId: die Gradient-IDs müssen eindeutig sein, wenn mehrere Äxte gleichzeitig im
  // DOM hängen, und dürfen sich beim Re-Render nicht ändern.
  const uid = useId().replace(/:/g, '');
  const bladeId = `axe-blade-${uid}`;
  const woodId = `axe-wood-${uid}`;
  const style = AXE_STYLES[skin] ?? AXE_STYLES[DEFAULT_AXE_SKIN];

  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 32 60"
      className={className}
      overflow="visible"
      style={style.glow ? { filter: `drop-shadow(0 0 6px ${style.glow})` } : undefined}
    >
      <defs>
        <linearGradient id={bladeId} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor={style.steel[0]} />
          <stop offset="52%" stopColor={style.steel[1]} />
          <stop offset="100%" stopColor={style.steel[2]} />
        </linearGradient>
        <linearGradient id={woodId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={style.wood[0]} />
          <stop offset="100%" stopColor={style.wood[1]} />
        </linearGradient>
      </defs>

      {/* Griff: kräftig genug, um bei 30px noch als Stiel lesbar zu sein */}
      <path
        d="M12.8 14 L19.2 14 L18.5 55 C18.5 57.2 17.4 58.4 16 58.4 C14.6 58.4 13.5 57.2 13.5 55 Z"
        fill={`url(#${woodId})`}
        stroke={style.outline}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Wicklung am Griff – drei kräftige Ringe, wie beim Vorbild */}
      <rect x="12.2" y="26" width="7.6" height="3.6" rx="1.6" fill={style.wrap} />
      <rect x="12.3" y="33" width="7.4" height="3.6" rx="1.6" fill={style.wrap} />
      <rect x="12.4" y="40" width="7.2" height="3.6" rx="1.6" fill={style.wrap} />

      {/* Hammer-Sporn hinten links. Zusammen mit dem Blatt rechts wird der Kopf breit
          und flach – erst dadurch liest sich die Silhouette klein noch als Axt und
          nicht als runder Klecks. */}
      <path
        d="M13 7.5 L5.5 8.8 C2.6 9.4 2.2 13.4 4.8 14.8 L13 18.6 Z"
        fill={`url(#${bladeId})`}
        stroke={style.outline}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* Blatt: breite, nach rechts ausschwingende Schneide. */}
      <path
        d="M12.5 3.5
           C21.5 2 30 6.5 30.8 12.5
           C31.5 18 24.5 22 16.5 20.6
           L12.5 19.8 Z"
        fill={`url(#${bladeId})`}
        stroke={style.outline}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Schneide: heller Saum entlang der Außenkante */}
      <path
        d="M15.5 5 C22.8 4.2 28.6 7.8 29.2 12.8"
        fill="none"
        stroke={style.steel[0]}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.95"
      />
    </svg>
  );
}
