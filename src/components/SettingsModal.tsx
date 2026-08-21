import './LevelCompleteModal.css';
import './SettingsModal.css';

interface SettingsModalProps {
  soundOn: boolean;
  bestLevel: number;
  onToggleSound: (on: boolean) => void;
  onClose: () => void;
}

export function SettingsModal({ soundOn, bestLevel, onToggleSound, onClose }: SettingsModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card--wide">
        <div className="modal-card__title">Einstellungen</div>

        <button className="settings-row" onClick={() => onToggleSound(!soundOn)}>
          <span className="settings-row__label">Ton &amp; Vibration</span>
          <span className={`settings-toggle ${soundOn ? 'settings-toggle--on' : ''}`}>
            <span className="settings-toggle__knob" />
          </span>
        </button>

        <div className="settings-row settings-row--static">
          <span className="settings-row__label">Highscore</span>
          <span className="settings-row__value">Level {bestLevel}</span>
        </div>

        <button className="modal-card__button" onClick={onClose}>
          Fertig
        </button>
      </div>
    </div>
  );
}
