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
- **Es gibt KEIN Zielen.** Die Axt fliegt immer geradeaus nach oben und schlägt
  immer an derselben Stelle auf dem Bildschirm ein (unten an der Scheibe) – egal,
  wo man tippt. Der einzige Skill ist das **Timing**: die Scheibe dreht sich
  darunter weg. Genau wie beim Vorbild. (Es gab zwischendurch eine Ziel-Mechanik,
  bei der die Tippposition den Einschlagpunkt verschob; auf Wunsch wieder
  entfernt, weil sie das Spiel unnötig kompliziert gemacht hat.)
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

### Endlos-Modus nach Level 100

Level 100 ist NICHT das Ende. `generateLevel()` (siehe Level-System oben) ist
eine reine Funktion der Levelnummer OHNE eingebaute Obergrenze – Tempo deckelt
sich selbst bei `MAX_SPEED_DEG_PER_SEC`, Axt-/Hindernis-/Apfelzahl bei den
letzten `if`-Stufen, der Boss-Zyklus und die goldene-Apfel-Formel laufen über
Modulo. Der Endlos-Modus nutzt genau das aus, statt etwas Neues zu bauen:
- `levelConfigAt(levelIndex)` (`constants.ts`) liefert für Level ≤ 100 das
  vorberechnete Array-Element, darüber hinaus wird `generateLevel()` bei
  Bedarf einmalig live gerechnet. `useAxeGame.ts` nutzt diese Funktion überall
  statt direkt auf `LEVELS[...]` zuzugreifen.
- `nextLevel()` hat keine Obergrenze mehr (vorher `Math.min(..., LEVELS.length
  - 1)` – das hätte Level 100 endlos wiederholt statt weiterzuzählen).
- Nach Level 100 zeigt der Ergebnis-Screen einmalig "Alle 100 Level
  gemeistert!" (`isCampaignComplete` in `useAxeGame.ts`, wahr GENAU beim
  Abschluss von Level 100) – der Weiter-Button bleibt aber immer da, beschriftet
  ab dann als "Weiter im Endlos-Modus" statt mit einer Levelnummer.
- **Kein Extra-Spardaten-Feld nötig:** `SaveData.bestLevel` zählt ohnehin über
  100 hinaus weiter (`Math.max(bestLevel, levelIndex + 2)`) und ist damit
  zugleich die Endlos-Bestmarke.
- **Welten laufen optisch aus:** `worldForLevel()` (`worlds.ts`) klemmt Level
  jenseits von 100 auf die letzte Welt (Kosmos) – bewusst schon so gebaut, als
  die Welten entstanden sind. Die Weltkarte zeigt zusätzlich einen Hinweis
  "Endlos-Modus freigeschaltet – Bestmarke Level N", sobald `bestLevel` über
  100 liegt, damit die randvollen Fortschrittsbalken nicht unerklärt bleiben.
- **Game Over im Endlos-Modus verhält sich wie gewohnt:** `blockStartIndex()`
  rechnet ohne Deckel weiter (Level 111 stirbt → zurück auf 110), es gibt
  bewusst KEINEN Sonderfall "zurück auf Level 100" – die 10er-Block-Regel gilt
  unverändert weiter.
  Verifiziert durch direktes Setzen von `currentLevel`/`bestLevel` im
  Spielstand (Level 105 lädt korrekt: Boss-Zyklus, Kosmos-Deko, Weltkarten-
  Hinweis) statt durch Echtzeit-Durchspielen bis Level 100 – Letzteres ist in
  der automatisierten Browser-Umgebung wegen des dokumentierten rAF-Freeze-
  Problems nicht zuverlässig zu testen (siehe Zeitschritt-Deckel-Abschnitt).

### Grafik- und Gefühl-Ausbau: Weltkarte, Zielscheibe, Wurf, Game Over

Auf das Feedback "mach die Weltkarte wie eine echte Karte, erweiter die Grafik-
und Spielqualität, die Axt muss sich wie eine Pistole anfühlen, das Game-Over-
Menü ist langweilig" wurden vier Bereiche überarbeitet:

- **Weltkarte als echter Reiseweg** (`WorldMap.tsx`/`.css`): kein Modal mit
  Karten-Liste mehr, sondern ein eigener Vollbild-Screen mit einem gewundenen
  Pfad, der alle Welten im Zickzack verbindet (S-Kurven per einfachem Trick:
  Bezier-Kontrollpunkte auf halber Höhe zwischen zwei Knoten – braucht keine
  Kurven-Bibliothek). Jede Welt hat eine eigene Knoten-Farbe, ein Icon, einen
  Fortschrittsring (SVG `stroke-dasharray`) und – falls gesperrt – ein Schloss
  statt Deko. Der Hintergrund tönt sich zonenweise passend zur jeweiligen Welt.
  **Wichtig fürs Koordinatensystem:** alle Positionen (Knoten UND SVG-Pfad)
  sind Prozent der EIGENEN Breite der Karte (nicht des Viewports) – dadurch
  bleiben Knoten und Pfad bei jeder Bildschirmgröße exakt deckungsgleich, ohne
  dass irgendetwas per `ResizeObserver` gemessen werden müsste. Ein sechster
  Knoten für den Endlos-Modus erscheint automatisch oben auf dem Pfad, sobald
  `bestLevel > LEVEL_COUNT`. Beim Öffnen scrollt die Karte automatisch zur
  aktuellen Welt, damit man bei Level 80 nicht erst durch vier Welten scrollen
  muss.
