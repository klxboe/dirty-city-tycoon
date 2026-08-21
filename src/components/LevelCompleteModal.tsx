import { useEffect } from 'react';
import { Apple } from './Apple';
import { Axe } from './Axe';
import { Coin } from './Coin';
import { Gem } from './Gem';
import { useCountUp } from '../hooks/useCountUp';
import { getBossFruit, getSkin } from '../game/shop';
import type { LevelReward } from '../game/types';
import './LevelCompleteModal.css';

/**
 * Nach dieser Zeit geht's von selbst zum nächsten Level – kein Pflicht-Tap mehr auf
 * "Weiter" nötig. Der Button bleibt trotzdem da, für alle, die es eilig haben.
 */
const AUTO_ADVANCE_MS = 3500;

interface LevelCompleteModalProps {
  level: number;
  applesCollected: number;
  appleCount: number;
  reward: LevelReward;
  totalCoins: number;
  totalGems: number;
  totalXp: number;
  streak: number;
  /** Wahr genau einmal: wenn gerade Level 100 (der letzte feste Kampagnen-Level) geschafft wurde. */
  isCampaignComplete: boolean;
  onNext: () => void;
  onOpenShop: () => void;
}

export function LevelCompleteModal({
  level,
  applesCollected,
  appleCount,
  reward,
  totalCoins,
  totalGems,
  totalXp,
  streak,
  isCampaignComplete,
  onNext,
  onOpenShop,
}: LevelCompleteModalProps) {
  // Zählt die verdienten Münzen hoch, statt sie fertig hinzuklatschen – fühlt sich
  // nach Belohnung an statt nach Zahl auf einem Zettel.
  const shownCoins = useCountUp(reward.total, 700);

  // Automatisch weiter, statt bei JEDEM Level auf einen Tap zu warten – das nervte bei
  // langen Läufen. `onNext` löst in App.tsx einen kurzen "Level N"-Hinweis auf der Bühne
  // aus, damit der Sprung trotzdem sichtbar bleibt statt unbemerkt zu passieren.
  useEffect(() => {
    const timeout = setTimeout(onNext, AUTO_ADVANCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const boss = reward.bossFruitId ? getBossFruit(reward.bossFruitId) : undefined;
  const unlockedAxe = reward.unlockedAxeSkinId ? getSkin(reward.unlockedAxeSkinId) : undefined;

  return (
    <div className="modal-backdrop">
      <div className={`modal-card ${boss ? 'modal-card--boss' : ''}`}>
        {boss ? (
          <>
            <div className="modal-card__kicker">Boss besiegt</div>
            <div className="modal-card__title">{boss.name} geknackt!</div>
          </>
        ) : (
          <div className="modal-card__title">Level {level} geschafft!</div>
        )}

        <div className="modal-card__body">
          {applesCollected} von {appleCount} {appleCount === 1 ? 'Apfel' : 'Äpfeln'} eingesammelt.
        </div>

        {/* Frisch freigeschaltete Boss-Axt – der eigentliche Moment des Levels. */}
        {unlockedAxe && (
          <div className="modal-card__unlock">
            <div className="modal-card__unlock-axe">
              <Axe size={44} skin={unlockedAxe.id} />
            </div>
            <div className="modal-card__unlock-text">
              <span className="modal-card__unlock-label">Neue Axt</span>
              <span className="modal-card__unlock-name">{unlockedAxe.name}</span>
            </div>
          </div>
        )}

        <div className="modal-card__apples">
          <Coin size={34} className="modal-card__coin-spin" />
          <span className="modal-card__score">+{shownCoins}</span>
        </div>

        {/* Goldener Apfel getroffen: eigener Diamanten-Badge, damit der seltene Fund
            nicht in der Textliste der Aufschlüsselung untergeht. */}
        {reward.gems > 0 && (
          <div className="modal-card__gems">
            <Gem size={20} />
            <span className="modal-card__gems-score">+{reward.gems}</span>
          </div>
        )}

        {/* Sammelfigur getroffen (nur Heldenstadt): eigener Badge wie beim goldenen Apfel. */}
        {reward.figurines > 0 && (
          <div className="modal-card__gems modal-card__gems--figurine">
            <Apple size={22} figurine />
            <span className="modal-card__gems-score">+{reward.figurines}</span>
          </div>
        )}

        {/* Aufschlüsselung: zeigt, WOFÜR es Münzen gab – macht die Boni sichtbar. */}
        <div className="reward-breakdown">
          {reward.apples > 0 && (
            <span className="reward-breakdown__row">
              Äpfel <strong>+{reward.apples}</strong>
            </span>
          )}
          <span className="reward-breakdown__row">
            Level geschafft <strong>+{reward.base}</strong>
          </span>
          {reward.perfect > 0 && (
            <span className="reward-breakdown__row reward-breakdown__row--bonus">
              Alle Äpfel! <strong>+{reward.perfect}</strong>
            </span>
          )}
          {reward.block > 0 && (
            <span className="reward-breakdown__row reward-breakdown__row--bonus">
              Block geschafft <strong>+{reward.block}</strong>
            </span>
          )}
          {reward.streakMultiplier > 1 && (
            <span className="reward-breakdown__row reward-breakdown__row--bonus">
              Serie ×{streak} <strong>×{reward.streakMultiplier.toFixed(2)}</strong>
            </span>
          )}
          {/* XP läuft bewusst NICHT durch den Münz-Serien-Multiplikator (siehe
              Kommentar in useAxeGame.ts) – deshalb eigene Zeile statt Teil der
              Münz-Aufschlüsselung oben. */}
          <span className="reward-breakdown__row reward-breakdown__row--gems">
            XP <strong>+{reward.xp}</strong>
          </span>
          {reward.gems > 0 && (
            <span className="reward-breakdown__row reward-breakdown__row--gems">
              Goldener Apfel <strong>+{reward.gems} Diamanten</strong>
            </span>
          )}
          {reward.figurines > 0 && (
            <span className="reward-breakdown__row reward-breakdown__row--gems">
              Sammelfigur <strong>+{reward.figurines}</strong>
            </span>
          )}
        </div>

        <div className="modal-card__sub">
          Münzen insgesamt: <strong>{totalCoins}</strong>
        </div>
        {totalGems > 0 && (
          <div className="modal-card__sub">
            <Gem size={13} /> Diamanten insgesamt: <strong>{totalGems}</strong>
          </div>
        )}
        <div className="modal-card__sub">
          XP insgesamt: <strong>{totalXp}</strong>
        </div>

        {/* Einmalige Glückwunsch-Zeile bei Level 100 – danach geht's im Endlos-Modus
            einfach weiter, deshalb bleibt der Weiter-Button unten immer da. */}
        {isCampaignComplete && <div className="modal-card__badge">Alle 100 Level gemeistert! 🎉</div>}
        <button className="modal-card__button modal-card__button--auto" onClick={onNext}>
          {isCampaignComplete ? 'Weiter im Endlos-Modus' : `Weiter zu Level ${level + 1}`}
          <span className="modal-card__auto-bar" style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }} />
        </button>
        <button className="modal-card__button modal-card__button--secondary" onClick={onOpenShop}>
          Werkstatt öffnen
        </button>
      </div>
    </div>
  );
}
