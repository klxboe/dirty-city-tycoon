interface AxeProps {
  size?: number;
  className?: string;
}

/**
 * Eine einzelne Axt-Form. Bei Rotation 0° zeigt die Klinge nach oben (= "voran"),
 * so wie sie in der Zielscheibe stecken soll. Rotation wird vom Aufrufer per CSS gesteuert.
 */
export function Axe({ size = 40, className }: AxeProps) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 24 36" className={className}>
      <rect x="9.5" y="14" width="5" height="22" rx="2.5" fill="#8a5a2b" stroke="#6b4420" strokeWidth="1" />
      <path
        d="M12 0 L22 8 L18 18 H6 L2 8 Z"
        fill="#d7dde3"
        stroke="#98a2ad"
        strokeWidth="1.5"
      />
      <path d="M12 2 L18 8 L15.5 15 H12 Z" fill="#eef1f4" opacity="0.7" />
    </svg>
  );
}