- **Zielscheibe grafisch aufgewertet** (`TargetBoard.tsx`/`.css`): 16 statt 12
  Speichen mit alternierender Helligkeit (Pinwheel-Muster statt gleichmäßiger
  Reihe), zwei Strich-Ringe (fein am Kern, grob am Rand) per
  `repeating-conic-gradient` + Masken-Ring – kostet nur EIN Element pro Ring
  statt eines DOM-Knotens je Strich, wichtig bei bis zu 40 Strichen. Dazu ein
  Glanzlicht-Layer (`mix-blend-mode: soft-light`) und ein Bevel-Schatten
  (heller Kamm oben links, dunklere Kante unten rechts) für sichtbare Tiefe,
  plus ein zusätzlicher Ring im Kern. Alles läuft über die BESTEHENDEN
  `--board-*`-CSS-Variablen aus `shop.ts` – kein Skin musste angefasst werden,
  der Effekt gilt automatisch für alle Scheiben-Designs.
- **Axt-Wurf wie ein Pistolenschuss** (`App.tsx`/`.css`): auf "wie ne Pistole
  direkt geschossen" reagiert, OHNE `FLIGHT_DURATION_MS` (190ms) anzufassen –
  die ausführlich begründete Balance dahinter (siehe `constants.ts`) bleibt
  unverändert, nur wie sich der Flug ANFÜHLT hat sich geändert:
  - **Mündungsblitz + Rückstoß** feuern jetzt GENAU im Moment des Abtippens
    (`muzzleId`-Zähler analog zu `burstId`/`clashId`, `recoilStage()` analog zu
    `shakeStage()`) – vorher gab es nur beim Einschlag eine Reaktion, der
    Abschuss selbst war stumm.
  - Schärfere, vorne geladenere Beschleunigungskurve
    (`cubic-bezier(0.05, 0.9, 0.1, 1)`), dünnerer/hellerer Leuchtspur-Trail
    statt weichem Bewegungsschleier.
  - **Rotation von 360° auf 190° gekürzt.** Eine volle Umdrehung liest sich
    wie eine geworfene Tomahawk-Axt, die durch die Luft trudelt – ein
    kontrollierter Schuss taumelt nicht. Die Axt dreht sich noch (bleibt als
    Axt erkennbar), aber weniger als eine ganze Umdrehung.
  - **Dabei gefunden und behoben:** der neue Mündungsblitz nutzte anfangs
    denselben Zähler-Namensraum wie die Treffer-/Kollisions-Effekte
    (`key={burstId}` etc. – alle drei Zähler laufen unabhängig hoch und
    kollidieren zwangsläufig irgendwann auf denselben Zahlenwert). React warnte
    vor doppelten Keys unter demselben Elternknoten (`.stage`). Behoben durch
    Namensraum-Präfixe (`key={\`muzzle-${muzzleId}\`}` usw.).
- **Game-Over-Fenster eigenständig inszeniert** (`GameOverModal.tsx` +
  eigene neue `GameOverModal.css`): vorher teilte sich dieses Fenster
  komplett die Optik von `LevelCompleteModal` (nur andere Textfarbe) und
  wirkte dadurch wie derselbe Screen zweimal. Jetzt: rot pulsierende Vignette
  über dem Hintergrund, ein bildschirmfüllendes Riss-Overlay (derselbe Trick
  wie der Bruch-Effekt auf der Zielscheibe, nur größer), die Axt zerspringt
  beim Erscheinen sichtbar in zwei auseinanderfliegende Hälften (zwei
  `clip-path`-Kopien derselben `<Axe>`-Komponente, keine neue Grafik nötig)
  mit einem kleinen Funkenkranz drumherum, der Titel schlägt wie ein Stempel
  ein statt sanft einzublenden, die Karte knallt hart hinein statt weich
  einzufedern. "Neuer Versuch" nutzt den bestehenden
  `.modal-card__button--danger`-Stil aus `SettingsModal.css` (CSS ist in
  diesem Projekt global, siehe `unlock-pop`-Kollision weiter oben) statt der
  Standard-Orange-Farbe.

