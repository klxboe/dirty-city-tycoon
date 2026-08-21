import './LevelCompleteModal.css';
import './GameOverModal.css';

interface PauseModalProps {
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
export function PauseModal({ onResume, onBackToMenu }: PauseModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__title">Pausiert</div>
        <button className="modal-card__button modal-card__button--ocean" onClick={onResume}>
          Fortsetzen
        </button>
        <button className="modal-card__button modal-card__button--secondary" onClick={onBackToMenu}>
          Zurück zum Menü
        </button>
      </div>
    </div>
  );
}
