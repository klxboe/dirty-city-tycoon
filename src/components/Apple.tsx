import { useId } from 'react';

interface AppleProps {
  size?: number;
  /** Seltene Variante: golden statt rot, bringt Diamanten statt Münzen. */
  golden?: boolean;
  /** Heldenstadt-exklusiv: eine kleine Helden-Sammelfigur statt eines Apfels. */
  figurine?: boolean;
}

/**
 * Ein Apfel, der am Rand der Zielscheibe hängt und abgeworfen werden kann.
 * Flach und kontraststark gezeichnet (kräftiges Rot, dunkle Kontur, ein Glanzpunkt),
 * damit er vor dem dunklen Hintergrund auch klein sofort erkennbar ist.
 *
 * Golden ist bewusst dieselbe Form, nur andere Farben plus ein kleiner Funke – der
 * Wiedererkennungswert als "Apfel" muss erhalten bleiben, nur golden statt rot soll
 * ins Auge springen (~1 von 7 Leveln hat genau einen).
 *
 * `figurine` ersetzt die Frucht komplett durch eine kleine Chibi-Heldenfigur (rot/blau,
 * passend zum "Netzschwinger"-Skin-Thema) – macht in der Heldenstadt-Welt keinen Sinn,
 * eine Frucht abzuwerfen, wenn dort stattdessen Sammelfiguren zu finden sind.
 */
export function Apple({ size = 30, golden = false, figurine = false }: AppleProps) {
  const uid = useId();
  const fruitId = `apple-fruit-${uid}`;

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

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" overflow="visible">
      {golden && (
        <defs>
          <radialGradient id={fruitId} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0%" stopColor="#fff6c8" />
            <stop offset="55%" stopColor="#ffce3d" />
            <stop offset="100%" stopColor="#c98a00" />
          </radialGradient>
        </defs>
      )}
      {/* Frucht: zwei verschmolzene Rundungen mit Kerbe oben */}
      <path
        d="M16 10.5
           C12.5 7.8 6 8.8 5 15
           C4 21.2 8.6 28 12.8 28
           C14.2 28 15.2 27.4 16 27
           C16.8 27.4 17.8 28 19.2 28
           C23.4 28 28 21.2 27 15
           C26 8.8 19.5 7.8 16 10.5 Z"
        fill={golden ? `url(#${fruitId})` : '#e63946'}
        stroke={golden ? '#8a5c00' : '#7a1119'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Glanzlicht */}
      <path
        d="M10.5 14.5 C9.4 16.2 9.3 18.6 10.2 20.4"
        stroke={golden ? '#fff3c0' : '#ff9b9b'}
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
      {/* Funke: markiert golden zusätzlich, auch wenn die Farbe klein mal untergeht. */}
      {golden && (
        <path
          d="M25 6 L26 8.4 L28.4 9.4 L26 10.4 L25 12.8 L24 10.4 L21.6 9.4 L24 8.4 Z"
          fill="#fff3c0"
          opacity="0.95"
        />
      )}
    </svg>
  );
}