Durchgetestet: Weltkarte mit teilweise gesperrten Welten (Schloss-Zustand,
gedimmter Pfad) und Tap-Navigation, Zielscheibe mit zwei verschiedenen Skins
(Standard-Holz und ein dunkles Legendär-Design), mehrere echte Würfe inkl.
eines vollständigen Level-1-Durchlaufs (5 Treffer ohne Konsolenfehler) sowie
ein echter Game Over mit Neustart – jeweils per echtem Tap, nicht nur Code-
Review. Die Feinheiten des ~150-220ms-Mündungsblitzes selbst ließen sich per
Screenshot nicht scharf einfangen (bekannte Automatisierungs-Limitierung bei
kurzen Animationen, siehe rAF-Freeze-Abschnitt weiter oben) – stattdessen
direkt per `getAnimations()`/DOM-Inspektion bestätigt, dass die neuen Klassen
und Elemente bei einem echten Wurf zuverlässig gesetzt werden.

### Cartoon-Ozean-Ausbau: Weltkarte, Web-Slinger-Skin, Game Over, Startbildschirm

Zweiter Grafik-Durchgang, ausgelöst durch ein Referenzbild (gemaltes Mario-
World-artiges Overworld-Poster) und den Wunsch nach einem Spider-Man-artigen
Skin sowie einem lebendigeren, blaueren Look insgesamt:

- **Weltkarte als Cartoon-Insel-Archipel** (`WorldMap.tsx`/`.css`, löst die
  vorherige schlichte Knoten-Kette ab): jede Welt ist jetzt eine organische
  Insel im Ozean statt eines Kreis-Badges auf einer Linie. Die Insel-Silhouette
  entsteht aus `blobPoints()` (Punkte unregelmäßig auf einem Kreis verteilt,
  per `seededRandom()` – deterministisch, sieht bei jedem Öffnen gleich aus)
  und `smoothClosedPath()` (Catmull-Rom-Spline durch diese Punkte zu einer
  glatten geschlossenen Kurve). Eine zweite, dunklere "Klippen"-Insel sitzt
  leicht nach unten versetzt darunter für Tiefe. Der Ozean-Hintergrund nutzt
  ein SVG-`<pattern>` für die Wellenoptik, dazu ein paar per Seed platzierte
  Wolken. Der Sandpfad zwischen den Inseln ist jetzt dreilagig (gedimmte
  Vollstrecke + heller "Trampelpfad"-Überzug), Deko-Sprites (Bäume, Kakteen, …)
  sitzen verstreut auf den Inseln. Marker-Logik (Fortschrittsring, Sperr-
  Zustand, Tap-Navigation, Endlos-Modus-Knoten, Auto-Scroll) ist unverändert
  aus der vorherigen Fassung übernommen – reines Grafik-Update.
- **"Netzschwinger"-Axt + "Spinnennetz"-Scheibe** (`shop.ts`): der Wunsch nach
  einem Spider-Man-Skin wurde bewusst NICHT wörtlich umgesetzt – die Marvel/
  Sony-Figur samt Kostüm-Design ist urheberrechtlich geschützt, eine
  Reproduktion würde dagegen verstoßen. Stattdessen ein eigener rot-blauer
  Held-Look ohne Namen-/Logo-Bezug, käuflich in den normalen Äxte-/Scheiben-
  Reitern (nicht Diamanten/Legendär). Netter Nebeneffekt: die radialen
  Speichen der Zielscheibe (eigentlich fürs Stamm-Muster gedacht) lesen sich
  in Rot/Blau von selbst wie ein Spinnennetz.
- **Game-Over als Bottom-Sheet in Blau** (`GameOverModal.tsx`/`.css`): statt
  mittig einzublenden schiebt sich die Karte jetzt von unten herein
  (`.modal-backdrop--danger { align-items: flex-end; }` + `gameover-slide-up`-
  Keyframe) – ein Bottom-Sheet, wie man es aus mobilen Apps kennt. Farbschema
  von Warnrot auf Blau umgestellt (Vignette, Risslinien, Funken, Titel-Glow),
  passend zum neuen Ozean-Look. Dabei eine echte Lücke geschlossen: es gab
  vorher KEINEN Weg zurück zum Startbildschirm nach einem Game Over (nur
  Neustart oder Werkstatt) – jetzt ein dritter Button "Zurück zum Menü"
  (`onBackToMenu` → `setScreen('start')` in `App.tsx`).
- **Startbildschirm im Blue-Cartoon-Stil** (`StartScreen.css`): Himmel-zu-
  Ozean-Verlauf mit Wolken-Tupfen direkt im `background` der `.start`-Box
  (keine eigenen Elemente – wichtig, weil die Box bei langem Inhalt intern
  scrollt und separate Deko-Elemente sonst mit hochgescrollt wären, der
  Box-Hintergrund selbst aber stehen bleibt), dick umrandeter Comic-Titel
  (gestapelte `text-shadow`-Versätze statt `text-stroke`, das würde die
  Innenfläche dünner wirken lassen) mit Pop-in-Animation, Münzen/Diamanten
  als Badge-Pillen, pillenförmige glasige Buttons, leise pulsierender
  Haupt-Button als Antipp-Einladung. Respektiert `prefers-reduced-motion`.

