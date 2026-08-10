import { Axe } from './Axe';
import { Apple } from './Apple';
import type { Apple as AppleData, StuckAxe } from '../game/types';
import './TargetBoard.css';

interface TargetBoardProps {
  angleDeg: number;
  stuckAxes: StuckAxe[];
  apples: AppleData[];
}

export const BOARD_SIZE = 210;
const BOARD_RADIUS = 96;
const APPLE_RADIUS = 58;

export function TargetBoard({ angleDeg, stuckAxes, apples }: TargetBoardProps) {
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
      </div>
    </div>
  );
}
