import './WorkerSprite.css';

interface WorkerSpriteProps {
  /** 0-3, sorgt für ein bisschen Abwechslung, damit nicht alle Arbeiter Klone sind. */
  variant?: number;
  /** Spiegelt die Figur horizontal (z.B. damit sie zur Müllhalde hin "schaut"). */
  flip?: boolean;
  size?: number;
}

const SKIN_TONES = ['#f3c19c', '#c98a5e', '#8d5a3b', '#f0d0b0'];
const SHIRT_COLORS = ['#2f9bff', '#3ecf5d', '#ff8c42', '#9b6bff'];

/** Eine kleine Cartoon-Arbeiter-Figur mit Warnweste, Helm und Besen. */
export function WorkerSprite({ variant = 0, flip = false, size = 56 }: WorkerSpriteProps) {
  const skin = SKIN_TONES[variant % SKIN_TONES.length];
  const shirt = SHIRT_COLORS[variant % SHIRT_COLORS.length];

  return (
    <svg
      className="worker-sprite"
      width={size}
      height={size * 1.35}
      viewBox="0 0 60 80"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* Beine */}
      <g className="worker-sprite__legs">
        <rect x="20" y="52" width="8" height="20" rx="4" fill="#33404f" />
        <rect x="32" y="52" width="8" height="20" rx="4" fill="#2a3542" />
        <rect x="18" y="70" width="12" height="6" rx="3" fill="#1c2733" />
        <rect x="30" y="70" width="12" height="6" rx="3" fill="#1c2733" />
      </g>

      {/* Körper / Weste */}
      <rect x="16" y="32" width="28" height="24" rx="9" fill={shirt} />
      <rect x="16" y="32" width="28" height="24" rx="9" fill="none" stroke="#ffe066" strokeWidth="2" strokeDasharray="3 4" opacity="0.9" />

      {/* Arm mit Besen (schwingt per CSS-Animation) */}
      <g className="worker-sprite__arm" style={{ transformOrigin: '40px 38px' }}>
        <rect x="37" y="36" width="7" height="18" rx="3.5" fill={shirt} />
        <line x1="41" y1="52" x2="52" y2="72" stroke="#8a5a2b" strokeWidth="3" strokeLinecap="round" />
        <path d="M46 68 L58 64 L58 76 L46 74 Z" fill="#e8b04b" stroke="#c88f2e" strokeWidth="1.5" />
      </g>

      {/* Anderer Arm */}
      <rect x="14" y="36" width="7" height="16" rx="3.5" fill={shirt} />

      {/* Kopf */}
      <circle cx="30" cy="22" r="12" fill={skin} />
      <circle cx="26" cy="22" r="1.6" fill="#2c2416" />
      <circle cx="34" cy="22" r="1.6" fill="#2c2416" />
      <path d="M26 27 Q30 30 34 27" stroke="#2c2416" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Helm */}
      <path d="M17 16 A13 13 0 0 1 43 16 Z" fill="#ffd23f" stroke="#e0a52f" strokeWidth="1.5" />
      <rect x="15" y="14" width="30" height="4" rx="2" fill="#ffd23f" stroke="#e0a52f" strokeWidth="1.5" />
    </svg>
  );
}
