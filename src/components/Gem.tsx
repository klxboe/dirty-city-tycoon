interface GemProps {
  size?: number;
  className?: string;
}

/**
 * Die zweite Währung: ein Diamant. Bewusst in der bisher ungenutzten Teal-Akzentfarbe
 * (--color-accent aus theme.css), damit er auf einen Blick von den goldenen Münzen zu
 * unterscheiden ist.
 */
export function Gem({ size = 20, className }: GemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="gem-face" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#d4fff9" />
          <stop offset="50%" stopColor="#2ec4b6" />
          <stop offset="100%" stopColor="#177f76" />
        </linearGradient>
      </defs>
      <path d="M6 4 H18 L22 10 L12 21 L2 10 Z" fill="url(#gem-face)" stroke="#0e5951" strokeWidth="1" strokeLinejoin="round" />
      <path d="M6 4 L9 10 L2 10 Z" fill="#8ff0e5" opacity="0.85" />
      <path d="M18 4 L15 10 L22 10 Z" fill="#177f76" opacity="0.65" />
      <path d="M9 10 L12 21 L15 10 Z" fill="#5be0d2" opacity="0.55" />
      <path d="M6 4 H18 L15 10 H9 Z" fill="#e8fffc" opacity="0.5" />
    </svg>
  );
}
