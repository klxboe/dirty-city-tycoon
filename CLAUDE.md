# Axe Throw – Projektstatus

Diese Datei ist die "Quelle der Wahrheit" für den aktuellen Stand des Projekts.
Bei jedem größeren Fortschritt wird sie aktualisiert, damit man beim Öffnen des
Projekts auf einem anderen PC sofort weiß, wo wir stehen.

## Pivot-Hinweis (wichtig für alle Mitwirkenden!)

Dieses Repo hieß ursprünglich "Dirty City Tycoon" (ein Müll-Idle-Spiel). Nach
mehreren Design-Anläufen, die nicht überzeugt haben, wurde entschieden, **ein
komplett neues, anderes Spiel** im selben Repo zu bauen (um die bestehende
GitHub-Mitarbeiter-Einladung nicht neu aufsetzen zu müssen). Der alte Code ist
nicht verloren, sondern bleibt vollständig in der Git-Historie erhalten
(`git log`, ältere Commits vor diesem Pivot).

## Was ist das Spiel?

Ein simples, süchtig machendes Arcade-Handyspiel, sehr nah am Vorbild
"Knife Hit": **Axt-Wurf auf eine rotierende Zielscheibe**.

- Die Zielscheibe dreht sich kontinuierlich.
- Antippen wirft sofort eine Axt (kein Halten/Laden/Timing-Fenster mehr –
  das gab es in einer früheren Version, wurde auf Wunsch entfernt, um näher
  am Vorbild zu sein).
- Trifft man eine Stelle, an der schon eine Axt steckt → sie prallt ab.
  Das verbraucht einfach eine Axt aus dem Kontingent, beendet aber NICHT
  das ganze Spiel (siehe Level-System unten).
- Der einzige Skill: den richtigen Moment zum Antippen abpassen, damit die
  Axt in eine freie Lücke zwischen den schon steckenden Äxten trifft.

Rechtlich unbedenklich: Spielmechaniken sind nicht urheberrechtlich
geschützt, nur die konkrete Umsetzung (eigene Grafiken/Sounds/Code – haben
wir). Name/Branding "Knife Hit" wird nirgends verwendet.

### Level-System

- **100 Level** = 20 Schwierigkeitsstufen × 5 Varianten pro Stufe, PER FORMEL
  erzeugt (`generateLevel()` in `constants.ts`), nicht von Hand aufgeschrieben
  (bei 100 Stück unübersichtlich). Innerhalb einer Stufe gleiche Schwierigkeit
  (Axt-Anzahl, Grundtempo, Anzahl Hindernisse/Äpfel), nur genaue Platzierung
  von Äpfeln/vorplatzierten Äxten und exaktes Tempo variieren
  (`SPEED_MULTIPLIERS`) – für 5 spürbar unterschiedliche, gleich schwere
  Level pro Stufe. Level haben KEINE Namen mehr (auf Wunsch entfernt), nur
  die Nummer 1-100.
- Jedes Level hat eine feste Axt-Anzahl (steigt von 5 auf 8 über die Stufen),
  unten als Reihe von Axt-Icons sichtbar – geworfene Äxte werden dort grau.
- Am Brett hängen Äpfel (feste Positionen pro Level, jetzt AUSSERHALB des
  Randes an einem kleinen Stiel, nicht auf dem Holz). Trifft eine erfolgreich
  steckende Axt nah genug an einem Apfel, fällt er ab und zählt als
  **Spielwährung** (dauerhaft über alle Durchläufe gespeichert).
- Ab Stufe 2 starten Level mit bereits im Brett steckenden Äxten
  (`preplacedAxeAngles`) als Hindernisse von Anfang an, Anzahl steigt mit
  der Stufe (max. 3).
- Die Rotationsgeschwindigkeit steigt über die Stufen, variiert aber auch
  innerhalb einer Stufe (mal schneller, mal langsamer) statt nur stetig.
- Sind alle Äxte des Levels verworfen (egal ob getroffen oder nicht), ist das
  Level fertig → Ergebnis-Screen mit Trefferquote und gesammelten Äpfeln.
  Nicht letztes Level: Button "Weiter zu Level N+1" (Hauptaktion) plus
  kleinerer "Level nochmal spielen"-Button. Level 100 geschafft:
  Glückwunsch-Badge "Alle Level gemeistert!" statt Weiter-Button.
