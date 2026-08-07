import './TruckSprite.css';

interface TruckSpriteProps {
  variant?: number;
  flip?: boolean;
  size?: number;
}

const BODY_COLORS = [
  { main: '#2f9bff', dark: '#1c74cc' },
  { main: '#3ecf5d', dark: '#269943' },
  { main: '#ff8c42', dark: '#dd6c22' },
  { main: '#9b6bff', dark: '#7a46e6' },
];

/** Ein kleiner Cartoon-Müllwagen, seitlich, mit sich drehenden Rädern. */
export function TruckSprite({ variant = 0, flip = false, size = 84 }: TruckSpriteProps) {
  const color = BODY_COLORS[variant % BODY_COLORS.length];

  return (
    <svg
      className="truck-sprite"
      width={size}
      height={size * 0.62}
      viewBox="0 0 120 74"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* Ladefläche */}
      <rect x="4" y="18" width="72" height="34" rx="8" fill={color.main} />
      <rect x="4" y="18" width="72" height="10" rx="5" fill="#ffffff" opacity="0.25" />
      <rect x="10" y="24" width="60" height="4" rx="2" fill={color.dark} opacity="0.6" />

      {/* Fahrerkabine */}
      <path d="M76 24 h20 a8 8 0 0 1 8 8 v20 h-28 Z" fill={color.dark} />
      <rect x="84" y="30" width="14" height="14" rx="3" fill="#cdeffd" stroke="#8fb8c9" strokeWidth="1.5" />
      <rect x="76" y="48" width="28" height="6" fill={color.dark} />

      {/* Stoßstange */}
      <rect x="102" y="46" width="6" height="10" rx="2" fill="#3a414a" />

      {/* Räder */}
      <g className="truck-sprite__wheel" style={{ transformOrigin: '26px 58px' }}>
        <circle cx="26" cy="58" r="11" fill="#2c2c2c" />
        <circle cx="26" cy="58" r="4.5" fill="#c9c9c9" />
      </g>
      <g className="truck-sprite__wheel" style={{ transformOrigin: '90px 58px' }}>
        <circle cx="90" cy="58" r="11" fill="#2c2c2c" />
        <circle cx="90" cy="58" r="4.5" fill="#c9c9c9" />
      </g>
    </svg>
  );
}