Durchgetestet: Weltkarte mit Insel-Klippen-Schichtung und grauem Sperr-
Zustand, echter Kauf + Ausrüsten beider Web-Slinger-Skins mit sichtbarem
Netz-Speichen-Effekt auf der Scheibe, Game-Over-Bottom-Sheet inkl. Klick auf
"Zurück zum Menü" (kehrt korrekt zum Startbildschirm zurück, Lauf-Fortschritt
bleibt erhalten), Startbildschirm normal und im Erstlauf-Tutorial-Zustand –
alles per echtem Tap, keine Konsolenfehler in beiden Durchläufen.

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

### Welten, Weltkarte, Diamanten und goldener Apfel (Erweiterung)

Nach dem Wunsch "erweiter das Spiel richtig, guck was man erweitern kann –
mehr Welten, eine zweite Währung, Easter Eggs" kam ein zweites Standbein neben
Leveln/Boss/Münzen dazu, ohne die Level-Formel selbst anzufassen:

- **5 Welten** (`game/worlds.ts`): Wald, Wüste, Eis, Vulkan, Kosmos – je 20
  Level (Start bei Level 1/21/41/61/81). Jede Welt bringt eine eigene
  Bühnen-Farbpalette (`worldStyleVars()` setzt dieselben CSS-Variablen, die
  `App.css`/`theme.css` schon lesen – `--color-bg-top`, `--stage-glow` usw. –
  KEINE neue CSS-Struktur nötig) und eine eigene Deko (`WorldDecor.tsx`):
  Baum-/Kaktus-/Eiszapfen-/Lava-Silhouetten in den Bühnenecken, bei Kosmos
  stattdessen ein Sternenfeld. Rein optisch, ändert kein Balancing.
- **Weltkarte** (`WorldMap.tsx`, über den neuen Button auf dem Startbildschirm):
  zeigt alle 5 Welten mit Fortschrittsbalken (`bestLevel - startLevelIndex`,
  begrenzt auf 20) und erlaubt per Tap den Sprung zu einer freigeschalteten
  Welt. Gesperrte Welten zeigen "Erreiche Level X, um freizuschalten" statt
  eines Zahlenwerts.
- **Diamanten** (`Gem.tsx`, zweite Währung neben Münzen, `SaveData.gems`):
  kommen NUR aus goldenen Äpfeln, nicht aus normalem Spielen – bewusst eine
  Glücks-Komponente, die separat vom Serien-Multiplikator läuft (Serie
  belohnt Nicht-Sterben, Diamanten sind reiner Zufall, siehe Kommentar in
  `computeReward()`). Ob ein Level einen goldenen Apfel hat und an welcher
  Apfel-Position, ist wie die restliche Level-Generierung eine reine Funktion
  der Levelnummer (`goldenAppleIndexFor()` in `constants.ts`, KEIN
  `Math.random()` – Retries bleiben reproduzierbar). Golden ist ungefähr
  jedes 7. Level. Ein getroffener goldener Apfel gibt `GEMS_PER_GOLDEN_APPLE`
  (3) Diamanten statt der normalen Münzen für diesen Apfel.

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
  Startbildschirm und beide Modals): rein kosmetische Designs, mittlerweile in
  VIER Reitern – Äxte, Scheiben, **Legendär** (Diamanten-Preis, gemischt Äxte
  + Scheiben, `LEGENDARY_SKINS` in `shop.ts`) und **Extras** (Boss-Beute plus
  das Oster-Ei, siehe unten). Kaufen zieht Münzen ODER Diamanten ab, je nach
  `skin.source` (`'shop'` = Münzen, `'gem'` = Diamanten) und rüstet direkt aus;
  Gekauftes lässt sich frei wechseln. **Kein Design verändert das Balancing** –
  nur Farben und Glanz.
  Bug beim Bau des vierten Reiters gefunden und behoben: `equippedId` wurde
  früher einmal PRO REITER berechnet (`tab === 'board' ? ... : ...`), was für
  den gemischten Legendär-Reiter falsch war (eine Scheibe konnte fälschlich als
  "ausgerüstete Axt" markiert erscheinen). Jetzt wird pro Karte einzeln anhand
  von `skin.kind` verglichen.
