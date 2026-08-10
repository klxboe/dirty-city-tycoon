interface VineDecorationProps {
  flip?: boolean;
  className?: string;
}

/** Rein dekorative Efeu-Ranke für die Ecken der Bühne – mehr Detail, kein Gameplay. */
export function VineDecoration({ flip = false, className }: VineDecorationProps) {
  return (
    <svg
      width="90"
      height="150"
      viewBox="0 0 90 150"
      className={className}
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <path
        d="M4 150 C 2 120 20 108 10 84 C 2 62 24 52 16 30 C 10 14 22 6 34 2"
        fill="none"
        stroke="#3a6b2e"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {[
        { cx: 12, cy: 118, r: 10, rot: -20 },
        { cx: 6, cy: 92, r: 9, rot: 15 },
        { cx: 18, cy: 66, r: 10, rot: -10 },
        { cx: 8, cy: 40, r: 8, rot: 20 },
        { cx: 26, cy: 14, r: 9, rot: -15 },
      ].map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.cx}
          cy={leaf.cy}
          rx={leaf.r}
          ry={leaf.r * 0.6}
          fill={i % 2 === 0 ? '#4f9c3f' : '#3f7f32'}
          stroke="#2c5a22"
          strokeWidth="1"
          transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
        />
      ))}
    </svg>
  );
}
