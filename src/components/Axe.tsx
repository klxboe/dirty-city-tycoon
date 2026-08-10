interface AxeProps {
  size?: number;
  className?: string;
}

let gradientIdCounter = 0;

/**
 * Eine Tomahawk-Axt. Bei Rotation 0° zeigt die Klinge nach oben (= "voran"),
 * so wie sie in der Zielscheibe stecken soll. Rotation wird vom Aufrufer per CSS gesteuert.
 */
export function Axe({ size = 40, className }: AxeProps) {
  // Eindeutige Gradient-IDs, falls mehrere Äxte gleichzeitig auf der Seite sind.
  const idRef = (gradientIdCounter += 1);
  const steelId = `axe-steel-${idRef}`;
  const woodId = `axe-wood-${idRef}`;

  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 32 60" className={className} overflow="visible">
      <defs>
        <linearGradient id={steelId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3f6f8" />
          <stop offset="45%" stopColor="#c7d1d9" />
          <stop offset="100%" stopColor="#8b98a3" />
        </linearGradient>
        <linearGradient id={woodId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a5713c" />
          <stop offset="50%" stopColor="#8a5a2b" />
          <stop offset="100%" stopColor="#6b4420" />
        </linearGradient>
      </defs>

      {/* Griff */}
      <rect x="12" y="20" width="8" height="36" rx="4" fill={`url(#${woodId})`} stroke="#4d3016" strokeWidth="1" />
      {/* Leder-Wicklung am Griffansatz */}
      <rect x="11.5" y="21" width="9" height="3" rx="1.2" fill="#5a3a1e" />
      <rect x="11.5" y="25.5" width="9" height="3" rx="1.2" fill="#5a3a1e" />
      {/* Lederschlaufe am Griffende */}
      <circle cx="16" cy="54" r="3" fill="none" stroke="#5a3a1e" strokeWidth="2" />

      {/* Axtkopf: Rückspitze links, geschwungene Klinge rechts */}
      <path
        d="M16 18 L7 15 C4.5 14 4 11 6 9 L9 6 C10.5 4.5 12.5 5 13 7 L16 18 Z"
        fill={`url(#${steelId})`}
        stroke="#5c6670"
        strokeWidth="1"
      />
      <path
        d="M16 2 C22 1 29 5 29.5 12 C30 18 24 22.5 17 21.5 L14.5 21 C13 20.5 12.5 18.5 13.5 17 L16 2 Z"
        fill={`url(#${steelId})`}
        stroke="#5c6670"
        strokeWidth="1.2"
      />
      {/* Glanzlicht auf der Klinge */}
      <path d="M18 5 C22 5 26 8 26.5 12" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
      {/* Auge/Schaftloch, verbindet Kopf und Griff optisch */}
      <rect x="12.5" y="15" width="7" height="8" rx="2.5" fill="#3a4149" />
    </svg>
  );
}