- **Oster-Ei** (`StartScreen.tsx`): siebenmaliges schnelles Antippen des
  Titel-Logos (`SECRET_TAP_COUNT = 7` innerhalb `SECRET_TAP_WINDOW_MS = 2200ms`)
  schaltet einen geheimen Axt-Skin frei ("Quietsche-Ente", `axe-egg-duck`,
  Preis 0, `source: 'egg'`) und rüstet ihn direkt aus. Bewusst **kein Hinweis
  im Tutorial oder in der UI** (kein Cursor-Wechsel, keine Umrandung am Logo) –
  wer's findet, findet's. Im Shop-Reiter "Extras" wird der Skin, solange er
  nicht gefunden ist, als "???"-Silhouette angezeigt
  (`shop-card__preview--mystery`), damit man sieht, dass da etwas Verstecktes
  existiert, ohne dass verraten wird, was oder wie. Freischalten läuft über
  eine eigene, preis-lose Hook-Aktion (`unlockEasterEgg()`), getrennt von
  `buySkin()`. Verifiziert per Browser-Automatisierung: das enge 2,2-Sekunden-
  Fenster kollidiert mit der Klick-Latenz der Automatisierung, deshalb wurde
  für den Test kurz auf ein 20-Sekunden-Fenster gestellt, die Freischalt-Logik
  end-to-end bestätigt (Toast, Skin in `ownedSkins` + `equippedAxeSkin`,
  sichtbar am Startbildschirm) und danach zurück auf 2200ms gestellt.
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
- `SettingsModal.tsx`: Ton/Vibration an-aus, **Schwierigkeitsgrad** (Leicht/
  Normal/Schwer) und "Fortschritt zurücksetzen" (mit Rückfrage, weil es alles
  löscht).
- **Schwierigkeitsgrad** (`SaveData.difficulty`, `Difficulty` in `types.ts`):
  rührt bewusst NICHT an `generateLevel()` – die 100 Level bleiben eine
  einzige, für alle geltende Formel, sonst müsste man drei komplette Kurven
  pflegen. Stattdessen skaliert `useAxeGame.ts` zwei Werte nachträglich über
  `DIFFICULTY_SPEED_MULTIPLIER`/`DIFFICULTY_REWARD_MULTIPLIER` (`constants.ts`):
  Board-Tempo (×0.8 / ×1 / ×1.25) und die Münz-Endsumme aus `computeReward()`
  (×0.75 / ×1 / ×1.4). Mehr Risiko bei "Schwer" bringt bewusst auch mehr
  Münzen – sonst gäbe es keinen Grund, es zu wählen. Der Faktor steckt NICHT
  in `LevelReward.streakMultiplier` (der Ergebnis-Screen beschriftet dieses
  Feld explizit als "Serie ×N"), sondern wird separat auf `total` multipliziert.
  Diamanten aus goldenen Äpfeln bleiben unberührt – die sind ohnehin reines
  Fund-Glück, kein Skill-Ertrag.
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
                   Apfel-Trefferradius, Flugzeit, Verzögerungen vor den
                   Ergebnis-Fenstern, Münz-Wirtschaft
    engine.ts     Reine Winkel-Mathematik & Spiellogik (kein React):
                   normalizeAngle, angularDistance, computeBoardLocalAngle,
                   collidesWithStuckAxe, findHitApple
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
das Spiel automatisiert testet.)

### Die Winkel-Logik (der kniffligste Teil, kurz erklärt)

- Die Zielscheibe rotiert kontinuierlich (Weltwinkel, 0° = oben, im Uhrzeigersinn).
- Der Einschlagpunkt auf dem BILDSCHIRM ist immer derselbe
  (`IMPACT_WORLD_ANGLE_DEG`, 180° = unten an der Scheibe). Die Axt fliegt
  senkrecht dorthin; bewegt wird nur die Scheibe darunter. `computeBoardLocalAngle()`
  braucht deshalb nur den aktuellen Drehwinkel.
- Die Flug-Animation setzt entsprechend nur eine Endhöhe (`--flight-end-bottom`).
  Die Drehung liegt bei einer Umdrehung – vorher waren es 900° in 140ms, also
  2,5 Umdrehungen, was keine sichtbare Drehung mehr ist, sondern Matsch.
- **Das Flugziel kommt aus der GEMESSENEN Scheibenposition, nicht aus einem
  Prozentwert.** Die Animation endete früher fest bei `bottom: 68%` – ein Wert,
  der zur alten 210px-Scheibe passte. Seit die Scheibe 260px groß ist und mittig
  in einer flexiblen Zone sitzt, hängt ihre Lage von der Bildschirmhöhe ab, und
  die Axt flog rund 300px zu weit: quer durch die Scheibe hindurch bis fast an
  deren Oberkante ("fliegt einfach drüber"). `TargetBoardHandle.getGeometry()`
  liefert jetzt Mitte und Radius in Bildschirmkoordinaten, `App.tsx` rechnet
  daraus den Einschlagpunkt und setzt ihn als `--flight-end-bottom`. Gemessen
  wird in einem `useLayoutEffect` mit `ResizeObserver` auf der Bühne – bewusst
  nicht `window.resize`, weil sich die nutzbare Höhe auf dem Handy auch beim
  Ein- und Ausfahren der Browserleiste ändert. Nachgemessen: der Einschlag liegt
  exakt am Steck-Radius, 6px im Holz (`AXE_BITE_PX`) – vorher 300px dahinter.
