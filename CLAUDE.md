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
- **Zielen:** Wo man tippt, dahin fliegt die Axt. Die horizontale Tippposition
  relativ zur Scheibenmitte bestimmt den Einschlagpunkt – Mitte tippen trifft
  unten an der Scheibe, weiter links/rechts verschiebt den Einschlag um bis zu
  `MAX_AIM_SPREAD_DEG` (75°) zur Seite. Damit ist das Spiel nicht mehr nur
  Timing, sondern Timing + Zielen.
- Trifft man eine Stelle, an der schon eine Axt steckt → **sofort Game Over**.
  Der ganze Lauf endet und startet wieder bei **Level 1**. Münzen aus bereits
  abgeschlossenen Leveln bleiben erhalten, nur das angefangene Level bringt nichts.
- Der Skill: den richtigen Moment UND die richtige Stelle treffen, damit die
  Axt in eine freie Lücke zwischen den schon steckenden Äxten geht – und dabei
  möglichst nah an den Äpfeln landen.

Rechtlich unbedenklich: Spielmechaniken sind nicht urheberrechtlich
geschützt, nur die konkrete Umsetzung (eigene Grafiken/Sounds/Code – haben
wir). Name/Branding "Knife Hit" wird nirgends verwendet.

### Level-System

- **100 Level** = 20 Schwierigkeitsstufen × 5 Varianten pro Stufe, PER FORMEL
  erzeugt (`generateLevel()` in `constants.ts`), nicht von Hand aufgeschrieben
  (bei 100 Stück unübersichtlich). Die Stufe bestimmt Axt-Anzahl, Anzahl
  Hindernisse und Äpfel; innerhalb einer Stufe variieren die Platzierung von
  Äpfeln/vorplatzierten Äxten und das Dreh-Muster – für 5 spürbar
  unterschiedliche Level pro Stufe. Level haben KEINE Namen mehr (auf Wunsch
  entfernt), nur die Nummer 1-100.
- **Dreh-Muster** (`spinPattern`) sorgen für Abwechslung, ohne an den
  Grundwerten zu drehen: `steady` (gleichmäßig), `pulse` (Tempo schwankt weich)
  und `reverse` (Scheibe dreht periodisch die Richtung um). Stufe 1-3 laufen
  bewusst nur `steady`, damit man die Grundmechanik lernt; ab Stufe 4 kommt
  `pulse` dazu, ab Stufe 8 auch `reverse`.
  WICHTIG: Kein Muster darf die Geschwindigkeit auf ~0 bringen. Steht die
  Scheibe kurz still, landen zwei schnell geworfene Äxte an derselben Stelle –
  mit der Game-Over-Regel wäre das ein unfairer Instant-Tod. Deshalb sinkt der
  Puls-Faktor nie unter 0.55 und der Richtungswechsel springt hart, statt weich
  durch null zu gehen.
- **Die Drehgeschwindigkeit steigt mit JEDEM Level** (streng steigend über alle
  100 Level, nicht mehr pro Stufe schwankend): Level 1 = 55°/Sek., Level 50 =
  126°/Sek., Level 100 = 199°/Sek. Je schneller die Scheibe, desto kürzer das
  Zeitfenster, in dem ein bestimmter Apfel am Einschlagpunkt vorbeikommt –
  genau das macht das gezielte Apfel-Sammeln nach hinten raus schwerer.
- Jedes Level hat eine feste Axt-Anzahl (steigt von 5 auf 8 über die Stufen),
  unten als Reihe von Axt-Icons sichtbar – geworfene Äxte werden dort grau.
- Am Brett hängen Äpfel (feste Positionen pro Level, AUSSERHALB des Randes an
  einem kleinen Stiel, nicht auf dem Holz). Trifft eine erfolgreich steckende
  Axt nah genug an einem Apfel, fällt er ab und bringt Münzen.
- Ab Stufe 2 starten Level mit bereits im Brett steckenden Äxten
  (`preplacedAxeAngles`) als Hindernisse von Anfang an, Anzahl steigt mit
  der Stufe (max. 3).
- Ein Level endet auf zwei Arten: alle Äxte sauber verworfen → geschafft, ODER
  eine Axt trifft eine steckende Axt → Game Over (`GameOverModal.tsx`).
