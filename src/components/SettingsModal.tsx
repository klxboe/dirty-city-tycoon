import { getStrings, type Language } from '../game/i18n';
import './LevelCompleteModal.css';
import './SettingsModal.css';

interface SettingsModalProps {
  soundOn: boolean;
  bestLevel: number;
  lang: Language;
  onToggleSound: (on: boolean) => void;
  onSetLanguage: (lang: Language) => void;
  onClose: () => void;
}

export function SettingsModal({ soundOn, bestLevel, lang, onToggleSound, onSetLanguage, onClose }: SettingsModalProps) {
  const t = getStrings(lang);
  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card--wide">
        <div className="modal-card__title">{t.settings.title}</div>

        <button className="settings-row" onClick={() => onToggleSound(!soundOn)}>
          <span className="settings-row__label">{t.settings.soundLabel}</span>
          <span className={`settings-toggle ${soundOn ? 'settings-toggle--on' : ''}`}>
            <span className="settings-toggle__knob" />
          </span>
        </button>

        {/* Sprachumschalter: Klaus: "bei Einstellungen soll man das gesamte Spiel auf
            Englisch schalten können" – kompletter Textbestand kommt aus game/i18n.ts,
            SaveData.language wird dauerhaft gespeichert (siehe storage.ts). */}
        <div className="settings-row settings-row--static">
          <span className="settings-row__label">{t.settings.languageLabel}</span>
          <div className="settings-lang-toggle">
            <button
              className={`settings-lang-toggle__option ${lang === 'de' ? 'settings-lang-toggle__option--active' : ''}`}
              onClick={() => onSetLanguage('de')}
            >
              Deutsch
            </button>
            <button
              className={`settings-lang-toggle__option ${lang === 'en' ? 'settings-lang-toggle__option--active' : ''}`}
              onClick={() => onSetLanguage('en')}
            >
              English
            </button>
          </div>
        </div>

        <div className="settings-row settings-row--static">
          <span className="settings-row__label">{t.settings.highscoreLabel}</span>
          <span className="settings-row__value">{t.gameOver.highscoreValue(bestLevel)}</span>
        </div>

        <button className="modal-card__button" onClick={onClose}>
          {t.settings.done}
        </button>
      </div>
    </div>
  );
}
