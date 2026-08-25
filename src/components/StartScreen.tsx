import { useRef, useState } from 'react';
import { Apple } from './Apple';
import { Axe } from './Axe';
import { Coin } from './Coin';
import { Gem } from './Gem';
import { BOSS_EVERY } from '../game/constants';
import { isWorldBossLevel, worldForLevel } from '../game/worlds';
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
  /** Welt-IDs, deren Weltboss schon (mindestens einmal, dauerhaft) besiegt wurde. */
  defeatedWorldBosses: string[];
  /** Öffnet den Rewarded-Video-Flow für die Hauptmenü-Münzbelohnung (App.tsx) – gibt
   *  dieselbe Summe wie die Game-Over-Rettung (VIDEO_RESCUE_COINS), ist aber jederzeit
   *  vom Hauptmenü aus nutzbar, unabhängig von einem laufenden Versuch. */
  onWatchAd: () => void;
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
  defeatedWorldBosses,
  onWatchAd,
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
  /**
   * Steht der Spielstand GENAU am Weltboss-Tor (siehe isWorldBossLevel) UND ist dessen
   * Weltboss noch NICHT besiegt, darf der Haupt-Button nicht direkt in den Bosskampf
   * springen (Klaus: "man soll nur gegen ihn spielen können, wenn man zuerst auf
   * Weltkarte geht") – und schon gar nicht "Weiter – Level 21" anzeigen, ein Weltboss
   * hat laut HUD/LevelCompleteModal bewusst KEINE Levelnummer. Der Button führt in
   * diesem Fall stattdessen zur Weltkarte, wo der Bosskampf über den passenden
   * Welt-Knoten gestartet wird.
   *
   * Einmal besiegt (siehe `defeatedWorldBosses`, dauerhaft in SaveData) ist dieser
   * Level-Index für immer ein normaler Level derselben Welt (siehe generateLevel() in
   * constants.ts) – die Sperre gilt dann nicht mehr, "Weiter" führt direkt ins normale
   * Spiel statt nochmal über die Weltkarte zu zwingen (Klaus: "wenn man den Boss
   * einmal spielt und dann zurück zum Hauptmenü geht, soll man ins normale Spiel
   * zurückkommen, nicht wieder zur Weltkarte").
   */
  const isBossGate = isWorldBossLevel(Math.max(0, continueLevel - 1)) && !defeatedWorldBosses.includes(world.id);

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

        {/* Highscore als eigener Blickfang statt einer kleinen Zeile zwischen Münzen/XP
            (Klaus: "Highscore soll gefühlt der Mittelpunkt sein") – große Zahl mit
            Pokal-Label, direkt unter dem Logo, bevor überhaupt die Welt/Währungen kommen. */}
        <div className="start__highscore">
          <span className="start__highscore-label">🏆 Highscore</span>
          <span className="start__highscore-value">Level {bestLevel}</span>
        </div>

        <div className="start__world-badge" style={{ ['--world-accent' as string]: world.colors.accent }}>
          <span className="start__world-dot" />
          Aktuelle Welt: <strong>{world.name}</strong>
        </div>

        <div className="start__stats">
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

      {/* Eigener, jederzeit nutzbarer Rewarded-Video-Button – ursprünglich oben rechts
          bei Highscore/Münzen/XP platziert, kollidierte dort aber sichtbar mit dem
          Logo (Klaus, mit Screenshot vom echten Gerät: "mach den Video für 350 hier
          her" + eingekreiste leere Fläche unter der Axt). Jetzt in genau dieser
          leeren Zone zwischen Axt-Bild und Button-Stapel, komplett unabhängig von der
          Game-Over-Rettung (`rescueRun`), die unverändert bleibt. Nur außerhalb des
          Erstlauf-Tutorials (dort füllt `.start__rules` denselben Platz) – ein
          Werbevideo-Angebot direkt beim allerersten Öffnen wäre verfrüht. */}
      {!showTutorial && (
        <button className="start__ad-button" onClick={onWatchAd} aria-label="Werbevideo für 350 Münzen ansehen">
          <span className="start__ad-button-icon">📺</span>
          <span className="start__ad-button-text">+350</span>
        </button>
      )}

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
        <button className="start__button start__button--main" onClick={isBossGate ? onOpenWorldMap : onPlay}>
          {isBossGate ? 'Weiter zur Weltkarte' : continueLevel > 1 ? `Weiter – Level ${continueLevel}` : 'Los geht’s'}
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