- Level-Fortschritt selbst ist NICHT gespeichert (immer Start bei Level 1
  nach Neuladen der Seite) – nur die Apfel-Währung bleibt erhalten. Bewusste
  Vereinfachung fürs Erste, siehe Offene To-dos.

## Tech-Stack

- Vite + React + TypeScript
- Capacitor (spätere Phase) für die native iOS-Verpackung
- Speicherung: localStorage im Web (dauerhafte Apfel-Währung)
- Kein Backend, keine Accounts, kein externes Game-Framework. Alles läuft lokal.

## Architektur

```
src/
  game/
    types.ts     GameState, StuckAxe, Apple, LevelConfig,
                  GamePhase (ready/flying/levelComplete)
    constants.ts  LEVELS (100 Stück, per generateLevel() erzeugt), Kollisions-/
                   Apfel-Trefferradius, Flugzeit
    engine.ts     Reine Winkel-Mathematik & Spiellogik (kein React):
                   normalizeAngle, angularDistance, computeBoardLocalAngle,
                   collidesWithStuckAxe, findHitApple
    storage.ts    Dauerhafte Apfel-Währung laden/speichern (localStorage)
    sound.ts      Soundeffekte per Web Audio API SELBST ERZEUGT (Oszillatoren +
                   Rausch-Bursts) – keine externen Audio-Dateien, keine
                   Lizenzfragen. playHitSound/playMissSound/playAppleSound/
                   playBreakSound. unlockAudio() muss innerhalb einer echten
                   Nutzer-Interaktion aufgerufen werden (Browser-Autoplay-Regel).
  hooks/
    useAxeGame.ts  Verbindet engine.ts mit React: Rotations-Loop
                    (requestAnimationFrame), Werfen per Antippen,
                    Zustandsmaschine ready -> flying -> ready,
                    nach der letzten Axt -> levelComplete
  components/
    Axe.tsx              Die Axt-Form (SVG), für fliegende UND steckende Äxte
    Apple.tsx            Der Apfel (SVG)
    TargetBoard.tsx      Die rotierende Zielscheibe inkl. Äxte + Äpfel
                          (forwardRef + useImperativeHandle, siehe Performance-
                          Abschnitt unten)
    AxeInventory.tsx     Reihe der verbleibenden/verbrauchten Äxte unten
    VineDecoration.tsx   Rein dekorative Ranken in den Bühnen-Ecken
    HUD.tsx              Level / Trefferquote / Äpfel-Währung oben
    LevelCompleteModal.tsx  Ergebnis-Screen nach der letzten Axt
  styles/theme.css  Alle Design-Werte als CSS-Variablen (Farben, Radien, Abstände)
```

Prinzip: `game/` kennt React nicht (pure Funktionen, leicht nachvollziehbar/
testbar), `hooks/useAxeGame.ts` ist die einzige Brücke zu React.

### Performance: Rotation läuft NICHT über React-State

`TargetBoard.tsx` dreht sich per eigenem `requestAnimationFrame`-Loop, der
direkt `element.style.transform` setzt – NICHT über React-State. Vorherige
Version hat den Winkel bei jedem Frame (60x/Sek.) in den State von
`useAxeGame` geschrieben, was bei jedem Frame die GESAMTE App neu gerendert
hat (HUD, Inventar, alles) und sich "unflüssig"/ruckelig angefühlt hat.
Jetzt: `TargetBoard` hält den Winkel in einer Ref und exposed ihn per
`useImperativeHandle` (`getAngleDeg()`), `useAxeGame` bekommt eine
`getBoardAngleDeg`-Callback-Funktion übergeben statt selbst zu rotieren, und
fragt den Winkel nur beim Wurf-Auflösen einmalig ab. Andere State-Änderungen
(Treffer, Level-Wechsel) lösen weiterhin normale React-Re-Renders aus – das
ist unkritisch, weil die selten passieren (nicht 60x/Sek.).

### Die Winkel-Logik (der kniffligste Teil, kurz erklärt)

- Die Zielscheibe rotiert kontinuierlich (Weltwinkel, 0° = oben, im Uhrzeigersinn).
- Der Einschlagpunkt ist immer an derselben Stelle auf dem BILDSCHIRM fixiert
  (unten an der Scheibe, `IMPACT_WORLD_ANGLE_DEG`).
- Eine steckende Axt merkt sich ihren Winkel im LOKALEN Koordinatensystem der
  Scheibe (`boardLocalAngleDeg = IMPACT_WORLD_ANGLE_DEG - aktueller Weltwinkel`),
  damit sie beim Rendern korrekt "mitrotiert", wenn sich die Scheibe weiterdreht.
