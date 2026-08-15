import { useId } from 'react';
import { DEFAULT_AXE_SKIN, getAxeStyle } from '../game/shop';
import './Axe.css';

interface AxeProps {
  size?: number;
  className?: string;
  /** Skin-ID aus shop.ts. Ändert nur Farben/Glanz, nie die Form oder das Balancing. */
  skin?: string;
}

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
  const wrapId = `axe-wrap-${uid}`;
  const style = getAxeStyle(skin);

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
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="14%" stopColor={style.steel[0]} />
          <stop offset="52%" stopColor={style.steel[1]} />
          <stop offset="100%" stopColor={style.steel[2]} />
        </linearGradient>
        <linearGradient id={woodId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={style.wood[0]} />
          <stop offset="100%" stopColor={style.wood[1]} />
        </linearGradient>
        <linearGradient id={wrapId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
          <stop offset="35%" stopColor={style.wrap} />
          <stop offset="70%" stopColor={style.wrap} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
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
      {/* Wicklung am Griff – drei kräftige Ringe, wie beim Vorbild. Gradient statt
          Flachfarbe (dunkler an den Rändern) lässt sie leicht rund/gewölbt wirken. */}
      <rect x="12.2" y="26" width="7.6" height="3.6" rx="1.6" fill={`url(#${wrapId})`} />
      <rect x="12.3" y="33" width="7.4" height="3.6" rx="1.6" fill={`url(#${wrapId})`} />
      <rect x="12.4" y="40" width="7.2" height="3.6" rx="1.6" fill={`url(#${wrapId})`} />

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
      {/* Wanderndes Glanzlicht auf der Schneide – ein kurzer heller Strich, der per
          stroke-dashoffset-Animation immer wieder die Klinge entlangläuft. Macht die
          bereitliegende Axt am Startbildschirm/vor dem Wurf lebendiger, ohne die Form
          selbst anzufassen. */}
      <path
        className="axe__edge-glint"
        d="M15.5 5 C22.8 4.2 28.6 7.8 29.2 12.8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
