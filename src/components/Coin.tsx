interface CoinProps {
  size?: number;
  className?: string;
}

/** Die Spielwährung: eine goldene Münze mit eingeprägter Axt. */
export function Coin({ size = 20, className }: CoinProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10.5" fill="#b8860b" />
      <circle cx="12" cy="11.4" r="10" fill="url(#coin-face)" />
      <defs>
        <radialGradient id="coin-face" cx="0.36" cy="0.3" r="0.85">
          <stop offset="0%" stopColor="#fff3b8" />
          <stop offset="55%" stopColor="#ffce3d" />
          <stop offset="100%" stopColor="#d99a00" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="11.4" r="7.6" fill="none" stroke="#a8760a" strokeWidth="0.9" opacity="0.65" />
      {/* Kleine Axt als Prägung */}
      <path d="M11.2 6.6 L11.2 16.2" stroke="#8a6508" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M11 6.4 C13.6 6 15.8 7.6 15.9 9.8 C16 11.6 14 12.8 11.6 12.4 Z" fill="#8a6508" />
    </svg>
  );
}
