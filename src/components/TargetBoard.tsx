import { Axe } from './Axe';
import type { StuckAxe } from '../game/types';
import './TargetBoard.css';

interface TargetBoardProps {
  angleDeg: number;
  stuckAxes: StuckAxe[];
}

export const BOARD_SIZE = 210;
const BOARD_RADIUS = 96;

export function TargetBoard({ angleDeg, stuckAxes }: TargetBoardProps) {
  return (
    <div className="target-board" style={{ transform: `rotate(${angleDeg}deg)` }}>
      <div className="target-board__ring target-board__ring--outer" />
      <div className="target-board__ring target-board__ring--mid" />
      <div className="target-board__ring target-board__ring--inner" />
      <div className="target-board__bullseye" />

      {stuckAxes.map((axe) => (
        <div
          key={axe.id}
          className="target-board__axe-slot"
          style={{ transform: `translate(-50%, -50%) rotate(${axe.boardLocalAngleDeg}deg) translateY(-${BOARD_RADIUS}px)` }}
        >
          <div className="target-board__axe-flip">
            <Axe size={26} />
          </div>
        </div>
      ))}
    </div>
  );
}
