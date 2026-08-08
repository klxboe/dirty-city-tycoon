import './WorkerSprite.css';

interface WorkerSpriteProps {
  /** 0-3, sorgt für ein bisschen Abwechslung, damit nicht alle Arbeiter Klone sind. */
  variant?: number;
  /** Spiegelt die Figur horizontal (z.B. damit sie zur Müllhalde hin "schaut"). */
  flip?: boolean;
  size?: number;
}

const SKIN_TONES = ['#f3c19c', '#c98a5e', '#8d5a3b', '#f0d0b0'];
const SHIRT_COLORS = ['#2f9bff', '#3ecf5d', '#ff8c42', '#e0466b'];
const HELMET_COLORS = ['#ffd23f', '#5fd0ff', '#ffd23f', '#8fe388'];

/** Eine kleine Chibi-Cartoon-Arbeiter-Figur mit großem Kopf, Warnweste, Helm und Besen. */
export function WorkerSprite({ variant = 0, flip = false, size = 56 }: WorkerSpriteProps) {
  const skin = SKIN_TONES[variant % SKIN_TONES.length];
  const shirt = SHIRT_COLORS[variant % SHIRT_COLORS.length];
  const helmet = HELMET_COLORS[variant % HELMET_COLORS.length];

  return (
    <svg
      className="worker-sprite"
      width={size}
      height={size * 1.2}
      viewBox="0 0 60 72"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* Beine */}
      <g className="worker-sprite__legs">
        <rect x="21" y="56" width="8" height="12" rx="4" fill="#33404f" />
        <rect x="31" y="56" width="8" height="12" rx="4" fill="#2a3542" />
        <rect x="19" y="66" width="12" height="5" rx="2.5" fill="#1c2733" />
        <rect x="29" y="66" width="12" height="5" rx="2.5" fill="#1c2733" />
      </g>

      {/* Körper / Weste */}
      <rect x="15" y="39" width="30" height="20" rx="10" fill={shirt} />
      <rect x="15" y="39" width="30" height="20" rx="10" fill="none" stroke="#ffe066" strokeWidth="2" strokeDasharray="3 4" opacity="0.9" />

      {/* Arm mit Besen (schwingt per CSS-Animation) */}
      <g className="worker-sprite__arm" style={{ transformOrigin: '41px 44px' }}>
        <rect x="38" y="42" width="7" height="16" rx="3.5" fill={shirt} />
        <line x1="42" y1="56" x2="53" y2="70" stroke="#8a5a2b" strokeWidth="3" strokeLinecap="round" />
        <path d="M47 66 L59 62 L59 73 L47 71 Z" fill="#e8b04b" stroke="#c88f2e" strokeWidth="1.5" />
      </g>

      {/* Anderer Arm */}
      <rect x="13" y="42" width="7" height="14" rx="3.5" fill={shirt} />

      {/* Kopf (bewusst groß = chibi/knuffiger Stil) */}
      <circle cx="30" cy="20" r="17" fill={skin} />
      <circle cx="25" cy="21" r="2" fill="#2c2416" />
      <circle cx="35" cy="21" r="2" fill="#2c2416" />
      <circle cx="25.7" cy="20.3" r="0.7" fill="#fff" />
      <circle cx="35.7" cy="20.3" r="0.7" fill="#fff" />
      <path d="M25 27 Q30 31 35 27" stroke="#2c2416" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="24" r="3" fill="#ff9d8a" opacity="0.5" />
      <circle cx="41" cy="24" r="3" fill="#ff9d8a" opacity="0.5" />

      {/* Helm */}
      <path d="M11 15 A19 19 0 0 1 49 15 Z" fill={helmet} stroke="#00000022" strokeWidth="1.5" />
      <rect x="9" y="12" width="42" height="5" rx="2.5" fill={helmet} stroke="#00000022" strokeWidth="1.5" />
    </svg>
  );
}
