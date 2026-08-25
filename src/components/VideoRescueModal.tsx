import { useEffect, useState } from 'react';
import { showRewardedAd } from '../game/ads';
import { VIDEO_RESCUE_COINS } from '../game/constants';
import './LevelCompleteModal.css';
import './GameOverModal.css';
import './VideoRescueModal.css';

interface VideoRescueModalProps {
  /** Wird aufgerufen, sobald die Belohnung wirklich verdient wurde (Nutzer hat das Video zu Ende gesehen). */
  onFinished: () => void;
  onCancel: () => void;
  /**
   * 'rescue' (Standard): Game-Over-Rettung, setzt den Lauf im selben Level fort
   * (`rescueRun()`). 'reward': derselbe Rewarded-Video-Flow, aber vom Hauptmenü aus
   * angestoßen (`watchAdReward()`) – reine Münz-Belohnung ohne laufenden Versuch,
   * braucht deshalb andere Texte ("Du machst weiter, wo du aufgehört hast" ergibt
   * dort keinen Sinn, siehe Klaus: "wenn man verliert, kann man durch ein Video
   * seinen Fortschritt beibehalten, Punkt aus Ende" – DAS bleibt der 'rescue'-Fall,
   * unangetastet; 'reward' ist ein komplett separater, zusätzlicher Button im
   * Hauptmenü bei Highscore/Münzen/XP).
   */
  variant?: 'rescue' | 'reward';
}

type Status = 'loading' | 'success' | 'error';

/**
 * Zeigt ein echtes Rewarded Video (Google AdMob, siehe `game/ads.ts`) – entweder für
 * die einmalige Game-Over-Rettung (`rescueRun()` in useAxeGame.ts, `variant="rescue"`)
 * oder für die jederzeit nutzbare Münz-Belohnung im Hauptmenü (`watchAdReward()`,
 * `variant="reward"`). Ersetzt die frühere simulierte Zähler-Anzeige – siehe
 * CLAUDE.md für die Historie dieses Umbaus.
 *
 * Drei Zustände statt nur "läuft/fertig": `showRewardedAd()` kann auch fehlschlagen
 * (kein Fill, kein Internet, Ladefehler) – dafür ein eigener Fehler-Zustand mit
 * "Erneut versuchen" statt die App in einem endlosen Lade-Zustand hängen zu lassen
 * (siehe App-Store-Audit 2026-08-22, Abschnitt "Offline/Netzwerkverhalten").
 */
export function VideoRescueModal({ onFinished, onCancel, variant = 'rescue' }: VideoRescueModalProps) {
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
            <div className="modal-card__body">
              {variant === 'rescue' ? 'Danke fürs Anschauen – gleich geht’s weiter.' : 'Danke fürs Anschauen!'}
            </div>
            <button className="modal-card__button modal-card__button--secondary" onClick={onCancel}>
              Abbrechen
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="modal-card__title">Belohnung erhalten!</div>
            <div className="modal-card__body">
              {variant === 'rescue'
                ? `+${VIDEO_RESCUE_COINS} Münzen! Du machst genau da weiter, wo du aufgehört hast.`
                : `+${VIDEO_RESCUE_COINS} Münzen gutgeschrieben!`}
            </div>
            <button className="modal-card__button modal-card__button--ocean" onClick={onFinished}>
              {variant === 'rescue' ? "Weiter geht's" : 'Super!'}
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
