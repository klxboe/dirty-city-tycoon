import { Coin } from './Coin';
import { LEVELS_PER_BLOCK } from '../game/constants';
import './HUD.css';

interface HUDProps {
  level: number;
  /** Wie viele Level des aktuellen 10er-Blocks schon geschafft sind (0-9). */
  levelInBlock: number;
  coins: number;
  /** Läuft kurz eine Aufblink-Animation, wenn gerade Münzen dazugekommen sind. */
  coinsFlash: boolean;
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
export function HUD({ level, levelInBlock, coins, coinsFlash, onOpenShop }: HUDProps) {
  return (
    <header className="hud">
      <div className="hud__level">
        <span className="hud__level-number">{level}</span>
        <span className="hud__level-label">Level</span>
      </div>

      <div className="hud__progress" aria-label={`Level ${levelInBlock + 1} von ${LEVELS_PER_BLOCK} im Block`}>
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

      <button
        className={`hud__coins ${coinsFlash ? 'hud__coins--flash' : ''}`}
        onClick={onOpenShop}
        aria-label="Werkstatt öffnen"
      >
        <span className="hud__coins-value">{coins}</span>
        <Coin size={26} />
      </button>
    </header>
  );
}
