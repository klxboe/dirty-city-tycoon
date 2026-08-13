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
  Der Lauf endet und startet am **Anfang des aktuellen 10er-Blocks** neu (wer in
  Level 34 stirbt, macht bei 31 weiter). Münzen aus bereits abgeschlossenen
  Leveln bleiben erhalten, nur das angefangene Level bringt nichts.
- Der Skill: den richtigen Moment UND die richtige Stelle treffen, damit die
  Axt in eine freie Lücke zwischen den schon steckenden Äxten geht – und dabei
  möglichst nah an den Äpfeln landen.

Rechtlich unbedenklich: Spielmechaniken sind nicht urheberrechtlich
geschützt, nur die konkrete Umsetzung (eigene Grafiken/Sounds/Code – haben
wir). Name/Branding "Knife Hit" wird nirgends verwendet.

### Level-System

- **100 Level**, PER FORMEL aus der Levelnummer erzeugt (`generateLevel()` in
  `constants.ts`), nicht von Hand aufgeschrieben (bei 100 Stück unübersichtlich).
  Level haben KEINE Namen, nur die Nummer 1-100.
- **Die Schwierigkeits-Kurve hängt an der LEVELNUMMER, nicht an "Stufen zu je 5".**
  Das war eine bewusste Korrektur: die erste Fassung änderte in den ersten 16
  Leveln praktisch nichts (immer 5 Äxte, 2 Äpfel, keine Hindernisse, gleichmäßige
  Drehung, +1,4°/Sek. pro Level – das merkt niemand). Das erste Hindernis kam in
  Level 31, der erste Richtungswechsel in Level 38. Wer nach fünf Minuten
  aufhörte, hatte vom Spiel nichts gesehen. Jetzt kommt jede Zutat in den ersten
  ~15 Leveln mindestens einmal vor, danach wird nur noch nachgeschärft:
  | ab Level | Änderung |
  |---|---|
  | 3 | Pulsieren kommt dazu, erstes Hindernis (`obstacleCountFor`) |
  | 8 | Richtungswechsel kommt dazu |
  | 11 | 6 Äxte |
  | 14 | 2 Hindernisse |
  | 21 | 7 Äxte |
  | 26 | 3 Hindernisse, 3 Äpfel |
  | 31 | 8 Äxte |
  | 51 | 4 Äpfel |
- **Dreh-Muster** (`spinPattern`) sorgen für Abwechslung, ohne an den
  Grundwerten zu drehen: `steady` (gleichmäßig), `pulse` (Tempo schwankt weich)
  und `reverse` (Scheibe dreht periodisch die Richtung um).
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
- Jedes Level hat eine feste Axt-Anzahl (5-8, siehe Tabelle oben), am linken
  Bühnenrand als senkrechte Reihe sichtbar – geworfene Äxte werden dort grau.
- Am Brett hängen Äpfel (feste Positionen pro Level, AUSSERHALB des Randes an
  einem kleinen Stiel, nicht auf dem Holz). Trifft eine erfolgreich steckende
  Axt nah genug an einem Apfel, **fällt er sichtbar herunter** und bringt Münzen.
  Der fallende Apfel liegt in einer eigenen, NICHT rotierenden Ebene
  (`.target-mount__falling`) – im rotierenden Brett würde er beim Fallen
  mitkreiseln statt nach unten zu fallen.
- Level starten je nach Nummer mit bereits im Brett steckenden Äxten
  (`preplacedAxeAngles`) als Hindernisse (max. 3).
- Ein Level endet auf zwei Arten: alle Äxte sauber verworfen → geschafft, ODER
  eine Axt trifft eine steckende Axt → Game Over (`GameOverModal.tsx`).
- Ergebnis-Screen nach geschafftem Level zeigt eingesammelte Äpfel und die
  verdienten Münzen (zählen sichtbar hoch). Nicht letztes Level: Button
  "Weiter zu Level N+1" plus "Werkstatt öffnen". Level 100 geschafft:
  Glückwunsch-Badge "Alle Level gemeistert!" statt Weiter-Button.

