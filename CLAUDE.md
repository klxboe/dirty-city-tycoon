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

- **10 Level** (`LEVELS` in `constants.ts`), jedes mit fester Axt-Anzahl
  (5-8 Stück), unten als Reihe von Axt-Icons sichtbar – geworfene Äxte werden
  dort grau.
- Am Brett hängen Äpfel (feste Positionen pro Level, jetzt am Rand). Trifft
  eine erfolgreich steckende Axt nah genug an einem Apfel, fällt er ab und
  zählt als **Spielwährung** (dauerhaft über alle Durchläufe gespeichert).
- Manche Level starten mit bereits im Brett steckenden Äxten
  (`preplacedAxeAngles`) als Hindernisse von Anfang an.
- Die Rotationsgeschwindigkeit variiert bewusst pro Level (mal schneller,
  mal langsamer) statt nur stetig zu steigen.
- Sind alle Äxte des Levels verworfen (egal ob getroffen oder nicht), ist das
  Level fertig → Ergebnis-Screen mit Trefferquote und gesammelten Äpfeln.
  Nicht letztes Level: Button "Weiter zu [nächstes Level]" (Hauptaktion) plus
  kleinerer "Level nochmal spielen"-Button. Letztes Level (10) geschafft:
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
    constants.ts  LEVELS (Liste aller Level-Konfigurationen), Kollisions-/
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
    AxeInventory.tsx     Reihe der verbleibenden/verbrauchten Äxte unten
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
  selbst schnell aufeinanderfolgende Würfe unfair mit der eigenen letzten Axt
  (war ein echter Bug in einer früheren Version).
- Es gab früher eine Halten-und-Loslassen-Timing-Mechanik (Lade-Regler mit
  "Sweet Spot"). Auf Wunsch entfernt – jetzt zählt nur noch die Position
  (Kollision mit vorherigen Äxten), kein Timing-Fenster mehr. Einfacher und
  näher am Vorbild "Knife Hit".

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
