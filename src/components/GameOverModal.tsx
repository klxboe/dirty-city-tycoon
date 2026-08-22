import { Axe } from './Axe';
import { Coin } from './Coin';
import './LevelCompleteModal.css';
import './GameOverModal.css';

interface GameOverModalProps {
  level: number;
  /** Höchstes je erreichtes Level – bleibt als Highscore stehen. */
  bestLevel: number;
  /** Münzen, die dieser Lauf gekostet hat (gesammelte Äpfel des laufenden Levels). */
  coinsLost: number;
  totalCoins: number;
  /** Nur fürs Icon oben im Fenster – zerspringt in zwei Hälften beim Erscheinen. */
  axeSkin: string;
  /** true, wenn der Lauf an einem Zacken-Hindernis endete statt an der eigenen Axt
   *  (siehe LevelConfig.spikeAngles / ThrowOutcome 'spiked') – eigener Text, damit die
   *  angezeigte Todesursache stimmt. */
  hitSpike: boolean;
  /** Ob die einmalige Video-Rettung in diesem Lauf noch verfügbar ist (siehe useAxeGame.ts). */
  rescueAvailable: boolean;
  /** Öffnet den (simulierten) Rettungs-Video-Flow, siehe VideoRescueModal.tsx. */
  onWatchVideo: () => void;
  /**
   * Startet direkt einen neuen Lauf bei Level 1 – OHNE Umweg über den
   * Startbildschirm (Klaus: "riesen Fehler, wenn man kein Video anschaut, startet
   * man wieder bei Level 1, mach einfach so 'Spielen' oder sowas" – gemeint war
   * nicht ein Bug, sondern dass der bisherige Button "Zurück zum Menü" einen
   * unnötigen Extra-Tap über den Startbildschirm verlangte, bevor man wirklich
   * wieder spielen konnte). Ruft schlicht `restartRun()` auf, während der
   * Bildschirm bereits auf "game" steht – kein Screen-Wechsel nötig.
   */
  onPlayAgain: () => void;
  /**
   * Zurück zum Startbildschirm (Weltkarte/Werkstatt/Einstellungen). War bewusst
   * entfernt worden ("extrem klare UI, keine dritten Buttons"), musste aber wieder
   * rein: ohne diesen Button gab es nach einem Game Over KEINEN Weg mehr zum Menü,
   * nur noch "Fortschritt mit Video" oder direkt weiterspielen (Klaus: "man kann
   * nicht mehr zurück zum Menü"). Deshalb bewusst als dritter, aber sichtbar
   * zurückhaltenderer Button (siehe `modal-card__button--ghost` in GameOverModal.css) –
   * die ersten beiden bleiben die Hauptaktionen, das hier ist die Notbremse.
   */
  onBackToMenu: () => void;
}

const SPARK_ANGLES = [-100, -55, -20, 20, 55, 100, 145, -145];

/**
 * Erscheint, wenn eine Axt eine bereits steckende Axt ODER ein Zacken-Hindernis trifft
 * (siehe `hitSpike`, nur bei Bossen). Das beendet den Lauf –
 * weiter geht es immer bei Level 1 (Highscore-Prinzip: ein Fehler irgendwo wirft
 * konsequent auf Los zurück), ES SEI DENN der Spieler nutzt die Video-Rettung.
 *
 * Bewusst auf GENAU zwei mögliche Buttons reduziert (Klaus: "extrem klare UI, keine
 * dritten Buttons") – vorher gab es zusätzlich "Neuer Versuch" und "Werkstatt öffnen".
 * "Nochmal spielen" startet DIREKT einen neuen Lauf bei Level 1 (kein Umweg über den
 * Startbildschirm mehr – siehe `onPlayAgain`), die Werkstatt ist über den Münzstand im
 * HUD ohnehin einen Tap entfernt.
 */
export function GameOverModal({
  level,
  bestLevel,
  coinsLost,
  totalCoins,
  axeSkin,
  hitSpike,
  rescueAvailable,
  onWatchVideo,
  onPlayAgain,
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

        <div className="modal-card__title modal-card__title--fail modal-card__title--stamp">
          {hitSpike ? 'Am Zacken zersplittert!' : 'Axt zersplittert!'}
        </div>
        <div className="modal-card__body">
          {hitSpike
            ? `Du hast einen Zacken getroffen – in Level ${level}.`
            : `Du hast deine eigene Axt getroffen – in Level ${level}.`}
        </div>

        <div className="modal-card__record">
          Highscore: <strong>Level {bestLevel}</strong>
        </div>

        {coinsLost > 0 && (
          <div className="modal-card__sub modal-card__sub--warn">
            {coinsLost} {coinsLost === 1 ? 'Apfel' : 'Äpfel'} aus diesem Level verloren.
          </div>
        )}
        <div className="modal-card__sub">
          <Coin size={15} /> Münzen insgesamt: <strong>{totalCoins}</strong>
        </div>

        {rescueAvailable && (
          <button className="modal-card__button modal-card__button--ocean" onClick={onWatchVideo}>
            📺 Fortschritt mit Video
          </button>
        )}
        <button className="modal-card__button modal-card__button--secondary" onClick={onPlayAgain}>
          Nochmal spielen
        </button>
        <button className="modal-card__button modal-card__button--ghost" onClick={onBackToMenu}>
          Zum Hauptmenü
        </button>
      </div>
    </div>
  );
}