### Boss-Level

- **Jedes 5. Level ist ein Boss** (`BOSS_EVERY`, `bossFruitForLevel()` in
  `constants.ts`). Statt Holz ist die Zielscheibe dann eine aufgeschnittene
  Frucht – Wassermelone, Orange, Kiwi, Drachenfrucht, Ananas, Zitrone,
  Blaubeere, Granatapfel, Kokosnuss, Traube (`BOSS_FRUITS` in `shop.ts`).
  Die Liste wiederholt sich, Level 5-50 decken alle zehn ab.
- Boss-Level sind eine Prüfung: eine Axt mehr und +12°/Sek. Tempo. Das
  Frucht-Design überschreibt für dieses Level das ausgerüstete Scheiben-Design.
- **Belohnung:** die passende Frucht-Axt, geschenkt. Hat man sie schon (ab der
  zweiten Runde durch die Liste), gibt es stattdessen Münzen
  (`BOSS_REPEAT_BONUS`). Die Frucht-Äxte sind NICHT käuflich – sie stehen im
  Shop unter "Beute" und zeigen dort, welches Boss-Level sie freischaltet.
### Münzen, Läufe und die Werkstatt (Shop)

- **Die 100 Level sind in 10er-Blöcke gruppiert** (`LEVELS_PER_BLOCK`,
  `blockStartIndex()` in `constants.ts`). Ein Game Over wirft nicht bis Level 1
  zurück, sondern nur an den Anfang des aktuellen Blocks – Level 1, 11, 21, …
  So bleibt der Einsatz spürbar, ohne dass ein später Fehler den ganzen
  Fortschritt kostet. Das höchste je erreichte Level bleibt als "Bestmarke"
  gespeichert. Die Punktreihe im HUD zeigt die Position im aktuellen Block.
- **Münzen** sind die einzige Währung (früher waren es Äpfel; alte Spielstände
  werden beim ersten Start umgerechnet, siehe `loadSave()` in `storage.ts`).
  Es gibt sie NUR beim Abschluss eines Levels – ein Game Over schreibt nichts
  gut, deshalb lohnt sich vorsichtiges Zielen statt Spammen. Die Rechnung steht
  in `computeReward()` (`useAxeGame.ts`) und wird im Ergebnis-Screen
  aufgeschlüsselt, damit sichtbar ist, WOFÜR es Münzen gab:
  | Posten | Wert |
  |---|---|
  | Äpfel | je 5 (`COINS_PER_APPLE`) |
  | Level geschafft | 10 + Levelnummer |
  | Alle Äpfel erwischt | +25 (`PERFECT_APPLE_BONUS`) |
  | 10er-Block geschafft | 100 × Blocknummer |
  | Boss schon besiegt | +150 statt neuer Axt |
  | **Serie** | ×1,25 je 5 Level ohne Game Over, max ×2 |
- **Die Serie** (`streak`) ist der Grund, nicht zu sterben: sie zählt Level ohne
  Game Over und multipliziert alle Münzen. Ein Game Over setzt sie auf 0. Im HUD
  taucht sie erst ab 5 auf – vorher wäre sie nur eine Zahl ohne Wirkung.
- **Werkstatt** (`Shop.tsx`, erreichbar über den Münzstand im HUD, den
  Startbildschirm und beide Modals): rein kosmetische Designs in drei Reitern –
  Äxte, Scheiben, Beute (die Boss-Äxte). Kaufen zieht die Münzen ab und rüstet
  direkt aus; Gekauftes lässt sich frei wechseln.
  **Kein Design verändert das Balancing** – nur Farben und Glanz.
- **Farbwerte stehen als DATEN in `game/shop.ts`** (`BOARD_STYLES`, `AXE_STYLES`),
  nicht im CSS. `TargetBoard` und die Shop-Vorschau setzen sie über
  `boardStyleVars()` als CSS-Variablen inline. Ein neues Design braucht deshalb
  nur einen Eintrag in `shop.ts` – vorher brauchte es zusätzlich einen CSS-Block
  je Skin, was mit den zehn Boss-Früchten unhaltbar geworden wäre.
