import { Axe } from './Axe';
import { Coin } from './Coin';
import { BOSS_EVERY } from '../game/constants';
import './StartScreen.css';

interface StartScreenProps {
  /** Level, bei dem es weitergeht (1-basiert). */
  continueLevel: number;
  bestLevel: number;
  coins: number;
  axeSkin: string;
  /** Beim allerersten Start zeigen wir zusätzlich die Regeln. */
  showTutorial: boolean;
  onPlay: () => void;
  onRestartFromOne: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
}

export function StartScreen({
  continueLevel,
  bestLevel,
  coins,
  axeSkin,
  showTutorial,
  onPlay,
  onRestartFromOne,
  onOpenShop,
  onOpenSettings,
}: StartScreenProps) {
  return (
    <div className="start">
      <div className="start__top">
        <h1 className="start__title">
          Axe<span className="start__title-accent">Throw</span>
        </h1>
        <div className="start__stats">
          <span>
            Bestmarke: <strong>Level {bestLevel}</strong>
          </span>
          <span className="start__coins">
            <Coin size={16} /> {coins}
          </span>
        </div>
      </div>

      <div className="start__art">
        <Axe size={92} skin={axeSkin} />
      </div>

      {showTutorial ? (
        <div className="start__rules">
          <h2 className="start__rules-title">So geht's</h2>
          <ul className="start__rules-list">
            <li>
              <span className="start__rules-icon">👆</span>
              <span>
                Tippen wirft eine Axt – immer geradeaus. Es zählt nur, <strong>wann</strong> du tippst.
              </span>
            </li>
            <li>
              <span className="start__rules-icon">🍎</span>
              <span>Triff nah an den Äpfeln, das gibt Münzen für neue Äxte und Scheiben.</span>
            </li>
            <li>
              <span className="start__rules-icon">💥</span>
              <span>
                Triffst du deine <strong>eigene Axt</strong>, ist der Lauf vorbei. Timing zählt.
              </span>
            </li>
            <li>
              <span className="start__rules-icon">🏆</span>
              <span>Jedes {BOSS_EVERY}. Level ist ein Boss – schaffst du ihn, gehört dir seine Axt.</span>
            </li>
          </ul>
        </div>
      ) : (
        <div className="start__spacer" />
      )}

      <div className="start__buttons">
        <button className="start__button start__button--main" onClick={onPlay}>
          {continueLevel > 1 ? `Weiter – Level ${continueLevel}` : 'Los geht’s'}
        </button>
        {continueLevel > 1 && (
          <button className="start__button start__button--ghost" onClick={onRestartFromOne}>
            Von Level 1 starten
          </button>
        )}
        <div className="start__button-row">
          <button className="start__button start__button--ghost" onClick={onOpenShop}>
            Werkstatt
          </button>
          <button className="start__button start__button--ghost" onClick={onOpenSettings}>
            Einstellungen
          </button>
        </div>
      </div>
    </div>
  );
}