- Ergebnis-Screen nach geschafftem Level zeigt eingesammelte Äpfel und die
  verdienten Münzen (zählen sichtbar hoch). Nicht letztes Level: Button
  "Weiter zu Level N+1" plus "Werkstatt öffnen". Level 100 geschafft:
  Glückwunsch-Badge "Alle Level gemeistert!" statt Weiter-Button.

### Münzen, Läufe und die Werkstatt (Shop)

- **Ein Lauf geht immer von Level 1 aufwärts.** Ein Game Over beendet den Lauf
  komplett – der nächste Versuch startet wieder bei Level 1. Das höchste je
  erreichte Level bleibt als "Bestmarke" gespeichert.
- **Münzen** sind die einzige Währung (früher waren es Äpfel; alte Spielstände
  werden beim ersten Start umgerechnet, siehe `loadSave()` in `storage.ts`).
  Es gibt sie NUR beim Abschluss eines Levels:
  `gesammelte Äpfel × COINS_PER_APPLE (5) + levelCompletionBonus(levelIndex)`
  (10 + Levelnummer). Ein Game Over schreibt nichts gut – deshalb lohnt sich
  vorsichtiges Zielen statt Spammen.
- **Werkstatt** (`Shop.tsx`, erreichbar über die Münz-Pille im HUD und über
  beide Modals): rein kosmetische Axt- und Scheiben-Designs. Kaufen zieht die
  Münzen ab und rüstet den Skin direkt aus; bereits gekaufte lassen sich frei
  wechseln. Definitionen und Preise stehen in `game/shop.ts`.
  **Kein Skin verändert das Balancing** – nur Farben und Glanz.
  Neuen Skin anlegen = Eintrag in `shop.ts` + Farbwerte in `Axe.tsx`
  (`AXE_STYLES`) bzw. `TargetBoard.css` (`.board-skin--<id>`).
- Gespeichert wird alles zusammen als JSON unter `axe-throw-save-v2`:
  Münzen, gekaufte Skins, ausgerüstete Skins, Bestmarke. Der Level-Fortschritt
  eines laufenden Durchgangs ist bewusst NICHT dabei.

## Tech-Stack

- Vite + React + TypeScript
- Capacitor (spätere Phase) für die native iOS-Verpackung
- Speicherung: localStorage im Web (Münzen, Skins, Bestmarke)
- Kein Backend, keine Accounts, kein externes Game-Framework. Alles läuft lokal.

## Architektur

