import { Axe } from './Axe';
import { Coin } from './Coin';
import './LevelCompleteModal.css';
import './GameOverModal.css';

interface GameOverModalProps {
  level: number;
  /** Level, bei dem der neue Versuch startet: der Anfang des aktuellen 10er-Blocks. */
  restartLevel: number;
  /** Höchstes je erreichtes Level – bleibt als Bestmarke stehen. */
  bestLevel: number;
  /** Münzen, die dieser Lauf gekostet hat (gesammelte Äpfel des laufenden Levels). */
  coinsLost: number;
  totalCoins: number;
  /** Nur fürs Icon oben im Fenster – zerspringt in zwei Hälften beim Erscheinen. */
  axeSkin: string;
  onRestart: () => void;
  onOpenShop: () => void;
  /** Zurück zum Startbildschirm, ohne einen neuen Versuch zu starten. */
  onBackToMenu: () => void;
}

const SPARK_ANGLES = [-100, -55, -20, 20, 55, 100, 145, -145];

/**
 * Erscheint, wenn eine Axt eine bereits steckende Axt trifft. Das beendet den Lauf –
 * weiter geht es am Anfang des aktuellen 10er-Blocks. Die Münzen aus früher
 * abgeschlossenen Leveln bleiben erhalten, nur das angefangene Level bringt nichts ein.
 *
 * Bekommt bewusst eine EIGENE Inszenierung als das Erfolgs-Fenster (`LevelCompleteModal`)
 * – vorher teilten sich beide dieselbe sanfte Pop-in-Animation, nur in Rot statt Orange,
 * und wirkten dadurch wie dieselbe Karte zweimal. Jetzt: ein Bottom-Sheet, das von unten
 * hereinschiebt statt mittig einzublenden, blau statt rot getönt (passend zum neuen
 * Ozean-Look der Weltkarte), Riss-Overlay, die Axt zerspringt beim Erscheinen sichtbar
 * in zwei Hälften, und drei klare Wege weiter: neuer Versuch, zurück zum Startbildschirm,
 * oder direkt in die Werkstatt.
 */
export function GameOverModal({
  level,
  restartLevel,
  bestLevel,
  coinsLost,
  totalCoins,
  axeSkin,
  onRestart,
  onOpenShop,
  onBackToMenu,
}: GameOverModalProps) {
  return (
    <div className="modal-backdrop modal-backdrop--danger">
      {/* Riss-Overlay über den ganzen Bildschirm, direkt hinter der Karte – derselbe
          Trick wie der Bruch-Effekt auf der Zielscheibe, nur bildschirmfüllend. */}
      <svg className="gameover-cracks" viewBox="0 0 300 300" preserveAspectRatio="none">
        <path
          d="M150 150 L60 40 M150 150 L230 20 M150 150 L20 130 M150 150 L40 260 M150 150 L140 300 M150 150 L280 170 M150 150 L250 260 M150 150 L280 60"
          stroke="rgba(90,160,255,0.85)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div className="modal-card modal-card--gameover">
        <div className="gameover-axe">
          <span className="gameover-axe__spark-ring">
            {SPARK_ANGLES.map((angle) => (
              <span key={angle} className="gameover-axe__spark" style={{ ['--angle' as string]: `${angle}deg` }} />
            ))}
          </span>
          <div className="gameover-axe__half gameover-axe__half--a">
            <Axe size={54} skin={axeSkin} />
          </div>
          <div className="gameover-axe__half gameover-axe__half--b">
            <Axe size={54} skin={axeSkin} />
          </div>
        </div>

        <div className="modal-card__title modal-card__title--fail modal-card__title--stamp">Axt zersplittert!</div>
        <div className="modal-card__body">
          Du hast deine eigene Axt getroffen – in Level {level}.
          {restartLevel === level
            ? ' Noch einmal von vorn.'
            : ` Weiter geht es bei Level ${restartLevel}.`}
        </div>

        <div className="modal-card__record">
          Bestmarke: <strong>Level {bestLevel}</strong>
        </div>

        {coinsLost > 0 && (
          <div className="modal-card__sub modal-card__sub--warn">
            {coinsLost} {coinsLost === 1 ? 'Apfel' : 'Äpfel'} aus diesem Level verloren.
          </div>
        )}
        <div className="modal-card__sub">
          <Coin size={15} /> Münzen insgesamt: <strong>{totalCoins}</strong>
        </div>

        <button className="modal-card__button modal-card__button--ocean" onClick={onRestart}>
          {restartLevel === level ? 'Neuer Versuch' : `Zurück zu Level ${restartLevel}`}
        </button>
        <div className="modal-card__button-row">
          <button className="modal-card__button modal-card__button--secondary" onClick={onBackToMenu}>
            Zurück zum Menü
          </button>
          <button className="modal-card__button modal-card__button--secondary" onClick={onOpenShop}>
            Werkstatt öffnen
          </button>
        </div>
      </div>
    </div>
  );
}
