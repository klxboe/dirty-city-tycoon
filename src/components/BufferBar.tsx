import { AlertTriangle, Archive } from 'lucide-react';
import { formatNumber } from '../utils/format';
import './BufferBar.css';

interface BufferBarProps {
  buffer: number;
  capacity: number;
  bottlenecked: boolean;
}

export function BufferBar({ buffer, capacity, bottlenecked }: BufferBarProps) {
  const progress = capacity > 0 ? Math.min(1, buffer / capacity) : 0;

  return (
    <div className="buffer">
      <div className="buffer__label">
        <span className="buffer__title">
          <Archive size={14} /> Zwischenlager
        </span>
        <span>
          {formatNumber(buffer)} / {formatNumber(capacity)}
        </span>
      </div>
      <div className="buffer__track">
        <div
          className={`buffer__fill ${bottlenecked ? 'buffer__fill--full' : ''}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      {bottlenecked && (
        <div className="buffer__warning">
          <AlertTriangle size={14} />
          Puffer voll! Kauf mehr Transporter, sonst geht Müll verloren.
        </div>
      )}
    </div>
  );
}
