import { useState } from 'react';
import './LevelCompleteModal.css';
import './SettingsModal.css';

interface SettingsModalProps {
  soundOn: boolean;
  bestLevel: number;
  onToggleSound: (on: boolean) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export function SettingsModal({ soundOn, bestLevel, onToggleSound, onResetProgress, onClose }: SettingsModalProps) {
  // Zurücksetzen löscht alles – deshalb erst nach einer ausdrücklichen Bestätigung.
  const [confirmReset, setConfirmReset] = useState(false);

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

        {confirmReset ? (
          <div className="settings-confirm">
            <p className="settings-confirm__text">
              Wirklich alles löschen? Münzen, XP, Äxte, Scheiben und der Highscore sind dann weg.
            </p>
            <button
              className="modal-card__button modal-card__button--danger"
              onClick={() => {
                onResetProgress();
                setConfirmReset(false);
                onClose();
              }}
            >
              Ja, alles zurücksetzen
            </button>
            <button className="modal-card__button modal-card__button--secondary" onClick={() => setConfirmReset(false)}>
              Abbrechen
            </button>
          </div>
        ) : (
          <button className="modal-card__button modal-card__button--secondary" onClick={() => setConfirmReset(true)}>
            Fortschritt zurücksetzen
          </button>
        )}

        <button className="modal-card__button" onClick={onClose}>
          Fertig
        </button>
      </div>
    </div>
  );
}