```
src/
  game/
    types.ts     GameState, StuckAxe, Apple, LevelConfig, SpinPattern,
                  GamePhase (ready/flying/levelComplete/gameOver)
    constants.ts  LEVELS (100 Stück, per generateLevel() erzeugt), Kollisions-/
                   Apfel-Trefferradius, Flugzeit, Ziel-Spreizung, Münz-Wirtschaft
    engine.ts     Reine Winkel-Mathematik & Spiellogik (kein React):
                   normalizeAngle, angularDistance, aimToImpactWorldAngle,
                   computeBoardLocalAngle, collidesWithStuckAxe, findHitApple
    shop.ts       Skin-Definitionen und Preise (Äxte + Scheiben), rein kosmetisch
    storage.ts    Spielstand laden/speichern (Münzen, Skins, Bestmarke) inkl.
                   Migration des alten Apfel-Zählers
    sound.ts      Soundeffekte per Web Audio API SELBST ERZEUGT (Oszillatoren +
                   Rausch-Bursts) – keine externen Audio-Dateien, keine
                   Lizenzfragen. playHitSound/playMissSound/playAppleSound/
                   playBreakSound. unlockAudio() muss innerhalb einer echten
                   Nutzer-Interaktion aufgerufen werden (Browser-Autoplay-Regel).
  hooks/
    useAxeGame.ts  Verbindet engine.ts mit React: Werfen per Antippen,
                    Zustandsmaschine ready -> flying -> ready, nach der letzten
                    Axt -> levelComplete, bei Kollision -> gameOver.
                    Auch Münz-Gutschrift und Shop-Käufe.
    useCountUp.ts  Zählt eine Zahl per rAF hoch (Belohnungs-Anzeige)
  components/
    Axe.tsx              Die Axt-Form (SVG) mit Skin-Varianten (AXE_STYLES)
    Apple.tsx            Der Apfel (SVG)
    Coin.tsx             Die Münze (SVG), Symbol der Spielwährung
    TargetBoard.tsx      Die rotierende Zielscheibe inkl. Äxte + Äpfel
                          (forwardRef + useImperativeHandle, siehe Performance-
                          Abschnitt unten)
    AxeInventory.tsx     Reihe der verbleibenden/verbrauchten Äxte unten
    VineDecoration.tsx   Rein dekorative Ranken in den Bühnen-Ecken
    HUD.tsx              Level / Äxte / Münzen oben. Die Münz-Pille ist zugleich
                          der Werkstatt-Button.
    Shop.tsx             Die Werkstatt: Skins kaufen und ausrüsten
    LevelCompleteModal.tsx  Ergebnis-Screen nach der letzten Axt
    GameOverModal.tsx    Screen nach Treffer auf die eigene Axt (nutzt dieselbe
                          LevelCompleteModal.css)
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
- Der Einschlagpunkt auf dem BILDSCHIRM ergibt sich aus der Tippposition:
  `aimToImpactWorldAngle()` rechnet die horizontale Tippposition (-1 = linker
  Scheibenrand, 0 = Mitte, +1 = rechter Rand) in einen Weltwinkel um, ausgehend
  von `IMPACT_WORLD_ANGLE_DEG` (180° = unten) ± `MAX_AIM_SPREAD_DEG` (75°).
  Rechts tippen = kleinerer Winkel, links = größerer (Weltwinkel laufen im
  Uhrzeigersinn). Die Flug-Animation nutzt denselben Winkel, um über die
  CSS-Variablen `--flight-dx`/`--flight-dy` sichtbar dorthin zu fliegen.
- Eine steckende Axt merkt sich ihren Winkel im LOKALEN Koordinatensystem der
  Scheibe (`boardLocalAngleDeg = Einschlag-Weltwinkel - aktueller Weltwinkel`),
  damit sie beim Rendern korrekt "mitrotiert", wenn sich die Scheibe weiterdreht.
- Kollisionsprüfung vergleicht den neuen lokalen Winkel gegen alle bereits
  steckenden Äxte (`COLLISION_ANGLE_TOLERANCE_DEG`).
- **Wichtiges Balancing:** Bei 55°/Sek. (Level 1) dreht sich die Scheibe in der
  140ms-Flugzeit nur ~7.7° – WENIGER als die Kollisions-Toleranz (10°). Wer in
  die gleiche Richtung spammt, trifft also garantiert die eigene letzte Axt und
  ist raus. Das ist seit der Game-Over-Regel bewusst so: Spammen wird bestraft,
  getimtes Werfen belohnt. Zielen in eine andere Richtung bleibt jederzeit sicher.
- Es gab früher eine Halten-und-Loslassen-Timing-Mechanik (Lade-Regler mit
  "Sweet Spot"). Auf Wunsch entfernt. Seit der Ziel-Mechanik zählt wieder beides:
  WANN man tippt (Rotation) und WO man tippt (Einschlagpunkt).

### Gepufferte Taps: warum das NICHT in der setState-Updater-Funktion stehen darf

Tippt man während eine Axt fliegt, wird der Tap gepuffert (`pendingAimRef`)
und feuert automatisch, sobald die aktuelle Axt gelandet ist – sonst fühlt
sich schnelles Tippen "kaputt" an, weil Taps im kurzen 140ms-Flug einfach
verschluckt wurden.

Frühere Versionen haben diesen Puffer INNERHALB der `setState`-Updater-Funktion
gelesen und geleert ("wenn gepuffert, direkt weiterfliegen"). Das ist eine Falle:
React ruft Updater-Funktionen im **StrictMode** (Entwicklungsmodus, ist in
`main.tsx` aktiv) absichtlich **zweimal** auf und behält das Ergebnis des
ZWEITEN Aufrufs. Der erste Durchlauf leert den Puffer, der zweite sieht ihn
dann leer – und der gepufferte Wurf verschwand stillschweigend. Messbar war das
so: zweimal schnell tippen löste nur EINEN Wurf aus statt zwei.

**Regel daraus:** Die Updater-Funktion im Auflöse-Effekt ist bewusst REIN –
keine Ref-Mutationen, kein `performance.now()`, keine hochgezählten Zähler
(die Axt-`id` ist deshalb einfach die laufende Wurfnummer `axesThrown`).
Das Nachziehen des gepufferten Taps passiert in einem SEPARATEN `useEffect`,
der auf `phase === 'ready'` reagiert. Der läuft zuverlässig erneut, weil die
Phase dabei immer `flying -> ready -> flying` wechselt.

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
- [x] Auf Klaus' Feedback drei Kernmechaniken geändert:
      - **Zielen eingebaut:** Wo man tippt, dahin fliegt die Axt (horizontale
        Tippposition -> Einschlagwinkel, ±75°). Flug-Animation fliegt sichtbar
        dorthin statt immer stur nach unten-Mitte.
      - **Tempo steigt jetzt mit jedem Level** statt innerhalb einer Stufe zu
        schwanken (55°/Sek. in Level 1 bis 199°/Sek. in Level 100). Macht das
        Apfel-Sammeln nach hinten raus gezielt schwerer.
      - **Eigene Axt treffen = Game Over** (vorher: kostete nur eine Axt, Level
        lief weiter). Gesammelte Äpfel des Versuchs sind damit verloren.
      Dabei gefunden und behoben: gepufferte Taps gingen im Entwicklungsmodus
      verloren, weil der Puffer in einer setState-Updater-Funktion geleert wurde
      (StrictMode-Doppelaufruf, siehe eigener Abschnitt oben). Doppel-Tippen
      löste dadurch nur einen Wurf aus.
- [x] Großer Ausbau zum "richtigen" Handyspiel:
      - **Lauf-Struktur:** Game Over wirft auf Level 1 zurück, Bestmarke wird
        gespeichert. Der Lauf hat dadurch echten Einsatz.
      - **Münzen als Währung** (ersetzen die Äpfel; alte Stände werden migriert):
        pro Level Äpfel × 5 + Bonus (10 + Levelnummer), nur bei Level-Abschluss.
      - **Werkstatt/Shop** mit 5 Axt- und 4 Scheiben-Designs zum Kaufen und
        Wechseln, rein kosmetisch.
      - **Dreh-Muster** pro Level (gleichmäßig / pulsierend / Richtungswechsel)
        für mehr Abwechslung über die 100 Level.
      - **Mehr Juice:** Bewegungsschweif hinter der fliegenden Axt, Schockwelle
        und größerer Späne-Burst beim Treffer, kräftigerer Screen-Shake,
        eingesammelter Apfel fliegt als Münze zur Anzeige, Münz-Pille blitzt auf,
        Münzen zählen im Ergebnis-Screen sichtbar hoch.
      Durchgetestet: Kauf + Ausrüsten beider Skin-Arten, Münz-Rechnung, Level 1-4
      am Stück, Game Over samt Rückwurf auf Level 1 mit erhaltenen Münzen.
- [ ] Weiterer Feinschliff nach Bedarf.
- [ ] Phase 2: Capacitor + iOS-Plattform, Speicherung auf Capacitor Preferences.
- [ ] Phase 3: App-Icon, Splash-Screen, App-Store-Vorbereitung.

## Offene To-dos

- Selbst durchspielen und Feedback zum Balancing geben – die Werte sind
  Schätzungen. Zwei konkrete Fragen:
  1. **Härte des Rückwurfs:** Ein Game Over kostet den ganzen Lauf. Wer in
     Level 30 stirbt, fängt bei Level 1 an. Fühlt sich das nach "nochmal!" an
     oder nach Strafe? Mögliche Abmilderungen: Leben pro Lauf, oder Level in
     10er-Blöcken (Neustart nur zum Blockanfang).
  2. **Münz-Tempo:** Aktuell ~15-25 Münzen pro Level. Der erste Skin (150)
     kommt also nach ~7-10 Leveln, der teuerste (2000) sehr viel später.
     Zu schnell, zu langsam?
- Apfel-Ausbeute prüfen: mit `APPLE_HIT_TOLERANCE_DEG = 24` erwischt man pro
  Level oft nur 1 von 2 Äpfeln. Da Äpfel jetzt Münzen bringen, wirkt das direkt
  aufs Tempo der Shop-Progression.
- Mehr Shop-Inhalte denkbar, wenn die Struktur gefällt (z.B. Spuren/Trails der
  Axt, Hintergrund-Kulissen, Sound-Sets).

## Zusammenarbeits-Regeln (siehe auch Anleitung im Chat)

- Immer zuerst `git pull`, bevor man anfängt zu arbeiten.
- Kleine, häufige Commits mit klarer Beschreibung.
- Diese Datei nach jedem größeren Schritt aktualisieren und mit committen.
