interface AppleProps {
  size?: number;
}

/**
 * Ein Apfel, der am Rand der Zielscheibe hängt und abgeworfen werden kann.
 * Flach und kontraststark gezeichnet (kräftiges Rot, dunkle Kontur, ein Glanzpunkt),
 * damit er vor dem dunklen Hintergrund auch klein sofort erkennbar ist.
 */
export function Apple({ size = 30 }: AppleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" overflow="visible">
      {/* Frucht: zwei verschmolzene Rundungen mit Kerbe oben */}
      <path
        d="M16 10.5
           C12.5 7.8 6 8.8 5 15
           C4 21.2 8.6 28 12.8 28
           C14.2 28 15.2 27.4 16 27
           C16.8 27.4 17.8 28 19.2 28
           C23.4 28 28 21.2 27 15
           C26 8.8 19.5 7.8 16 10.5 Z"
        fill="#e63946"
        stroke="#7a1119"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Glanzlicht */}
      <path
        d="M10.5 14.5 C9.4 16.2 9.3 18.6 10.2 20.4"
        stroke="#ff9b9b"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Stiel */}
      <path d="M16 10 C15.6 7 15.9 5.4 16.8 4" stroke="#5c3a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Blatt */}
      <path
        d="M17 6.4 C19 4.2 22.2 3.8 24 4.8 C22.6 7.4 19.6 8.2 17 6.4 Z"
        fill="#4caf50"
        stroke="#256b2b"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