- Kollisionsprüfung vergleicht den neuen lokalen Winkel gegen alle bereits
  steckenden Äxte (`COLLISION_ANGLE_TOLERANCE_DEG`).
- **Wichtiges Balancing:** Die Rotationsgeschwindigkeit der Scheibe muss immer
  deutlich schneller sein als "Kollisions-Toleranz ÷ Flugzeit", sonst kollidieren
  selbst schnell aufeinanderfolgende Würfe unfair mit der eigenen letzten Axt
  (war ein echter Bug in einer früheren Version).
- Es gab früher eine Halten-und-Loslassen-Timing-Mechanik (Lade-Regler mit
  "Sweet Spot"). Auf Wunsch entfernt – jetzt zählt nur noch die Position
  (Kollision mit vorherigen Äxten), kein Timing-Fenster mehr. Einfacher und
  näher am Vorbild "Knife Hit".

### Wichtiger Bug (behoben): Spiel blieb bei schnellem Tippen für immer hängen

Tippt man während eine Axt fliegt, wird der Tap gepuffert (`pendingThrowRef`)
und feuert automatisch, sobald die aktuelle Axt gelandet ist – sonst fühlt
sich schnelles Tippen "kaputt" an, weil Taps im kurzen 140ms-Flug einfach
verschluckt wurden. ABER: der Auflöse-`useEffect` in `useAxeGame.ts` hatte
ursprünglich nur `[state.phase, ...]` als Abhängigkeit. Wenn ein gepufferter
Tap den State direkt "fliegend -> fliegend" verkettet (ohne Zwischenstopp bei
"ready"), ändert sich `state.phase` NICHT – React führt den Effekt dann nicht
erneut aus, der Timer für die zweite Axt startet nie, und das Spiel blieb für
immer im "fliegend"-Zustand hängen (reproduziert mit einem automatisierten
120-Tap-Stresstest: Spiel blieb bei Level 1 stecken statt durchzuspielen).
**Fix:** Abhängigkeit auf `[state.phase, state.flyingAxe, getBoardAngleDeg]`
erweitert – `flyingAxe.startedAt` bekommt bei jeder neuen Axt einen frischen
Wert und löst den Effekt auch bei einer Verkettung zuverlässig erneut aus.
Nach dem Fix: derselbe Stresstest kommt bis Level 13 statt hängenzubleiben.

## Aktueller Stand

- [x] Grundgerüst: Vite+React+TS-Projekt, komplettes Spiel im Browser spielbar.
      Kernschleife (Laden/Werfen/Kollision) durchgetestet.
      Balancing-Bug gefunden und behoben (Rotationsgeschwindigkeit, siehe oben).
      Zweiter Bug gefunden und behoben (Sweet-Spot-Position, siehe oben) –
      gemeldet von Klaus: "manchmal prallt sie ohne Grund ab, und Klicken
      (statt Halten) geht immer".
- [x] Design-Politur: hochwertigere Axt (Tomahawk-Form, Metall-Gradient),
      Holz-Zielscheibe mit Wachstumsringen + Metallrand + Kettenaufhängung,
      Bruchbude-Szenerie im Hintergrund, Treffer-Partikel/Screen-Shake/
      Wackel-Animation als Juice.
- [x] Level-System: vom endlosen Highscore-Modus auf feste Level mit
      begrenzter Axt-Anzahl umgestellt (Level 1 = 5 Äxte), Axt-Inventar-Leiste
      unten, Äpfel am Brett als dauerhaft gespeicherte Spielwährung.
      Kollisions-Hitbox verkleinert (10° statt 16°) für etwas mehr Fairness.
      Kompletter Level-Durchlauf inkl. Apfel-Sammeln, Fehlwurf-ohne-Abbruch,
      Level-Abschluss und Neustart durchgetestet.
- [x] Timing-Mechanik (Lade-Regler) komplett entfernt – jetzt einfaches
      Antippen zum Werfen, näher am Vorbild "Knife Hit". Einziges
      Fail-Kriterium ist noch die Kollision mit einer bereits steckenden Axt.
