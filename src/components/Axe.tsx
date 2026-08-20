import { useId } from 'react';
import { DEFAULT_AXE_SKIN, getAxeStyle } from '../game/shop';
import { getAxeShape, getAxeImage } from '../game/axeShapes';
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
  const shape = getAxeShape(skin);
  const image = getAxeImage(skin);

  // Echter Bild-Skin (siehe game/axeShapes.ts): ersetzt komplett das SVG.
  // Gleiche Bounding-Box wie die Vektor-Variante (size × size*1.5), damit
  // Wurf-Rotation/Positionierung an den Aufruf-Stellen unverändert bleiben –
  // die setzen ihre Transforms auf den umgebenden Wrapper, nicht auf die Axt
  // selbst.
  if (image) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size * 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: style.glow ? `drop-shadow(0 0 6px ${style.glow})` : undefined,
        }}
      >
        <img
          src={image}
          alt=""
          draggable={false}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

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

      {/* Rückseite (Sporn oder zweite Klinge, skin-abhängig). Zusammen mit dem
          Blatt wird der Kopf breit und flach – erst dadurch liest sich die
          Silhouette klein noch als Axt und nicht als runder Klecks. */}
      {shape.back && (
        <path
          d={shape.back}
          fill={`url(#${bladeId})`}
          stroke={style.outline}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      )}

      {/* Blatt: skin-abhängige Form (siehe game/axeShapes.ts). */}
      <path
        d={shape.front}
        fill={`url(#${bladeId})`}
        stroke={style.outline}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {shape.edgeGlint && (
        <>
          {/* Schneide: heller Saum entlang der Außenkante */}
          <path
            d={shape.edgeGlint}
            fill="none"
            stroke={style.steel[0]}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.95"
          />
          {/* Wanderndes Glanzlicht auf der Schneide – ein kurzer heller Strich, der per
              stroke-dashoffset-Animation immer wieder die Klinge entlangläuft. */}
          <path
            className="axe__edge-glint"
            d={shape.edgeGlint}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Zier-Flächen (Edelstein, Blatt, Totenkopf, ...) */}
      {shape.accentFills?.map((accent, i) => (
        <path key={i} d={accent.d} fill={accent.color ?? style.steel[0]} />
      ))}
      {/* Zier-Linien (Riss, Zeigernadel, Schaltkreis, ...) */}
      {shape.accentStrokes?.map((accent, i) => (
        <path
          key={i}
          d={accent.d}
          fill="none"
          stroke={accent.color ?? style.steel[0]}
          strokeWidth={accent.width ?? 1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
