import { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { formatNumber } from '../utils/format';
import './TapButton.css';

interface TapButtonProps {
  tapValue: number;
  onTap: () => void;
}

interface Floater {
  id: number;
  x: number;
}

export function TapButton({ tapValue, onTap }: TapButtonProps) {
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const nextId = useRef(0);

  const handleTap = () => {
    onTap();

    const id = nextId.current++;
    const x = Math.random() * 60 - 30;
    setFloaters((prev) => [...prev, { id, x }]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 700);

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 120);
  };

  return (
    <div className="tap-zone">
      {floaters.map((floater) => (
        <span key={floater.id} className="tap-zone__floater" style={{ left: `calc(50% + ${floater.x}px)` }}>
          +{formatNumber(tapValue)}
        </span>
      ))}
      <button
        className={`tap-button ${isPressed ? 'tap-button--pressed' : ''}`}
        onClick={handleTap}
      >
        <Sparkles size={22} className="tap-button__icon" />
        Selber kehren
      </button>
    </div>
  );
}
