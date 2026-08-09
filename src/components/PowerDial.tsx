import { spinProgress } from '../game/engine';
import './PowerDial.css';

interface PowerDialProps {
  chargeStartedAt: number | null;
  spinPeriodMs: number;
  tolerance: number;
  active: boolean;
}

/**
 * Der Lade-Regler: ein Punkt kreist kontinuierlich, während man hält. Der grüne Keil oben
 * ist der "Sweet Spot" – lässt man genau dann los, sitzt die Axt sauber in der Scheibe.
 */
export function PowerDial({ chargeStartedAt, spinPeriodMs, tolerance, active }: PowerDialProps) {
  const holdMs = active && chargeStartedAt !== null ? performance.now() - chargeStartedAt : 0;
  const progress = spinProgress(holdMs, spinPeriodMs);
  const markerDeg = progress * 360;
  const wedgeHalf = Math.min(179, tolerance * 360);

  return (
    <div
      className="power-dial"
      style={{
        background: `conic-gradient(#3ecf5d 0deg ${wedgeHalf}deg, #4a3320 ${wedgeHalf}deg ${360 - wedgeHalf}deg, #3ecf5d ${360 - wedgeHalf}deg 360deg)`,
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
