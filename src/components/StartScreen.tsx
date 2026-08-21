import { useRef, useState } from 'react';
import { Apple } from './Apple';
import { Axe } from './Axe';
import { Coin } from './Coin';
import { Gem } from './Gem';
import { BOSS_EVERY } from '../game/constants';
import { worldForLevel } from '../game/worlds';
import './StartScreen.css';

interface StartScreenProps {
  /** Level, bei dem es weitergeht (1-basiert). */
  continueLevel: number;
  bestLevel: number;
  xp: number;
  coins: number;
  gems: number;
  /** Sammelfiguren aus Heldenstadt – nur gezeigt, wenn schon welche im Inventar sind. */
  figurines: number;
  axeSkin: string;
  /** Beim allerersten Start zeigen wir zusätzlich die Regeln. */
  showTutorial: boolean;
  onPlay: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenWorldMap: () => void;
  /** Oster-Ei: ausgelöst, wenn das Logo siebenmal schnell hintereinander angetippt wird. */
  onSecretFound: () => void;
}

/** Wie viele Taps auf das Logo nötig sind, um das Oster-Ei freizuschalten. */
const SECRET_TAP_COUNT = 7;
/** Zeitfenster, in dem die Taps aufeinanderfolgen müssen (ms) – sonst zählt es nicht als Absicht. */
const SECRET_TAP_WINDOW_MS = 2200;

export function StartScreen({
  continueLevel,
  bestLevel,
  xp,
  coins,
  gems,
  figurines,
  axeSkin,
  showTutorial,
  onPlay,
  onOpenShop,
  onOpenSettings,
  onOpenWorldMap,
  onSecretFound,
}: StartScreenProps) {
  // Oster-Ei: bewusst KEIN Hinweis im Tutorial – wer's findet, findet's.
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<number | undefined>(undefined);
  const [secretFoundMsg, setSecretFoundMsg] = useState(false);

  const handleLogoTap = () => {
    tapCountRef.current += 1;
    window.clearTimeout(tapTimeoutRef.current);

    if (tapCountRef.current >= SECRET_TAP_COUNT) {
      tapCountRef.current = 0;
      onSecretFound();
      setSecretFoundMsg(true);
      window.setTimeout(() => setSecretFoundMsg(false), 3000);
      return;
    }

    // Zählt nur, wenn die Taps zügig aufeinanderfolgen – ein zufälliger Tap alle
    // paar Sekunden beim Anschauen des Titels soll nichts auslösen.
    tapTimeoutRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
    }, SECRET_TAP_WINDOW_MS);
  };

  // Welche Welt als Nächstes drankommt – rein informativ, damit der Startbildschirm
  // schon vorher zeigt, wo man landet, statt das erst nach dem Start-Tap zu erfahren.
  const world = worldForLevel(Math.max(0, continueLevel - 1));

  return (
    <div className="start">
      {/* Rein dekorative Wolken, die langsam über den Himmel driften – reine Atmosphäre,
          kein eigenes Element im Hintergrund-`background` (der bleibt für die
          statischen Tupfen zuständig), damit sie unabhängig animieren können. */}
      <div className="start__clouds" aria-hidden="true">
        <span className="start__cloud start__cloud--1" />
        <span className="start__cloud start__cloud--2" />
        <span className="start__cloud start__cloud--3" />
      </div>

      <div className="start__top">
        <h1 className="start__title" onClick={handleLogoTap}>
          Axe<span className="start__title-accent">Throw</span>
        </h1>

        <div className="start__world-badge" style={{ ['--world-accent' as string]: world.colors.accent }}>
          <span className="start__world-dot" />
          Aktuelle Welt: <strong>{world.name}</strong>
        </div>

        <div className="start__stats">
          <span>
            Highscore: <strong>Level {bestLevel}</strong>
          </span>
          <span className="start__coins">
            <Coin size={16} /> {coins}
          </span>
          <span className="start__xp">{xp} XP</span>
          {gems > 0 && (
            <span className="start__gems">
              <Gem size={14} /> {gems}
            </span>
          )}
          {figurines > 0 && (
            <span className="start__figurines">
              <Apple size={14} figurine /> {figurines}
            </span>
          )}
        </div>
        {secretFoundMsg && <div className="start__secret-toast">Geheimnis gefunden! Schau in der Werkstatt vorbei.</div>}
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
        <button className="start__button start__button--ghost" onClick={onOpenWorldMap}>
          Weltkarte
        </button>
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
