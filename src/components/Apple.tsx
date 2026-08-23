import { useId } from 'react';

interface AppleProps {
  size?: number;
  /** Seltene Variante: Diamant statt Münze, bringt Diamanten statt Münzen. */
  golden?: boolean;
  /** Heldenstadt-exklusiv: eine kleine Helden-Sammelfigur statt einer Münze. */
  figurine?: boolean;
}

/**
 * Die Sammel-Objekte am Rand der Zielscheibe (Name/Props aus historischen Gründen noch
 * "Apple" – der intern gültige Mechanismus/die Bezeichner im restlichen Code blieben
 * unangetastet, siehe `appleAngles`/`applesCollectedThisRun`; nur die Optik wurde
 * getauscht). Klaus: "Münzen statt Äpfel" – Früchte lasen sich nicht sofort als
 * Belohnung, eine Münze schon, zumal sie ja auch tatsächlich Münzen bringen.
 *
 * Normal = dieselbe Münze wie das HUD-Icon (`Coin.tsx`, geprägte Axt), damit sofort
 * klar ist: das hier UND die Zahl oben rechts sind dieselbe Währung. Golden = statt
 * einer goldenen Münze ein Diamant in der exakten `Gem.tsx`-Optik, weil diese Variante
 * ja auch tatsächlich Diamanten statt Münzen bringt – vorher war "goldener Apfel gibt
 * Diamanten" ein Bruch, jetzt passt Aussehen und Belohnung zusammen. Beide hängen an
 * einer kleinen Öse statt Stiel+Blatt (kein Fruchtstamm mehr nötig).
 */
export function Apple({ size = 30, golden = false, figurine = false }: AppleProps) {
  const uid = useId();
  const faceId = `pickup-face-${uid}`;

  if (figurine) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" overflow="visible">
        <path d="M12 12 C6 14 5 22 9 27 C10 23 11 18 13 14 Z" fill="#c41e2f" opacity="0.9" />
        <path d="M13 22 L11 29 M19 22 L21 29" stroke="#1a2a6b" strokeWidth="3.4" strokeLinecap="round" />
        <path
          d="M12 14 C12 12 20 12 20 14 L21 23 C18 24 14 24 11 23 Z"
          fill="#e0242f"
          stroke="#7a0f16"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M12 15 C9 15 7 13 6 10 M20 15 C23 15 24 18 24 21"
          stroke="#1a2a6b"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="16" cy="9" r="5.4" fill="#e0242f" stroke="#7a0f16" strokeWidth="1.4" />
        <path d="M13 8.4 C13.8 7 15 7 15.6 8.2 C15 9.4 13.6 9.4 13 8.4 Z" fill="#fff" />
        <path d="M19 8.4 C18.2 7 17 7 16.4 8.2 C17 9.4 18.4 9.4 19 8.4 Z" fill="#fff" />
      </svg>
    );
  }

  if (golden) {
    // Diamant statt goldener Münze – exakt dieselbe Form/Farbe wie das HUD-Gem-Icon
    // (Gem.tsx), nur in eine hängende Öse statt eines Stiels gefasst.
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" overflow="visible">
        <path d="M16 4 C16 2 18 2 18 4" stroke="#0e5951" strokeWidth="2" fill="none" strokeLinecap="round" />
        <defs>
          <linearGradient id={faceId} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#d4fff9" />
            <stop offset="50%" stopColor="#2ec4b6" />
            <stop offset="100%" stopColor="#177f76" />
          </linearGradient>
        </defs>
        <path d="M8 9 H24 L29 16 L16 29 L3 16 Z" fill={`url(#${faceId})`} stroke="#0e5951" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M8 9 L11.5 16 L3 16 Z" fill="#8ff0e5" opacity="0.85" />
        <path d="M24 9 L20.5 16 L29 16 Z" fill="#177f76" opacity="0.65" />
        <path d="M11.5 16 L16 29 L20.5 16 Z" fill="#5be0d2" opacity="0.55" />
        <path d="M8 9 H24 L20.5 16 H11.5 Z" fill="#e8fffc" opacity="0.5" />
        {/* Funke: markiert die seltene Variante zusätzlich, auch wenn die Form allein untergeht. */}
        <path
          d="M26 4 L27 6.4 L29.4 7.4 L27 8.4 L26 10.8 L25 8.4 L22.6 7.4 L25 6.4 Z"
          fill="#d4fff9"
          opacity="0.95"
        />
      </svg>
    );
  }

  // Normale Münze – dieselbe Optik wie das HUD-Icon (Coin.tsx, geprägte Axt), an
  // einer kleinen Öse statt eines Fruchtstiels hängend.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" overflow="visible">
      <path d="M16 4 C16 2 18 2 18 4" stroke="#6b4a12" strokeWidth="2" fill="none" strokeLinecap="round" />
      <defs>
        <radialGradient id={faceId} cx="0.36" cy="0.32" r="0.85">
          <stop offset="0%" stopColor="#fff3b8" />
          <stop offset="55%" stopColor="#ffce3d" />
          <stop offset="100%" stopColor="#d99a00" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="18" r="12" fill="#b8860b" />
      <circle cx="16" cy="17.2" r="11.4" fill={`url(#${faceId})`} />
      <circle cx="16" cy="17.2" r="8.6" fill="none" stroke="#a8760a" strokeWidth="1" opacity="0.65" />
      {/* Kleine Axt als Prägung, wie beim HUD-Icon */}
      <path d="M15.2 11.4 L15.2 23" stroke="#8a6508" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M15 11.2 C18 10.7 20.6 12.6 20.7 15.2 C20.8 17.3 18.4 18.7 15.6 18.2 Z" fill="#8a6508" />
    </svg>
  );
}
