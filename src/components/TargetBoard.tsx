import { Axe } from './Axe';
import { Apple } from './Apple';
import type { Apple as AppleData, StuckAxe } from '../game/types';
import './TargetBoard.css';

interface TargetBoardProps {
  angleDeg: number;
  stuckAxes: StuckAxe[];
  apples: AppleData[];
  /** true, wenn die letzte Axt des Levels gerade sauber getroffen hat – zeigt einen Riss-Effekt. */
  broken?: boolean;
}

export const BOARD_SIZE = 210;
const BOARD_RADIUS = 96;
const APPLE_RADIUS = 88;

export function TargetBoard({ angleDeg, stuckAxes, apples, broken = false }: TargetBoardProps) {
  return (
    <div className="target-mount">
      <div className="target-mount__bracket" />
      <div className="target-mount__chain">
        <span />
        <span />
        <span />
      </div>

      <div className="target-board" style={{ transform: `rotate(${angleDeg}deg)` }}>
        <div className="target-board__grain" />
        <div className="target-board__ring target-board__ring--outer" />
        <div className="target-board__ring target-board__ring--mid" />
        <div className="target-board__ring target-board__ring--inner" />
        <div className="target-board__bullseye" />
        <div className="target-board__shine" />

        {apples
          .filter((apple) => !apple.collected)
          .map((apple) => (
            <div
              key={apple.id}
              className="target-board__apple-slot"
              style={{ transform: `translate(-50%, -50%) rotate(${apple.boardLocalAngleDeg}deg) translateY(-${APPLE_RADIUS}px)` }}
            >
              <Apple size={22} />
            </div>
          ))}

        {stuckAxes.map((axe) => (
          <div
            key={axe.id}
            className="target-board__axe-slot"
            style={{ transform: `translate(-50%, -50%) rotate(${axe.boardLocalAngleDeg}deg) translateY(-${BOARD_RADIUS}px)` }}
          >
            <div className="target-board__axe-flip target-board__axe-flip--landed">
              <Axe size={26} />
            </div>
          </div>
        ))}

        {broken && <div className="target-board__flash" />}

        {broken && (
          <svg className="target-board__cracks" viewBox="0 0 210 210">
            <path
              d="M105 105 L70 40 M105 105 L150 30 M105 105 L20 90 M105 105 L30 150 M105 105 L100 195 M105 105 L180 120 M105 105 L165 175"
              stroke="#2a1c0e"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M105 105 L70 40 M105 105 L150 30 M105 105 L20 90 M105 105 L30 150 M105 105 L100 195 M105 105 L180 120 M105 105 L165 175"
              stroke="#6b4a2a"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