- **Ein Radius, überall derselbe (`AXE_STICK_RATIO`).** Flugbahn und Späne-Burst
  müssen denselben Radius benutzen wie die steckenden Äxte. Eine frühere Fassung
  rechnete mit dem gemessenen Scheiben-Radius (130) statt dem Steck-Radius (120):
  der Flug endete 10px weiter außen als die Axt danach steckte, und der Burst saß
  daneben. Alle leiten den Wert jetzt aus `stickRadiusPx()` ab.
- **Der Späne-Burst sitzt am echten Treffpunkt.** Er hing vorher fest unten in
  der Mitte der Scheiben-Zone; bei einem Wurf an den Rand lagen Späne und
  Einschlag sichtbar auseinander (das fiel noch zur Zeit der Ziel-Mechanik auf).
  Jetzt nutzt er dieselben Koordinaten wie der Flug.
- **Hit-Stop beim Treffer** (`HIT_STOP_MS`, 55ms): die Drehung steht einen
  Sekundenbruchteil still und die Scheibe zuckt zusammen (`punch()` auf dem
  Handle, damit kein React-Re-Render nötig ist). Der klassische Kniff aus
  Actionspielen – man nimmt ihn nicht bewusst wahr, aber der Treffer fühlt sich
  schwer an. Die Zuck-Animation läuft auf der HÜLLE, nicht auf der Scheibe: die
  trägt schon die Inline-Rotation, eine zweite transform-Animation würde sie
  sichtbar zurückspringen lassen.
- Eine steckende Axt merkt sich ihren Winkel im LOKALEN Koordinatensystem der
  Scheibe (`boardLocalAngleDeg = Einschlag-Weltwinkel - aktueller Weltwinkel`),
  damit sie beim Rendern korrekt "mitrotiert", wenn sich die Scheibe weiterdreht.
- Kollisionsprüfung vergleicht den neuen lokalen Winkel gegen alle bereits
  steckenden Äxte (`COLLISION_ANGLE_TOLERANCE_DEG`).
