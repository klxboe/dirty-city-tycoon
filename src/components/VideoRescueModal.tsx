import { useEffect, useState } from 'react';
import { showRewardedAd } from '../game/ads';
import './LevelCompleteModal.css';
import './GameOverModal.css';
import './VideoRescueModal.css';

interface VideoRescueModalProps {
  /** Wird aufgerufen, sobald die Belohnung wirklich verdient wurde (Nutzer hat das Video zu Ende gesehen). */
  onFinished: () => void;
  onCancel: () => void;
}

type Status = 'loading' | 'success' | 'error';

/**
 * Zeigt ein echtes Rewarded Video (Google AdMob, siehe `game/ads.ts`) für die
 * einmalige Game-Over-Rettung (`rescueRun()` in useAxeGame.ts). Ersetzt die frühere
 * simulierte Zähler-Anzeige – siehe CLAUDE.md für die Historie dieses Umbaus.
 *
 * Drei Zustände statt nur "läuft/fertig": `showRewardedAd()` kann auch fehlschlagen
 * (kein Fill, kein Internet, Ladefehler) – dafür ein eigener Fehler-Zustand mit
 * "Erneut versuchen" statt die App in einem endlosen Lade-Zustand hängen zu lassen
 * (siehe App-Store-Audit 2026-08-22, Abschnitt "Offline/Netzwerkverhalten").
 */
export function VideoRescueModal({ onFinished, onCancel }: VideoRescueModalProps) {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    showRewardedAd().then((result) => {
      if (cancelled) return;
      setStatus(result.success ? 'success' : 'error');
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = () => setStatus('loading');

  return (
    <div className="modal-backdrop">
      <div className="modal-card video-rescue">
        <div className="video-rescue__screen">
          {status === 'success' && <span className="video-rescue__icon">🎁</span>}
          {status === 'loading' && <span className="video-rescue__countdown">📺</span>}
          {status === 'error' && <span className="video-rescue__icon">⚠️</span>}
        </div>

        {status === 'loading' && (
          <>
            <div className="modal-card__title">Werbevideo läuft …</div>
            <div className="modal-card__body">Danke fürs Anschauen – gleich geht’s weiter.</div>
            <button className="modal-card__button modal-card__button--secondary" onClick={onCancel}>
              Abbrechen
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="modal-card__title">Belohnung erhalten!</div>
            <div className="modal-card__body">Du machst genau da weiter, wo du aufgehört hast.</div>
            <button className="modal-card__button modal-card__button--ocean" onClick={onFinished}>
              Weiter geht's
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="modal-card__title">Video nicht verfügbar</div>
            <div className="modal-card__body">
              Gerade ist kein Video verfügbar – bitte prüfe deine Internetverbindung und versuch es
              nochmal.
            </div>
            <button className="modal-card__button modal-card__button--ocean" onClick={retry}>
              Erneut versuchen
            </button>
            <button className="modal-card__button modal-card__button--secondary" onClick={onCancel}>
              Abbrechen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
