import { spinProgress } from '../game/engine';
import './PowerDial.css';

interface PowerDialProps {
  chargeStartedAt: number | null;
  spinPeriodMs: number;
  tolerance: number;
  active: boolean;
}

/**
 * Der Lade-Regler: ein Punkt kreist kontinuierlich, während man hält. Der grüne Keil unten
 * (bei 180°) ist der "Sweet Spot" – lässt man genau dann los, sitzt die Axt sauber in der
 * Scheibe. Bewusst NICHT bei 0°/Start, sonst wäre sofortiges Loslassen immer ein Treffer.
 */
export function PowerDial({ chargeStartedAt, spinPeriodMs, tolerance, active }: PowerDialProps) {
  const holdMs = active && chargeStartedAt !== null ? performance.now() - chargeStartedAt : 0;
  const progress = spinProgress(holdMs, spinPeriodMs);
  const markerDeg = progress * 360;
  const wedgeHalf = Math.min(179, tolerance * 360);
  const wedgeStart = 180 - wedgeHalf;
  const wedgeEnd = 180 + wedgeHalf;

  return (
    <div
      className="power-dial"
      style={{
        background: `conic-gradient(#4a3320 0deg ${wedgeStart}deg, #3ecf5d ${wedgeStart}deg ${wedgeEnd}deg, #4a3320 ${wedgeEnd}deg 360deg)`,
        opacity: active ? 1 : 0.4,
      }}
    >
      <div className="power-dial__hub" />
      {active && (
        <div
          className="power-dial__marker"
          style={{ transform: `translate(-50%, -50%) rotate(${markerDeg}deg) translateY(-37px)` }}
        />
      )}
    </div>
  );
}
