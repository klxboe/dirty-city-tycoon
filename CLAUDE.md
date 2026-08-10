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
- Lässt man genau im richtigen Moment los (grüner Bereich im Regler, unten),
  fliegt die Axt sauber in die rotierende Zielscheibe.
- Zu früh oder zu spät losgelassen → die Axt prallt ab. Trifft man eine
  Stelle, an der schon eine Axt steckt → sie prallt auch ab. Beides
  verbraucht einfach eine Axt aus dem Kontingent, beendet aber NICHT das
  ganze Spiel (siehe Level-System unten).

Der Skill ist bewusst anders als bei Knife Hit: nicht "im richtigen Moment
tippen", sondern "die Ladezeit/den Schwung richtig dosieren".

### Level-System

- Jedes Level hat eine feste Anzahl Äxte (Level 1: 5 Stück), unten als Reihe
  von Axt-Icons sichtbar – geworfene Äxte werden dort grau.
- Am Brett hängen Äpfel (feste Positionen pro Level). Trifft eine erfolgreich
  steckende Axt nah genug an einem Apfel, fällt er ab und zählt als
  **Spielwährung** (dauerhaft über alle Durchläufe gespeichert, nicht nur
  diese Runde).
- Sind alle Äxte des Levels verworfen (egal ob getroffen oder nicht), ist das
  Level fertig → Ergebnis-Screen mit Trefferquote und gesammelten Äpfeln,
  "Nochmal spielen" startet das gleiche Level neu.
- Aktuell nur EIN Level, aber als Liste (`LEVELS` in `constants.ts`) angelegt,
  damit weitere Level leicht ergänzt werden können (mehr Äxte, andere
  Rotationsgeschwindigkeit/Zykluszeit/Toleranz, andere Apfel-Positionen).

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
                  GamePhase (ready/charging/flying/levelComplete)
    constants.ts  LEVELS (Liste aller Level-Konfigurationen), Kollisions-/
                   Apfel-Trefferradius, Flugzeit
    engine.ts     Reine Winkel-Mathematik & Spiellogik (kein React):
                   normalizeAngle, angularDistance, spinProgress, isGoodTiming,
                   computeBoardLocalAngle, collidesWithStuckAxe, findHitApple
    storage.ts    Dauerhafte Apfel-Währung laden/speichern (localStorage)
  hooks/
    useAxeGame.ts  Verbindet engine.ts mit React: Rotations-Loop
                    (requestAnimationFrame), Laden/Werfen per Pointer-Events,
                    Zustandsmaschine ready -> charging -> flying -> ready,
                    nach der letzten Axt -> levelComplete
  components/
    Axe.tsx              Die Axt-Form (SVG), für fliegende UND steckende Äxte
    Apple.tsx            Der Apfel (SVG)
    TargetBoard.tsx      Die rotierende Zielscheibe inkl. Äxte + Äpfel
    AxeInventory.tsx     Reihe der verbleibenden/verbrauchten Äxte unten
    PowerDial.tsx        Der Lade-Regler mit dem grünen "Sweet Spot"-Keil
    HUD.tsx              Level / Trefferquote / Äpfel-Währung oben
    LevelCompleteModal.tsx  Ergebnis-Screen nach der letzten Axt
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
- **Wichtig (Sweet-Spot-Position):** Der Sweet Spot in `isGoodTiming()` liegt
  bewusst bei `progress ≈ 0.5` (Zyklus-MITTE), nicht bei `progress ≈ 0` (Start).
  War anfangs falsch bei 0/1 – dadurch war ein sofortiges Loslassen (0ms halten)
  IMMER ein Treffer (0 liegt trivial innerhalb jeder Toleranz um 0), was die
  ganze Lade-Mechanik zu einem "einfach schnell klicken"-Exploit gemacht hat.
  Deswegen auch der grüne Keil im PowerDial bei 180° (unten), nicht bei 0° (oben).

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
- [ ] Weiterer Feinschliff nach Bedarf (Soundeffekte, evtl. weitere Juice,
      mehr Level, evtl. ein Shop für die gesammelten Äpfel).
- [ ] Phase 2: Capacitor + iOS-Plattform, Speicherung auf Capacitor Preferences.
- [ ] Phase 3: App-Icon, Splash-Screen, App-Store-Vorbereitung.

## Offene To-dos

- Klaus soll das Spiel selbst testen (`npm run dev`) und Feedback zu
  Schwierigkeit/Timing-Gefühl geben – Balancing-Werte sind erste Schätzungen.
- Weitere Level ergänzen (mehr Äxte, andere Geschwindigkeit/Toleranz, mehr
  Äpfel) – Struktur dafür steht bereits (`LEVELS`-Liste).
- Überlegen, wofür die gesammelten Äpfel später verwendet werden (Shop?
  Freischalten weiterer Level?).

## Zusammenarbeits-Regeln (siehe auch Anleitung im Chat)

- Immer zuerst `git pull`, bevor man anfängt zu arbeiten.
- Kleine, häufige Commits mit klarer Beschreibung.
- Diese Datei nach jedem größeren Schritt aktualisieren und mit committen.
