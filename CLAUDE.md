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

Ein simples, süchtig machendes Arcade-Handyspiel im Stil von "Knife Hit", aber
mit eigenem Twist: **Axt-Wurf mit Schwung-Kontrolle**.

- Man hält den Bildschirm gedrückt, um zu "laden" – ein Regler dreht sich
  dabei kontinuierlich.
- Lässt man genau im richtigen Moment los (grüner Bereich im Regler), fliegt
  die Axt sauber in die rotierende Zielscheibe.
- Zu früh oder zu spät losgelassen → die Axt prallt ab → Game Over.
- Trifft man eine Stelle, an der schon eine Axt steckt → auch Game Over.
- Mit jedem Treffer wird es schwerer: Die Scheibe dreht sich schneller, der
  Lade-Zyklus wird kürzer, das Zeitfenster für einen sauberen Treffer schrumpft.
- Score = Anzahl sauberer Treffer in Folge. Bestwert wird lokal gespeichert.

Der Skill ist bewusst anders als bei Knife Hit: nicht "im richtigen Moment
tippen", sondern "die Ladezeit/den Schwung richtig dosieren".

## Tech-Stack

- Vite + React + TypeScript
- Capacitor (spätere Phase) für die native iOS-Verpackung
- Speicherung: localStorage im Web (Bestwert)
- Kein Backend, keine Accounts, kein externes Game-Framework. Alles läuft lokal.

## Architektur

```
src/
  game/
    types.ts     GameState, StuckAxe, GamePhase (ready/charging/flying/gameover)
    constants.ts  Alle Balancing-Zahlen an einem Ort
    engine.ts     Reine Winkel-Mathematik & Spiellogik (kein React):
                   normalizeAngle, angularDistance, spinProgress, isGoodTiming,
                   computeBoardLocalAngle, collidesWithStuckAxe,
                   boardSpeedForScore/spinPeriodForScore/sweetSpotToleranceForScore
                   (Schwierigkeitskurve)
    storage.ts    Bestwert laden/speichern (localStorage)
  hooks/
    useAxeGame.ts  Verbindet engine.ts mit React: Rotations-Loop
                    (requestAnimationFrame), Laden/Werfen per Pointer-Events,
                    Zustandsmaschine ready -> charging -> flying -> ready/gameover
  components/
    Axe.tsx          Die Axt-Form (SVG), für fliegende UND steckende Äxte
    TargetBoard.tsx  Die rotierende Zielscheibe inkl. aller steckenden Äxte
    PowerDial.tsx    Der Lade-Regler mit dem grünen "Sweet Spot"-Keil
    HUD.tsx          Score/Bestwert oben
    GameOverModal.tsx
  styles/theme.css  Alle Design-Werte als CSS-Variablen (Farben, Radien, Abstände)
```

Prinzip: `game/` kennt React nicht (pure Funktionen, leicht nachvollziehbar/
testbar), `hooks/useAxeGame.ts` ist die einzige Brücke zu React.

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
  selbst perfekt getimte, schnell aufeinanderfolgende Würfe unfair mit der
  eigenen letzten Axt (das war ein echter Bug beim ersten Bauen, ist jetzt
  behoben: `BASE_BOARD_SPEED_DEG_PER_SEC = 95`).

## Aktueller Stand

- [x] Grundgerüst: Vite+React+TS-Projekt, komplettes Spiel im Browser spielbar.
      Kernschleife (Laden/Werfen/Kollision/Highscore) durchgetestet.
      Balancing-Bug gefunden und behoben (siehe oben, Rotationsgeschwindigkeit).
- [ ] Feinschliff: Visuelles Feedback bei Treffer/Fehlwurf (Juice: Partikel,
      Screen-Shake o.ä.), evtl. Soundeffekte.
- [ ] Phase 2: Capacitor + iOS-Plattform, Speicherung auf Capacitor Preferences.
- [ ] Phase 3: App-Icon, Splash-Screen, App-Store-Vorbereitung.

## Offene To-dos

- Klaus soll das Spiel selbst testen (`npm run dev`) und Feedback zu
  Schwierigkeit/Timing-Gefühl geben – Balancing-Werte sind erste Schätzungen.
- Ggf. Juice/Polish-Runde vor Phase 2.

## Zusammenarbeits-Regeln (siehe auch Anleitung im Chat)

- Immer zuerst `git pull`, bevor man anfängt zu arbeiten.
- Kleine, häufige Commits mit klarer Beschreibung.
- Diese Datei nach jedem größeren Schritt aktualisieren und mit committen.