- **Flugzeit – mehrfach nachjustiert, siehe `FLIGHT_DURATION_MS` in
  `constants.ts` für die volle Herleitung.** Stand mal bei 140ms (Kalkül: unter
  der Kollisions-Toleranz bleiben, Dauertippen also riskant machen), das war
  aber unlesbar ("fliegt einfach drüber"). Über 300ms und 220ms ("langweilig und
  zu langsam") liegt der aktuelle Wert bei 190ms. Der eigentliche Fix war NICHT
  die Zahl allein, sondern die Animation selbst mit mehr Energie zu versehen
  (Squash-and-Stretch beim Abschuss, schärferes Easing, kräftigerer Trail –
  siehe `axe-fly`-Keyframes in App.css) – reine Dauer war nie das Hauptproblem.
  190ms liegen bei 55°/Sek. knapp über der 10°-Kollisions-Toleranz, Dauertippen
  bleibt also riskant. Stellschrauben, falls es zu leicht wird:
  `COLLISION_ANGLE_TOLERANCE_DEG` erhöhen oder den Levelstart verlangsamen.
- Es gab früher eine Halten-und-Loslassen-Timing-Mechanik (Lade-Regler mit
  "Sweet Spot") UND zwischenzeitlich eine Ziel-Mechanik (Tippposition bestimmte
  den Einschlagpunkt). Beides wieder entfernt, auf ausdrücklichen Wunsch: "mach
  doch das egal wo man auf den Bildschirm drückt es gerade aus geht, genauso wie
  bei Knife Hit". Der einzige Skill ist wieder rein das TIMING.

### Gepufferte Taps: warum das NICHT in der setState-Updater-Funktion stehen darf

Tippt man während eine Axt fliegt, wird der Tap gepuffert (`pendingThrowRef`)
und feuert automatisch, sobald die aktuelle Axt gelandet ist – sonst fühlt
sich schnelles Tippen "kaputt" an, weil Taps mitten im Flug einfach
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
- [x] Axt-Flug korrigiert, nachdem das Spiel zum ersten Mal auf dem Handy lief:
      - **Flug endet jetzt AN der Scheibe.** Vorher endete die Animation bei
        einem festen `bottom: 68%` und die Axt flog rund 300px zu weit, also
        quer durch die Scheibe hindurch. Das Ziel kommt jetzt aus der gemessenen
        Scheibenposition (`getGeometry()` + `ResizeObserver`). Nachgemessen:
        Einschlag bei Mitte- und Seitenwürfen exakt 14px im Holz.
      - **Flugzeit 140ms → 300ms.** Die 140ms waren ein Balancing-Trick gegen
        Dauertippen, aber auf dem Handy legt die Axt damit die ganze
        Bildschirmhöhe in einer Siebtelsekunde zurück – man sieht schlicht
        nichts. Lesbarkeit hat hier Vorrang, siehe Begründung in `constants.ts`.
      - Flugkurve bremst zum Schluss leicht ab, damit die Axt "ankommt".
- [x] Wucht und Tempo nachgeschärft, nachdem der Flug endlich saß:
      - Flugzeit 300ms → **220ms**. 300ms waren gut lesbar, fühlten sich beim
        Spielen aber zäh an.
      - **Hit-Stop** (55ms) plus Zusammenzucken der Scheibe beim Treffer.
      - **Späne-Burst sitzt am echten Treffpunkt** statt fest unten in der Mitte.
      - Schweif länger und wärmer, läuft über die ganze Flugzeit; Späne fallen
        jetzt am Ende nach unten statt gleichmäßig zu verpuffen.
      - Dabei gefunden: Zielen und Flugbahn benutzten unterschiedliche Radien
        (120 gegen gemessene 130) – behoben über `AXE_STICK_RATIO`.
- [x] **Ziel-Mechanik wieder entfernt** – auf Wunsch zurück zum Vorbild: egal wo
      man tippt, die Axt fliegt immer geradeaus an dieselbe Stelle. Der einzige
      Skill ist wieder das Timing. Damit fallen `aimToImpactWorldAngle()`, der
      `aim`-Parameter und `FlyingAxe.impactWorldAngleDeg` weg; der Tap-Puffer ist
      wieder ein einfaches Flag. Nachgemessen: Tippen ganz links und in der Mitte
      ergeben identische Flugbahnen (`flightX` beide 0).
- [x] **Drei Feedback-Punkte nach dem ersten echten Spielen auf dem Handy behoben:**
      - **"Kommt so random das Menü, das erschreckt einen"** – das Ergebnis-Fenster
        erschien im selben Moment, in dem die letzte Axt einschlug. Jetzt läuft
        dazwischen eine kurze Pause (`LEVEL_COMPLETE_DELAY_MS` 900ms /
        `GAME_OVER_DELAY_MS` 650ms, `constants.ts`), in der ein großes
        `.outcome-banner` ("Geschafft!" / "Boss besiegt!" / "Axt zersplittert!")
        auf der Bühne erscheint. Die Scheibe friert weiterhin SOFORT ein (kein
        zusätzliches Warten dafür), nur das Vollbild-Fenster selbst wartet – so
        gibt es sofort eine Rückmeldung, aber das Menü kommt als bewusster
        zweiter Schritt statt als Überraschung. Steuerung über `modalVisible` in
        `App.tsx`, per `useEffect` an `game.phase` gekoppelt. Die Reihenfolge
        (Banner zuerst, Menü nach exakt der konfigurierten Verzögerung) wurde per
        `MutationObserver` nachgemessen: 665ms Abstand bei 650ms Vorgabe.
      - **"Die Axt-Wurf-Animation ist langweilig und zu langsam"** – Flugzeit
        220ms → 190ms (siehe Herleitung bei `FLIGHT_DURATION_MS`), vor allem aber
        Squash-and-Stretch beim Abschuss in den `axe-fly`-Keyframes (App.css: die
        Axt streckt sich beim Werfen, federt beim Durchschwingen über, pendelt
        sich für die Landung ein), schärferes Easing
        (`cubic-bezier(0.11, 0.85, 0.2, 1)` statt sanftem Ease-out) und ein
        heller/längerer Trail. Die reine Dauer war beim zweiten Feedback trotz
        vorheriger Kürzung immer noch das Problem – der eigentliche Fix war die
        Bewegungsenergie der Animation selbst, nicht die Zahl.
      - **Kollision (Game Over) hatte GAR KEINEN eigenen Effekt.** `hits` steigt
        bei einer Kollision nicht (die Axt steckt ja nicht), der normale
        Treffer-Effekt (Screen-Shake, Hit-Stop, Holzspäne-Burst) feuerte deshalb
        nie – die tödliche Axt verschwand einfach kommentarlos. Neuer
        `.hit-effect--clash`-Effekt in kalten Metallfarben (Funken statt
        Holzspäne, `.hit-effect__spark`) plus Screen-Shake und Hit-Stop, ausgelöst
        über denselben `shakeStage()`-Helfer wie normale Treffer.
      - Dreh-Muster (Tempo steigt pro Level, `pulse`/`reverse` sorgen für
        Schwankung mitten im Level wie beim Vorbild) und konstante Axt-Fluggeschw-
        indigkeit unabhängig vom Scheibentempo gab es beides bereits, unverändert.
      Durchgetestet: Level-Erfolg und Game-Over-Pfad einzeln mit echten Klicks,
      Banner-vor-Menü-Reihenfolge und -Abstand per MutationObserver nachgemessen.
- [x] **Großer inhaltlicher Ausbau** nach dem Wunsch "erweiter das Spiel richtig,
      lass dir Zeit" – an "Knife Hit" als Vorbild orientiert, aber bewusst nicht
      1:1 kopiert. Sechs neue Bausteine, jeder einzeln im Browser geprüft und
      committet (Details siehe die jeweiligen Abschnitte oben):
      - **5 Welten** mit eigener Bühnen-Tönung und Ecken-Deko, **Weltkarte**
        zum gezielten Zurückspringen.
      - **Diamanten** als zweite Währung, ausschließlich aus goldenen Äpfeln
        (~14% der Level), deterministisch wie der Rest der Level-Generierung.
      - **Werkstatt auf vier Reiter erweitert**: Legendär (Diamanten-Preis)
        und Extras (Boss-Beute + Oster-Ei). Dabei einen Anzeige-Bug im
        gemischten Legendär-Reiter gefunden und behoben.
      - **Oster-Ei**: sieben schnelle Taps aufs Logo schalten einen geheimen
        Skin frei, ohne jeden Hinweis in der UI.
      - **Schwierigkeitsgrad** (Leicht/Normal/Schwer) in den Einstellungen,
        skaliert Tempo und Münz-Belohnung nachträglich, ohne die Level-Formel
        selbst anzufassen.
      - **Endlos-Modus**: Level 100 ist nicht mehr das Ende, weil
        `generateLevel()` schon immer eine unbegrenzte reine Funktion der
        Levelnummer war – der Deckel saß nur in `nextLevel()`.
      Durchgetestet: alle vier Shop-Reiter inkl. einem echten Diamanten-Kauf,
      Weltkarte-Fortschritt und -Sprung, goldener Apfel optisch, Oster-Ei-
      Freischaltung Ende-zu-Ende (Sequenz-Logik mit testweise verlängertem
      Zeitfenster, danach zurückgesetzt), Schwierigkeitsgrad-Umschalter samt
      Speicherung, Level 105 direkt geladen (Boss-Zyklus, Kosmos-Deko,
      Weltkarten-Hinweis) als Ersatz für ein Echtzeit-Durchspielen bis 100,
      das an der bekannten rAF-Freeze-Einschränkung der automatisierten
      Browser-Umgebung gescheitert wäre.
- [x] **Grafik- und Gefühl-Ausbau** nach dem Feedback "Weltkarte wie eine
      echte Karte, mehr Grafik-/Spielqualität, Axt wie eine Pistole, Game-
      Over-Menü ist langweilig" (Details siehe eigener Abschnitt oben):
      - Weltkarte als gewundener Vollbild-Reiseweg statt Karten-Liste.
      - Zielscheibe mit mehr Speichen, zwei Strich-Ringen, Glanzlicht und
        Bevel-Schatten – über die bestehenden Skin-Farbvariablen, kein Skin
        musste angefasst werden.
      - Axt-Wurf fühlt sich durch Mündungsblitz, Rückstoß, schärfere Kurve
        und kürzere Rotation wie ein Schuss an – `FLIGHT_DURATION_MS` selbst
        unverändert.
      - Game-Over-Fenster mit eigener Inszenierung (rote Vignette, Riss-
        Overlay, zersplitternde Axt, Stempel-Titel) statt Kopie des Erfolgs-
        Screens.
      Dabei einen echten React-Key-Kollisions-Bug gefunden und behoben
      (drei unabhängige Zähler für Wurf-Effekte konnten denselben Zahlenwert
      erreichen).
- [x] **Cartoon-Ozean-Ausbau** nach einer Bild-Vorlage (gemaltes Overworld-
      Poster) und dem Wunsch nach einem lebendigeren, blaueren Gesamtlook
      (Details siehe eigener Abschnitt oben):
      - Weltkarte als Insel-Archipel im Ozean statt Knoten-Kette (organische
        Insel-Silhouetten per Seed, Klippen-Schichtung, Wellen-Pattern).
      - "Netzschwinger"/"Spinnennetz"-Skin als eigener, unbranded Rot-Blau-
        Look statt einer wörtlichen (urheberrechtlich geschützten)
        Spider-Man-Kopie.
      - Game-Over als blaues Bottom-Sheet mit drittem Button "Zurück zum
        Menü" – vorher fehlte dieser Weg ganz.
      - Startbildschirm im selben blauen Cartoon-Stil (Himmel-Verlauf,
        Comic-Titel, glasige Pillen-Buttons).
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
