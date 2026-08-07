import { Rocket } from 'lucide-react';
import './Modal.css';

interface PrestigeModalProps {
  fromCityLabel: string;
  toCityLabel: string;
  stars: number;
  newMultiplier: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PrestigeModal({
  fromCityLabel,
  toCityLabel,
  stars,
  newMultiplier,
  onConfirm,
  onCancel,
}: PrestigeModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <Rocket size={36} className="modal-card__icon" />
        <div className="modal-card__title">Umziehen nach {toCityLabel}?</div>
        <div className="modal-card__body">
          Du verlässt {fromCityLabel}. Geld, Arbeiter, Transporter und Lager werden zurückgesetzt –
          dafür bekommst du <strong>{stars} ⭐</strong> und einen dauerhaften Multiplikator von{' '}
          <strong>×{newMultiplier.toFixed(1)}</strong> auf all deine zukünftigen Einnahmen.
        </div>
        <button className="modal-card__button" onClick={onConfirm}>
          Ja, umziehen
        </button>
        <button className="modal-card__button modal-card__button--secondary" onClick={onCancel}>
          Noch nicht
        </button>
      </div>
    </div>
  );
}
