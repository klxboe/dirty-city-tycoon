import { Coin } from './Coin';
import { Gem } from './Gem';
import { DAILY_REWARDS } from '../game/constants';
import type { DailyReward } from '../game/daily';
import { getStrings, type Language } from '../game/i18n';
import './DailyRewardModal.css';

interface DailyRewardModalProps {
  streak: number;
  reward: DailyReward;
  lang: Language;
  onClaim: () => void;
}

/**
 * Erscheint automatisch auf dem Startbildschirm, sobald eine tägliche Belohnung
 * wartet (`game.dailyReward`, siehe game/daily.ts – reine Ableitung aus dem
 * Spielstand, kein eigener Auf-/Zu-State nötig: sobald abgeholt wird, liefert
 * `pendingDailyReward()` beim nächsten Render `null` und das Modal verschwindet
 * von selbst). Zeigt den ganzen 7-Tage-Zyklus, heute hervorgehoben, damit klar
 * wird, dass es sich lohnt, morgen wiederzukommen.
 */
export function DailyRewardModal({ streak, reward, lang, onClaim }: DailyRewardModalProps) {
  const t = getStrings(lang);
  return (
    <div className="modal-backdrop">
      <div className="daily-reward">
        <h2 className="daily-reward__title">{t.dailyReward.title}</h2>
        <p className="daily-reward__streak">{t.dailyReward.streak(streak)}</p>

        <div className="daily-reward__track">
          {DAILY_REWARDS.map((tier, i) => {
            const day = i + 1;
            const isToday = day === reward.day;
            return (
              <div key={day} className={`daily-reward__day ${isToday ? 'daily-reward__day--today' : ''}`}>
                <span className="daily-reward__day-label">{isToday ? t.dailyReward.today : t.dailyReward.day(day)}</span>
                {tier.gems > 0 ? <Gem size={18} /> : <Coin size={18} />}
                <span className="daily-reward__day-amount">+{tier.gems > 0 ? tier.gems : tier.coins}</span>
              </div>
            );
          })}
        </div>

        <button className="daily-reward__claim" onClick={onClaim}>
          {t.dailyReward.claim}
          {reward.coins > 0 && (
            <span className="daily-reward__claim-amount">
              <Coin size={16} /> {reward.coins}
            </span>
          )}
          {reward.gems > 0 && (
            <span className="daily-reward__claim-amount">
              <Gem size={16} /> {reward.gems}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
