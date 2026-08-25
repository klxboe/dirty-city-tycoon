import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Axe } from './components/Axe';
import { AxeInventory } from './components/AxeInventory';
import { HUD } from './components/HUD';
import { AXE_STICK_RATIO, BOARD_SIZE, TargetBoard, type TargetBoardHandle } from './components/TargetBoard';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { VideoRescueModal } from './components/VideoRescueModal';
import { PauseModal } from './components/PauseModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { SettingsModal } from './components/SettingsModal';
import { Shop } from './components/Shop';
import { StartScreen } from './components/StartScreen';
import { WorldDecor } from './components/WorldDecor';
import { WorldHorizon } from './components/WorldHorizon';
import { WorldMap } from './components/WorldMap';
import { useAxeGame } from './hooks/useAxeGame';
import { AXE_EMBED_DEPTH_PX, FLIGHT_DURATION_MS, GAME_OVER_DELAY_MS, LEVEL_COMPLETE_DELAY_MS } from './game/constants';
import { worldForLevel, worldStyleVars } from './game/worlds';
import { EASTER_EGG_SKINS } from './game/shop';
import { AXE_IMAGES } from './game/axeShapes';
import { BOARD_IMAGES } from './game/boardImages';
import { initAds } from './game/ads';
import { initPurchases } from './game/purchases';
import {
  playCoinSound,
  playBossSound,
  playLevelCompleteSound,
  playGameOverSound,
  playHitSound,
  playThrowSound,
  unlockAudio,
  vibrate,
} from './game/sound';
import type { ThrowOutcome } from './game/types';
import './App.css';

/**
 * Lage der Scheibe innerhalb der Bühne, in Pixeln. Grundlage für die Flugbahn –
 * siehe ausführliche Begründung unten bei der Berechnung.
 */
interface BoardGeometry {
  /** Seitlicher Abstand der Scheibenmitte zur Bühnenmitte. */
  centerX: number;
  /** Abstand der Scheibenmitte zur Oberkante der Bühne. */
  centerY: number;
  radius: number;
  /** Höhe der Bühne – nötig, um von "Abstand oben" auf `bottom` umzurechnen. */
  height: number;
}

/**
 * Radius in Bildschirm-Pixeln, auf dem die Äxte tatsächlich stecken.
 *
 * Flugbahn und Späne-Burst müssen denselben Wert benutzen wie die steckenden Äxte.
 * Eine frühere Fassung rechnete mit dem gemessenen Scheiben-Radius (130) statt dem
 * Steck-Radius (120) – dadurch endete der Flug 10px weiter außen als die Axt danach
 * steckte, und der Späne-Burst saß sichtbar neben dem Einschlag.
 */
function stickRadiusPx(geom: BoardGeometry | null): number {
  return (geom?.radius ?? BOARD_SIZE / 2) * AXE_STICK_RATIO;
}

/**
 * Größe des Axt-Icons im Flug UND in Wurfbereitschaft (`<Axe size={FLIGHT_AXE_SIZE} .../>`
 * unten, zwei Stellen) – EINE gemeinsame Konstante statt zweimal derselben Zahl, damit sie
 * nie auseinanderlaufen kann. MUSS mit `STUCK_AXE_SIZE` (TargetBoard.tsx) übereinstimmen,
 * siehe dort für die ausführliche Herleitung: die eigentliche Ursache des "Axt fliegt/
 * steckt in der Mitte"-Problems war nie der Flug, sondern dass die STECKENDE Axt mit
 * ihrer Icon-Mitte (nicht der Klingenspitze) auf den Steck-Radius zentriert wurde – bei
 * einem zu großen Icon reichte die Klinge dadurch weit Richtung Scheibenmitte.
 */
const FLIGHT_AXE_SIZE = 33;

// Rein dekorativer Staub, der langsam nach oben treibt – für Atmosphäre.
const DUST_MOTES = [
  { left: '12%', delay: '0s', duration: '9s' },
  { left: '28%', delay: '2.5s', duration: '11s' },
  { left: '48%', delay: '1s', duration: '8s' },
  { left: '66%', delay: '4s', duration: '12s' },
  { left: '82%', delay: '1.8s', duration: '10s' },
  { left: '92%', delay: '3.4s', duration: '9.5s' },
];

/** Welcher Bildschirm gerade oben liegt. Rein visuell – der Spielzustand lebt in useAxeGame. */
type Screen = 'start' | 'game';

