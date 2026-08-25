import { useEffect, useState } from 'react';
import { showRewardedAd } from '../game/ads';
import { VIDEO_RESCUE_COINS } from '../game/constants';
import { getStrings, type Language } from '../game/i18n';
import './LevelCompleteModal.css';
import './GameOverModal.css';
import './VideoRescueModal.css';

interface VideoRescueModalProps {
  lang: Language;
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
export function VideoRescueModal({ lang, onFinished, onCancel, variant = 'rescue' }: VideoRescueModalProps) {
  const [status, setStatus] = useState<Status>('loading');
  const t = getStrings(lang);

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
          {/* 'rescue' bewahrt nur den Fortschritt, ist keine Belohnung – eigenes Schild-
              statt Geschenk-Icon, damit das auch optisch nicht wie ein Bonus wirkt. */}
          {status === 'success' && <span className="video-rescue__icon">{variant === 'rescue' ? '🛡️' : '🎁'}</span>}
          {status === 'loading' && <span className="video-rescue__countdown">📺</span>}
          {status === 'error' && <span className="video-rescue__icon">⚠️</span>}
        </div>

        {status === 'loading' && (
          <>
            <div className="modal-card__title">{t.videoRescue.loadingTitle}</div>
            <div className="modal-card__body">
              {variant === 'rescue' ? t.videoRescue.loadingBodyRescue : t.videoRescue.loadingBodyReward}
            </div>
            <button className="modal-card__button modal-card__button--secondary" onClick={onCancel}>
              {t.videoRescue.cancel}
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            {/* Klaus: "wenn man verkackt, soll man mit Video NUR Fortschritt nicht
                verlieren, nicht zusätzlich 350 bekommen" – 'rescue' erwähnt deshalb
                bewusst KEINE Münzen mehr, weder im Titel noch im Text. */}
            <div className="modal-card__title">
              {variant === 'rescue' ? t.videoRescue.successTitleRescue : t.videoRescue.successTitleReward}
            </div>
            <div className="modal-card__body">
              {variant === 'rescue' ? t.videoRescue.successBodyRescue : t.videoRescue.successBodyReward(VIDEO_RESCUE_COINS)}
            </div>
            <button className="modal-card__button modal-card__button--ocean" onClick={onFinished}>
              {variant === 'rescue' ? t.videoRescue.successButtonRescue : t.videoRescue.successButtonReward}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="modal-card__title">{t.videoRescue.errorTitle}</div>
            <div className="modal-card__body">{t.videoRescue.errorBody}</div>
            <button className="modal-card__button modal-card__button--ocean" onClick={retry}>
              {t.videoRescue.retry}
            </button>
            <button className="modal-card__button modal-card__button--secondary" onClick={onCancel}>
              {t.videoRescue.cancel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
