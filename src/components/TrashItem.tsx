interface TrashItemProps {
  variant?: number;
  size?: number;
}

/** Ein einzelnes, kleines Müllstück (Dose, Papier, Bananenschale, Tüte) für die Straßen-Szene. */
export function TrashItem({ variant = 0, size = 20 }: TrashItemProps) {
  const kind = variant % 4;

  if (kind === 0) {
    // Dose
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <rect x="7" y="6" width="10" height="14" rx="2" fill="#c7cdd4" stroke="#9aa3ad" strokeWidth="1.2" />
        <rect x="7" y="9" width="10" height="2.5" fill="#8fbfff" opacity="0.7" />
        <ellipse cx="12" cy="6" rx="5" ry="1.6" fill="#e4e8ec" stroke="#9aa3ad" strokeWidth="1.2" />
      </svg>
    );
  }

  if (kind === 1) {
    // Papier / Tüte
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path
          d="M5 9 Q4 16 8 19 Q14 22 18 17 Q21 12 16 8 Q10 5 5 9 Z"
          fill="#fdf8ec"
          stroke="#d8cba8"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  if (kind === 2) {
    // Bananenschale
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path
          d="M6 12 C6 7 10 4 13 5 C11 6 9 9 10 13 C11 17 15 18 18 16 C17 20 12 22 9 19 C6 16 6 14 6 12 Z"
          fill="#ffd23f"
          stroke="#d9a521"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  // Flasche
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="10" y="3" width="4" height="4" rx="1" fill="#7fd88a" />
      <path d="M9 7 h6 l1 3 v10 a2 2 0 0 1 -2 2 h-4 a2 2 0 0 1 -2 -2 v-10 Z" fill="#7fd88a" stroke="#4fa85a" strokeWidth="1.2" opacity="0.85" />
    </svg>
  );
}
