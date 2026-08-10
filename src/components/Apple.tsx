interface AppleProps {
  size?: number;
}

/** Ein kleiner Apfel, der am Zielbrett hängt und abgeworfen werden kann. */
export function Apple({ size = 22 }: AppleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 9 C7 9 5 12.5 5 16 C5 19.5 8 22 11 22 C11.7 22 12.3 21.8 12.9 21.6 C13.5 21.8 14.1 22 14.8 22 C17.8 22 20.5 19 20.5 15.5 C20.5 12.3 18.3 9.3 15 9 Z"
        fill="#e6433a"
        stroke="#9c2620"
        strokeWidth="1"
      />
      <path d="M9 12 C9.5 13 10.5 13.3 11.5 13" stroke="#ff8f88" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M12 9 C11.5 6.5 12 5 12.8 3.8" stroke="#6b4420" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M12.5 5 C13.5 3.8 15 3.6 16 4.2 C15.2 5.6 13.6 5.8 12.5 5 Z" fill="#4fa53f" stroke="#2f7a24" strokeWidth="0.8" />
    </svg>
  );
}