- [x] Feinschliff nach Feedback: Äpfel sitzen jetzt am Rand (nah am
      Axt-Radius) statt in der Mitte. Flugzeit der Axt deutlich verkürzt
      (320ms -> 140ms) – WICHTIG: das ist bewusst kürzer als
      Kollisions-Toleranz/Board-Geschwindigkeit, damit schnelles
      Hintereinander-Tippen (Spammen) riskant ist und man dabei die eigene
      letzte Axt treffen kann (siehe Kommentar in `constants.ts`). Screen-Shake
      und Axt-Wackel-Animation deutlich abgeschwächt (weniger "Rückeln").
      Neuer "Holz bricht"-Effekt: trifft die letzte Axt des Levels sauber,
      zeigt die Zielscheibe Risse + einen kurzen Lichtblitz.
- [x] Zielscheibe aufgeräumt: Äpfel wirklich am Rand (Radius 92px, nah an
      Axt-Radius 96px) statt in der Mitte. Das "Pizzastück"-Lichteffekt
      (`target-board__shine`, ein Kegel-Gradient) entfernt. Das graue
      Rechteck über der Kette (`target-mount__bracket`) entfernt.
- [x] Soundeffekte: Treffer, Fehlwurf/Kollision, Apfel-Sammeln, Level-Ende
      ("Holz bricht") – alle per Web Audio API im Code erzeugt, keine
      Audio-Dateien (siehe `sound.ts` oben).
- [x] 10 Level gebaut mit steigender/wechselnder Schwierigkeit: mehr Äxte
      (5→8), variierende Rotationsgeschwindigkeit (55-170°/Sek, nicht nur
      steigend), teils mit vorplatzierten Äxten als Hindernisse. Level-
      Fortschritt mit "Weiter zu [Level]"-Button getestet (Level 1→2→3 inkl.
      korrekt vorplatzierter Axt in Level 3).
- [x] Feedback "unflüssig + langweilig" behoben: Board-Rotation läuft jetzt
      komplett außerhalb von React-State (siehe Architektur-Abschnitt oben) –
      behebt die Ruckler, die durch 60x/Sek. volle App-Re-Renders entstanden
      sind. Zusätzlich Design-Politur: kräftigere/gesättigtere Farben
      (Theme + Zielscheibe + HUD-Pillen jetzt farblich unterschieden statt
      alle gleich braun), pulsierende Bullseye, wärmerer/atmenderer
      Spotlight-Glow, treibende Staubpartikel im Hintergrund, glänzende
      HUD-Pillen, aufgeräumtere Axt-Inventar-Leiste.
- [x] Auf Feedback ("Namen weg", "100 Level", "buggt bei schnellem Werfen",
      "Äpfel wirklich außen", "detailreicher") reagiert:
      - Level-Namen entfernt, nur noch Nummern 1-100.
      - Von 10 Hand-Leveln auf 100 formel-generierte Level umgestellt
        (20 Schwierigkeitsstufen × 5 Varianten, siehe Level-System oben).
      - ECHTEN Freeze-Bug bei schnellem Tippen gefunden und behoben (siehe
        Bug-Abschnitt oben) – vorher blieb das Spiel bei Spam-Tippen komplett
        hängen, das war vermutlich der Kern des "buggt rum"-Feedbacks.
      - Äpfel hängen jetzt wirklich außerhalb des Bretts (Radius 112px, Board
        endet bei ~105px) an einem kleinen Holzstiel statt auf dem Holz zu
        kleben.
      - Zwei dekorative Efeu-Ranken (`VineDecoration.tsx`) in den
        Bühnen-Ecken für mehr Detail/weniger "leer".
- [ ] Weiterer Feinschliff nach Bedarf (evtl. mehr Juice, evtl. ein Shop für
      die gesammelten Äpfel).
- [ ] Phase 2: Capacitor + iOS-Plattform, Speicherung auf Capacitor Preferences.
- [ ] Phase 3: App-Icon, Splash-Screen, App-Store-Vorbereitung.

## Offene To-dos

- Klaus soll das Spiel selbst testen (`npm run dev`) und Feedback zu
  Schwierigkeit/Level-Balancing geben – Werte sind erste Schätzungen.
- Überlegen, ob der Level-Fortschritt (welches Level man erreicht hat)
  zusätzlich zur Apfel-Währung gespeichert werden soll.
- Überlegen, wofür die gesammelten Äpfel später verwendet werden (Shop?
  Freischalten weiterer Level?).

## Zusammenarbeits-Regeln (siehe auch Anleitung im Chat)

- Immer zuerst `git pull`, bevor man anfängt zu arbeiten.
- Kleine, häufige Commits mit klarer Beschreibung.
- Diese Datei nach jedem größeren Schritt aktualisieren und mit committen.
