import { useEffect, useState } from 'react';
import './LevelCompleteModal.css';
import './GameOverModal.css';
import './VideoRescueModal.css';

interface VideoRescueModalProps {
  /** Wird aufgerufen, sobald das (simulierte) Video zu Ende ist und der Spieler bestätigt hat. */
  onFinished: () => void;
  onCancel: () => void;
}

/** Wie lange die Platzhalter-Anzeige "läuft" (Sekunden), bevor man sie schließen kann. */
const FAKE_AD_SECONDS = 3;

/**
 * Simuliert eine Rewarded-Video-Anzeige für die einmalige Game-Over-Rettung (siehe
 * `rescueRun()` in useAxeGame.ts). Es gibt in diesem Projekt (noch) KEINE echte
 * Ad-SDK-Anbindung (kein AdMob o.ä. verdrahtet, siehe STATUS.md) – dieser Screen ist
 * bewusst ein einfacher, klar als Platzhalter erkennbarer Zähler statt eines echten
 * Videos, damit die Spiel-Logik (einmalige Rettung, Fortsetzen im selben Level) schon
 * jetzt vollständig funktioniert. Sobald eine echte Rewarded-Video-Anzeige angebunden
 * wird, muss nur DIESE Komponente ersetzt werden – `onFinished` bleibt der Vertrag
 * dafür ("Belohnung gutschreiben"), der Rest der App ändert sich nicht.
 */
export function VideoRescueModal({ onFinished, onCancel }: VideoRescueModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(FAKE_AD_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [secondsLeft]);

  const done = secondsLeft <= 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-card video-rescue">
        <div className="video-rescue__screen">
          {done ? (
            <span className="video-rescue__icon">🎁</span>
          ) : (
            <span className="video-rescue__countdown">{secondsLeft}</span>
          )}
        </div>
        <div className="modal-card__title">{done ? 'Belohnung erhalten!' : 'Werbevideo läuft …'}</div>
        <div className="modal-card__body">
          {done
            ? 'Du machst genau da weiter, wo du aufgehört hast.'
            : 'Platzhalter-Anzeige – hier läuft später ein echtes Video.'}
        </div>
        {done ? (
          <button className="modal-card__button modal-card__button--ocean" onClick={onFinished}>
            Weiter geht's
          </button>
        ) : (
          <button className="modal-card__button modal-card__button--secondary" onClick={onCancel}>
            Abbrechen
          </button>
        )}
      </div>
    </div>
  );
}