- Gespeichert wird alles zusammen als JSON unter `axe-throw-save-v2`: Münzen,
  besessene und ausgerüstete Designs, Bestmarke, **aktuelles Level, Serie,
  Ton-Einstellung** und ob die Einstiegs-Erklärung schon lief. Dass der
  Lauf-Fortschritt mitgespeichert wird, ist wichtig fürs Handy: ohne das fing
  man nach jedem App-Wechsel wieder bei Level 1 an.

### Startbildschirm und Einstellungen

- `StartScreen.tsx` ist der erste Bildschirm: Titel, Bestmarke, Münzstand und
  je nach Stand "Los geht's" oder "Weiter – Level N" (plus "Von Level 1
  starten"). Beim allerersten Start stehen dort zusätzlich die vier Regeln –
  danach nie wieder (`tutorialSeen` im Spielstand).
- `SettingsModal.tsx`: Ton/Vibration an-aus und "Fortschritt zurücksetzen"
  (mit Rückfrage, weil es alles löscht).
- **Vibration** (`vibrate()` in `sound.ts`) bei Treffer, Apfel und Game Over.
  Läuft über denselben Schalter wie der Ton. iOS-Safari kennt
  `navigator.vibrate` nicht und ignoriert das stillschweigend.
- **`prefers-reduced-motion`** schaltet Screen-Shake, Staub und Puls-Effekte ab
  (siehe Ende von `App.css`). Spielmechanik-Animationen wie Axt-Flug und
  Scheibendrehung bleiben bewusst – ohne sie wäre das Spiel nicht spielbar.

## Auf dem Handy spielen (ohne App Store)

Das Spiel läuft komplett im Browser – man braucht keinen Build und keinen Mac,
um es auf dem eigenen Handy zu testen:

1. `npm run dev` auf dem PC starten. Vite bindet dank `server.host: true` in
   `vite.config.ts` ans ganze WLAN und gibt beim Start eine Network-Adresse aus
   (`http://<PC-IP>:5173/`).
2. Handy ins **gleiche WLAN**, diese Adresse im Browser öffnen.
3. Im Browser-Menü **"Zum Home-Bildschirm"** wählen. Danach startet das Spiel
   über ein eigenes Icon im Vollbild, ohne Browserleisten.

Damit Schritt 3 funktioniert, liegen in `public/` ein `manifest.webmanifest`
und PNG-Icons. **iOS ignoriert das Manifest weitgehend** und braucht die
eigenen `apple-*`-Meta-Tags in `index.html`; `apple-touch-icon` muss ein PNG
sein, SVG wird dort nicht unterstützt. Die Icons werden von einem
Pillow-Skript gezeichnet (siehe Commit) – bewusst keine zusätzliche
Build-Abhängigkeit im Projekt.

Grenzen dieser Variante: Der PC muss laufen, und es ist kein echter App-Store-
Build. Für **iOS braucht es zwingend einen Mac mit Xcode** – auf Windows lässt
sich kein iOS-Build erzeugen. Ein Android-Build via Capacitor ginge dagegen
auch unter Windows.

### Wenn der WLAN-Weg nicht klappt: eine Datei zum Mitnehmen

```bash
npm run build:single
```

erzeugt `dist-single/axe-throw.html` – **eine einzige Datei mit allem drin**
(~300 kB). Die kopiert man aufs Handy (Kabel, Mail an sich selbst, Cloud) und
öffnet sie direkt. Kein Server, kein WLAN, nichts öffentlich im Netz.

Zwei Fallstricke, die den Aufbau erklären (`vite.config.single.ts`,
`scripts/bundle-single.mjs`):

- **Kein ES-Modul.** Ein `<script type="module">` wird über `file://` durch die
  CORS-Regeln blockiert – die Seite bliebe schwarz. Deshalb baut die
  Single-Config nach `format: 'iife'`.
- **Ersetzungs-FUNKTION statt -String beim Einfügen.** `String.replace` deutet
  `$&`, `` $` `` und `$'` im Ersetzungstext als Sonderzeichen. Der gebaute Code
  enthält solche Folgen; als String übergeben blähte das die Datei von 280 kB
  auf 1,8 MB auf.

Einschränkung: Über `file://` kann der Browser `localStorage` sperren. Das
Spiel läuft dann normal, **der Fortschritt wird aber eventuell nicht
gespeichert** (Lesen und Schreiben sind in `storage.ts` abgesichert, es stürzt
also nichts ab). Wer Fortschritt behalten will, braucht den WLAN-Weg oben.

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
    shop.ts       Designs als DATEN: Äxte, Scheiben, Boss-Früchte, Preise und
                   alle Farbwerte (BOARD_STYLES/AXE_STYLES). Rein kosmetisch.
    storage.ts    Spielstand laden/speichern (Münzen, Designs, Bestmarke,
                   Lauf-Fortschritt, Einstellungen) inkl. Migration des alten
                   Apfel-Zählers
    sound.ts      Soundeffekte per Web Audio API SELBST ERZEUGT (Oszillatoren +
                   Rausch-Bursts) – keine externen Audio-Dateien, keine
                   Lizenzfragen. playHitSound/playMissSound/playAppleSound/
                   playBreakSound/playBossSound + vibrate(). unlockAudio() muss
                   innerhalb einer echten Nutzer-Interaktion aufgerufen werden
                   (Browser-Autoplay-Regel). setMuted() schaltet beides ab.
  hooks/
    useAxeGame.ts  Verbindet engine.ts mit React: Werfen per Antippen,
                    Zustandsmaschine ready -> flying -> ready, nach der letzten
                    Axt -> levelComplete, bei Kollision -> gameOver.
                    Auch Belohnungs-Rechnung (computeReward), Serie,
                    Boss-Freischaltung, Shop-Käufe und Einstellungen.
    useCountUp.ts  Zählt eine Zahl per rAF hoch (Belohnungs-Anzeige)
  components/
    Axe.tsx              Die Axt-Form (SVG) mit Skin-Varianten (AXE_STYLES)
    Apple.tsx            Der Apfel (SVG)
    Coin.tsx             Die Münze (SVG), Symbol der Spielwährung
    TargetBoard.tsx      Die rotierende Zielscheibe inkl. Äxte + Äpfel
                          (forwardRef + useImperativeHandle, siehe Performance-
                          Abschnitt unten)
    AxeInventory.tsx     Senkrechte Reihe der verbleibenden Äxte am linken Rand
    VineDecoration.tsx   Rein dekorative Ranken in den Bühnen-Ecken
    HUD.tsx              Levelnummer / Block-Punktreihe / Münzen oben. Der
                          Münzstand ist zugleich der Werkstatt-Button.
    Shop.tsx             Die Werkstatt: Skins kaufen und ausrüsten
    LevelCompleteModal.tsx  Ergebnis-Screen nach der letzten Axt
    GameOverModal.tsx    Screen nach Treffer auf die eigene Axt (nutzt dieselbe
                          LevelCompleteModal.css)
  styles/theme.css  Alle Design-Werte als CSS-Variablen (Farben, Radien, Abstände)
```

Prinzip: `game/` kennt React nicht (pure Funktionen, leicht nachvollziehbar/
testbar), `hooks/useAxeGame.ts` ist die einzige Brücke zu React.

### Look: dunkle Arcade-Optik (Vorbild "Knife Hit")

Die Optik ist bewusst flach und kontraststark statt fein schattiert:

- **Hintergrund:** fast schwarz mit kantigen, senkrechten Schatten-"Scherben"
  (zwei überlagerte `repeating-linear-gradient` in `.stage`, kein Bild-Asset).
  Ein warmer Lichtkegel hinter der Scheibe hebt das Ziel ab.
- **Zielscheibe:** aufgebaut wie ein aufgeschnittener Stamm – Rand, Fläche mit
  hellem Kern, 12 radiale Segmentlinien, zwei dezente Ringe, glühender Kern.
  Alle Farben kommen aus `--board-*`-Variablen auf `.board-skin`, damit die
  Shop-Vorschau dieselben Werte nutzen kann.
- **Axt:** breiter, flacher Kopf (Blatt rechts, Hammer-Sporn links) mit kräftiger
  dunkler Kontur. Die Kontur ist wichtig: ohne sie zerläuft die Silhouette vor
  dem dunklen Hintergrund, und im Vorrat wird sie bei 30px zum weißen Klecks.
- **HUD:** keine Kästchen mehr, sondern freistehende Zahlen – Levelnummer links,
  Punktreihe für den Block-Fortschritt in der Mitte, Münzstand rechts.
- **Axt-Vorrat:** senkrechte Reihe am linken Bühnenrand statt Kasten unter der
  Wurfzone. Hält die Mitte frei.

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

**Zeitschritt-Deckel (wichtig!):** Der rAF-Loop deckelt `deltaSeconds` bei 0.05s.
Der Browser hält `requestAnimationFrame` an, solange der Tab im Hintergrund ist –
auf dem Handy also, sobald man die App wegwischt. Ohne den Deckel wäre der erste
Zeitschritt nach der Rückkehr die GESAMTE Pausendauer, und die Scheibe würde um
hunderte Grad weiterspringen, mitten in einem Spiel, in dem die genaue Position
über Sieg und Niederlage entscheidet. (Fiel beim Testen auf, weil ein
Hintergrund-Tab die Scheibe komplett einfriert – nützlich zu wissen, wenn man
das Spiel automatisiert testet: dort hilft Zielen statt Timing zum Streuen.)

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
- [x] Optik komplett auf den "Knife Hit"-Look umgestellt (Screenshot als Vorlage)
      und Game Over entschärft:
      - **10er-Blöcke:** Game Over wirft nur an den Blockanfang zurück (Level 1,
        11, 21, …) statt bis Level 1. Das war die Antwort auf die Frage, ob der
        Rückwurf zu hart ist.
      - **Dunkles Theme:** fast schwarzer Hintergrund mit kantigen Schatten-
        Scherben statt Holzwand, Orange als einzige Leitfarbe.
      - **Zielscheibe neu:** Stamm-Querschnitt mit radialen Segmenten, glühendem
        Kern und kräftigem Rand, 260px statt 210px. Alle vier Skins mitgezogen.
      - **Axt neu gezeichnet:** breiter flacher Kopf mit Blatt und Hammer-Sporn,
        dunkle Kontur, gewickelter Griff. Vorher lief sie klein zu einem weißen
        Klecks zusammen.
      - **Äpfel** deutlich größer und mit Blatt, hängen klar außerhalb des Rands.
      - **HUD neu:** freistehende Zahlen statt Pillen, Punktreihe zeigt die
        Position im aktuellen 10er-Block.
      - **Axt-Vorrat** wandert an den linken Bühnenrand.
      - Kette über der Scheibe und die Efeu-Ranken (`VineDecoration.tsx`)
        entfernt – passten nicht mehr zum aufgeräumten Look.
- [x] Großes Erlebnis-Paket nach einer Bestandsaufnahme des Spielgefühls. Der
      Auslöser war eine Messung: die ersten 16 Level unterschieden sich in
      NICHTS außer +1,4°/Sek. Tempo, das erste Hindernis kam in Level 31.
      - **Schwierigkeits-Kurve nach vorne gezogen** (siehe Tabelle im
        Level-System oben) – jede Zutat kommt jetzt in den ersten ~15 Leveln
        mindestens einmal vor.
      - **Boss-Level alle 5 Level** mit zehn Frucht-Zielscheiben und der
        passenden Frucht-Axt als Beute (siehe eigener Abschnitt oben).
      - **Äpfel fallen** jetzt sichtbar herunter, statt zu verschwinden.
      - **Startbildschirm** mit Weiterspielen/Werkstatt/Einstellungen, beim
        ersten Start mit den vier Regeln.
      - **Lauf-Fortschritt wird gespeichert** – App wegwischen verliert den
        Durchgang nicht mehr.
      - **Einstellungen**: Ton/Vibration aus, Fortschritt zurücksetzen.
      - **Serie, Perfekt-Bonus, Block-Bonus** als Gründe, sauber zu spielen;
        der Ergebnis-Screen schlüsselt auf, wofür es Münzen gab.
      - **Vibration** bei Treffer/Apfel/Game Over, **`prefers-reduced-motion`**
        schaltet Shake und Deko-Animationen ab.
      - **Shop erweitert** auf 7 Äxte + 5 Scheiben + 10 Boss-Äxte, mit
        Beute-Reiter. Farbwerte sind dafür von CSS nach `shop.ts` gewandert.
      - **Leerraum geschlossen**: die Scheibe sitzt jetzt in einer flexiblen
        Zone, vorher war rund die halbe Bildschirmhöhe leer.
      - Dabei gefunden und behoben: die Scheibe sprang nach jeder Pause
        schlagartig weiter (siehe Zeitschritt-Deckel unten).
      Durchgetestet: Einstieg als frischer Spieler, Boss-Level 5 samt
      freigeschalteter Wassermelone-Axt, Münz-Rechnung inkl. Serien-Faktor,
      Beute-Reiter im Shop, fallender Apfel, Speichern und Fortsetzen.
- [x] Auf dem Handy spielbar gemacht, ohne App Store (siehe Abschnitt oben):
      Dev-Server im WLAN erreichbar, App-Icons, Manifest und iOS-Meta-Tags für
      "Zum Home-Bildschirm", dazu Handy-Feinschliff – sichere Ränder für Notch
      und Home-Indikator, kein Ziehen-zum-Neuladen, kein Doppeltipp-Zoom, keine
      Text-Auswahl beim schnellen Tippen, `100dvh` gegen die ein- und
      ausfahrende Browserleiste.
- [ ] Weiterer Feinschliff nach Bedarf.
- [ ] Phase 2: Capacitor + native Plattform.
      **Achtung: iOS-Builds gehen NUR auf einem Mac mit Xcode** – Klaus'
      Rechner ist Windows. Android ginge dort. Dabei zu erledigen:
      - Speicherung auf `@capacitor/preferences` (localStorage kann iOS in
        einer WKWebView unter Speicherdruck löschen – da hängt inzwischen
        echter Fortschritt dran).
      - Vibration auf `@capacitor/haptics` umstellen: `navigator.vibrate`
        existiert auf iOS gar nicht, der Code läuft dort wirkungslos.
- [ ] Phase 3: Splash-Screen, App-Store-Vorbereitung. (App-Icon steht bereits.)

## Offene To-dos

- Selbst durchspielen und Feedback zum Balancing geben – die Werte sind
  Schätzungen. Konkret unklar:
  - **Münz-Tempo.** ~15-25 Münzen pro Level plus Boni. Der erste kaufbare Skin
    (150) kommt nach ~7-10 Leveln, der teuerste (5000) sehr viel später.
  - **Sind Boss-Level hart genug?** Aktuell +1 Axt und +12°/Sek. Sie sollen sich
    wie eine Prüfung anfühlen, nicht wie ein normales Level mit anderer Farbe.
  - **Apfel-Ausbeute:** mit `APPLE_HIT_TOLERANCE_DEG = 24` erwischt man oft nur
    1 von 2 Äpfeln – der Perfekt-Bonus ist dadurch selten.
- Mehr Shop-Inhalte denkbar (Spuren/Trails der Axt, Hintergrund-Kulissen,
  Sound-Sets) – die Struktur trägt das jetzt, Farben sind reine Daten.
- Idee für später: Level-Auswahl statt nur "weiter" – die Bestmarke ist da, ein
  Sprung in einen früheren Block wäre wenig Aufwand.

## Zusammenarbeits-Regeln (siehe auch Anleitung im Chat)

- Immer zuerst `git pull`, bevor man anfängt zu arbeiten.
- Kleine, häufige Commits mit klarer Beschreibung.
- Diese Datei nach jedem größeren Schritt aktualisieren und mit committen.