function App() {
  const boardHandleRef = useRef<TargetBoardHandle>(null);
  const getBoardAngleDeg = useCallback(() => boardHandleRef.current?.getAngleDeg() ?? 0, []);
  const game = useAxeGame(getBoardAngleDeg);

  // Einmal beim App-Start: SDK-Initialisierung + EU/UK-Consent-Flow für Rewarded
  // Video (siehe game/ads.ts). Läuft im Web-Preview ins Leere (kein natives AdMob
  // vorhanden), blockiert dort aber nichts – die Video-Rettung scheitert dann später
  // beim tatsächlichen Zeigen sauber mit einer Fehlermeldung statt zu crashen.
  useEffect(() => {
    initAds();
    initPurchases();
  }, []);

  /**
   * GEFUNDENER BUG (Klaus: "beim Werfen wird die Axt kurz unsichtbar" + "bei Boss-Leveln
   * zeigt die Scheibe zuerst das normale Holz, erst danach die Frucht"): Axt- UND
   * Scheiben-Skins sind echte Bild-Dateien (siehe axeShapes.ts/boardImages.ts). Die
   * fliegende Axt wird bei JEDEM Wurf neu gemountet (`key={flyingAxe.startedAt}`), ein
   * Boss-Level wechselt den Scheiben-Skin erst beim Levelstart – beide Male fordert der
   * Browser das Bild dann zum ERSTEN Mal an, wenn es noch nicht im Cache/Decoder-Speicher
   * liegt. Bei einer 100ms-Flugzeit reicht diese Decodier-Verzögerung locker, um wie ein
   * kurzes Verschwinden auszusehen. Fix: ALLE Axt-/Scheiben-Bilder einmal beim App-Start
   * im Hintergrund laden (`new Image().src = ...`), damit der Browser sie längst decodiert
   * hat, bevor sie das erste Mal im Spiel gebraucht werden.
   */
  useEffect(() => {
    Object.values(AXE_IMAGES).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    Object.values(BOARD_IMAGES).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const prevHitsRef = useRef(game.hits);
  const prevOutcomeRef = useRef<ThrowOutcome | null>(null);
  const prevApplesRef = useRef(game.applesCollectedThisRun);
  const prevCoinsRef = useRef(game.save.coins);
  const prevGemsRef = useRef(game.save.gems);
  const prevFlightStartRef = useRef<number | null>(null);
  const [coinsFlash, setCoinsFlash] = useState(false);
  const [gemsFlash, setGemsFlash] = useState(false);
  /**
   * Kurzer "Level N"-Hinweis auf der Bühne, wenn ein geschafftes Level automatisch ins
   * nächste übergeht (siehe LevelCompleteModal – kein Pflicht-Tap mehr auf "Weiter").
   * Ohne diesen Hinweis würde die Spielszene einfach wechseln, ohne dass klar wird,
   * DASS und WOHIN man gerade gesprungen ist. `expectLevelIntroRef` wird nur beim
   * automatischen/manuellen "Weiter"-Übergang gesetzt, nicht bei jedem Levelwechsel
   * (Weltkarten-Sprung, Neustart) – dort ist der Kontext schon durch die eigene
   * Navigation klar.
   */
  const expectLevelIntroRef = useRef(false);
  const prevLevelIndexForIntroRef = useRef(game.levelIndex);
  const [levelIntroVisible, setLevelIntroVisible] = useState(false);
  useEffect(() => {
    if (game.levelIndex !== prevLevelIndexForIntroRef.current) {
      prevLevelIndexForIntroRef.current = game.levelIndex;
      if (expectLevelIntroRef.current) {
        expectLevelIntroRef.current = false;
        setLevelIntroVisible(true);
        const timeout = setTimeout(() => setLevelIntroVisible(false), 1300);
        return () => clearTimeout(timeout);
      }
    }
  }, [game.levelIndex]);
  const [shopOpen, setShopOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  /** Rewarded-Video-Fenster für den Hauptmenü-Münzbutton (siehe StartScreen.tsx,
   *  `game.watchAdReward()`) – komplett getrennt vom Game-Over-Rettungsvideo. */
  const [adRewardOpen, setAdRewardOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('start');
  /**
   * Pause-Menü während eines laufenden Levels. Der Pause-BUTTON selbst ist nur
   * sichtbar/aktivierbar, während `game.phase === 'ready'` ist – bewusst NICHT während
   * eine Axt fliegt, damit die Pause-Funktion die Flug-/Kollisions-Logik nie berühren
   * muss (siehe PauseModal.tsx). Wird automatisch geschlossen, sobald sich Bildschirm
   * oder Level-Phase ändern (Level-Ende, Zurück zum Menü etc.), damit sie nie über
   * einen Bildschirmwechsel hinweg "hängen bleibt".
   */
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (screen !== 'game' || game.phase !== 'ready') setPaused(false);
  }, [screen, game.phase]);
  /**
   * Einmalige Video-Rettung im Game-Over-Fenster (siehe rescueRun() in useAxeGame.ts).
   * Zeigt zunächst GameOverModal (mit dem Button, falls verfügbar), dann bei Klick
   * dieses Platzhalter-Video (VideoRescueModal.tsx), erst danach wird tatsächlich
   * gerettet.
   */
  const [videoRescueOpen, setVideoRescueOpen] = useState(false);
  useEffect(() => {
    if (game.phase !== 'gameOver') setVideoRescueOpen(false);
  }, [game.phase]);
  const [boardGeom, setBoardGeom] = useState<BoardGeometry | null>(null);
  /**
   * Ob das große Ergebnis-Fenster schon sichtbar sein darf. Ohne diese Verzögerung
   * knallte das Menü im selben Moment hoch, in dem die letzte Axt einschlug – man
   * wurde davon regelrecht überrumpelt ("kommt so random das Menü, das erschreckt
   * einen"). Die Scheibe friert trotzdem SOFORT ein (siehe `paused` weiter unten),
   * nur das Fenster selbst wartet: erst zeigt die Bühne kurz ein großes "Geschafft!"
   * bzw. "Axt zersplittert" (`.outcome-banner`), danach erst fährt das Menü rein.
   */
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (game.phase !== 'levelComplete' && game.phase !== 'gameOver') {
      setModalVisible(false);
      return;
    }
    setModalVisible(false);
    const delay = game.phase === 'levelComplete' ? LEVEL_COMPLETE_DELAY_MS : GAME_OVER_DELAY_MS;
    const timeout = setTimeout(() => setModalVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [game.phase]);
  /*
   * Scheibenposition messen, sobald die Bühne steht – und bei jeder Größenänderung neu.
   * `useLayoutEffect`, damit der Wert vor dem ersten Zeichnen da ist und der allererste
   * Wurf nicht mit einer Notfall-Schätzung fliegt.
   *
   * Der ResizeObserver hängt an der Bühne, nicht am Fenster: auf dem Handy ändert sich
   * die nutzbare Höhe auch ohne Fenster-Resize, wenn die Browserleiste ein- und
   * ausfährt. Ein reiner `window.resize`-Listener würde das verpassen.
   */
  /**
   * Ausgelagert (statt lokal in der Messungs-`useLayoutEffect`), damit `handlePointerDown`
   * unten VOR jedem einzelnen Wurf zusätzlich frisch nachmessen kann – letzte
   * Absicherung gegen jeden noch verbliebenen, minimalen Reflow zwischen zwei Würfen
   * (Klaus nach dem Fix der großen Verschiebung: "die Axt fliegt immer noch ein Mini-
   * Stück weiter als sie soll, bevor sie zurückkommt" – deutlich kleiner als der vorige
   * große Sprung, aber noch spürbar).
   */
  const messenRef = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    if (screen !== 'game') return;
    const stage = stageRef.current;
    if (!stage) return;

    const messen = () => {
      const board = boardHandleRef.current?.getGeometry();
      if (!board) return;
      const s = stage.getBoundingClientRect();
      setBoardGeom({
        centerX: board.centerX - (s.left + s.width / 2),
        centerY: board.centerY - s.top,
        radius: board.radius,
        height: s.height,
      });
    };
    messenRef.current = messen;

    messen();
    const beobachter = new ResizeObserver(messen);
    beobachter.observe(stage);

    /*
     * GEFUNDENER BUG (Klaus: "Axt fliegt weiter, dann erst an den Rand" – per Live-
     * Debugging im Browser bestätigt, nicht nur vermutet): die Scheibe verschiebt sich
     * NACH diesem ersten `messen()`-Aufruf noch spürbar (in einem Test: 34,5px nach
     * unten) – vermutlich ein später Reflow, nachdem der Browser tatsächlich fertig
     * gelayoutet/gemalt hat. Der `ResizeObserver` beobachtet nur die GRÖSSE der Bühne,
     * nicht ihre Position innerhalb der Seite – verschiebt sich die Scheibe bei
     * gleichbleibender Bühnengröße (z.B. weil ein Geschwister-Element seine Höhe erst
     * nach dem ersten Layout-Durchlauf final einnimmt), feuert er NIE, und `boardGeom`
     * bleibt für den Rest des Levels auf der zu alten Position eingefroren – das
     * Flugziel wird nie neu berechnet. Fix: zusätzlich zweimal per
     * `requestAnimationFrame` nachmessen (doppeltes rAF ist die übliche Technik, um
     * sicher NACH einem abgeschlossenen Layout+Paint-Zyklus zu landen) – fängt jeden
     * späten Reflow ab, den der ResizeObserver verpasst.
     */
    const rafId = requestAnimationFrame(() => requestAnimationFrame(messen));

    return () => {
      beobachter.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [screen, game.levelIndex]);

  /*
   * Kein Screen-Shake, kein Rückstoß-Ruck, kein Mündungsblitz, keine Partikel/
   * Schockwellen, kein Zusammenzucken der Scheibe mehr (Klaus, radikale
   * Wurf-Vereinfachung: "KEIN Schnickschnack" – explizit u.a. kein Camera/Screen
   * Shake, kein Zielscheiben-Wackeln, keine übertriebenen Partikel, keine
   * zusätzlichen Fluganimationen). Übrig bleiben ausschließlich Sound + kurzes
   * haptisches Feedback – die Bewegung selbst soll "satisfying" sein, nicht
   * zusätzliche Effekte obendrauf.
   */
  useEffect(() => {
    const started = game.flyingAxe?.startedAt ?? null;
    if (started !== null && started !== prevFlightStartRef.current) {
      playThrowSound();
    }
    prevFlightStartRef.current = started;
  }, [game.flyingAxe]);

  useEffect(() => {
    if (game.hits > prevHitsRef.current) {
      vibrate(18);
    }
    prevHitsRef.current = game.hits;
  }, [game.hits]);

  // Soundeffekte je nach Ausgang des Wurfs.
  useEffect(() => {
    if (game.lastOutcome && game.lastOutcome !== prevOutcomeRef.current) {
      if (game.phase === 'levelComplete' && game.lastOutcome === 'stuck') {
        if (game.bossFruit) playBossSound();
        else playLevelCompleteSound();
      } else if (game.lastOutcome === 'stuck') {
        playHitSound();
      } else {
        playGameOverSound();
        vibrate([40, 60, 90]); // Game Over darf sich anders anfühlen als ein Treffer
      }
    }
    prevOutcomeRef.current = game.lastOutcome;
  }, [game.lastOutcome, game.phase, game.bossFruit]);

  // Eingesammelter Apfel: Ton. Das Fallen zeigt TargetBoard selbst an.
  useEffect(() => {
    if (game.applesCollectedThisRun > prevApplesRef.current) {
      playCoinSound();
      vibrate(12);
    }
    prevApplesRef.current = game.applesCollectedThisRun;
  }, [game.applesCollectedThisRun]);

  // Münz-Anzeige aufblitzen lassen, sobald sich der Kontostand erhöht.
  useEffect(() => {
    if (game.save.coins > prevCoinsRef.current) {
      setCoinsFlash(true);
      const timeout = setTimeout(() => setCoinsFlash(false), 700);
      prevCoinsRef.current = game.save.coins;
      return () => clearTimeout(timeout);
    }
    prevCoinsRef.current = game.save.coins;
  }, [game.save.coins]);

  // Diamant-Anzeige aufblitzen lassen, sobald sich der Bestand erhöht.
  useEffect(() => {
    if (game.save.gems > prevGemsRef.current) {
      setGemsFlash(true);
      const timeout = setTimeout(() => setGemsFlash(false), 700);
      prevGemsRef.current = game.save.gems;
      return () => clearTimeout(timeout);
    }
    prevGemsRef.current = game.save.gems;
  }, [game.save.gems]);

  /*
   * GEFUNDENER BUG (Klaus: "der Pause-Button und der Hinweistext müssen die ganze
   * Zeit sichtbar bleiben"): der Hinweistext (und die Bereitschafts-Axt daneben,
   * siehe `.stage__ready-axe` unten) verschwanden bisher WÄHREND des Fluges
   * (`phase !== 'ready'`) – das ist ein echter DOM-Knoten innerhalb von
   * `.stage__thrower-zone`, einem normalen Flex-Kind, kein absolut positioniertes
   * Element. Verschwindet er, schrumpft die Thrower-Zone, und `.stage__board-zone`
   * (flex:1, teilt sich denselben Platz) wächst dadurch minimal – GENAU DAS könnte
   * erklären, warum die Scheibe bei JEDEM Wurf leicht verschiebt, während
   * `boardGeom` noch die Messung von VOR diesem Verschwinden benutzt (die eigentliche
   * Ursache für "Axt fliegt/steckt in der Mitte", die keine der bisherigen
   * Positions-Fixes beheben konnte, weil sie alle mit einer bereits VERALTETEN
   * `boardGeom`-Messung rechneten). Text bleibt jetzt konstant, kein Verschwinden
   * mehr, keine Layout-Verschiebung mehr durch diesen Text.
   */
  const hint = 'Tippen zum Werfen – triff die Lücke';

  const handlePointerDown = () => {
    unlockAudio(); // muss innerhalb der Nutzer-Interaktion passieren, sonst blockt der Browser Audio

    // Direkt vor jedem Wurf nochmal frisch nachmessen (siehe `messenRef` oben) – letzte
    // Absicherung gegen einen minimalen Reflow zwischen zwei Würfen, den weder der
    // ResizeObserver noch das doppelte rAF beim Level-Start abfangen würden, weil
    // beide nur beim Level-Wechsel laufen, nicht bei jedem einzelnen Wurf.
    messenRef.current();

    // WO man tippt, spielt keine Rolle – die Axt geht immer geradeaus nach oben,
    // wie beim Vorbild "Knife Hit". Es gab zwischendurch eine Ziel-Mechanik; die hat
    // das Spiel unnötig kompliziert gemacht und wurde wieder entfernt.
    game.throwAxe();
  };

  const startPlaying = () => {
    unlockAudio();
    game.markTutorialSeen();
    setScreen('game');
  };

  /*
   * Flugbahn der Axt: immer senkrecht nach oben durch die Scheibenmitte, bis zum
   * tiefsten Punkt des Steck-Radius. Es gibt keine Richtungsvariante mehr – der
   * Einschlagpunkt ist auf dem Bildschirm immer derselbe, nur die Scheibe dreht
   * sich darunter weg.
   *
   * Die Endhöhe wird aus der GEMESSENEN Scheibenposition gerechnet, nicht aus einem
   * festen Prozentwert: die Scheibe sitzt mittig in einer flexiblen Zone, ihre Lage
   * hängt also von der Bildschirmhöhe ab. Eine frühere Fassung endete fest bei
   * `bottom: 68%` und die Axt flog rund 300px zu weit, quer durch die Scheibe.
   */
  const flightX = boardGeom?.centerX ?? 0;
  const impactY = (boardGeom?.centerY ?? 0) + stickRadiusPx(boardGeom);
  /*
   * VIERTER Anlauf – die ECHTE Ursache gefunden (Klaus: "es ist genau gleich", nachdem
   * drei rein FLUG-seitige Fixes (Höhen-Ausgleich, Mitte-zu-Mitte-Anker, reine Pixel-
   * Animation) alle wirkungslos blieben). Identisches Ergebnis bei drei technisch
   * verschiedenen Ansätzen bedeutet: der Fehler lag nie im Flug selbst, sondern darin,
   * dass `translate(-50%, -50%)` die ICON-MITTE auf den Ziel-Radius legt, nicht die
   * Klingenspitze. Ein Radius-Ausgleich (halbe Icon-Höhe nach außen, analog zu
   * `STUCK_AXE_RADIUS` in TargetBoard.tsx) wurde ausprobiert, schob die Axt aber zu weit
   * von der Scheibe weg (Klaus: "Äxte sind nicht mehr am Rand, sondern weit entfernt") –
   * wieder zurückgenommen, das kleinere `FLIGHT_AXE_SIZE` bleibt als alleinige
   * Milderung stehen.
   */
  const flightEndTopPx = impactY - AXE_EMBED_DEPTH_PX;
  // Startposition wie zuvor bei 92% der Bühnenhöhe von oben (= 8% von unten).
  const flightStartTopPx = (boardGeom?.height ?? 0) * 0.92;
  const flightTravelPx = flightEndTopPx - flightStartTopPx;

  const overlayOpen = shopOpen || settingsOpen || worldMapOpen || adRewardOpen;
  const world = worldForLevel(game.levelIndex);

  if (screen === 'start') {
    return (
      <div className="app">
        <StartScreen
          continueLevel={game.levelIndex + 1}
          bestLevel={game.save.bestLevel}
          xp={game.save.xp}
          coins={game.save.coins}
          gems={game.save.gems}
          figurines={game.save.figurines}
          axeSkin={game.save.equippedAxeSkin}
          showTutorial={!game.save.tutorialSeen}
          defeatedWorldBosses={game.save.defeatedWorldBosses}
          onWatchAd={() => setAdRewardOpen(true)}
          onPlay={startPlaying}
          onOpenShop={() => setShopOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenWorldMap={() => setWorldMapOpen(true)}
          onSecretFound={() => game.unlockEasterEgg(EASTER_EGG_SKINS[0].id)}
        />

        {shopOpen && (
          <Shop save={game.save} onBuy={game.buySkin} onEquip={game.equipSkin} onGrantPurchase={game.grantPurchasedSkin} onTradeFigurines={game.tradeFigurines} onClose={() => setShopOpen(false)} />
        )}
        {settingsOpen && (
          <SettingsModal
            soundOn={game.save.soundOn}
            bestLevel={game.save.bestLevel}
            onToggleSound={game.setSoundOn}
            onClose={() => setSettingsOpen(false)}
          />
        )}
        {worldMapOpen && (
          <WorldMap
            bestLevel={game.save.bestLevel}
            xp={game.save.xp}
            currentLevelIndex={game.levelIndex}
            defeatedWorldBosses={game.save.defeatedWorldBosses}
            onSelectLevel={(levelIndex) => {
              game.goToLevel(levelIndex);
              startPlaying();
            }}
            onClose={() => setWorldMapOpen(false)}
          />
        )}

        {/* Nur auf dem Startbildschirm und wenn gerade kein anderes Fenster offen ist –
            sonst würde die Belohnung mitten in der Werkstatt o.ä. aufpoppen. */}
        {!overlayOpen && game.dailyReward && (
          <DailyRewardModal
            streak={game.dailyReward.streak}
            reward={game.dailyReward.reward}
            onClaim={game.claimDailyReward}
          />
        )}

        {adRewardOpen && (
          <VideoRescueModal
            variant="reward"
            onFinished={() => {
              game.watchAdReward();
              setAdRewardOpen(false);
            }}
            onCancel={() => setAdRewardOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <HUD
        level={game.levelIndex + 1}
        levelInBlock={game.levelIndex - game.blockStart}
        coins={game.save.coins}
        coinsFlash={coinsFlash}
        gems={game.save.gems}
        gemsFlash={gemsFlash}
        streak={game.streak}
        isBoss={!!game.bossFruit}
        isWorldBoss={!!game.worldBossName}
        onOpenShop={() => setShopOpen(true)}
      />

      <div
        ref={stageRef}
        className={`stage ${game.bossFruit ? 'stage--boss' : ''}`}
        style={worldStyleVars(game.levelIndex) as React.CSSProperties}
        onPointerDown={handlePointerDown}
      >
        <WorldHorizon decor={world.decor} />
        <WorldDecor decor={world.decor} />

        <AxeInventory total={game.axeCount} thrown={game.axesThrown} skin={game.save.equippedAxeSkin} />

        <div className="stage__dust">
          {DUST_MOTES.map((mote, i) => (
            <span key={i} style={{ left: mote.left, animationDelay: mote.delay, animationDuration: mote.duration }} />
          ))}
        </div>

        {/*
         * Pause-Button: bleibt jetzt DURCHGEHEND sichtbar (Klaus: "der muss die ganze
         * Zeit sichtbar bleiben") – vorher war er nur zwischen zwei Würfen da
         * (`phase === 'ready'`), verschwand also bei jedem Wurf kurz. `stopPropagation`
         * ist nötig, weil der Button INNERHALB von `.stage` liegt, dessen
         * `onPointerDown` sonst einen Wurf auslösen würde.
         */}
        {!overlayOpen && !paused && (
          <button
            className="stage__pause-button"
            aria-label="Pause"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setPaused(true)}
          >
            ⏸
          </button>
        )}

        {/* Boss-Level bekommen ein eigenes Schild, damit der Moment klar erkennbar ist. */}
        {game.bossFruit && (
          <div className="stage__boss-tag">
            <span className="stage__boss-tag-label">Boss</span>
            <span className="stage__boss-tag-name">{game.bossFruit.name}</span>
          </div>
        )}

        {/* Weltboss: eigene, auffälligere Kennzeichnung als ein normaler 5-Level-Boss –
            das hier ist das "Tor" vor der Welt, keine Routine-Prüfung. */}
        {game.worldBossName && (
          <div className="stage__boss-tag stage__boss-tag--world">
            <span className="stage__boss-tag-label">⚠ Weltboss</span>
            <span className="stage__boss-tag-name">{game.worldBossName}</span>
          </div>
        )}

        <div className="stage__board-zone">
          <TargetBoard
            ref={boardHandleRef}
            speedDegPerSec={game.boardSpeedDegPerSec}
            spinPattern={game.spinPattern}
            paused={game.phase === 'levelComplete' || game.phase === 'gameOver' || overlayOpen || paused}
            stuckAxes={game.stuckAxes}
            apples={game.apples}
            boardSkin={game.activeBoardSkin}
            axeSkin={game.save.equippedAxeSkin}
            broken={game.phase === 'levelComplete' && game.lastOutcome === 'stuck'}
          />

        </div>

        {game.phase === 'flying' && game.flyingAxe && (
          /*
           * DRITTER Anlauf beim Flug-Positions-Bug (Klaus, per Fotoserie auf dem
           * echten Gerät bestätigt: Axt sitzt sichtbar in der Mitte, bevor sie im
           * NÄCHSTEN Frame an den Rand schnappt – der Bug bestand also weiter, obwohl
           * die Mathematik im Desktop-Browser-Test exakt aufging). Verdacht: WebKit/
           * Safari (iOS-WKWebView) interpoliert die eigenständige `translate`-
           * Eigenschaft nicht zuverlässig, wenn ihr Wert ein `calc()` aus Prozent UND
           * Pixeln ist (`-50% calc(-50% + var(--flight-travel-px))`, siehe vorherige
           * Fassung) – im Desktop-Chrome-Test unauffällig, auf dem echten iPhone aber
           * offenbar kein sauberes Tweening, sondern ein Sprung.
           *
           * Fix: zwei VERSCHACHTELTE Elemente statt eines mit gemischter Prozent-
           * Pixel-Angabe. Äußerer Anker (`.axe-flying-anchor`) übernimmt NUR die
           * Zentrierung (`transform: translate(-50%, -50%)`, statisch, NIE animiert) –
           * exakt dieselbe Methode wie bei einer steckenden Axt in TargetBoard.tsx.
           * Innen animiert `.axe-flying` NUR noch eine REINE Pixel-`translateY()`
           * (kein Prozentanteil mehr in der animierten Eigenschaft) – das ist die am
           * weitesten verbreitete, am wenigsten überraschungsanfällige Form einer CSS-
           * Positions-Animation.
           */
          <div
            className="axe-flying-anchor"
            style={{
              top: `${flightStartTopPx}px`,
              ['--flight-x' as string]: `${flightX}px`,
            }}
          >
            <div
              key={game.flyingAxe.startedAt}
              className="axe-flying"
              style={{
                animationDuration: `${FLIGHT_DURATION_MS}ms`,
                ['--flight-travel-px' as string]: `${flightTravelPx}px`,
              }}
              /*
               * Löst den Einschlag aus, statt dass useAxeGame das über einen eigenen
               * setTimeout(FLIGHT_DURATION_MS) tut (siehe ausführliche Herleitung bei
               * resolveThrow() in useAxeGame.ts – GENAU der Grund für den gemeldeten
               * Mikro-Stopp: ein JS-Timer neben der CSS-Animation kann nachhinken, die
               * Axt stand dann fertig am Ziel und wartete auf einen zweiten,
               * unabhängigen Zeitgeber).
               */
              onAnimationEnd={(e) => {
                if (e.animationName === 'axe-fly-position') game.resolveThrow();
              }}
            >
              <Axe size={FLIGHT_AXE_SIZE} skin={game.save.equippedAxeSkin} />
            </div>
          </div>
        )}

        <div className="stage__thrower-zone">
          {/*
           * Die "bereitliegende" Axt zeigt, von wo geworfen wird. War bisher komplett
           * UNMOUNTED während des Fluges (`phase !== 'flying'`-Bedingung) – ein
           * echter DOM-Knoten mit echter Größe innerhalb dieser Flex-Zone, dessen
           * Verschwinden vermutlich GENAU die Layout-Verschiebung auslöste, die den
           * "Axt fliegt/steckt in der Mitte"-Bug verursacht hat (siehe Kommentar bei
           * `hint` oben). Jetzt bleibt der Platz IMMER reserviert (`visibility:
           * hidden` statt Unmounten) – die Bereitschafts-Axt verschwindet weiterhin
           * optisch während des Wurfs, ändert aber nicht mehr die Höhe der Zone.
           */}
          {game.axesThrown < game.axeCount && (
            <div className="stage__ready-axe" style={game.phase === 'flying' ? { visibility: 'hidden' } : undefined}>
              <Axe size={FLIGHT_AXE_SIZE} skin={game.save.equippedAxeSkin} />
            </div>
          )}
          <div className="stage__hint">{hint}</div>
        </div>

        {/*
         * Sofortige Rückmeldung, WÄHREND das Menü noch wartet (siehe modalVisible oben).
         * Ohne dieses Banner war die Pause bis zum Menü ein stummes Nichts – jetzt sieht
         * man sofort, was passiert ist, und das Menü kommt danach als bewusster zweiter
         * Schritt statt als Überraschung.
         */}
        {(game.phase === 'levelComplete' || game.phase === 'gameOver') && !modalVisible && (
          <div
            className={`outcome-banner outcome-banner--${
              game.phase === 'gameOver' ? 'fail' : game.bossFruit || game.worldBossName ? 'boss' : 'win'
            }`}
          >
            <span
              className="outcome-banner__title"
              style={{
                animationDuration: `${game.phase === 'gameOver' ? GAME_OVER_DELAY_MS : LEVEL_COMPLETE_DELAY_MS}ms`,
              }}
            >
              {game.phase === 'gameOver'
                ? 'Axt zersplittert!'
                : game.worldBossName
                  ? 'Weltboss besiegt!'
                  : game.bossFruit
                    ? 'Boss besiegt!'
                    : 'Geschafft!'}
            </span>
          </div>
        )}

        {/* Macht den automatischen Levelwechsel sichtbar (siehe expectLevelIntroRef
            oben) – ohne das würde die Szene nach dem Abschluss-Fenster einfach
            wechseln, ohne dass klar ist, DASS und WOHIN man gerade gesprungen ist. */}
        {levelIntroVisible && (
          <div className="stage__level-intro">
            <span>Level {game.levelIndex + 1}</span>
          </div>
        )}
      </div>

      {shopOpen && (
        <Shop save={game.save} onBuy={game.buySkin} onEquip={game.equipSkin} onGrantPurchase={game.grantPurchasedSkin} onTradeFigurines={game.tradeFigurines} onClose={() => setShopOpen(false)} />
      )}

      {settingsOpen && (
        <SettingsModal
          soundOn={game.save.soundOn}
          bestLevel={game.save.bestLevel}
          onToggleSound={game.setSoundOn}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {!overlayOpen && modalVisible && game.phase === 'levelComplete' && game.reward && (
        <LevelCompleteModal
          level={game.levelIndex + 1}
          applesCollected={game.applesCollectedThisRun}
          appleCount={game.appleCount}
          reward={game.reward}
          totalCoins={game.save.coins}
          totalGems={game.save.gems}
          totalXp={game.save.xp}
          streak={game.streak}
          isCampaignComplete={game.isCampaignComplete}
          onNext={() => {
            // Weltboss-Sieg: NICHT nahtlos weiterspielen ("nach dem Boss soll man nur
            // die Welt geschafft haben, nicht zu Level 22 oder so kommen – der Boss
            // ist separat und hat kein Level"). `game.nextLevel()` lässt den
            // Level-Index dafür unverändert stehen (siehe dortiger Kommentar) und
            // markiert die Welt als besiegt – zurück zum Hauptmenü statt einer
            // automatischen Weiterfahrt in eine neue Begegnung.
            const wasWorldBoss = Boolean(game.worldBossName);
            game.nextLevel();
            if (wasWorldBoss) {
              setScreen('start');
            } else {
              expectLevelIntroRef.current = true;
            }
          }}
          onOpenShop={() => setShopOpen(true)}
        />
      )}

      {!overlayOpen && modalVisible && game.phase === 'gameOver' && !videoRescueOpen && (
        <GameOverModal
          level={game.levelIndex + 1}
          bestLevel={game.save.bestLevel}
          coinsLost={game.applesCollectedThisRun}
          totalCoins={game.save.coins}
          axeSkin={game.save.equippedAxeSkin}
          rescueAvailable={!game.rescueUsedThisRun}
          onWatchVideo={() => setVideoRescueOpen(true)}
          onPlayAgain={game.restartRun}
          onBackToMenu={() => {
            // `restartRun()` zuerst: `game.phase` steht sonst weiter auf 'gameOver'
            // (nur der SAVE-Stand wird beim Game Over selbst schon zurückgesetzt,
            // siehe useAxeGame.ts) – ohne diesen Reset würde das Game-Over-Fenster
            // sofort wieder erscheinen, sobald man vom Startbildschirm aus erneut
            // "Los geht's" tippt.
            game.restartRun();
            setScreen('start');
          }}
        />
      )}

      {videoRescueOpen && (
        <VideoRescueModal
          onFinished={() => {
            game.rescueRun();
            setVideoRescueOpen(false);
          }}
          onCancel={() => setVideoRescueOpen(false)}
        />
      )}

      {paused && <PauseModal onResume={() => setPaused(false)} onBackToMenu={() => setScreen('start')} />}
    </div>
  );
}

export default App;
