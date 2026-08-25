import { getStrings, type Language } from '../game/i18n';
import './LevelCompleteModal.css';
import './GameOverModal.css';

interface PauseModalProps {
  lang: Language;
  onResume: () => void;
  onBackToMenu: () => void;
}

/**
 * Pause-Menü während eines laufenden Levels. Rendert als eigenständiger Overlay
 * (Geschwister der `.stage`, wie Shop/Einstellungen/Weltkarte) – dieselbe Struktur
 * sorgt schon dafür, dass ein Tap auf die Karte NICHT versehentlich einen Wurf auf
 * `.stage` auslöst (der Backdrop deckt den Bildschirm ab, ist aber kein Kind von
 * `.stage`, bekommt also sein eigenes Klick-Ziel statt durchzureichen).
 *
 * Der Pause-Button selbst ist nur sichtbar, während `game.phase === 'ready'` ist
 * (siehe App.tsx) – bewusst NICHT während eine Axt fliegt, damit die Pause-Funktion
 * die Flug-/Kollisions-Logik nie berühren muss.
 */
export function PauseModal({ lang, onResume, onBackToMenu }: PauseModalProps) {
  const t = getStrings(lang);
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__title">{t.pause.title}</div>
        <button className="modal-card__button modal-card__button--ocean" onClick={onResume}>
          {t.pause.resume}
        </button>
        <button className="modal-card__button modal-card__button--secondary" onClick={onBackToMenu}>
          {t.pause.backToMenu}
        </button>
      </div>
    </div>
  );
}
