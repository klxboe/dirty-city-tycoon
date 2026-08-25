import { Coin } from './Coin';
import { Gem } from './Gem';
import { LEVELS_PER_BLOCK } from '../game/constants';
import { getStrings, type Language } from '../game/i18n';
import './HUD.css';

interface HUDProps {
  level: number;
  /** Wie viele Level des aktuellen 10er-Blocks schon geschafft sind (0-9). */
  levelInBlock: number;
  coins: number;
  /** Läuft kurz eine Aufblink-Animation, wenn gerade Münzen dazugekommen sind. */
  coinsFlash: boolean;
  gems: number;
  /** Läuft kurz eine Aufblink-Animation, wenn gerade Diamanten dazugekommen sind. */
  gemsFlash: boolean;
  /** Level in Folge ohne Game Over. Ab 5 gibt es dafür einen Münz-Multiplikator. */
  streak: number;
  /** Boss-Level: die Levelnummer wird hervorgehoben. */
  isBoss: boolean;
  /**
   * Weltboss-"Tor" (siehe worlds.ts) – zeigt WEDER Levelnummer NOCH Block-Fortschritt.
   * Klaus: "Level gibt es nur im normalen Modus, der Boss hat kein Level, der ist der
   * Boss" – ein Weltboss ist kein Level X von Y in einem 10er-Block, sondern eine
   * eigenständige Prüfung, deshalb bekommt er hier eine eigene, zahlenfreie Anzeige.
   */
  isWorldBoss: boolean;
  lang: Language;
  onOpenShop: () => void;
}

/**
 * Kopfzeile: Levelnummer links, Block-Fortschritt als Punktreihe in der Mitte,
 * Münzstand rechts (zugleich der Werkstatt-Button).
 *
 * Die Punktreihe zeigt, wo im aktuellen 10er-Block man steht – und damit auch,
 * wie weit ein Game Over zurückwerfen würde. Der Stern am Ende markiert den
 * Block-Abschluss.
 */
export function HUD({ level, levelInBlock, coins, coinsFlash, gems, gemsFlash, streak, isBoss, isWorldBoss, lang, onOpenShop }: HUDProps) {
  const t = getStrings(lang);
  return (
    <header className="hud">
      <div className={`hud__level ${isBoss ? 'hud__level--boss' : ''}`}>
        {isWorldBoss ? (
          <span className="hud__level-label hud__level-label--world-boss">{t.hud.worldBoss}</span>
        ) : (
          <>
            <span className="hud__level-number">{level}</span>
            <span className="hud__level-label">{isBoss ? t.hud.boss : t.hud.level}</span>
          </>
        )}
        {/* Serie erst ab dem ersten wirksamen Multiplikator zeigen – vorher wäre sie nur Zahlensalat. */}
        {streak >= 5 && <span className="hud__streak">🔥 {streak}</span>}
      </div>

      {/* Block-Fortschritt ist ein reines Normal-Modus-Konzept (10er-Block), bei einem
          Weltboss ausgeblendet statt eine falsche Zugehörigkeit vorzugaukeln. */}
      {!isWorldBoss && (
        <div className="hud__progress" aria-label={t.hud.progressAria(levelInBlock + 1, LEVELS_PER_BLOCK)}>
          {Array.from({ length: LEVELS_PER_BLOCK }).map((_, i) => (
            <span
              key={i}
              className={`hud__dot ${i < levelInBlock ? 'hud__dot--done' : ''} ${
                i === levelInBlock ? 'hud__dot--current' : ''
              }`}
            />
          ))}
          <span className="hud__star">★</span>
        </div>
      )}

      <div className="hud__wallet">
        <button
          className={`hud__coins ${coinsFlash ? 'hud__coins--flash' : ''}`}
          onClick={onOpenShop}
          aria-label={t.hud.openShopAria}
        >
          <span className="hud__coins-value">{coins}</span>
          <Coin size={26} />
        </button>
        {/* Diamanten nur zeigen, sobald man den ersten hat – vorher wäre die Zeile
            nur eine unerklärte 0 und würde eher verwirren als neugierig machen. */}
        {gems > 0 && (
          <button
            className={`hud__gems ${gemsFlash ? 'hud__gems--flash' : ''}`}
            onClick={onOpenShop}
            aria-label={t.hud.openShopAria}
          >
            <span className="hud__gems-value">{gems}</span>
            <Gem size={15} />
          </button>
        )}
      </div>
    </header>
  );
}
