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

- **120 Level** (ursprünglich 100, siehe Heldenstadt-Abschnitt weiter unten),
  PER FORMEL aus der Levelnummer erzeugt (`generateLevel()` in `constants.ts`),
  nicht von Hand aufgeschrieben (bei so vielen unübersichtlich). Level haben
  KEINE Namen, nur die Nummer 1-120.
- **Die Schwierigkeits-Kurve hängt an der LEVELNUMMER, nicht an "Stufen zu je 5".**
  Das war eine bewusste Korrektur: die erste Fassung änderte in den ersten 16
  Leveln praktisch nichts (immer 5 Äxte, 2 Äpfel, keine Hindernisse, gleichmäßige
  Drehung, +1,4°/Sek. pro Level – das merkt niemand). Jetzt kommt jede Zutat in
  den ersten ~15 Leveln mindestens einmal vor, danach wird nachgeschärft:
  | ab Level | Änderung |
  |---|---|
  | 3 | Pulsieren kommt dazu, erstes Hindernis (`obstacleCountFor`) |
  | 8 | Richtungswechsel kommt dazu |
  | 9 | 2 Hindernisse |
  | 11 | 6 Äxte |
  | 17 | 3 Hindernisse |
  | 20 | `steady` verschwindet komplett aus dem Muster-Zyklus – ab hier ist IMMER etwas in Bewegung |
  | 21 | 7 Äxte |
  | 27 | 4 Hindernisse |
  | 26 | 3 Äpfel |
  | 31 | 8 Äxte |
  | 41 | 5 Hindernisse |
  | 46 | 9 Äxte |
  | 51 | 4 Äpfel |
  | 61 | 6 Hindernisse (Deckel) |
  | 71 | 10 Äxte (Deckel) |

  **Zweite, deutlich härtere Runde (Klaus' Wunsch: "die Level sind viel zu
  einfach, je höher desto schwerer"):** die alten Deckel (8 Äxte ab Level 31,
  3 Hindernisse ab Level 26, 200°/Sek. ab ca. Level 100) waren fürs alte
  120-Level-Kampagnen-Ziel gedacht. Seit dem Umstieg aufs Highscore-Prinzip
  (siehe Münzen/Läufe-Abschnitt weiter unten – ein Lauf geht potenziell lange
  über Level 120 in den Endlos-Modus hinein) war das falsch: ein guter
  Spieler hätte den harten Teil der Kurve schnell hinter sich und der Rest
  des Laufs würde sich nicht mehr steigern. Deckel deshalb höher und weiter
  hinten (siehe Tabelle oben), Tempo-Deckel von 200 auf 320°/Sek. angehoben
  (erreicht jetzt bei Level ~183, tief im Endlos-Modus), und ab Level 20 gibt
  es gar kein `steady`-Muster mehr – nur noch Pulsieren/Richtungswechsel.
  **Dritte Runde (Klaus, 2026-08-21: "immer noch zu einfach, deutlich
  schwerer"):** diesmal an fünf Stellschrauben gleichzeitig gedreht statt nur
  an einer, jeweils in `constants.ts`/`TargetBoard.tsx` mit Begründung im
  Code kommentiert:
  - **Tempo-Anstieg pro Level** (`SPEED_STEP_PER_LEVEL`) von 1,45 auf
    1,9°/Sek. – Level 50 jetzt ~150°/Sek. (vorher ~126), Level 100 jetzt
    ~245°/Sek. (vorher ~199). Der Tempo-DECKEL (`MAX_SPEED_DEG_PER_SEC`)
    musste dafür von 320 auf 400°/Sek. mitwandern, sonst hätte der steilere
    Anstieg den Deckel spürbar früher erreicht als vorher – bei 400 liegt er
    jetzt bei Level ~182, also praktisch an derselben Stelle wie zuvor
    (~183), nur auf höherem Niveau.
  - **Axt-/Hindernis-Kurve steiler und mit höherem Deckel:** Axt-Deckel von
    10 auf 12 (`axeCountFor`), Hindernis-Deckel von 6 auf 8
    (`obstacleCountFor`), UND alle Zwischenstufen kommen jetzt 30-40% früher
    (z.B. Deckel-Erreichen bei Axt vorher Level 71, jetzt Level 81, aber bei
    HÖHEREM Wert und mit dichteren Zwischenschritten davor – die Kurve ist
    insgesamt steiler, nicht nur nach hinten verschoben). Am Levelende sind
    dadurch 19 von theoretisch 36 möglichen Steckplätzen belegt (vorher 16).
  - **Boss-Level härter:** Tempo-Bonus von 20 auf 28°/Sek., zusätzliche
    Hindernisse von +1 auf +2 – ein Boss soll sich wie eine echte Spitze
    anfühlen, nicht wie ein normales Level mit Frucht-Textur.
  - **Puls-/Richtungswechsel-Rhythmus verkürzt** (`PULSE_PERIOD_SEC` 2,6→2,2,
    `PULSE_PERIOD_AT_MAX_SEC` 1,0→0,75, `REVERSE_PERIOD_SEC` 3,4→2,9,
    `REVERSE_PERIOD_AT_MAX_SEC` 1,3→1,0, alle in `TargetBoard.tsx`) – die
    Scheibe pulsiert/wechselt jetzt sowohl bei Level-1-Tempo als auch am
    Tempo-Deckel spürbar öfter. Die Fairness-Untergrenze (Puls-Faktor nie
    unter 0.55, Richtungswechsel springt hart statt weich durch null) blieb
    dabei bewusst UNANGETASTET – die steht extra im Code-Kommentar als
    Grenze, die nicht fallen darf (siehe Dreh-Muster-Abschnitt oben), sonst
    wird die Scheibe irgendwann unfair (fast Stillstand -> zwei Äxte landen
    an derselben Stelle -> Instant-Tod ohne eigenes Zutun).
  **Vierte Runde (Klaus, direkt danach: "es müssen nicht immer 6 Messer sein,
  mache unterschiedlich, aber Durchschnitt höher, damit es deutlich schwerer
  wird"):** die Hindernis-Zahl (`obstacleCountFor`) gab für einen ganzen
  Level-Bereich (z.B. Level 35-45) bisher IMMER exakt denselben Wert (6) –
  vorhersehbar und zugleich ein Deckel nach oben. Umgebaut auf eine
  Basis-Kurve (`obstacleBaseFor`, unverändert die alten Stufen) plus eine
  deterministische Schwankung (`(levelIndex * 41 + 17) % 5` → Werte aus
  `[-1, 0, 1, 1, 2]`): Level 36 hat jetzt z.B. 7 Hindernisse, Level 39 nur 5 –
  bei GLEICHEM Level aber immer IDENTISCH (reproduzierbar bei jedem Versuch,
  kein `Math.random()`, wie der Rest der Level-Generierung). Die Schwankung
  ist bewusst nach OBEN verzerrt statt symmetrisch, damit der Schnitt über
  alle 120 Level von 6,34 auf 6,92 Hindernisse steigt (per Simulationsskript
  nachgerechnet) – "unterschiedlich" UND "im Schnitt höher", nicht nur eins
  von beiden. Deckel dafür von 8 auf `OBSTACLE_COUNT_CAP = 10` angehoben,
  weil die Schwankung gelegentlich über die alte Basis-Kurve hinausschlägt.
  Verifiziert per echtem Spielstand: Level 63 lädt mit 10 vorplatzierten
  Hindernis-Äxten, Level 64 mit 7 (`.target-board__axe-slot`-Elemente
  gezählt) – unterschiedliche Level, unterschiedliche Werte, keine
  Konsolenfehler.
  Bewusst NICHT angefasst (zu diesem Zeitpunkt): `COLLISION_ANGLE_TOLERANCE_DEG`
  (10°) – der Wert war eng an `FLIGHT_DURATION_MS` gekoppelt (190ms Flugzeit bei
  damals 55°/Sek. Level-1-Tempo ergaben ~10,5° Drehung, knapp ÜBER der Toleranz,
  siehe Kommentar in `constants.ts`), ihn isoliert zu erhöhen hätte diese fein
  austarierte Kalibrierung verschoben, ohne dass das der eigentliche Hebel
  für "die Level fühlen sich zu leicht an" ist. Ebenfalls unangetastet:
  `APPLE_HIT_TOLERANCE_DEG` – das reguliert das Apfel-Sammeln (Belohnung),
  nicht das Überleben.
  **Fünfte Runde (Klaus: "Level 1-5 sind sehr einfach und es ist nervig, weil
  sich das Brett so langsam dreht und man es eh schafft, aber nicht so
  schnell werfen kann"):** hier war nicht die Erfolgschance das Problem
  (0-1 Hindernisse in Level 1-5 sind Absicht, siehe Level-System-Tabelle oben),
  sondern das TEMPO-GEFÜHL – bei 55°/Sek. dauert es lange, bis eine gute Lücke
  wieder am Einschlagpunkt vorbeikommt, obwohl praktisch jeder Wurf sitzt.
  `BASE_SPEED_DEG_PER_SEC` von 55 auf 70°/Sek. angehoben (einzige Änderung,
  wirkt als flacher Sockel unter der ganzen Kurve – Level 100 rutscht dadurch
  von ~245 auf ~258°/Sek., der Tempo-Deckel wird bei Level ~175 statt ~182
  erreicht, beides marginal). `FLIGHT_DURATION_MS` (190ms) bewusst NICHT
  angefasst – das ist die separate, ausführlich hergeleitete
  Wurf-Fluganimation/Cooldown-Dauer, nicht der eigentliche Hebel hier. Netter
  Nebeneffekt: bei 70°/Sek. dreht sich die Scheibe in den 190ms jetzt um
  ~13,3° statt ~10,5° – Dauertippen kollidiert in Level 1-5 damit nicht mehr
  zuverlässig mit der eigenen letzten Axt, passend dazu, dass man dort ohnehin
  kaum sterben kann ("kann nicht so schnell werfen" wird damit adressiert,
  ohne den separat kalibrierten `FLIGHT_DURATION_MS`-Wert anzufassen).
  Verifiziert: `tsc -b` sauber, Level 1 direkt aus einem Spielstand geladen
  (0 Hindernisse wie erwartet), keine Konsolenfehler. Das tatsächliche
  Tempo-GEFÜHL ließ sich wie bei allen Geschwindigkeits-Änderungen nicht per
  Browser-Automatisierung nachspielen (rAF-Freeze, siehe eigener Abschnitt) –
  Bestätigung am echten Gerät steht noch aus.
  Verifiziert: `tsc -b` läuft sauber durch, die Seite lädt ohne
  Konsolenfehler (Level 51 aus einem vorhandenen Spielstand direkt
  geladen, 7 Hindernis-Äxte korrekt vorplatziert – passt zur neuen
  `obstacleCountFor(50) === 7`-Stufe). Das TATSÄCHLICHE Spielgefühl (wie viel
  schneller/enger sich ein Lauf jetzt anfühlt) ließ sich NICHT per
  Browser-Automatisierung nachspielen – derselbe dokumentierte
  rAF-Freeze wie bei allen bisherigen Balancing-Änderungen (die
  Browser-Pane komponiert hier keine Frames, `requestAnimationFrame`
  bleibt aus, die Scheibe dreht sich in dieser Umgebung schlicht nicht).
  Bestätigung durch echtes Spielen auf dem Gerät steht noch aus.
  **Sechste Runde (Klaus, 2026-08-21: "Durchschnitt Äxte-Anzahl deutlich
  höher, es ist viel zu einfach die Level"):** diesmal gezielt NUR
  `axeCountFor` (Anzahl Äxte pro Level – voller wird das Brett, enger die
  Lücken zum Werfen), nicht Tempo oder Hindernisse, die waren gerade erst
  dran. Jede Stufe angehoben (Start 5→6, Deckel 12→19) und wieder früher
  erreicht als vorher; Schnitt über alle 100 vorbereiteten Level springt von
  ~8,7 auf ~12,7 Äxten (per Kopfrechnung über beide Stufenlisten). Bei den
  höchsten Leveln (Deckel 19 + Boss-Bonus 1 = 20 Würfe auf ein Brett mit
  `COLLISION_ANGLE_TOLERANCE_DEG`=10° pro Axt, macht 36 theoretische
  Steckplätze) wird gegen Levelende eine freie Lücke irgendwann rechnerisch
  unvermeidbar eng – im Highscore-Prinzip (irgendwann stirbt man garantiert,
  siehe Münzen/Läufe-Abschnitt) ist das der gewünschte Effekt, kein Bug.
  Verifiziert per echtem Spielstand: Level 51 direkt geladen, Axt-Vorrat
  zeigt 15 Äxte (`.axe-inventory__slot`-Elemente gezählt) – passt exakt zur
  neuen `axeCountFor(50) === 15`-Stufe (vorher 10). `tsc -b` sauber, keine
  Konsolenfehler. Das tatsächliche Schwierigkeitsgefühl ließ sich wie bei
  allen bisherigen Balancing-Runden nicht per Browser-Automatisierung
  nachspielen (rAF-Freeze) – Bestätigung durch echtes Spielen steht noch aus.
  **Siebte Runde – bewusste WALL bei Level 20-25 (Klaus: "es soll wirklich
  schwer sein, über Level 20-25 zu kommen, sehr schwer"):** statt die Kurve
  nochmal überall gleichmäßig anzuheben, diesmal ein klar spürbares
  Nadelöhr genau in diesem Fenster gebaut – Level 20 UND Level 25 sind
  ohnehin schon Boss-Level (`isBoss()`, `BOSS_EVERY=5`), die Lücke
  dazwischen war aber bisher nur eine normale Zwischenstufe. `axeCountFor`
  springt dort von 9-11 auf 16 (Wert, der sonst erst ab Level ~43 kommt),
  `obstacleBaseFor` von 4 auf 8 (mit der Schwankung effektiv 7-10 Hindernisse
  – nah am `OBSTACLE_COUNT_CAP`). Level 26-30 fällt danach bewusst auf die
  alten Werte zurück (11 Äxte / Basis 5 Hindernisse), bevor die ursprüngliche
  Kurve unverändert weiterläuft – kein neues Dauer-Plateau, sondern ein
  Nadelöhr, das man entweder übersteht oder eben nicht. Verifiziert per
  echtem Spielstand (Save-Feld `currentLevel` direkt gesetzt, da die
  Weltkarten-Reise-Animation denselben rAF-Freeze wie alle Dreh-Effekte hat
  und in der Sandbox nicht durchläuft): Level 20 (Boss) lädt mit 17 Äxten /
  10 Hindernissen (16+1 Boss-Bonus, 8+0-Schwankung+2 Boss-Bonus), Level 21
  mit 16 Äxten / 9 Hindernissen (8+1-Schwankung, kein Boss) – beide exakt
  wie von den neuen Formeln erwartet. `tsc -b` sauber, keine Konsolenfehler.
  Das tatsächliche Schwierigkeitsgefühl (wie brutal sich das Nadelöhr
  anfühlt) ließ sich wie immer nicht per Browser-Automatisierung nachspielen
  – Bestätigung durch echtes Spielen steht noch aus.
  **Achter Härte-Durchgang – Level 1-10 härter OHNE mehr Äxte, plus
  Boss-/Level-Rotation pro Runde (Klaus: "die Anfangs-Level 1-10 noch ein
  Stück schwerer, und es müssen nicht immer mehr Äxte werden, sondern
  einfach nur immer schwerer, und die Bosse dürfen nicht immer dieselben
  sein, rotiere sie durch, und auch die Level-Reihenfolge darf nicht dieselbe
  sein, mach ein paar neue Level und rotiere sie von Runde zu Runde, sonst
  wird es langweilig"):** drei damit zusammenhängende, aber technisch
  getrennte Änderungen:
  - **Level 1-10 schwerer über Hindernisse + Dreh-Muster statt Äxte:**
    `axeCountFor` bewusst UNANGETASTET (genau wie gewünscht). Stattdessen
    `obstacleBaseFor` für Level 4-19 angehoben (4-6: 1→2, 7-10: 2→3, 11-19:
    3→4, einheitlich mit der bisherigen 17-19-Stufe) und `spinPatternFor`
    verschärft: `steady` verschwindet jetzt schon ab Level 5 komplett aus dem
    Zyklus (vorher erst ab Level 20) – Level 5-19 laufen durchgehend mit
    Pulsieren/Richtungswechsel statt gelegentlich ruhig. Level 1-3 bleiben
    bewusst unangetastet (reine Grundmechanik-Einführung, 0 Hindernisse).
  - **Boss-Rotation:** neues Speicherfeld `runSeed` (`SaveData.runSeed`,
    `storage.ts`) verschiebt `bossFruitForLevel()`
    (`BOSS_FRUITS[(bossNumber + runSeed) % BOSS_FRUITS.length]`, ebenso für
    `HERO_BOSSES`) um `runSeed`-viele Stellen. Bei `runSeed=0` (Standard,
    auch für alte Spielstände nach der Migration) verhält sich alles exakt
    wie vorher – rückwärtskompatibel.
  - **Level-Layout-Rotation statt komplett neuer Level:** eine wirklich neue
    Level-Bibliothek hätte die sorgfältig austarierte Schwierigkeits-Kurve
    (Axt-/Hindernis-Zahl, Tempo, Dreh-Muster – bleibt bewusst NUR von
    `levelIndex` abhängig) verdoppeln müssen. Stattdessen verschiebt
    `runSeed` in `generateLevel()` die Apfel-/Hindernis-Winkel-Seeds um
    `runSeed * 53` bzw. `runSeed * 97` (eigene, wieder teilerfremde
    Faktoren) – dieselbe Levelnummer bekommt in Runde 2 eine spürbar andere
    Anordnung auf der Scheibe, bleibt aber INNERHALB einer Runde bei jedem
    Versuch identisch (kein `Math.random()`, wie der Rest der
    Level-Generierung). `LEVEL_COUNT` fest vorbereitete Level gibt es
    unverändert weiterhin, das vorberechnete `LEVELS`-Array dafür ist aber
    entfallen (siehe `levelConfigAt()`) – es hätte für jede Runde eine
    eigene Cache-Invalidierung gebraucht, `generateLevel()` ist aber reine,
    billige Arithmetik, direktes Neuberechnen bei jedem Aufruf ist einfacher
    und ähnlich schnell.
  - **`runSeed` steigt GENAU EINMAL pro neuer Runde**, nicht bei jedem
    Levelwechsel: im Game-Over-Effekt (`useAxeGame.ts`, der Moment, in dem
    ein Lauf endgültig vorbei ist – unabhängig davon, ob sofort neu
    gestartet wird oder die App erst später wieder aufgemacht wird) und bei
    "Von Level 1 starten" auf dem Startbildschirm (`goToLevel(0)`). EIN
    Sprung zu einer schon freigeschalteten Welt über die Weltkarte zählt
    NICHT als neue Runde (kein Neustart bei Level 1). `restartRun()` (Button
    im Game-Over-Fenster) erhöht bewusst NICHT nochmal – der Game-Over-Effekt
    ist zu dem Zeitpunkt schon gelaufen, ein zweiter Anhub dort hätte die
    Rotation bei jedem Tod um 2 statt 1 springen lassen.
  - **Bekannter Nebeneffekt, bewusst nicht behoben:** die Shop-Anzeige
    "schaltet frei bei Level X" für Boss-Beute-Äxte (`Shop.tsx`) rechnet
    weiterhin mit `runSeed=0` – nach mehreren Neustarts ist das nur noch
    eine grobe Erst-Runde-Orientierung, keine exakte Garantie mehr, welche
    Frucht bei welchem Level in der AKTUELLEN Runde auftaucht. Eine exakte
    Anzeige hätte den Shop von der laufenden Runde abhängig gemacht, was den
    Rahmen dieser Änderung gesprengt hätte – als offenes To-do vermerkt.
  Verifiziert per echtem Spielstand (Save-Felder `currentLevel`/`runSeed`
  direkt gesetzt): Level 7 (Index 6) hat jetzt 4 statt vorher 3 Hindernisse;
  bei `runSeed` 0→1 bleibt die Hindernis-ZAHL bei Level 7 identisch (4), aber
  alle vier Winkel verschieben sich einheitlich um +97° (227°/317°/47°/137°
  → 324°/54°/144°/234°) – Zahl bleibt an `levelIndex` hängen, nur die
  Anordnung rotiert; Level 5 (Boss) zeigt bei `runSeed=0` `board-melon.png`,
  bei `runSeed=1` `board-orange.png`, Axt-/Hindernis-Zahl bleiben dabei
  identisch (7/4). `tsc -b` sauber, keine Konsolenfehler. Das tatsächliche
  Schwierigkeitsgefühl von Level 1-10 ließ sich wie immer nicht per
  Browser-Automatisierung nachspielen (rAF-Freeze) – Bestätigung durch
  echtes Spielen steht noch aus.
  **Neunter Härte-Durchgang, direkt danach (Klaus: "die ersten 4 Level sind
  leider deutlich zu einfach und zu langweilig"):** hebt die alte, mehrfach
  bekräftigte Design-Entscheidung "Level 1-3 bleiben hindernisfrei" bewusst
  auf – aktuelles Feedback wiegt schwerer als eine ältere Design-Prämisse.
  Vorher waren Level 1-3 hindernisfrei UND (je nach Parität) liefen bis zu
  vier Level am Stück mit `steady`-Drehung – mehrere fast identische, ruhige
  Level hintereinander. Jetzt bleibt NUR Level 1 unangetastet (ein einziger
  ruhiger Eintritts-Wurf ohne Hindernis, `steady`-Drehung, zum Zeigen des
  Tap-Mechanismus) – ab Level 2 steht sofort ein Hindernis auf dem Brett
  (`obstacleBaseFor`) UND wechselt sich sofort Pulsieren ein
  (`spinPatternFor`). Verifiziert per echtem Spielstand: Level 1 weiterhin 0
  Hindernisse, Level 2 jetzt 2 Hindernisse (vorher 0) bei unveränderter
  Axt-Zahl (6). `tsc -b` sauber, keine Konsolenfehler.
- **Dreh-Muster** (`spinPattern`) sorgen für Abwechslung, ohne an den
  Grundwerten zu drehen: `steady` (gleichmäßig, nur bis Level 19), `pulse`
  (Tempo schwankt) und `reverse` (Scheibe dreht periodisch die Richtung um).
  WICHTIG: Kein Muster darf die Geschwindigkeit auf ~0 bringen. Steht die
  Scheibe kurz still, landen zwei schnell geworfene Äxte an derselben Stelle –
  mit der Game-Over-Regel wäre das ein unfairer Instant-Tod. Deshalb sinkt der
  Puls-Faktor nie unter 0.55 und der Richtungswechsel springt hart, statt weich
  durch null zu gehen. Gilt unverändert auch für die härtere Fassung unten.
  **Wie OFT pulsiert/gewechselt wird, skaliert jetzt zusätzlich mit dem
  Board-Tempo** (`periodFor()` in `TargetBoard.tsx`): bei Level-1-Tempo dauert
  ein Puls-Zyklus 2,6 Sek. und ein Richtungswechsel-Zyklus 3,4 Sek., linear
  interpoliert bis runter auf 1,0 bzw. 1,3 Sek. bei Höchsttempo
  (`MAX_SPEED_DEG_PER_SEC`). Vorher blieben beide Perioden über alle Level
  fest, nur die Grundgeschwindigkeit stieg – ein Level-100-Puls fühlte sich
  dadurch genauso "gemächlich" an wie einer bei Level 10, nur schneller
  abgespult. Die TIEFE des Pulses/die Härte des Wechsels bleibt dabei exakt
  gleich (siehe Fairness-Regel oben) – nur die Häufigkeit steigt.
- **Die Drehgeschwindigkeit steigt mit JEDEM Level** (streng steigend, nicht
  mehr pro Stufe schwankend): Level 1 = 55°/Sek., Level 50 = 126°/Sek., Level
  100 = 199°/Sek., Deckel erst bei Level ~183 (320°/Sek., siehe oben). Je
  schneller die Scheibe, desto kürzer das Zeitfenster, in dem ein bestimmter
  Apfel am Einschlagpunkt vorbeikommt – genau das macht das gezielte
  Apfel-Sammeln nach hinten raus schwerer.
- Jedes Level hat eine feste Axt-Anzahl (5-10, siehe Tabelle oben), am linken
  Bühnenrand als senkrechte Reihe sichtbar – geworfene Äxte werden dort grau.
- Am Brett hängen Äpfel (feste Positionen pro Level, AUSSERHALB des Randes an
  einem kleinen Stiel, nicht auf dem Holz). Trifft eine erfolgreich steckende
  Axt nah genug an einem Apfel, **fällt er sichtbar herunter** und bringt Münzen.
  Der fallende Apfel liegt in einer eigenen, NICHT rotierenden Ebene
  (`.target-mount__falling`) – im rotierenden Brett würde er beim Fallen
  mitkreiseln statt nach unten zu fallen.
- Level starten je nach Nummer mit bereits im Brett steckenden Äxten
  (`preplacedAxeAngles`) als Hindernisse (max. 6, siehe Tabelle oben).
- Ein Level endet auf zwei Arten: alle Äxte sauber verworfen → geschafft, ODER
  eine Axt trifft eine steckende Axt → Game Over (`GameOverModal.tsx`).
- Ergebnis-Screen nach geschafftem Level zeigt eingesammelte Äpfel und die
  verdienten Münzen (zählen sichtbar hoch). Nicht letztes Level: Button
  "Weiter zu Level N+1" plus "Werkstatt öffnen". Level 100 geschafft:
  Glückwunsch-Badge "Alle Level gemeistert!" statt Weiter-Button.

### Endlos-Modus nach Level 120

Level 120 (ursprünglich 100, siehe Heldenstadt-Abschnitt weiter unten) ist
NICHT das Ende. `generateLevel()` (siehe Level-System oben) ist eine reine
Funktion der Levelnummer OHNE eingebaute Obergrenze – Tempo deckelt sich
selbst bei `MAX_SPEED_DEG_PER_SEC`, Axt-/Hindernis-/Apfelzahl bei den letzten
`if`-Stufen, der Boss-Zyklus und die goldene-Apfel-Formel laufen über Modulo.
Der Endlos-Modus nutzt genau das aus, statt etwas Neues zu bauen:
- `levelConfigAt(levelIndex)` (`constants.ts`) liefert für Level ≤
  `LEVEL_COUNT` das vorberechnete Array-Element, darüber hinaus wird
  `generateLevel()` bei Bedarf einmalig live gerechnet. `useAxeGame.ts` nutzt
  diese Funktion überall statt direkt auf `LEVELS[...]` zuzugreifen.
- `nextLevel()` hat keine Obergrenze mehr (vorher `Math.min(..., LEVELS.length
  - 1)` – das hätte das letzte Level endlos wiederholt statt weiterzuzählen).
- Nach dem letzten Kampagnen-Level zeigt der Ergebnis-Screen einmalig "Alle
  120 Level gemeistert!" (`isCampaignComplete` in `useAxeGame.ts`, wahr GENAU
  beim Abschluss von Level `LEVEL_COUNT`) – der Weiter-Button bleibt aber immer
  da, beschriftet ab dann als "Weiter im Endlos-Modus" statt mit einer
  Levelnummer.
- **Kein Extra-Spardaten-Feld nötig:** `SaveData.bestLevel` zählt ohnehin über
  `LEVEL_COUNT` hinaus weiter (`Math.max(bestLevel, levelIndex + 2)`) und ist
  damit zugleich die Endlos-Bestmarke.
- **Welten laufen optisch aus:** `worldForLevel()` (`worlds.ts`) klemmt Level
  jenseits des letzten Welten-Levels auf die letzte Welt (aktuell Heldenstadt,
  siehe eigener Abschnitt weiter unten) – bewusst generisch über
  `WORLDS.length` gebaut, nicht auf eine bestimmte Welt fest verdrahtet, damit
  eine neue letzte Welt hier nichts ändern muss. Die Weltkarte zeigt
  zusätzlich einen Hinweis-Knoten "Endlos-Modus – Bestmarke Level N", sobald
  `bestLevel > LEVEL_COUNT` ist, damit die randvollen Fortschrittsringe nicht
  unerklärt bleiben.
- **Game Over im Endlos-Modus verhält sich wie gewohnt:** `blockStartIndex()`
  rechnet ohne Deckel weiter, es gibt bewusst KEINEN Sonderfall am
  Kampagnen-Ende – die 10er-Block-Regel gilt unverändert weiter.
  Verifiziert durch direktes Setzen von `currentLevel`/`bestLevel` im
  Spielstand statt durch Echtzeit-Durchspielen bis zum letzten Level –
  Letzteres ist in der automatisierten Browser-Umgebung wegen des
  dokumentierten rAF-Freeze-Problems nicht zuverlässig zu testen (siehe
  Zeitschritt-Deckel-Abschnitt).

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

### Heldenstadt (6. Welt), Sammelfiguren, Reise-Animation, automatischer Levelwechsel

Dritter Ausbau-Durchgang: eine komplett neue Welt mit eigenen Bossen und
einem eigenen Collectible, eine Reise-Animation auf der Weltkarte, und ein
Levelwechsel, der nicht mehr bei jedem einzelnen Level einen Tap verlangt.

- **Heldenstadt: 6. Welt, Level 101-120** (`worlds.ts`, `constants.ts`,
  `shop.ts`): `DIFFICULTY_TIERS` von 20 auf 24 erhöht (`LEVEL_COUNT` damit
  120 statt 100) – die Schwierigkeits-Kurve selbst brauchte dafür KEINE
  Anpassung, weil Axt-/Hindernis-/Apfelzahl und Tempo ab Level 31/26/50
  ohnehin schon am Anschlag sind (siehe Tabelle im Level-System-Abschnitt).
  Die neue Welt hat eine EIGENE Boss-Rotation (`HERO_BOSSES` statt
  `BOSS_FRUITS`): Drohnenwächter, Neonmaske, Wasserspeier, Antennentitan –
  bewusst eigene, unbenannte Großstadt-Gegner-Konzepte statt Marvel-Figuren
  (Green Goblin, Doc Ock, Electro, Venom …), die sind urheberrechtlich
  geschützt und ein Nachbau wäre unabhängig vom gewählten Namen eine
  Verletzung. `bossFruitForLevel()` (`constants.ts`) verzweigt nach
  `HERO_WORLD_START` (aus `worlds.ts` exportiert, damit `constants.ts` und
  `Shop.tsx` denselben Wert kennen) zwischen beiden Rotationen; `getBossFruit()`
  sucht in beiden Listen. Die Shop-Anzeige der Freischalt-Levels musste
  ebenfalls auf zwei Rotationen mit unterschiedlichem Start umgestellt werden
  (`fruitIndex`/`heroIndex` statt einem gemeinsamen Index).
- **Sammelfiguren** (`Apple.tsx`, `types.ts`, `storage.ts`, `constants.ts`,
  `useAxeGame.ts`, `Shop.tsx`): exklusiv in Heldenstadt, gebaut als direkte
  Erweiterung der goldenen-Apfel-Mechanik statt eines neuen Systems.
  `figurineIndexFor()` (analog `goldenAppleIndexFor()`, aber nur aktiv für
  Level in `HERO_WORLD_START..+WORLDS_LEVEL_COUNT`, trifft auf jedes 4. Level
  der Welt zu) markiert einen Apfel-Slot als Sammelfigur statt Frucht – golden
  und Sammelfigur schließen sich damit gegenseitig aus (goldene Äpfel gibt es
  in Heldenstadt gar nicht erst). `Apple.tsx` rendert bei `figurine=true` eine
  komplett andere kleine Chibi-Heldenfigur (rot/blau, eigene unbenannte
  Gestaltung) statt der Frucht-Form. Landet beim Levelabschluss in
  `SaveData.figurines` (reiner Vorrat, keine einzeln verwalteten Exemplare –
  einfacher und robuster als eine "hat man diese schon"-Sammel-Logik), im
  Shop-Extras-Reiter gegen Diamanten eintauschbar (`GEMS_PER_FIGURINE = 2`,
  `tradeFigurines()` in `useAxeGame.ts`, tauscht immer den gesamten Vorrat auf
  einmal). `LevelReward.figurines` läuft wie `gems` OHNE Serien-Multiplikator
  (reines Fund-Glück) und wird im Ergebnis-Screen mit eigenem rot-blauem
  Badge angezeigt.
- **Weltkarte: Reise-Animation** (`WorldMap.tsx`/`.css`): Antippen einer
  freigeschalteten Welt springt nicht mehr sofort – eine kleine, sich
  drehende Axt reist sichtbar den Sandpfad entlang zur Zielwelt, auch über
  mehrere Zwischen-Inseln hinweg (`routeSegments()` verkettet die
  Kurvensegmente zwischen aktueller und Ziel-Position). Bewusst KEIN CSS
  `offset-path` verwendet – das erwartet echte Pixel-Koordinaten und müsste
  bei jeder Fenstergröße neu berechnet werden. Stattdessen dieselben
  Prozent-Koordinaten wie der Rest der Karte, Position pro Frame per
  kubischer Bezier-Auswertung (De-Casteljau-Formel, `pointOnSegment()`)
  berechnet. Dazu mehr Insel-Detail (5 statt 3 Deko-Sprites pro Insel mit
  Dreh-/Größen-Jitter je Instanz, ein kleiner Satelliten-Fels neben jeder
  Insel) für mehr "handgemalte" Unruhe, näher an der als Vorlage geteilten
  Bild-Referenz.
- **Automatischer Levelwechsel** (`LevelCompleteModal.tsx`/`.css`, `App.tsx`):
  nach einem geschafften Level geht es nach 3,5 Sekunden von selbst zum
  nächsten Level über, statt auf einen Pflicht-Tap auf "Weiter" zu warten – ein
  schrumpfender Balken am Haupt-Button zeigt das vorher an, der Button
  funktioniert für Ungeduldige weiterhin. Damit der Sprung nicht unbemerkt
  passiert, zeigt `App.tsx` danach kurz einen "Level N"-Toast auf der Bühne
  (`expectLevelIntroRef` wird NUR beim automatischen/manuellen "Weiter"
  gesetzt, nicht bei jedem Levelwechsel – ein Weltkarten-Sprung oder Neustart
  hat seinen Kontext schon durch die eigene Navigation).
- **Startbildschirm erweitert** (`StartScreen.tsx`/`.css`): ein "Aktuelle
  Welt"-Badge (Punkt in der jeweiligen Welt-Akzentfarbe, aus dem geplanten
  Level per `worldForLevel()` berechnet) und eine Sammelfiguren-Pille neben
  Münzen/Diamanten, dazu drei sanft driftende Wolken als eigene Ebene (nicht
  Teil des Hintergrund-Gradients, damit sie unabhängig vom teils scrollenden
  Inhalt animieren). Titel und Regeln-Karte konsequenter blau: "Throw" von
  Orange auf Zyan, Regeln-Karte mit Gradient statt flachem Blauton.

Dabei ein fehlendes Anschluss-Stück gefunden und nachgezogen: die
Sammelfiguren-Belohnung (`LevelReward.figurines`) wurde beim ersten Bau schon
berechnet, aber im Ergebnis-Screen noch nicht angezeigt – erst beim
automatischen-Levelwechsel-Umbau aufgefallen und mit erledigt.

Durchgetestet: Level 105 direkt geladen (Boss-Zyklus zeigt korrekt
"Drohnenwächter" statt einer Frucht, rote Heldenstadt-Bühnentönung), alle vier
Helden-Boss-Äxte im Shop mit korrekten Freischalt-Leveln (105/110/115/120),
Sammelfigur-Rendering per DOM-Inspektion bestätigt (eigenes `<circle>`-Element
an der berechneten Apfel-Position), echter Eintausch von 3 Figuren gegen 6
Diamanten im Shop, Weltkarten-Reise sowohl über eine benachbarte Welt als auch
über vier Zwischen-Inseln hinweg (beide Male korrekte Landung + kein
Konsolenfehler), automatischer Levelwechsel real beobachtet (Münzstand und
Levelnummer stiegen über zwei Level hinweg ohne manuellen Tap), Startbildschirm
mit neuem Welt-Badge in Wald (grün) und Heldenstadt (rot) sowie sichtbarer
Sammelfiguren-Pille.

### Spiel-Bühne belebt (Feedback: "sieht tot aus statt lebendig")

Nach dem ganzen Menü-/Weltkarten-Ausbau blieb die eigentliche Spiel-Ansicht
(`.stage`) optisch beim ursprünglichen, flachen "Knife Hit"-Arcade-Look – kein
Wunder, dass sie neben dem inzwischen lebendigen Startbildschirm und der
Cartoon-Weltkarte tot wirkte. Drei gezielte Korrekturen statt eines
kompletten Neu-Looks:

- **Staub-Partikel tönen sich nach Welt** (`App.css`, `worlds.ts`): vorher
  trieb überall derselbe amberfarbene Staub, auch in der Eis- oder
  Kosmos-Welt – passte farblich nicht. `worldStyleVars()` exportiert jetzt
  zusätzlich `--world-accent`, `.stage__dust span` nutzt die Variable statt
  eines festen Werts.
- **Ecken-Deko war praktisch unsichtbar UND komplett regungslos**
  (`WorldDecor.tsx`/`.css`): `color: rgba(255,255,255,0.06)` war so blass,
  dass eine Animation sowieso niemand gesehen hätte – erst auf 0.13 angehoben
  (immer noch klar Hintergrund), dann eine zur Deko-Art passende Idle-
  Animation ergänzt: Bäume schwanken, Kakteen wackeln minimal, Eiszapfen
  glänzen auf, Lava pulsiert, Heldenstadt-Fensterlichter flackern
  unregelmäßig (`steps(1, end)` statt weichem Überblenden). Braucht eine neue
  Modifier-Klasse `world-decor--<art>` auf dem äußeren Container, weil die
  Deko-Art vorher nirgends als CSS-Klasse verfügbar war (nur als SVG-Auswahl
  in der Komponente).
- **Äpfel pendeln sanft am Stiel** (`TargetBoard.tsx`/`.css`): vorher hingen
  sie zwischen den Würfen komplett reglos. Neues Kind-Element
  `.target-board__apple-sway` MIT EIGENER Rotation, damit die Animation nicht
  mit dem inline gesetzten Positionierungs-`transform` auf dem Eltern-Element
  kollidiert (derselbe Trick wie beim Axt-Zusammenzucken/Hit-Stop). Versatz
  je Apfel aus der ID (`apple.id % 4`), damit nicht alle im Gleichtakt
  schwingen.

Alle drei respektieren `prefers-reduced-motion`. Per DOM-Inspektion bestätigt
(`getComputedStyle` auf `--world-accent`, `animation-name`,
`animation-delay`) für Wald (grün) und Heldenstadt (rot/Flacker-Keyframe) –
keine Konsolenfehler.

### Vierter Grafik-Durchgang: Welt-Kulissen, Zielscheibe, Axt, Vorrat, Äpfel

Auf das Feedback "der Hintergrund ist bei jeder Welt null passend, mach die
Scheibe/Axt/den Vorrat/die Äpfel lebendiger" fünf gezielte Bausteine:

- **WorldHorizon – echte Kulisse statt Farbtönung** (`WorldHorizon.tsx`/`.css`,
  NEUE Komponente, ergänzt `WorldDecor` statt sie zu ersetzen): eine volle
  Horizont-Silhouette am Bühnenfuß statt nur getönter Hintergrundfläche + zwei
  kleiner Ecken-Icons. Wald=zweischichtige Baumreihe, Wüste=Dünen+Kakteen,
  Eis=schroffe Bergkette, Vulkan=Kegel mit glühender Lava-Linie,
  Heldenstadt=Skyline mit flackernden Fenstern, Kosmos=aufgehender Mond.
  Formen prozedural per Seed (`spikes()`/`ridge()`/`dunes()`/`buildings()`),
  dieselbe Technik wie die Weltkarten-Inseln. **Kontrast-Bug dabei gefunden
  und behoben:** reine schwarze Silhouetten waren praktisch unsichtbar, weil
  `--color-bg-bottom` jeder Welt ohnehin fast Schwarz ist (Silhouette vor
  Schwarz). Fix: Füllung über `color-mix()` aus `--world-accent` statt
  reinem Schwarz, dazu ein kräftigerer Lichtsaum an der Oberkante – beides
  vom Hintergrund unabhängige Wege, die Kontur erkennbar zu machen.
- **Zielscheibe**: wandernder Glanzstreifen (eigenes Element mit eigener
  `conic-gradient`-Rotation statt der inline gesetzten Dreh-Animation der
  Scheibe – hält die Fläche auch bei pausierter Scheibe lebendig), drei
  zeitversetzt aufblitzende Funkelpunkte um den Kern, kräftigerer Rand-Bevel.
- **Axt**: zusätzlicher heller Gradient-Stop auf der Klinge für ein
  deutlicheres Specular-Highlight, Griffwicklung mit Gradient statt
  Flachfarbe (wirkt rund/gewölbt), wanderndes Glanzlicht auf der Schneide
  (`stroke-dashoffset`-Animation, eigene `Axe.css`), bereitliegende Axt wiegt
  sich beim Atmen jetzt zusätzlich leicht hin und her.
- **Axt-Vorrat-Leiste**: dezenter Köcher-Hintergrund (`::before`, liegt
  automatisch hinter den Äxten), wartende Äxte wippen leicht (über die
  separate CSS-`translate`-Property, damit es nicht mit dem bestehenden
  `rotate(-32deg)` auf `transform` kollidiert), Verbrauchs-Übergang mit
  federnder statt linearer Kurve.
- **Äpfel**: normale Frucht bekommt denselben radialen Gradient-Aufbau wie
  die goldene Variante (vorher flache Einzelfarbe) plus einen kleinen
  Tau-Glanzpunkt. Fall-Animation um Zwischenschritte erweitert (leichte
  seitliche Drift statt geradem Fallen, mehr Gesamtdrehung), dazu ein kurzer
  Blatt-Spritzer-Burst genau im Abwurf-Moment (nur bei echten Früchten, nicht
  bei der Heldenstadt-Sammelfigur).

Alle neuen Animationen respektieren `prefers-reduced-motion`. Durchgetestet:
alle 6 Welten-Horizonte im Browser (Baumreihe, Dünen+Kakteen, Bergkette,
Vulkankegel, Skyline, Mond), Glanzstreifen/Funkeln/Wippen per
`getComputedStyle`-Inspektion bestätigt, keine Konsolenfehler bei mehreren
echten Würfen.

### Echte Foto-Hintergründe versucht, für die Spiel-Bühne wieder verworfen

Ein Versuch, `WorldHorizon`/`WorldDecor` (prozedurale Silhouetten, siehe oben)
auf der Spiel-Bühne durch echte Gemini-Bilder zu ersetzen
(`game/worldImages.ts`, sechs Welt-Bilder unter `public/backgrounds/`,
`App.tsx` setzte `--world-bg-image` inline als oberste `background`-Ebene) –
Klaus' Rückmeldung: **die Welt-Bilder waren zu realistisch/düster gemalt und
haben den Kinderspiel-Effekt kaputt gemacht**, das Foto für den
Startbildschirm (`start-screen.jpg`, heller Cartoon-Ozean-Look) passte aber
sehr gut. Deshalb:
- **Bühnen-Wiring komplett zurückgebaut**: `App.tsx`/`App.css` wieder auf die
  reine prozedurale Fassung (`WorldHorizon` zeigt sich unconditional wie
  vorher, kein `--world-bg-image` mehr), `game/worldImages.ts` gelöscht (nach
  dem Rückbau nirgends mehr importiert).
- **Startbildschirm-Bild bleibt** (`StartScreen.css`, `url('/backgrounds/
  start-screen.jpg')` als oberste `background`-Ebene, alte Verlauf-/
  Wolkentupfen-Gradients weiter als Fallback darunter) – das war der Teil,
  der laut Feedback gut passt.
- Die sechs jetzt unbenutzten Welt-Bilder (`public/backgrounds/world-*.jpg`)
  liegen noch auf der Platte (~350 KB gesamt), aber werden von keinem Code
  mehr referenziert – bewusst NICHT gelöscht, falls sie für etwas anderes
  (z.B. ein anderer Kontext als Bühnen-Hintergrund) noch gebraucht werden.
  Nachfragen, ob die weg sollen, falls sie stören.
- Verifiziert: `tsc -b` sauber, `.stage` liefert per `getComputedStyle`
  wieder nur die alten `repeating-linear-gradient`/`linear-gradient`-Werte
  (kein `url(...)` mehr), Level lädt ohne Konsolenfehler.

### Boss-Level

- **Jedes 5. Level ist ein Boss** (`BOSS_EVERY`, `bossFruitForLevel()` in
  `constants.ts`). Statt Holz ist die Zielscheibe dann eine aufgeschnittene
  Frucht – Wassermelone, Orange, Kiwi, Drachenfrucht, Ananas, Zitrone,
  Blaubeere, Granatapfel, Kokosnuss, Traube (`BOSS_FRUITS` in `shop.ts`).
  Die Liste wiederholt sich, Level 5-50 decken alle zehn ab. Ab Level 101
  (Heldenstadt) läuft eine GETRENNTE Boss-Rotation, siehe eigener Abschnitt
  weiter unten.
- Boss-Level sind eine Prüfung: eine Axt mehr, +20°/Sek. Tempo, ein
  zusätzliches Hindernis und ein fest auf `pulse` gesetztes Dreh-Muster
  (siehe Nachschärf-Kommentar in `generateLevel()`, `constants.ts`). Das
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
  **Anzeige später auf rohe XP-Zahlen umgestellt** (siehe XP-Abschnitt weiter
  unten, "Ab 200 XP" statt Level-Text), **dann auf Klaus' Feedback wieder
  zurück auf Level-Text geändert** ("die Level sollen man mit XP bekommen" –
  die rohe XP-Zahl war zu abstrakt): `WorldMap.tsx` zeigt gesperrte Welten
  jetzt wieder als `Ab Level ${startLevelIndex + 1} (durch XP)` statt
  `Ab ${xpThreshold} XP` – der Mechanismus bleibt exakt derselbe (XP schaltet
  frei, nicht der Highscore der laufenden Runde), nur die Beschriftung ist
  wieder die vertraute Levelnummer statt einer abstrakten Punktzahl. Das
  ungenutzt gewordene `xpThreshold`-Feld auf `MapNode` dabei entfernt, `Level
  ${startLevelIndex + 1}` reicht als Anzeige-Wert.
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

- **Highscore-Prinzip: ein Game Over wirft IMMER auf Level 1 zurück, egal wie
  weit man war.** Frühere Fassung warf nur an den Anfang des aktuellen
  10er-Blocks zurück (Level 1, 11, 21, …) – auf Wunsch geändert: das Ziel ist
  jetzt ein möglichst hoher Highscore in einem einzigen ununterbrochenen Lauf
  statt Kampagnen-Fortschritt mit Teil-Rückwurf. Ein Fehler ist wieder ein
  echter Fehler. `restartRun()` und der Game-Over-Effekt in `useAxeGame.ts`
  setzen `currentLevel` deshalb fest auf `0`, nicht mehr auf
  `blockStartIndex(levelIndex)`. Münzen, Diamanten, XP und Skins aus bereits
  abgeschlossenen Leveln bleiben dabei erhalten (die werden ja sofort beim
  Levelabschluss gutgeschrieben, nicht erst am Lauf-Ende) – nur der laufende
  Versuch verfällt. Das höchste je erreichte Level bleibt als **Highscore**
  gespeichert (`bestLevel`, umbenannt von "Bestmarke" in der gesamten UI). Die
  Punktreihe im HUD nutzt weiterhin `LEVELS_PER_BLOCK`/`blockStartIndex()` für
  die Positionsanzeige (rein kosmetisch, "wo stehe ich in diesem 10er-
  Abschnitt") und der 10er-Block-Münzbonus (`blockCompletionBonus`) läuft
  unverändert weiter – beide sind jetzt komplett unabhängig vom Neustart-Punkt.
- **XP: neue, dauerhafte Ressource, schaltet Welten frei – unabhängig vom
  Highscore.** Jedes geschaffte Level bringt `XP_PER_LEVEL` (10, bewusst FEST
  ohne Serie/Perfekt-Bonus/Schwierigkeit – anders als die Münzen soll XP nicht
  taktisch optimierbar sein, nur ein verlässlicher Fortschrittsbalken). XP
  übersteht ein Game Over (wie Münzen), auch wenn `currentLevel` dabei auf 0
  zurückspringt – das ist der ganze Witz daran: man kann nie weiter als bis
  zum eigenen Highscore in EINEM Lauf kommen, aber Welten schaltet man über
  viele Läufe hinweg frei, ohne sie in einem einzigen perfekten Durchlauf
  erreichen zu müssen. Die Schwelle pro Welt ist bewusst kein eigenes
  Datenfeld in `worlds.ts` (das kennt XP nicht, um einen Zirkelimport mit
  `constants.ts` zu vermeiden), sondern wird in `WorldMap.tsx` direkt aus dem
  bestehenden `startLevelIndex` abgeleitet (`startLevelIndex * XP_PER_LEVEL`
  – Wald 0, Wüste 200, Eis 400, Vulkan 600, Kosmos 800, Heldenstadt 1000).
  Damit bleibt das Freischalt-TEMPO ungefähr wie vorher (vorher: Level
  erreicht schaltet sofort frei; jetzt: gleich viele geschaffte Level
  irgendwann über beliebig viele Läufe schalten frei), nur dass man dafür
  nicht mehr in einem Rutsch bis dahin durchspielen muss. Der Endlos-Modus-
  Knoten auf der Weltkarte bleibt bewusst an `bestLevel` (Highscore) hängen,
  nicht an XP – der zeigt ja gerade "wie weit warst du in deinem besten
  Lauf", nicht "wie viel hast du insgesamt gefarmt".
  Verifiziert per direktem Setzen von `xp`/`currentLevel` im Spielstand: Welt
  exakt an der Schwelle (199 XP gesperrt, 200 XP frei), Game Over in Level 15
  (zweiter 10er-Block) wirft korrekt auf Level 1 zurück statt auf Level 11
  wie es die alte Logik getan hätte. Die tatsächliche XP-Gutschrift beim
  Abschluss eines Levels ließ sich nicht per echtem Durchspielen verifizieren
  (derselbe rAF-Freeze wie beim Endlos-Modus, siehe eigener Abschnitt weiter
  unten – die Scheibe dreht sich in der automatisierten Browser-Umgebung
  nicht, jeder zweite Wurf kollidiert deshalb zwangsläufig mit dem ersten),
  der Code folgt aber exakt demselben, bereits bewährten Muster wie die
  Diamanten-/Sammelfiguren-Gutschrift direkt daneben.
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
  + Scheiben, `LEGENDARY_SKINS` in `shop.ts`) und **Extras** (Boss-Beute aus
  BEIDEN Boss-Rotationen – Boss-Früchte UND Heldenstadt-Bosse – plus das
  Oster-Ei, siehe unten). Der Extras-Reiter zeigt zusätzlich, sobald Figuren
  im Inventar sind, eine Sammelfiguren-Eintausch-Karte (siehe Heldenstadt-
  Abschnitt weiter oben) GANZ OBEN, vor der Boss-Beute-Liste. Kaufen zieht
  Münzen ODER Diamanten ab, je nach `skin.source` (`'shop'` = Münzen, `'gem'`
  = Diamanten) und rüstet direkt aus; Gekauftes lässt sich frei wechseln.
  **Kein Design verändert das Balancing** –
  nur Farben und Glanz.
  Bug beim Bau des vierten Reiters gefunden und behoben: `equippedId` wurde
  früher einmal PRO REITER berechnet (`tab === 'board' ? ... : ...`), was für
  den gemischten Legendär-Reiter falsch war (eine Scheibe konnte fälschlich als
  "ausgerüstete Axt" markiert erscheinen). Jetzt wird pro Karte einzeln anhand
  von `skin.kind` verglichen.
- **Axt-Auswahl im Äxte-Reiter komplett getauscht** (`shop.ts`, Klaus'
  Wunsch): die ursprünglichen 7 Kauf-Äxte (Bronzeklinge, Frostkante,
  Glutspalter, Goldrausch, Jadeschneide, Leerenzahn, Netzschwinger) sind raus,
  ersetzt durch ein neues Zwölfer-Set – Wurzelhieb, Korallenschneide,
  Dampfschmiede, Runenbeil, Gezeitenklinge, Sternenschneide, Dornengift,
  Lavabruch, Pestbeil, Königsbeil, Datenbeil, Lichtschwinge (700-8300 Münzen,
  aufsteigend). Nur die kostenlose Start-Axt "Holzfäller" blieb unangetastet.
  Die Farbpaletten stammen aus zwölf per Gemini erzeugten Konzeptbildern –
  übernommen wurde NUR die Farbgebung (Stahl-/Holz-/Wicklungs-/Kontur-/
  Glüh-Werte in `AXE_STYLES`), nicht die Form: jede Axt nutzt weiterhin
  dieselbe gemeinsame SVG-Silhouette aus `Axe.tsx`. Bewusste Entscheidung
  gegen echte Bild-Assets pro Axt – hätte die Wurf-Rotation, den
  Glanzlicht-Effekt und vor allem die Lesbarkeit bei 22px im Vorrat riskiert
  (siehe Kommentar in `Axe.tsx` zur Kontur-Notwendigkeit bei kleiner Größe).
  Boss-Beute-, Legendär- und Oster-Ei-Äxte sind ein getrenntes Sortiment und
  unberührt. Geprüft: Werkstatt lädt alle verbliebenen Äxte ohne
  Konsolenfehler, `tsc -b` läuft sauber durch.
- **Axt-Skins: individuelle Silhouetten, dann echte Bild-Assets** (neue Datei
  `game/axeShapes.ts`, `Axe.tsx`): zwei Nachschärf-Runden auf dasselbe
  Feedback ("sieht noch wie eine Axt aus, nicht wie das Bild").
  1. Erste Runde: jede der 12 neuen Äxte bekam eine EIGENE Hand-gezeichnete
     SVG-Form (`AXE_SHAPES`) statt nur einer anderen Farbe auf der
     Standard-Silhouette – Doppelaxt (Runenbeil/Königsbeil, durch Spiegeln
     der Standard-Klinge an x=16), lange Sichel (Dornengift), Zahnrad-Rundung
     (Dampfschmiede), Wellen-Kontur (Gezeitenklinge) usw., dazu kleine
     Zier-Ebenen (Edelstein, Totenkopf, Schaltkreis-Linien, Gift-Tropfen, ...
     über `accentFills`/`accentStrokes`). WICHTIGE LEHRE dabei: die Werkstatt
     zeigt Äxte nur bei 26px (`Shop.tsx`), das Inventar bei 30px – feine
     Kurven-Unterschiede und kleine Zier-Details gehen bei der Größe unter,
     nur GROSSFLÄCHIGE Silhouetten-Unterschiede (breit/schmal, mittig/
     einseitig, kompakt/langgezogen) bleiben erkennbar. Erste Fassung war zu
     zaghaft (alle Formen noch zu ähnlich der Standard-Axt) und musste
     nachgeschärft werden. Per DOM-Analyse (Bounding-Box-Breite/-Höhe/-Fläche
     aller 12 Formen per `getBBox()`) verifiziert, dass sie sich danach
     deutlich unterscheiden – Screenshot-Vergleich war bei mir technisch
     nicht möglich (Browser-Pane nicht sichtbar), deshalb DOM-Messung statt
     visueller Prüfung.
  2. Trotzdem reichte das Klaus nicht – seine Gemini-Bilder sind gemalte
     Konzept-Kunst mit deutlich mehr Detail, als eine Hand-Vektor-
     Nachzeichnung treffen kann ("schaut VIEL besser und anders aus als in
     der App"). Zweite Runde: `AXE_IMAGES` in `axeShapes.ts` + neuer
     Rendering-Zweig in `Axe.tsx` – Skins mit echtem Bild rendern jetzt ein
     `<img>` statt der SVG-Pfade. **Wichtige Einschränkung, die zum Umbau
     führte:** ein Bild, das Klaus im Chat einfügt, kann ich nur VISUELL
     beschreiben, aber nicht als Datei verarbeiten (kein Zuschneiden, kein
     Hintergrund entfernen, kein Einbau als echtes Asset) – dafür muss die
     Datei auf der Festplatte liegen. Verarbeitung des ersten gelieferten
     Bilds (Python/Pillow, Skript im Scratchpad, nicht im Repo): weißer
     Hintergrund per Helligkeits-Schwellwert mit weichem Rand transparent
     gemacht, auf den Inhalt zugeschnitten, auf max. 900px Höhe begrenzt,
     liegt in `public/axes/`. Gleiche Bounding-Box wie die Vektor-Variante
     (`size` × `size*1.5`), damit Wurf-Rotation/Positionierung an allen
     Aufruf-Stellen unverändert bleiben – die Transforms hängen an den
     umgebenden Wrapper-Divs (`.axe-flying`, `.stage__ready-axe`,
     `.gameover-axe__half`), nie an der Axt-Komponente selbst, deshalb war
     der Root-Element-Tausch (svg -> div) gefahrlos möglich. Kompromiss:
     Bild-Skins lassen sich nicht mehr per Farbwerte einfärben oder mit dem
     Glanzlicht-Wander-Effekt versehen – die komplette Optik steckt im Bild.
  3. **Inzwischen ALLE 30 Äxte im Spiel laufen auf echten Bildern** –
     Zwölfer-Set, Start-Axt, alle 10 Boss-Beute-Früchte, alle 4
     Heldenstadt-Bosse, beide Legendär-Äxte und das Oster-Ei (`AXE_IMAGES` in
     `axeShapes.ts`). Bei der Start-Axt zusätzlich bestätigt, dass Bild-Skins
     auch außerhalb des Zwölfer-Sets funktionieren – `axe-standard` hatte
     vorher gar keinen `AXE_SHAPES`-Eintrag (nutzte den `DEFAULT_SHAPE`-
     Fallback), das Bild überschreibt trotzdem sauber darüber. Beide
     Rendering-Wege laufen parallel, `getAxeImage()` hat Vorrang vor
     `getAxeShape()` – der Vektor-Zweig bleibt im Code als Fallback für
     etwaige künftige Skins ohne Bild. Bei 26px (Werkstatt-Icon-Größe) per
     Downscale-Test geprüft: Silhouette und Farbthema bleiben bei allen
     erkennbar.
  4. **Scheiben ziehen nach: ALLE 22 Zielscheiben-Designs laufen jetzt
     ebenfalls auf echten Bildern** (Details siehe Werkstatt-Abschnitt weiter
     unten für die technische Umsetzung in `TargetBoard.tsx`) – die 6
     kaufbaren Scheiben, beide Legendär-Scheiben, UND alle 14 Boss-Beute-
     Scheiben (10 Früchte + 4 Heldenstadt-Bosse), die die Scheibe nur
     automatisch WÄHREND des jeweiligen Boss-Levels annimmt (kein eigener
     Shop-Eintrag). Per direktem Setzen von `currentLevel` auf einen
     Boss-Index verifiziert (Level 5 = Wassermelone, Level 50 = Traube),
     jeweils korrektes Bild ohne Konsolenfehler.
     **Überraschung beim Massen-Import:** Klaus hatte angenommen, er müsse
     jedes Gemini-Bild einzeln manuell als Datei speichern. Tatsächlich
     reicht es, Bilder direkt in den Chat einzufügen – die Umgebung legt
     dabei automatisch Kopien als UUID-benannte `.jpeg`-Dateien im
     Projekt-Root ab, die genauso lesbar sind wie eine "richtig"
     gespeicherte Datei. Erkannt, weil `git status` nach dem Chat-Einfügen
     plötzlich einen Schwung unbekannter UUID-Dateien zeigte. Diese Dateien
     NICHT committen (gehören nicht ins Repo, sind nur der
     Chat-Upload-Mechanismus) – nur die verarbeiteten PNGs in `public/axes/`
     bzw. `public/boards/`.
- **Zielscheiben: echte Bild-Assets statt CSS-gezeichneter Fläche**
  (`game/boardImages.ts`, `TargetBoard.tsx`, `Shop.tsx`): analog zu den
  Äxten, aber technisch anders gelöst, weil die Scheibe kein einfaches Icon
  ist, sondern ein komplexes Objekt aus mehreren unabhängigen Ebenen
  (rotierende Holzfläche, steckende Äxte, hängende Äpfel, Riss-Effekt beim
  Level-Abschluss). Ein Bild-Skin ersetzt in `TargetBoard.tsx` NUR die
  dekorativen CSS-Ebenen (`__face`, `__wedges`, `__ticks`, `__ring`,
  `__sheen`, `__shimmer`, `__bullseye`) durch ein einzelnes `<img>` – Rotation
  (eigener rAF-Loop, unverändert), steckende Äxte/hängende Äpfel (eigene
  absolut positionierte Kind-Elemente auf demselben Radius wie vorher) und
  der Riss-Effekt bleiben komplett unangetastet, weil sie ohnehin schon
  unabhängige Ebenen OBEN AUF der Fläche waren. `Shop.tsx` hat für die
  Werkstatt-Liste eine KOMPLETT SEPARATE Mini-Vorschau (`SkinPreview`,
  eigene 38px-CSS-Scheibe) – die wurde beim ersten Board-Bild (Eiche)
  übersehen und musste extra auf Bild-Unterstützung umgestellt werden, sonst
  hätte die Liste weiter die alte Optik gezeigt, obwohl das echte Spiel
  schon das Bild nutzt.
  Deckt am Ende ALLE 22 Scheiben-IDs ab, nicht nur die 8 kaufbaren
  (`BOARD_SKINS` + `LEGENDARY_BOARD_SKINS`): die 14 Boss-Beute-Scheiben
  (`board-melon` usw., `board-drone` usw.) sind keine eigenen Shop-Skins,
  sondern werden nur als `bossFruit.boardSkinId` direkt an die `boardSkin`-
  Prop von `TargetBoard` durchgereicht, solange man IM jeweiligen
  Boss-Level ist (`activeBoardSkin` in `useAxeGame.ts`) – dieselbe
  `getBoardImage()`-Zuordnung greift deshalb automatisch, ohne dass dafür
  irgendwo zusätzlicher Code nötig war.
- **Echte Hintergrundbilder für Startbildschirm und alle 6 Welten**
  (`game/worldImages.ts`): auf Feedback ("sieht sehr billig aus") die bisher
  rein prozeduralen Bühnen-Hintergründe (Farbverlauf + Schatten-Streifen,
  siehe `.stage` in App.css) durch echte Gemini-Bilder ergänzt. Technisch als
  zusätzliche, oberste `background`-Ebene gelöst (`--world-bg-image`
  CSS-Variable, von App.tsx pro Welt gesetzt) statt als eigenes DOM-Element –
  dadurch bleibt der alte Farbverlauf als Fallback bestehen, falls für eine
  Welt (oder z.B. spätere neue Welten) mal kein Bild da ist, ohne
  Sonderfall-Code. Beim Startbildschirm ist es einfacher: nur ein festes Bild
  (`START_SCREEN_BACKGROUND_IMAGE`), direkt in `StartScreen.css` als
  oberste Ebene vor die bisherigen Verlauf-/Wolkentupfen-Gradients gesetzt.
  **Wichtiger Fund dabei:** die alte, prozedurale `WorldHorizon`-Silhouette
  (Bäume/Dünen/Berge/Vulkan/Skyline am Bühnenfuß, siehe eigener Abschnitt
  weiter unten) zeichnet GENAU dasselbe Motiv an GENAU derselben Stelle wie
  das neue Bild – beides gleichzeitig hätte sich sichtbar überlagert/verdoppelt.
  `WorldHorizon` wird deshalb nur noch gerendert, wenn für die aktuelle Welt
  kein Bild existiert (`{!worldBgImage && <WorldHorizon ... />}` in App.tsx) –
  `WorldDecor` (die kleinen Ecken-Deko-Animationen) bleibt dagegen unverändert
  bestehen, die ist klein/dezent genug, um mit dem neuen Bild zusammen zu
  funktionieren. Bilder bewusst OHNE Freistellen verarbeitet (anders als bei
  Äxten/Scheiben) – das sind volle rechteckige Szenenbilder, kein Icon vor
  weißem Hintergrund, brauchen also keine Transparenz, nur Verkleinern/
  Komprimieren (Python/Pillow, JPEG statt PNG spart hier deutlich Dateigröße
  bei diesen foto-artigen Verläufen – alle 7 zusammen unter 400 KB). Beim
  Gemini-Prompt bewusst verlangt, dass die vertikale MITTE des Bilds dunkel/
  ruhig bleibt (Detail nur oben und am unteren Rand) – genau dort liegen
  Zielscheibe und Axt-Flugbahn, ein zu detailreicher Hintergrund dort hätte
  die Lesbarkeit gekostet. Geprüft: alle 7 Bilder laden mit Status 200, echter
  Wechsel zwischen zwei Welten (Wald -> Vulkan) live bestätigt, keine
  Konsolenfehler.
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
- `SettingsModal.tsx`: Ton/Vibration an-aus und "Fortschritt zurücksetzen"
  (mit Rückfrage, weil es alles löscht).
- **Schwierigkeitsgrad-Auswahl entfernt** (Klaus: "die Wahl soll weg, es soll
  automatisch immer nur eine geben, und die soll schwer sein"). Es gab
  vorher Leicht/Normal/Schwer (`SaveData.difficulty`, `Difficulty` in
  `types.ts`), umgesetzt über zwei nachträgliche Multiplikatoren in
  `useAxeGame.ts` (`DIFFICULTY_SPEED_MULTIPLIER`/`DIFFICULTY_REWARD_MULTIPLIER`
  in `constants.ts`: Board-Tempo ×0.8/×1/×1.25, Münz-Endsumme ×0.75/×1/×1.4).
  Komplett entfernt statt nur versteckt: `Difficulty`-Typ, `SaveData.difficulty`
  (samt Migrations-/Validierungscode in `storage.ts`), `setDifficulty()`,
  die Segmented-Control-UI samt CSS in `SettingsModal.tsx`/`.css`. Die beiden
  Multiplikatoren selbst blieben als einzelne, feste Konstanten
  `BOARD_SPEED_MULTIPLIER = 1.25` / `REWARD_MULTIPLIER = 1.4` in
  `constants.ts` erhalten – das waren die "Schwer"-Werte, jetzt
  bedingungslos für jeden Lauf angewendet statt nur bei aktiver Auswahl.
  `generateLevel()` selbst blieb unangetastet (war ohnehin nie Teil der
  Schwierigkeitsgrad-Logik). Alte Spielstände mit gespeichertem
  `difficulty`-Feld brechen nicht – das Feld wird beim Laden einfach nicht
  mehr gelesen (kein Migrationscode nötig, da nur ein bislang gelesenes
  Feld wegfällt, keine Werte-Umrechnung wie beim alten Apfel-Zähler).
  Diamanten aus goldenen Äpfeln unberührt – die sind ohnehin reines
  Fund-Glück, kein Skill-Ertrag.
- **Vibration** (`vibrate()` in `sound.ts`) bei Treffer, Apfel und Game Over.
  Läuft über denselben Schalter wie der Ton. iOS-Safari kennt
  `navigator.vibrate` nicht und ignoriert das stillschweigend.
- **`prefers-reduced-motion`** schaltet Screen-Shake, Staub und Puls-Effekte ab
  (siehe Ende von `App.css`). Spielmechanik-Animationen wie Axt-Flug und
  Scheibendrehung bleiben bewusst – ohne sie wäre das Spiel nicht spielbar.

### Tägliche Belohnung

Kleiner Baustein fürs Wiederkommen, bewusst NICHT als eigener React-State
gebaut, sondern als reine Ableitung aus dem Spielstand:

- `game/daily.ts` (`pendingDailyReward(lastClaim, streak)`) vergleicht das
  heutige Datum (`todayDateString()`, lokale Zeit, `YYYY-MM-DD`) mit
  `SaveData.lastDailyClaim`. Genau EIN Tag Abstand -> Serie geht weiter
  (`+1`). Länger her, in der Zukunft (Systemuhr manipuliert) oder nie
  abgeholt -> Serie beginnt neu bei 1. `useAxeGame.ts` berechnet daraus bei
  JEDEM Render `dailyReward` neu (kein eigener Timer nötig) – überschreitet
  eine offene Session Mitternacht, taucht die nächste Belohnung von selbst
  auf, sobald die Ableitung neu läuft.
- **7-Tage-Zyklus** (`DAILY_REWARDS` in `constants.ts`), der sich danach
  wiederholt (Tag 8 = wieder Tag-1-Belohnung), aber die ANGEZEIGTE Serie
  zählt unbegrenzt weiter (fürs Prahlen "12 Tage in Folge"). Tag 4 und 6
  geben schon einen kleinen Diamanten-Vorgeschmack, Tag 7 ist der große
  Abschluss (100 Münzen + 3 Diamanten).
- `DailyRewardModal.tsx` erscheint automatisch auf dem Startbildschirm,
  sobald `game.dailyReward` nicht `null` ist (und kein anderes Fenster
  offen ist) – zeigt den ganzen 7-Tage-Zyklus mit dem heutigen Tag
  hervorgehoben. `claimDailyReward()` schreibt Münzen/Diamanten gut und setzt
  `lastDailyClaim` auf heute; danach liefert `pendingDailyReward()` beim
  nächsten Render `null` und das Modal verschwindet von selbst – kein
  Auf/Zu-State nötig.
- Verifiziert per direktem Setzen von `lastDailyClaim`/`dailyStreak` im
  Spielstand: frischer Stand (Tag 1, +20), "gestern abgeholt" (Serie geht auf
  2 weiter, Tag 2 markiert), "vor 4 Tagen abgeholt bei Serie 6" (fällt trotz
  hoher gespeicherter Serie korrekt auf Tag 1 zurück) – alle drei Fälle mit
  echtem Tap auf "Abholen" durchgespielt, keine Konsolenfehler.

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

### Jemandem außerhalb des eigenen WLANs zeigen (z.B. einem Kollegen)

Der WLAN-Weg oben reicht nicht, wenn die andere Person in einem anderen
Netzwerk sitzt. Zwei Wege, je nach Bedarf:

- **Schnappschuss-Link (ein Artifact):** `npm run build:single` bauen, den
  `<style>`/`<div id="root">`/`<script>`-Teil aus `dist-single/axe-throw.html`
  (ohne `<!doctype>`/`<html>`/`<head>`/`<body>`) als Artifact veröffentlichen.
  Läuft komplett im Browser der anderen Person, unabhängig vom eigenen PC –
  aber ein FESTER Stand vom Bauzeitpunkt, kein Live-Zugriff auf spätere
  Änderungen, und Artifacts sind standardmäßig privat (muss über den
  Teilen-Button erst freigegeben werden).
- **Live-Tunnel (Cloudflare Quick Tunnel):** zeigt den ECHTEN, laufenden
  `npm run dev`-Server nach außen, ohne Account/Domain nötig:
  ```bash
  cloudflared tunnel --url http://localhost:5173
  ```
  Gibt eine zufällige `https://<drei-woerter>.trycloudflare.com`-Adresse aus,
  von überall erreichbar, sofort einsatzbereit, kein Freigabe-Schritt nötig.
  **Braucht `allowedHosts: ['.trycloudflare.com']` in `vite.config.ts`** – Vite
  blockt sonst jeden Host-Header außer localhost/eigener IP (Schutz vor
  DNS-Rebinding), genau das würde die trycloudflare.com-Adresse treffen
  (Vite antwortet dann mit "Blocked request... not allowed" statt der Seite).
  Grenzen: läuft nur, solange sowohl der `npm run dev`-Server ALS AUCH der
  `cloudflared`-Prozess auf dem PC laufen; die Adresse ändert sich bei jedem
  Neustart des Tunnels (kein fester Link); "Quick Tunnels" laufen laut
  Cloudflare selbst ohne Uptime-Garantie, gedacht zum kurzen Ausprobieren,
  nicht für Dauerbetrieb. `cloudflared` selbst per `winget install
  Cloudflare.cloudflared` installiert (einmalig, danach nur noch der Befehl
  oben nötig).

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
    constants.ts  LEVELS (120 Stück, per generateLevel() erzeugt), Kollisions-/
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
    daily.ts      Tägliche Belohnung: reiner Datums-Vergleich (pendingDailyReward),
                   siehe eigener Abschnitt oben
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
    WorldHorizon.tsx     Welt-passende Horizont-Silhouette am Bühnenfuß (Baumreihe/
                          Dünen/Bergkette/Vulkan/Skyline/Mond, siehe Grafik-Abschnitt)
    WorldDecor.tsx       Kleine animierte Ecken-Deko passend zur Welt (Ergänzung zu
                          WorldHorizon, nicht dasselbe)
    WorldMap.tsx         Cartoon-Insel-Weltkarte mit Reise-Animation
    HUD.tsx              Levelnummer / Block-Punktreihe / Münzen oben. Der
                          Münzstand ist zugleich der Werkstatt-Button.
    Shop.tsx             Die Werkstatt: Skins kaufen und ausrüsten
    LevelCompleteModal.tsx  Ergebnis-Screen nach der letzten Axt
    GameOverModal.tsx    Screen nach Treffer auf die eigene Axt (eigene Optik,
                          nutzt aber gemeinsame Klassen aus LevelCompleteModal.css)
    DailyRewardModal.tsx Tägliche Belohnung, erscheint automatisch auf dem
                          Startbildschirm (siehe eigener Abschnitt oben)
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

### Performance-Fix: Ruckeln beim Werfen und beim Einschlag (2026-08-21)

Klaus' Feedback nach echtem Spielen auf dem Handy: "ruckelt extrem beim
Werfen und Aufkommen". Zwei konkrete, unabhängige CSS-Stellen animierten
bisher LAYOUT-Eigenschaften statt reiner Compositor-Eigenschaften – genau
der Klassiker für Web-Performance-Probleme, weil der Browser bei einer
Layout-Eigenschaft JEDEN Animationsframe neu einsortieren muss (Reflow),
statt die Änderung wie bei `transform`/`opacity` direkt an die GPU
weiterzureichen:

- **Der Axt-Flug selbst** (`axe-fly-position` in `App.css`, seit dem
  Stall-Bug-Fix oben eine EIGENE Animation): animierte `bottom` – bei JEDEM
  Wurf 190ms lang, bei jedem Frame ein Reflow. Umgestellt auf die
  eigenständige `translate`-CSS-Eigenschaft (`translate: -50% var(--flight-
  travel-px)`), rein compositor-basiert. Die Reichweite kommt jetzt als
  Pixel-Wert aus App.tsx (`flightTravelPx`, negativ = nach oben), berechnet
  aus derselben gemessenen Scheibenposition wie bisher `flightEndBottom` –
  nur die Bewegungs-STRECKE statt eines `bottom`-Zielwerts. `.axe-flying`
  selbst bleibt bei einem STATISCHEN `bottom: 8%` (nur einmal beim Mounten
  berechnet, kein Reflow pro Frame). `translateX(-50%)` wanderte dabei aus
  dem `transform` von `axe-fly-transform` in dasselbe `translate` (jetzt
  `translate: -50% ...`) – WICHTIG dabei: nur reine Verschiebungen
  (`translate`) lassen sich gefahrlos aus einem `transform` herauslösen,
  weil zwei Verschiebungen in jeder Reihenfolge zum selben Ergebnis führen
  (kommutieren). Rotation und Squash (`scale`+`rotate`) bleiben bewusst
  WEITERHIN zusammen in einem `transform` – deren Reihenfolge ist NICHT
  vertauschbar (siehe die ausführliche Herleitung beim ursprünglichen
  Stall-Bug-Fix weiter oben, "unnatürlich langer Stiel"-Regression).
- **Der Trefferring** (`shockwave-expand` in `App.css`): animierte
  zusätzlich zu `transform`/`opacity` auch `border-width` (4px→1px) – bei
  JEDEM Treffer ein Reflow. `border-width` jetzt FEST bei 2px (Mittelwert
  der alten Spanne); der optische "wird beim Wachsen dünner"-Effekt bleibt
  trotzdem erhalten, weil ein fester Rand bei größer werdendem `scale()`
  relativ automatisch dünner wirkt.

Alle anderen `@keyframes`-Blöcke im Spiel wurden gezielt durchsucht (`grep`
über alle Komponenten-CSS-Dateien) – keine weiteren Layout-Eigenschaften
(`top`/`left`/`right`/`bottom`/`width`/`height`/`margin`/`padding`/
`border-width`/`font-size`) in Animationen gefunden, nur noch `transform`,
`opacity`, `box-shadow` und `translate`. Verifiziert: `tsc -b` sauber, die
geladenen Stylesheet-Regeln im Browser bestätigt per CSSOM-Inspektion
(`document.styleSheets`) – `axe-fly-position` animiert jetzt `translate`
statt `bottom`, `shockwave-expand` enthält kein `border-width` mehr, keine
Konsolenfehler. Das tatsächliche Ruckel-Gefühl auf einem echten (ggf.
schwächeren) Handy ließ sich wie bei allen Timing-/Performance-Themen
NICHT per Browser-Automatisierung nachspielen (rAF-Freeze, siehe Abschnitt
oben) – Bestätigung durch echtes Spielen steht noch aus.

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
  (Squash-and-Stretch beim Abschuss, schärferes Easing – siehe
  `axe-fly-*`-Keyframes in App.css) – reine Dauer war nie das Hauptproblem.
  190ms liegen bei 55°/Sek. knapp über der 10°-Kollisions-Toleranz, Dauertippen
  bleibt also riskant. Stellschrauben, falls es zu leicht wird:
  `COLLISION_ANGLE_TOLERANCE_DEG` erhöhen oder den Levelstart verlangsamen.
- **Echter "hängt kurz vor dem Treffer"-Bug gefunden und behoben – eine
  CSS-Timing-Falle, keine Physik/Kollisions-Sache.** `bottom` (die Position)
  stand im `axe-fly`-Keyframe früher nur bei 0%/100%, `transform`
  (Drehung/Squash) zusätzlich bei 12%. CSS interpoliert jede Eigenschaft
  unabhängig über ihre EIGENEN Stützstellen – dadurch lief `bottom` über die
  komplette, stark vorne-geladene `cubic-bezier(0.05, 0.9, 0.1, 1)`-Kurve
  gestreckt auf die GESAMTE Flugzeit: ~90-100% der Strecke waren nach ~10% der
  Zeit (≈19ms von 190ms) schon zurückgelegt, der Rest war sichtbarer
  Stillstand. Fix: Position bekam eine eigene, lineare (= konstante
  Geschwindigkeit) Animation `axe-fly-position`, komplett getrennt vom
  `axe-fly-transform`-Keyframe (Drehung + Squash bleiben dort bewusst
  ZUSAMMEN in einem `transform`, nicht in einzelne `rotate`/`scale`-
  Eigenschaften aufgeteilt).
  **Dabei eine eigene Regression gefunden und wieder zurückgenommen:** eine
  erste Fassung hatte Drehung UND Squash ebenfalls in einzelne CSS-
  Eigenschaften (`rotate`, `scale`) aufgeteilt. Einzelne Transform-
  Eigenschaften komponieren aber in einer FESTEN Browser-Reihenfolge
  (translate → rotate → scale), während das kombinierte `transform` in der
  geschriebenen Reihenfolge angewendet wird (hier: translate → scale →
  rotate) – dadurch drehte sich die Streck-Verzerrung MIT der Axt statt fest
  zur Bildschirmachse zu bleiben, sichtbar als unnatürlich langer Stiel
  ("Screenshot-Feedback: sieht aus, als wäre der Henkel weit lang"). Zurück
  zur ursprünglichen Kombination aus Drehung+Squash in einem `transform`,
  nur `bottom` bleibt separat.
  Per `getComputedStyle` verifiziert (animation-name/-timing-function korrekt
  gesetzt, `transform`-Matrix entspricht wieder der Original-Komposition),
  ECHTE Bildrate-Messung war in der automatisierten Browser-Umgebung nicht
  möglich (Browser-Pane rendert dort keine Frames, siehe rAF-Freeze-Abschnitt
  weiter unten) – deshalb final durch Klaus selbst am echten Gerät bestätigt.
  Dabei auch den Bewegungsschweif (`axe-flying__trail`, heller Leuchtstreifen
  hinter der Axt) auf Wunsch ("nervt, es soll nur die Axt sein") ganz entfernt.
- **Abschuss-Sound ergänzt** (`playThrowSound()` in `sound.ts`): es gab bereits
  Sounds fürs Einschlagen (Treffer/Fehlschlag/Apfel/Boss), aber keinen fürs
  Abschießen selbst. Kurzes, per Bandpass-Filter aufsteigendes Rauschen
  (1100→3400Hz über 90ms), feuert synchron mit Mündungsblitz und Rückstoß im
  selben Effekt.
- Es gab früher eine Halten-und-Loslassen-Timing-Mechanik (Lade-Regler mit
  "Sweet Spot") UND zwischenzeitlich eine Ziel-Mechanik (Tippposition bestimmte
  den Einschlagpunkt). Beides wieder entfernt, auf ausdrücklichen Wunsch: "mach
  doch das egal wo man auf den Bildschirm drückt es gerade aus geht, genauso wie
  bei Knife Hit". Der einzige Skill ist wieder rein das TIMING.

### Axt-Treffer: echter Mikro-Ruckler + Schwebe-Effekt gefunden und behoben

Klaus' Feedback ("Axt-Treffer final perfektionieren", sehr detaillierte
Analyse-Anleitung mit gezielten Verdachtspunkten): beim Übergang Flug→Steckend
gab es einen kleinen sichtbaren Ruckler, und steckende Äxte wirkten, als
würden sie leicht vor der Scheibe schweben statt sauber Kontakt zu haben.

**Ursache gefunden, EXAKT die im Feedback vermutete Fallart ("wird die Axt
beim Treffer zweimal positioniert", "setzen Flugbewegung und Stuck-Position im
selben Frame unterschiedliche Werte"):** `App.tsx` berechnete das Flugziel
schon länger mit einem "Einstech"-Zuschlag (`AXE_BITE_PX = 6`, lokale
Konstante) – die fliegende Axt landete also sichtbar auf Radius 114 (Steck-
Radius 120 minus 6). Die STECKENDE Axt-Darstellung in `TargetBoard.tsx`
kannte diesen Zuschlag aber nicht und rendert stur auf Radius 120. Eine
React-Render-Vorlage nach dem Einschlag sprang die Axt dadurch sichtbar 6px
nach außen – ein exakter, bei JEDEM Wurf reproduzierbarer Sprung GENAU im
Übergangsframe. Derselbe Fehlertyp, den ein Kommentar bei `stickRadiusPx()`
(App.tsx) schon einmal beschreibt (damals 10px, gemessener Scheiben- vs.
Steck-Radius) – hier als kleinere 6px-Variante durch eine spätere, nicht
gegengeprüfte Änderung wieder eingeschleppt. Erklärt vermutlich auch das
Schweben: die Axt "sackt" nach der Landung sichtbar wieder 6px nach außen,
weg von der Stelle, an der sie gerade eben noch sauber im Holz saß.
**Fix:** ein EINZIGER, benannter, dokumentierter Parameter
`AXE_EMBED_DEPTH_PX` (`constants.ts`, Wert 6, rein visuell, komplett
unabhängig von `COLLISION_ANGLE_TOLERANCE_DEG`/der Winkel-Trefferlogik) wird
jetzt an BEIDEN Stellen verwendet: `App.tsx` (Flugziel, wie vorher) UND
`TargetBoard.tsx` (`STUCK_AXE_RADIUS = BOARD_RADIUS - AXE_EMBED_DEPTH_PX`,
neu). Beide Systeme zielen jetzt auf exakt denselben Radius (114px) – der
Übergang braucht keinen Sprung mehr. Zum Nachjustieren ("etwas mehr/weniger
drin") reicht es künftig, NUR `AXE_EMBED_DEPTH_PX` zu ändern.
Verifiziert per DOM-Inspektion (`slot.style.transform`, direkt aus dem Inline-
Style ablesbar): vorher `translateY(-120px)`, nachher `translateY(-114px)`,
exakt passend zur Flugziel-Rechnung. `tsc -b` sauber, kein Konsolenfehler
nach echtem Reload.

**Dabei im Arbeitsverzeichnis vorgefunden (nicht in dieser Runde selbst
geschrieben, aber übernommen, weil eindeutig zum selben Problem gehörig und
funktional geprüft):** ein bereits vorhandener, noch uncommitteter
Performance-Fix in `App.tsx`/`App.css` – die Flugbahn der Axt animierte
bisher `bottom` (eine Layout-Eigenschaft, zwingt den Browser bei JEDEM
Animationsframe zu einem Reflow, 190ms lang bei JEDEM Wurf) und der
Trefferring animierte `border-width` (ebenfalls Layout). Beides jetzt auf
reine Compositor-Eigenschaften umgestellt: die Flugbahn läuft über eine neue
`--flight-travel-px`/`translate`-Eigenschaft (`flightTravelPx` in App.tsx,
`axe-fly-position`-Keyframe in App.css), der Trefferring nutzt einen festen
2px-Rand statt animierter Breite (wirkt durch das gleichzeitig wachsende
`scale()` optisch weiterhin dünner werdend). Trägt denselben
`AXE_EMBED_DEPTH_PX`-Wert korrekt weiter (`flightEndBottom` unverändert in
die neue `flightTravelPx`-Rechnung eingebunden). Per echtem Wurf
gegengeprüft (Kollisions-Pfad bis Game-Over-Fenster durchlaufen, keine neuen
Konsolenfehler) – funktioniert, wurde aber nicht Zeile für Zeile von mir
hergeleitet wie der Radius-Fix oben.

**Bewusst NICHT angefasst, mangels Beweis:** die Rotations-Seite der Frage
("wird die Rotation beim Treffer ebenfalls zweimal gesetzt"). Es GIBT
tatsächlich zwei separate Rotationsebenen für eine steckende Axt –
`rotate(boardLocalAngleDeg)` am `.target-board__axe-slot` (radiale
Ausrichtung/Position, hängt vom Wurf-Weltwinkel ab) UND ein statisches
`rotate(180deg)` am inneren `.target-board__axe-flip` (dreht die Grafik in
die "steckende" Orientierung, plus eine kurze ±3°-Wackel-Keyframe-Animation
`axe-land-wiggle` beim Landen, die sauber wieder bei 180° einrastet – ein
bestehender, offensichtlich bewusst gebauter Landungs-Effekt, kein Bug). Die
fliegende Axt dreht sich währenddessen rein dekorativ von 0° auf 190°
(`axe-fly-transform`-Keyframe, "wie ein taumelnder Tomahawk", siehe Grafik-
Abschnitt weiter oben) – KEINE dieser beiden Rotationen ist rechnerisch an
die jeweils andere gekoppelt. Rein numerisch ergibt das einen relativ großen
Rotations-Sprung am Übergang (deutlich mehr als die "Mikro"-Größenordnung, die
Klaus beschrieben hat), was eher dagegen spricht, dass GENAU das der
gemeldete Ruckler ist – ein Sprung dieser Größe wäre vermutlich schon vorher
aufgefallen, die 190°-Taumel-Rotation ist zudem seit mehreren Grafik-
Durchgängen unverändert und nie beanstandet worden. Ohne echte visuelle
Prüfung am Gerät (Browser-Pane komponiert hier keine Frames, siehe
rAF-Freeze-Abschnitt – Screenshots sind in dieser Umgebung nicht möglich)
wollte ich diese länger bewährte, mehrfach bewusst abgestimmte Animation
nicht ohne handfesten Beleg anfassen und riskieren, etwas Funktionierendes zu
verschlechtern. Falls nach dem Radius-Fix am echten Gerät noch ein Ruckler
sichtbar ist: das ist die nächste Stelle zum Ansetzen
(`axe-fly-transform`-Endwert in `App.css` bzw. der `axe-land-wiggle`-Start-
wert in `TargetBoard.css`).

### Der ECHTE Mikro-Stopp kurz vor dem Einschlag: zwei unabhängige Uhren

Klaus, direkt im Anschluss an den Radius-Fix oben ("Axt schwebt vor der
Scheibe"): der eigentliche, wichtigere Ruckler war noch da – die Axt wirkt
kurz VOR dem Einschlag, als bliebe sie kurz stehen, danach erst kommt der
Treffer. Explizite Ansage: kein Workaround, keine zusätzliche Animation,
Ursache finden statt kaschieren.

**Analyse des kompletten Lebenszyklus eines Wurfs** (Input → Spawn → Flug →
Kollisionsprüfung → Impact → Stuck) ergab: es gab tatsächlich ZWEI komplett
unabhängige "Uhren", die beide dieselbe Dauer (`FLIGHT_DURATION_MS`, 190ms)
repräsentieren sollten, aber NICHT garantiert im selben Moment ablaufen:

1. Die CSS-Flug-Animation (`.axe-flying`, `axe-fly-position` +
   `axe-fly-transform` in App.css) – läuft compositor-getrieben, bleibt exakt
   im Takt, unabhängig davon, was der Haupt-Thread gerade tut.
2. Ein `setTimeout(..., FLIGHT_DURATION_MS)` in `useAxeGame.ts`, der NACH
   Ablauf den eigentlichen Treffer auswertet (Kollision prüfen, Axt als
   steckend eintragen, Level-Fortschritt).

Ein JS-`setTimeout` läuft auf dem Haupt-Thread und KANN gegenüber einer
Compositor-Animation nachhinken (React-Re-Renders, andere Effekte, normale
Timer-Ungenauigkeit – Browser garantieren nur "nicht früher", nie "exakt
pünktlich"). Genau das war der Bug: die CSS-Animation war fertig und stand
(dank `animation-fill-mode: forwards`) exakt am Ziel – aber das Spiel
wartete noch auf den zweiten, unabhängigen Timer, bevor der Einschlag
(Kollisionsprüfung, Späne-Burst, Board-Zucken, steckende Axt) überhaupt
ausgelöst wurde. Die Axt war also in Wahrheit längst angekommen und stand
nur scheinbar "kurz davor" – tatsächlich wartete das SPIEL auf sich selbst.
Exakt die Fallart, vor der Klaus gewarnt hatte ("zwei Systeme kontrollieren
gleichzeitig denselben Ablauf").

**Fix – eine Uhr weniger, nicht eine weitere Animation:** `useAxeGame.ts`
exportiert jetzt `resolveThrow()` (dieselbe reine Treffer-Auswertung wie
vorher, nur nicht mehr in einen `setTimeout` verpackt). `App.tsx` ruft diese
Funktion direkt aus dem `onAnimationEnd`-Event der `.axe-flying`-Animation
auf – demselben Ereignis, das der Browser GENAU in dem Moment feuert, in dem
die Animation tatsächlich (compositor-seitig) fertig ist. Keine zweite,
unabhängig tickende Uhr mehr; nur noch EIN Ereignis entscheidet, wann der
Einschlag passiert – und das ist dasselbe Ereignis, das auch visuell das
Ende des Flugs markiert. `.axe-flying` trägt zwei gleichzeitige Animationen
(Position + Transform), `animationend` feuert deshalb zweimal – im Handler
auf `event.animationName === 'axe-fly-position'` gefiltert, damit
`resolveThrow` nicht doppelt läuft (wäre wegen des reinen Updaters ohnehin
harmlos, aber unnötig).
Nebeneffekt, der die Fairness sogar verbessert: der Trefferwinkel
(`computeBoardLocalAngle(getBoardAngleDeg())`) wird jetzt exakt im Moment
des sichtbaren Einschlags gelesen statt irgendwann später, wenn der
JS-Timer zufällig durchkam – die Scheibe könnte sich in der Zwischenzeit
ja weitergedreht haben.

**Verifiziert, mit einer offenen Einschränkung:** `tsc -b` sauber. Die
automatisierte Browser-Umgebung komponiert hier keine Frames (dokumentiertes
rAF-Freeze-Problem, siehe eigener Abschnitt weiter unten) – dadurch läuft in
dieser Umgebung auch KEINE echte CSS-Animation zu Ende, `animationend`
feuert hier nie von selbst (mit der alten `setTimeout`-Fassung hätte das
Spiel trotzdem "funktioniert", weil ein JS-Timer nicht auf Compositing
angewiesen ist – genau DAS war ja das Problem). Zur Verifizierung deshalb
das native `animationend`-Ereignis manuell simuliert
(`element.dispatchEvent(new AnimationEvent('animationend', {animationName:
'axe-fly-position'}))`): löst zuverlässig `resolveThrow` aus (Treffer → neue
steckende Axt, Kollision → Game-Over-Fenster), das FALSCHE Animation-Name
(`axe-fly-transform`) wird korrekt ignoriert (kein doppeltes Auslösen), keine
Konsolenfehler. Die eigentliche Kernfrage – "verschwindet der optische
Mikro-Stopp auf einem echten Gerät" – lässt sich damit nur indirekt
(Architektur-Ebene) bestätigen, nicht durch echtes Zeitlupen-Ansehen. Bitte
am echten Handy gegenprüfen: mehrere normale Würfe, schnelle Scheiben-
Drehung, verschiedene Trefferwinkel, schnelle Serienwürfe.

### Flugzeit verkürzt, OHNE die gerade gewonnene Flüssigkeit zu opfern

Direkt im Anschluss an den Mikro-Stopp-Fix: "Axt jetzt flüssig, aber der Wurf
dauert zu lange, bitte NUR die Geschwindigkeit erhöhen, an der Bewegungslogik
nichts mehr ändern." `FLIGHT_DURATION_MS` von 190 auf 140ms gesenkt (~26%
kürzer, im gewünschten 20-30%-Rahmen) – sonst **nichts** angefasst:

- Kein neues Easing/Lerp: die Positions-Animation (`axe-fly-position`) ist
  weiterhin strikt linear, läuft nur insgesamt kürzer ab.
- Keine Kollisions-Änderung nötig: `resolveThrow()` prüft die Kollision als
  EINEN diskreten Winkel-Vergleich bei Animationsende, kein Zeitschritt-
  Physik-Tunneling möglich – von der Flugdauer komplett unabhängig.
- Rotation bleibt automatisch im richtigen Verhältnis zur Geschwindigkeit:
  die `axe-fly-transform`-Keyframes (0%/12%/100%) sind PROZENTE der
  Animationsdauer, laufen bei kürzerer Dauer automatisch proportional
  schneller mit – keine separate Anpassung nötig.
- Kein neuer Mikro-Stopp möglich: seit dem vorherigen Fix hängt
  `resolveThrow()` direkt am `animationend`-Ereignis derselben Animation,
  deren Dauer sich hier ändert – beide Systeme bleiben also automatisch
  synchron, es gibt keine zweite Uhr mehr, die auseinanderlaufen könnte.

**140ms wurde früher schon einmal probiert und wegen Lesbarkeit verworfen**
("Axt fliegt einfach drüber", siehe Kommentar bei `FLIGHT_DURATION_MS`) –
diesmal aber in einem komplett anderen Kontext: die Positions-Animation lief
damals noch über `bottom` (Reflow, ruckelig) statt `translate`, UND die
Treffer-Auswertung hing an einem separaten `setTimeout` statt am
`animationend`-Ereignis selbst. Beide seitdem behobenen Probleme waren
vermutlich der eigentliche Grund für den damaligen "zu schnell, sieht man
nicht"-Eindruck, nicht die reine Zahl 140.

**Bewusst NICHT kompensiert:** bei `BASE_SPEED_DEG_PER_SEC` (70°/Sek.) dreht
sich die Scheibe in 140ms nur noch ~9,8° – wieder unter der 10°-Kollisions-
Toleranz, Dauertippen in Level 1-5 wird dadurch wieder etwas riskanter als
direkt nach dem Tempo-Anhub. Bewusst nicht mit-repariert, weil diese Anfrage
explizit nur die Flugzeit betraf ("nicht mehrere Systeme gleichzeitig
ändern") – falls das separat als Feedback zurückkommt, sind
`COLLISION_ANGLE_TOLERANCE_DEG` oder erneut `FLIGHT_DURATION_MS` die
Stellschrauben.

Verifiziert: `tsc -b` sauber, `.axe-flying` trägt korrekt `animationDuration:
140ms`, manuell simuliertes `animationend` löst `resolveThrow()` weiterhin
zuverlässig aus (Hint-Text kehrt zurück, Axt verschwindet aus dem Flug),
keine Konsolenfehler. Das eigentliche Geschwindigkeitsgefühl lässt sich wie
immer nicht in der automatisierten Umgebung nachspielen (kein echtes
Compositing) – bitte am Gerät bestätigen, ob 140ms "schnell, direkt, extrem
smooth" trifft oder ob nachjustiert werden muss (einzige Stellschraube:
`FLIGHT_DURATION_MS` in `constants.ts`).

### Axt kurz "falsch herum" ganz am Anfang des Wurfs

Klaus, mit expliziter Ansage "nur die Anfangsrotation korrigieren, NICHTS an
Fluggeschwindigkeit/-bahn/Kollision/Impact ändern – das Timing ist jetzt gut."

**Analyse:** `axe-fly-transform` (App.css) hatte einen Zwischenwert bei 12%:
`0% rotate(0deg) → 12% rotate(70deg) → 100% rotate(190deg)`. Bei den
aktuellen 140ms Flugzeit liegen die ersten 12% bei nur noch ~17ms – die Axt
sprang in dieser winzigen Zeitspanne von 0° auf 70°, mehr als 4× so schnell
wie die restliche Drehung bis 190° über die verbleibenden 88% der Flugzeit.
Das las sich wie ein kurzer, falscher Ausschlag direkt beim Abschuss, bevor
die eigentliche, gleichmäßigere Drehung übernahm – keine zwei konkurrierenden
Rotations-Systeme (es gibt nur diese eine Keyframe-Animation für die
Flug-Rotation), sondern ein rein gestalterischer Zwischenwert, der bei der
jetzt kürzeren Flugzeit unproportional schnell wirkte.
**Fix:** NUR der 12%-Rotationswert von 70° auf 25° gesenkt (nah an einer
linear durchgezogenen Kurve – 12% von 190° wären rechnerisch ~23°). `scale()`
an allen drei Stopps, der 0%- und 100%-Wert sowie alle Timings/Prozente
bleiben exakt unverändert. Betrifft ausschließlich `axe-fly-transform`
(Rotation/Squash) – `axe-fly-position` (Flugbahn/-geschwindigkeit),
`resolveThrow()` (Kollision/Impact) und `AXE_EMBED_DEPTH_PX` (Einstecktiefe)
komplett unangetastet.
Verifiziert: `tsc -b` sauber, `git diff --stat` zeigt nur `App.css`
geändert, die geladene `axe-fly-transform`-Regel im Browser bestätigt exakt
`0%→rotate(0deg)`, `12%→rotate(25deg)`, `100%→rotate(190deg)`. Ein
kompletter Wurf (Flug → simuliertes `animationend` → Auflösung) läuft
weiterhin fehlerfrei durch. Das eigentliche visuelle Ergebnis (wirkt der
Start jetzt sauber statt "kurz verdreht") lässt sich wie immer nicht in der
automatisierten Umgebung beobachten (kein echtes Compositing) – bitte am
Gerät gegenprüfen.

### Große Ausbaustufe: Pause, Game-Over, Video-Rettung, Logo-Farbe, UI-Aufräumen

Klaus' bislang größte Anfrage in einem Rutsch – ausdrücklich mit der Ansage,
die inzwischen flüssige Wurfmechanik NICHT anzufassen (Fluggeschwindigkeit,
Flugzeit, Flugbahn, Kollisionslogik, Impact, Axtrotation während des Flugs
blieben komplett unberührt – nichts davon war in dieser Runde überhaupt Teil
der Änderungen). Erster Teil-Batch, kleinere/klar abgegrenzte Punkte zuerst:

- **Pause-System** (neu, `PauseModal.tsx`): Pause-Button oben rechts auf der
  Bühne (`.stage__pause-button`), NUR sichtbar/aktiv während `phase ===
  'ready'` (zwischen zwei Würfen) – bewusst nie während eine Axt fliegt,
  damit Pausieren die Flug-/Kollisionslogik nie berühren muss. Der Button
  liegt INNERHALB von `.stage` (dessen `onPointerDown` sonst einen Wurf
  auslösen würde) – braucht deshalb `e.stopPropagation()` im eigenen
  Klick-Handler. Das Pause-Menü selbst rendert als Geschwister-Overlay
  (wie Shop/Einstellungen/Weltkarte), blockt Klicks auf `.stage` also schon
  durch die DOM-Struktur (kein gemeinsamer Elternknoten mit `onPointerDown`).
  `TargetBoard`s `paused`-Prop bekam den neuen `paused`-State einfach dazu
  (`... || paused`) – Board-Rotation/Axt-Bewegung waren dafür schon vorbereitet.
  Schließt sich automatisch, wenn sich Bildschirm oder Phase ändern (verhindert
  ein "hängendes" Pause-Menü nach einem Level-Wechsel).
- **Game-Over auf genau zwei Buttons reduziert** (`GameOverModal.tsx`):
  vorher "Neuer Versuch" + "Zurück zum Menü" + "Werkstatt öffnen" (drei
  Buttons). Jetzt: "📺 Fortschritt mit Video" (nur sichtbar, wenn die
  einmalige Rettung in diesem Lauf noch nicht verbraucht ist) + "Zurück zum
  Menü" (immer). Kein Neustart-Button mehr auf diesem Screen – ein
  Neustart läuft jetzt ausschließlich über "Zurück zum Menü" -> Startbildschirm
  ("Weiter – Level N" springt nach einem Game Over ohnehin automatisch auf
  Level 1, da `currentLevel` beim Game Over auf 0 zurückgesetzt wird, siehe
  Münzen/Läufe-Abschnitt) bzw. die Weltkarte.
- **Einmalige Video-Rettung** (`rescueRun()` in `useAxeGame.ts`, neu
  `VideoRescueModal.tsx`): setzt den Lauf GENAU im Level fort, in dem er
  endete (`state.levelIndex`, NICHT auf 0 zurückgesetzt wie bei
  `restartRun()`). Getrackt über ein neues `rescueUsedThisRun`-Flag im
  `GameState` – wie `streak` bewusst AUSSERHALB von `createLevelState()`
  gepflegt (bleibt bei `nextLevel()` erhalten, wird nur bei einem echten
  Neustart auf Level 0 – `goToLevel(0)`/`restartRun()` – wieder freigegeben).
  **Es gibt in diesem Projekt noch KEINE echte Rewarded-Ad-SDK-Anbindung**
  (kein AdMob verdrahtet, siehe STATUS.md-Historie) – `VideoRescueModal.tsx`
  ist deshalb bewusst ein klar erkennbarer PLATZHALTER (3-Sekunden-Zähler,
  kein echtes Video), der die Spiel-Logik (einmalige Rettung, Fortsetzen im
  selben Level) schon jetzt vollständig funktionsfähig macht. Austausch gegen
  eine echte Anzeige später betrifft NUR diese eine Komponente, der Rest der
  App (State-Machine, `rescueRun()`) ändert sich dabei nicht.
  Bekannte, bewusste Vereinfachung: die Serie (`streak`) wird beim
  automatischen Game-Over-Effekt schon auf 0 gesetzt, BEVOR das
  Game-Over-Fenster überhaupt erscheint – eine Rettung bewahrt deshalb
  Level-Fortschritt und Münzen, aber NICHT die Serie (bräuchte einen
  separaten "Serie vor dem Fehlwurf"-Zwischenspeicher, den es noch nicht
  gibt). Ebenfalls bewusst vereinfacht: `rescueUsedThisRun` lebt nur im
  React-State, nicht im persistenten Spielstand – ein App-Neustart mitten in
  einem Lauf gibt technisch eine neue Rettung frei. Für ein Solo-Handyspiel
  ohne Anti-Cheat-Anspruch akzeptabel, aber erwähnenswert.
- **Logo-Farbe**: "Throw" in `StartScreen.tsx` nutzt jetzt `var(--color-primary)`
  (dieselbe Orange-Leitfarbe wie die UI-Buttons unten, `theme.css`) statt der
  vorherigen Cyan-Farbe (`#5ce1ff`) – die kam aus einem früheren "mehr Blau"-
  Grafik-Durchgang (siehe Cartoon-Ozean-Abschnitt weiter oben: "Throw von
  Orange auf Zyan"). Diese Änderung dreht GENAU das wieder zurück.
- **"Von Level 1 starten" entfernt** (`StartScreen.tsx`): Button + Prop +
  Handler restlos raus (nicht nur versteckt). Die Weltkarte (eigener,
  weiterhin vorhandener Button direkt darunter) ist jetzt der einzige Weg,
  gezielt zu einer bestimmten Welt/Level 1 zu springen – `goToLevel(0)`
  bleibt dafür intern unverändert (wird vom Weltkarten-Sprung auf die erste
  Welt "Wald" weiterhin genutzt).
- **"Fortschritt zurücksetzen" restlos entfernt** (`SettingsModal.tsx`):
  Button, Bestätigungs-Dialog-UI (`settings-confirm`/`--danger`-CSS) UND die
  komplette `resetProgress()`-Funktion samt `loadSaveFresh()`-Helfer in
  `useAxeGame.ts` gelöscht (waren ausschließlich dafür da, keine andere
  Stelle nutzte sie). Andere Einstellungen (Ton/Vibration, Highscore-Anzeige)
  unverändert.

Verifiziert (echter Klick-/Event-Durchlauf, kein reines Code-Lesen): Pause
öffnet/schließt korrekt ohne einen Wurf auszulösen (Axt-Anzahl vor/nach
Pause-Klick identisch geprüft), Game-Over zeigt exakt die zwei erwarteten
Buttons, Video-Rettung läuft durch (Countdown -> "Belohnung erhalten" ->
Fortsetzen bei EXAKT demselben Level statt Rückwurf auf Level 1), ein
zweites Game Over im selben Lauf zeigt korrekt NUR noch "Zurück zum Menü"
(keine zweite Rettung). `tsc -b` sauber, keine Konsolenfehler. "Von Level 1
starten" und "Fortschritt zurücksetzen" bestätigt aus der UI verschwunden.

### Weltbosse: ein "Tor" pro Welt, ohne neues Freischalt-System

Zweiter Teil-Batch derselben großen Ausbaustufe. Klaus wollte einen eigenen,
SEHR schweren Weltboss pro Welt "als Tor vor dem eigentlichen Fortschritt".

**Kein neues Speicher-/Freischalt-System nötig:** Weltkarten-Sprünge
(`onSelectLevel` in `WorldMap.tsx`) und der automatische Levelaufstieg
(`nextLevel()`) landen IMMER exakt auf `world.startLevelIndex` – der erste
Level einer Welt ist dadurch schon strukturell ein echtes "Tor", man kann die
späteren Level einer Welt gar nicht erreichen, ohne zuerst hier durchzukommen.
Der Weltboss ist deshalb einfach eine massiv verschärfte `generateLevel()`-
Ausgabe genau an diesen sechs Level-Indizes – keine zusätzliche
"freigeschaltet/nicht"-Logik, kein neues Spielstand-Feld.

- **`isWorldBossLevel()`/`WORLD_BOSSES`** (`worlds.ts`): Weltboss an JEDEM
  Welt-Start AUSSER Wald/Level 1 – das ist für jeden neuen Spieler der
  allererste Level überhaupt und muss der sanfte Tutorial-Einstieg bleiben
  (siehe "Level 1-5 nervig"-Abschnitt weiter oben – ein Weltboss ausgerechnet
  dort wäre exakt das Gegenteil von diesem bereits behobenen Feedback).
  Sandkolossos (Wüste), Frostwardin (Eis), Aschenschlund (Vulkan),
  Leerenwächter (Kosmos), Turmbrecher (Heldenstadt) – reine Namen/Bezeichner,
  kein eigenes Grafik-System (Bilder kommen später separat, siehe
  Gemini-Prompt-Abschnitt am Ende dieser Datei).
- **Schwierigkeit** (`generateLevel()`, `constants.ts`): +45°/Sek. Tempo-Sockel
  (mehr als ein normaler 5-Level-Boss mit +28), erzwungenes `reverse`-Muster
  (unvorhersehbarer als das normale `pulse`). Axt-/Hindernis-Bonus BEWUSST
  klein gehalten (+1/+1 statt eines großen Sprungs) – `axeCountFor`/
  `obstacleCountFor` haben an genau diesen Level-Indizes (20/25, 40/45, ...)
  bereits eine eigene, scharfe "Wall"-Stufe aus einem parallelen
  Härte-Durchgang (siehe deren Kommentare "direkt an Boss-Level" – dieser Wert
  war schon VOR dieser Session so verschärft, nicht von mir). Ein großer
  Weltboss-Bonus zusätzlich dazu hätte das Brett auf ein rechnerisch kaum noch
  lösbares Maß gefüllt (Slot-Budget: 36 Plätze bei 10°-Kollisionstoleranz) –
  erst mit dem kleineren Bonus getestet: 10 Hindernis-Slots bei Level 21
  (Wüste-Boss), ~26 von 36 Plätzen gegen Levelende belegt, angespannt aber
  im Rahmen des an anderer Stelle bereits akzeptierten Endgame-Niveaus.
- **Mehrere Phasen** (`worldBossPhaseSpeedMultiplier()`, `constants.ts`,
  angewendet in `useAxeGame.ts`s abgeleitetem `boardSpeedDegPerSec`): das
  Tempo zieht WÄHREND des Kampfes an, abhängig vom Fortschritt
  (`axesThrown / axeCount`) – Phase 1 (<40%) beim regulären Weltboss-Tempo
  ("Muster lernen"), Phase 2 (<75%) ×1,15 ("schneller, mehr Druck"), Phase 3
  (Rest) ×1,3 ("hoher Druck, anspruchsvolles Timing"). Bewusst eine reine
  Tempo-Eskalation statt zusätzlicher Hindernisse – die liegen seit
  Levelstart fest, das Tempo lässt sich dagegen sauber pro Wurf variieren,
  ohne die (explizit geschützte) Kollisions-/Impact-Logik anzufassen.
  **Beim Gegenlesen gefunden und korrigiert, bevor es zum echten Bug wurde:**
  der Multiplikator wirkt NACH `BOARD_SPEED_MULTIPLIER` (1,25, seit der
  entfernten Schwierigkeitsgrad-Auswahl immer aktiv) und nach dem
  `MAX_SPEED_DEG_PER_SEC`-Deckel – beide Deckel greifen an dieser Stelle
  also nicht mehr, die Werte multiplizieren sich. Mit den ursprünglich
  geplanten ×1,35/×1,7 wäre der schwerste Weltboss (Heldenstadt/Turmbrecher)
  in Phase 3 auf über 600°/Sek. gekommen (mehr als 90° Board-Drehung
  innerhalb einer einzelnen 140ms-Flugzeit) – das hätte sich nicht mehr nach
  "schwer, aber lernbar" angefühlt, sondern nach Zufall. Deshalb die
  konservativeren ×1,15/×1,3 oben.
  Berührt NICHTS von der geschützten Wurfmechanik: `boardSpeedDegPerSec` ist
  seit jeher ein reiner Eingabewert für `TargetBoard`s Rotation, komplett
  getrennt von Fluggeschwindigkeit/Flugbahn/Kollisionsprüfung/Impact/
  Axtrotation während des Flugs.
- **Eigenes Bühnen-Schild** (`App.tsx`/`App.css`): `.stage__boss-tag--world`,
  Lila statt Rot, kräftigerer Puls-Glanz, "⚠ Weltboss" statt nur "Boss" –
  soll sich wie eine echte Ansage lesen, nicht wie ein Routine-5-Level-Boss.

Verifiziert: `tsc -b` sauber, Level 21 (Wüste-Weltboss) direkt geladen zeigt
korrekt "⚠ Weltboss / Sandkolossos" und 10 vorplatzierte Hindernisse
(passend zur Rechnung oben), keine Konsolenfehler. Das eigentliche
Spielgefühl der Phasen-Eskalation (zieht das Tempo während eines echten
Kampfes spürbar an?) ließ sich in der automatisierten Umgebung nicht in
Echtzeit nachspielen (rAF-Freeze) – bitte am Gerät bestätigen, ob die drei
Phasen als "lernen -> Druck -> Grenze" ankommen oder nachjustiert werden
müssen (Stellschraube: die Zahlen in `worldBossPhaseSpeedMultiplier()`).

### 20 neue Shop-Items in das bestehende System eingehängt

Dritter Teil-Batch. Klaus wollte einen "richtigen Shop mit ID/Name/Kategorie/
Preis/Bild/gekauft/ausgerüstet" – bei der Analyse zeigte sich: **das gibt es
in `game/shop.ts` bereits vollständig** (`SkinDef` trägt schon `id`, `kind`
als Kategorie, `name`, `price`; `ownedSkins`/`equippedAxeSkin`/
`equippedBoardSkin` im Spielstand decken gekauft/ausgerüstet ab; `getAxeImage()`/
`getBoardImage()` das Bild, mit automatischem Farb-Fallback ohne Bild). Statt
ein zweites, paralleles Item-System zu bauen, einfach 10 neue Äxte + 10 neue
Zielscheiben nach genau den von Klaus vorgegebenen Kategorien in die
bestehenden `AXE_SKINS`/`BOARD_SKINS`-Arrays gehängt (`shop.ts`):

- **Äxte:** Kiefernhieb, Schwarzstahl, Goldbeil, Feuerbeil, Frostbeil,
  Kristallbeil, Wikingerbeil, Dämonenbeil, Blitzbeil, Neonbeil (900-6700
  Münzen, eingereiht zwischen die bestehenden Preis-Stufen).
- **Zielscheiben:** Kiefernscheibe, Dunkelscheibe, Frostscheibe, Quarzscheibe,
  Magische Scheibe, Aschescheibe, Verfluchte Scheibe, Goldscheibe,
  Technikscheibe, Fantasy-Scheibe (350-3500 Münzen).
- Wo Klaus' Kategorie-Namen mit bereits existierenden Skins kollidiert hätten
  (z.B. "Eis-Scheibe" ↔ bestehende "Gletscher", "Vulkan-Scheibe" ↔
  bestehender "Vulkan", "Kristall-Scheibe" ↔ bestehende Legendär-Scheibe
  "Kristallkern"), bewusst leicht abgewandelte Namen/IDs gewählt
  (Frostscheibe/Aschescheibe/Quarzscheibe), damit es zwei sinnvoll
  unterscheidbare Varianten gibt statt eines Duplikats.
- **Jedes neue Item hat schon jetzt einen vollständigen Farb-Skin**
  (`AXE_STYLES`/`BOARD_STYLES`) – rendert also SOFORT sichtbar unterscheidbar
  über die bestehende Vektor-Silhouette, genau wie das erste Zwölfer-Set vor
  seinen eigenen Gemini-Bildern. Sobald echte Bilder da sind, reicht ein
  Eintrag in `AXE_IMAGES`/`BOARD_IMAGES` (`axeShapes.ts`/`boardImages.ts`) –
  `getAxeImage()`/`getBoardImage()` haben automatisch Vorrang vor der
  Farb-Silhouette, wie bei allen bisherigen Skins auch.
- Preise mit der bestehenden Ökonomie kompatibel gehalten (dieselbe
  Größenordnung wie das erste Zwölfer-Set/die sechs Kauf-Scheiben, keine neue
  Währung, kein neues Preis-System).

Verifiziert per echtem Kauf + Ausrüsten (Frostscheibe für 800 Münzen gekauft,
`ownedSkins`/`equippedBoardSkin` im Spielstand korrekt aktualisiert), beide
Shop-Reiter zeigen alle 20 neuen Karten mit Name/Beschreibung/Preis, `tsc -b`
sauber, keine Konsolenfehler.

### Weltkarte: Weltboss-Warnung sichtbar gemacht, gesperrte Welten kontrastreicher

Vierter Teil-Batch. Klaus wollte die Weltkarte "hochwertiger", mit
besonders auffälligen Boss-Welten und klar erkennbaren gesperrten Bereichen.
Bewusst KEIN kompletter Neubau (die Karte hat schon einen aufwendigen
Insel-/Reise-Look aus mehreren früheren Durchgängen, siehe Abschnitte weiter
oben) – zwei gezielte Ergänzungen statt alles neu zu erfinden:

- **Weltboss-Abzeichen** (`world-node__boss-badge`, `WorldMap.tsx`/`.css`):
  ein kleines rot-lila Schwert-Icon oben rechts an JEDEM Welt-Knoten außer
  Wald (nutzt `WORLD_BOSSES` aus `worlds.ts`, siehe Weltboss-Abschnitt weiter
  oben), plus der Bossname direkt im Label unter dem Level-Bereich ("⚔
  Sandkolossos" usw.) – schon sichtbar, auch während die Welt noch gesperrt
  ist ("das erwartet dich, sobald du so weit bist").
- **Gesperrte Welten kontrastreicher**: `filter: saturate(0.35)
  brightness(0.65)` auf dem Knoten-Badge statt nur eines leichten
  Grau-Untertons – deutlicherer Unterschied zwischen "gesperrt" und
  "freigeschaltet" auf den ersten Blick.

Verifiziert: alle 5 Bosse (Sandkolossos/Frostwardin/Aschenschlund/
Leerenwächter/Turmbrecher) erscheinen korrekt auf ihren Welt-Knoten, Wald
bleibt bewusst ohne Abzeichen, `tsc -b` sauber, keine Konsolenfehler.

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
- [x] **Heldenstadt (6. Welt), Sammelfiguren, Reise-Animation, automatischer
      Levelwechsel** (Details siehe eigener Abschnitt oben):
      - Kampagne auf 120 Level erweitert, 6. Welt "Heldenstadt" mit eigener
        Boss-Rotation (vier original gestaltete Großstadt-Gegner statt
        Marvel-Figuren).
      - Sammelfiguren als Heldenstadt-exklusives Collectible, gegen Diamanten
        eintauschbar im Shop.
      - Weltkarte: sichtbare Reise-Animation entlang des Pfads statt
        sofortigem Sprung, mehr Insel-Detail.
      - Levelabschluss geht automatisch weiter statt bei jedem Level auf
        einen Tap zu warten, mit kurzem "Level N"-Hinweis auf der Bühne.
      - Startbildschirm um Welt-Badge und Sammelfiguren-Anzeige erweitert,
        Titel/Regeln-Karte noch konsequenter blau.
      Dabei eine fehlende Anzeige nachgezogen: die Sammelfiguren-Belohnung
      wurde berechnet, aber zunächst nicht im Ergebnis-Screen gezeigt.
- [x] **Balancing nachgeschärft + Spiel-Bühne belebt** (Details siehe eigene
      Abschnitte oben): Apfel-Trefferfenster 24°→30° (nachgerechnet, nicht nur
      geschätzt), Boss-Level spürbar härter (Tempo, Hindernis, erzwungenes
      `pulse`-Muster). Staub-Partikel tönen sich jetzt pro Welt, Ecken-Deko war
      bei 6% Deckkraft praktisch unsichtbar und komplett regungslos – auf 13%
      angehoben und je Welt animiert, Äpfel pendeln sanft am Stiel.
- [x] **Vierter Grafik-Durchgang: Welt-Kulissen, Zielscheibe, Axt, Vorrat,
      Äpfel** (Details siehe eigener Abschnitt oben): neue WorldHorizon-
      Komponente mit welt-passender Horizont-Silhouette (vorher nur Farbtönung
      ohne jeden Bezug zur Welt), dabei einen Kontrast-Bug behoben (schwarze
      Silhouetten vor fast-schwarzem Bühnenfuß waren unsichtbar). Zielscheibe,
      Axt und Axt-Vorrat bekamen je einen wandernden Glanz-/Funkel-Effekt für
      mehr Leben auch außerhalb des eigentlichen Wurfs, Äpfel einen volleren
      Farbverlauf und eine natürlichere Fall-Animation mit Blatt-Spritzer.
- [x] **Tägliche Belohnung** (Details siehe eigener Abschnitt oben): 7-Tage-
      Belohnungs-Zyklus, der sich wiederholt, mit unbegrenzt weiterzählender
      Serie. Reine Ableitung aus dem Spielstand (kein eigener Auf-/Zu-State) –
      `DailyRewardModal.tsx` erscheint von selbst auf dem Startbildschirm,
      sobald eine Belohnung wartet, und verschwindet von selbst nach dem
      Abholen. Serien-Fortsetzung, Serien-Reset nach verpasstem Tag und
      Erstlauf alle drei per echtem Tap durchgespielt.
- [x] **Axt-Sortiment ausgetauscht** (Details siehe Werkstatt-Abschnitt oben):
      die alten 7 Kauf-Äxte raus, ein neues Zwölfer-Set mit Farbpaletten aus
      Gemini-Konzeptbildern rein, Start-Axt "Holzfäller" blieb unverändert.
- [x] **Alle Werkstatt-Grafiken auf echte Bild-Assets umgestellt: 30 Äxte +
      22 Scheiben** (Details siehe Werkstatt-Abschnitt oben): Zwischenschritt
      waren individuelle Hand-Vektor-Formen pro Axt statt einer gemeinsamen
      Silhouette, dann Schritt für Schritt echte, freigestellte
      Gemini-Bilder für buchstäblich jede Axt (Zwölfer-Set, Start-Axt, alle
      Boss-Beute-Früchte, Heldenstadt-Bosse, Legendär, Oster-Ei) und jede
      Scheibe (die 8 kaufbaren + 14 automatische Boss-Level-Scheiben)
      (`AXE_IMAGES`/`getAxeImage()` in `axeShapes.ts`,
      `BOARD_IMAGES`/`getBoardImage()` in `boardImages.ts`, neue
      Bild-Rendering-Zweige in `Axe.tsx`/`TargetBoard.tsx`/`Shop.tsx`). Per
      Skript gegen `shop.ts` gegengecheckt: keine einzige Axt- oder
      Scheiben-ID mehr ohne Bild.
- [x] **Wurf-Gefühl gezielt nachgeschärft** (Details siehe Winkel-Logik-
      Abschnitt oben): echten CSS-Timing-Bug behoben, der die Axt kurz vor
      dem Einschlag sichtbar "hängen" ließ (Position lief über eine
      vorne-geladene Kurve, die nach ~10% der Flugzeit schon fast fertig
      war). Dabei eine eigene Regression (Transform-Eigenschaften einzeln
      aufgeteilt -> Streck-Verzerrung drehte sich mit der Axt, sah wie ein
      langer Stiel aus) gefunden und zurückgenommen. Bewegungsschweif hinter
      der Axt entfernt, Abschuss-Sound ergänzt (gab vorher nur Einschlag-
      Sounds).
- [x] **Highscore-Prinzip + XP-Wirtschaft** (Details siehe Münzen/Läufe-
      Abschnitt oben): Game Over wirft jetzt immer auf Level 1 zurück statt
      nur an den 10er-Block-Anfang – Ziel ist ein möglichst hoher Highscore
      in einem Lauf, nicht Kampagnen-Fortschritt. "Bestmarke" in der gesamten
      UI zu "Highscore" umbenannt. Neue, dauerhafte XP-Ressource (übersteht
      ein Game Over) schaltet Welten frei, unabhängig davon, wie weit man im
      aktuellen Lauf kommt – Schwellenwerte aus den bestehenden
      Welt-Level-Bereichen abgeleitet, kein neues Datenfeld nötig.
- [x] **Schwierigkeits-Deckel deutlich angehoben** (Details siehe
      Level-System-Abschnitt oben): passend zum Highscore-Prinzip – die alten
      Deckel (8 Äxte/3 Hindernisse/200°Sek.) waren fürs 120-Level-Kampagnen-
      Ziel gedacht und hätten einen langen Highscore-Lauf nicht mehr
      gefordert. Jetzt bis zu 10 Äxte/6 Hindernisse, Tempo-Deckel bei
      320°/Sek. (statt 200), und ab Level 20 gibt es kein ruhiges `steady`-
      Muster mehr. Puls-/Richtungswechsel-Häufigkeit skaliert zusätzlich mit
      dem Board-Tempo (öfter, nicht nur schneller), die Fairness-Untergrenze
      (Scheibe darf nie fast stillstehen) bleibt dabei unverändert.
- [x] **Dritter Härte-Durchgang** (Details siehe Level-System-Abschnitt oben,
      2026-08-21): Tempo-Anstieg pro Level, Axt-/Hindernis-Deckel und
      -Kurvensteilheit, Boss-Level-Bonus sowie Puls-/Richtungswechsel-Rhythmus
      gleichzeitig verschärft, statt nur einen Wert zu drehen. Fairness-
      Untergrenze (Puls-Faktor nie unter 0.55) und die Flugzeit/Kollisions-
      Kalibrierung (`COLLISION_ANGLE_TOLERANCE_DEG`) bewusst unangetastet
      gelassen. `tsc -b` sauber, App lädt ohne Konsolenfehler – tatsächliches
      Spielgefühl noch nicht durch echtes Spielen bestätigt (rAF-Freeze in der
      automatisierten Umgebung, siehe eigener Abschnitt).
- [x] **Axt kurz "falsch herum" am Wurf-Start behoben** (Details siehe
      eigener Abschnitt oben, 2026-08-21): `axe-fly-transform`-Zwischenwert
      bei 12% von 70° auf 25° gesenkt (nah an linearer Kurve) – bei den
      jetzt kürzeren 140ms Flugzeit sprang die Axt in den ersten ~17ms
      unproportional schnell auf 70°. NUR dieser eine Rotationswert
      geändert, Flugbahn/-geschwindigkeit/Kollision/Impact/Einstecktiefe
      komplett unangetastet (per `git diff --stat` bestätigt: nur App.css).
- [x] **Schwierigkeitsgrad-Auswahl komplett entfernt, immer "Schwer"**
      (Details siehe Startbildschirm-Abschnitt oben, 2026-08-21): Klaus wollte
      keine Wahl mehr in den Einstellungen – automatisch immer die härteste
      Stufe. `Difficulty`-Typ, `SaveData.difficulty`, `setDifficulty()` und
      die Segmented-Control-UI restlos entfernt statt nur versteckt; die
      beiden "Schwer"-Multiplikatoren blieben als feste Konstanten
      (`BOARD_SPEED_MULTIPLIER`, `REWARD_MULTIPLIER`) erhalten und gelten
      jetzt immer. `tsc -b` sauber, Einstellungen-Fenster zeigt keinen Regler
      mehr, ein echter Wurf berechnet die Belohnung weiterhin korrekt.
- [x] **Flugzeit auf 140ms verkürzt, ohne die Flüssigkeit zu verlieren**
      (Details siehe eigener Abschnitt oben, 2026-08-21): `FLIGHT_DURATION_MS`
      190→140ms (~26%), sonst NICHTS an Easing/Kollision/Rotation-Kopplung
      angefasst – seit den beiden Fixes direkt davor (translate-basierte
      Bewegung, `animationend`-getriebene Auflösung) bleibt das automatisch
      synchron. Bewusst nicht kompensiert: Dauertippen in Level 1-5 wird
      dadurch wieder etwas riskanter (Nebenwirkung, kein Bug).
- [x] **Echter Mikro-Stopp vor dem Einschlag behoben: zwei unabhängige Uhren
      zu einer gemacht** (Details siehe eigener Abschnitt oben, 2026-08-21):
      die Treffer-Auswertung lief über einen eigenen `setTimeout`, parallel
      zur CSS-Flug-Animation – ein JS-Timer kann gegenüber einer Compositor-
      Animation nachhinken, die Axt stand dann fertig am Ziel und wartete auf
      das Spiel, nicht umgekehrt. Jetzt löst `App.tsx` die Treffer-Auswertung
      (`useAxeGame.ts`, neu `resolveThrow()`) direkt aus dem
      `onAnimationEnd`-Event der Flug-Animation aus – nur noch EIN Ereignis
      entscheidet über den Einschlags-Zeitpunkt. Per manuell simuliertem
      `animationend`-Event verifiziert (Treffer UND Kollision lösen korrekt
      aus, falsche Animation wird korrekt ignoriert); echte Zeitlupen-
      Bestätigung am Gerät steht noch aus (Browser-Pane komponiert hier keine
      echten Animationen, siehe rAF-Freeze-Abschnitt).
- [x] **Axt-Treffer: 6px-Positionssprung beim Übergang Flug→Steckend behoben**
      (Details siehe eigener Abschnitt oben, 2026-08-21): die fliegende Axt
      zielte schon länger auf Radius 114 (Steck-Radius minus Einstechtiefe),
      die steckende Darstellung kannte diesen Zuschlag nicht und rendert auf
      120 – ein exakter 6px-Sprung bei jedem Treffer, dabei vermutlich auch
      Ursache des "schwebt vor der Scheibe"-Eindrucks. Neuer, gemeinsamer
      Parameter `AXE_EMBED_DEPTH_PX` jetzt an beiden Stellen. Rotations-Seite
      geprüft, aber mangels visueller Verifizierbarkeit NICHT angefasst
      (bestehende, wahrscheinlich unbeteiligte Animation).
- [x] **Fünfte Runde: Basis-Tempo angehoben, Level 1-5 fühlen sich weniger
      zäh an** (Details siehe Level-System-Abschnitt oben, 2026-08-21):
      Klaus' Feedback "Level 1-5 nervig, Brett dreht zu langsam, kann nicht
      schnell werfen" – `BASE_SPEED_DEG_PER_SEC` von 55 auf 70°/Sek.
      angehoben, `FLIGHT_DURATION_MS` bewusst unangetastet. Nebeneffekt:
      Dauertippen kollidiert in den ersten Leveln jetzt nicht mehr
      zuverlässig mit der eigenen Axt (passend, da dort kaum Hindernisse
      sind). `tsc -b` sauber, Level 1 lädt fehlerfrei.
- [x] **Echte Foto-Bühnenhintergründe verworfen, Startbildschirm-Foto bleibt**
      (Details siehe eigener Abschnitt oben, 2026-08-21): realistische
      Welt-Fotos passten laut Klaus nicht zum Kinderspiel-Look, Bühnen-Wiring
      zurückgebaut und `worldImages.ts` gelöscht, das Startbildschirm-Foto
      (passt laut Feedback gut) blieb erhalten.
- [x] **Vierte Runde: Hindernis-Zahl schwankt statt starrer Treppenstufe**
      (Details siehe Level-System-Abschnitt oben, 2026-08-21): gleicher
      Level-Bereich hatte bisher immer exakt dieselbe Hindernis-Zahl (z.B.
      immer 6 zwischen Level 35-45), jetzt deterministische Schwankung um die
      Basis-Kurve (nach oben verzerrt, Schnitt 6,34→6,92 über alle 120
      Level), Deckel von 8 auf 10 angehoben. Per echtem Spielstand
      verifiziert (Level 63 = 10 Hindernisse, Level 64 = 7).
- [x] **Weltkarte: Freischalt-Anzeige zurück auf Level-Text** (Details siehe
      Welten-Abschnitt oben, 2026-08-21): gesperrte Welten zeigten "Ab X XP"
      (abstrakte Punktzahl), jetzt wieder "Ab Level N (durch XP)" – der
      XP-Mechanismus selbst ist unverändert, nur die Beschriftung wieder
      levelbasiert wie vor der XP-Wirtschaft. `tsc -b` sauber, per echtem Tap
      auf der Weltkarte geprüft (Eis/Vulkan/Kosmos/Heldenstadt zeigen korrekt
      "Ab Level 41/61/81/101"), keine Konsolenfehler.
- [x] **Sechste Runde: Äxte-Anzahl pro Level deutlich angehoben** (Details
      siehe Level-System-Abschnitt oben, 2026-08-21): Klaus fand die Level
      trotz aller bisherigen Härte-Durchgänge "viel zu einfach", diesmal
      gezielt am Axt-Vorrat gedreht statt an Tempo/Hindernissen – Start 5→6,
      Deckel 12→19, Schnitt über alle 100 Level ~8,7→~12,7 Äxte. Per echtem
      Spielstand verifiziert (Level 51 = 15 Äxte statt vorher 10).
- [x] **Siebte Runde: bewusste Schwierigkeits-WALL bei Level 20-25** (Details
      siehe Level-System-Abschnitt oben, 2026-08-21): Klaus wollte es
      "wirklich sehr schwer", speziell über Level 20-25 zu kommen – genau da
      liegen bereits die Boss-Level 20 und 25. Statt weiter überall
      gleichmäßig anzuheben, dort ein Nadelöhr eingebaut (Äxte 9-11→16,
      Hindernis-Basis 4→8), danach kurze Erholung auf die alten Werte für
      Level 26-30. Per echtem Spielstand verifiziert (Level 20 = 17 Äxte/10
      Hindernisse, Level 21 = 16 Äxte/9 Hindernisse, exakt wie erwartet).
- [x] **Achter Härte-Durchgang: Level 1-10 härter ohne mehr Äxte, plus
      Boss-/Level-Rotation pro Runde** (Details siehe Level-System-Abschnitt
      oben, 2026-08-21): `axeCountFor` unangetastet gelassen, stattdessen
      Hindernis-Basis für Level 4-19 angehoben und `steady`-Dreh-Muster
      verschwindet schon ab Level 5 statt erst ab 20. Neu: `SaveData.runSeed`
      rotiert Boss-Frucht UND die Apfel-/Hindernis-Winkel-Anordnung von Runde
      zu Runde (steigt bei Game Over bzw. "Von Level 1 starten"), damit ein
      wiederholter Lauf nicht mehr exakt gleich aussieht – die eigentliche
      Schwierigkeits-Kurve bleibt dabei unverändert nur von `levelIndex`
      abhängig. Per echtem Spielstand verifiziert (Level 7: 4 statt 3
      Hindernisse, Winkel rotieren um +97° zwischen zwei Runden; Level 5:
      Boss-Frucht wechselt zwischen den Runden, Axt-/Hindernis-Zahl bleibt
      gleich).
- [x] **Neunter Härte-Durchgang: die ersten 4 Level entschärft-Entscheidung
      aufgehoben** (Details siehe Level-System-Abschnitt oben, 2026-08-21):
      Klaus fand Level 1-4 direkt nach dem achten Durchgang immer noch "zu
      einfach und zu langweilig" – die alte Regel "Level 1-3 hindernisfrei"
      wurde deshalb bewusst gekippt. Nur noch Level 1 bleibt ein ruhiger
      Eintritts-Wurf, ab Level 2 gibt es sofort ein Hindernis und Pulsieren
      statt `steady`. Per echtem Spielstand verifiziert (Level 2 = 2
      Hindernisse statt vorher 0, Axt-Zahl unverändert).
- [x] **Performance-Fix: Ruckeln beim Werfen/Einschlag behoben** (Details
      siehe eigener Abschnitt oben, 2026-08-21): zwei CSS-Animationen
      (Axt-Flug-Position, Trefferring) animierten Layout-Eigenschaften
      (`bottom`, `border-width`) statt reiner Compositor-Eigenschaften – bei
      JEDEM Wurf/Treffer ein Reflow pro Animationsframe. Umgestellt auf
      `translate`/festen Rand, beide jetzt komplett compositor-basiert wie
      die restlichen Effekte im Spiel. `tsc -b` sauber, per CSSOM-Inspektion
      im Browser bestätigt, keine Konsolenfehler – das tatsächliche
      Ruckel-Gefühl auf einem echten Handy noch nicht bestätigt (rAF-Freeze
      in der automatisierten Umgebung).
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

- **Shop-Anzeige "schaltet frei bei Level X" für Boss-Beute-Äxte ist seit der
  Boss-Rotation (Achter Härte-Durchgang, siehe Level-System-Abschnitt oben)
  nur noch eine grobe Erst-Runde-Näherung**, keine exakte Garantie mehr –
  rechnet bewusst weiterhin mit `runSeed=0`. Betrifft nur die Anzeige im
  Shop (`Shop.tsx`, `bossLevel`-Berechnung), nicht die eigentliche
  Spiellogik. Falls das als verwirrend zurückgemeldet wird: entweder auf
  "Boss Nr. X" statt einer konkreten Levelnummer umstellen, oder den Shop
  den `runSeed` des aktuellen Spielstands mitgeben lassen.
- **Dritter Härte-Durchgang (2026-08-21) noch nicht durch echtes Spielen
  bestätigt.** Tempo-Anstieg, Axt-/Hindernis-Deckel, Boss-Bonus und Puls-/
  Richtungswechsel-Rhythmus wurden gleichzeitig hochgeschraubt (siehe
  Level-System-Abschnitt oben) – rein rechnerisch/per Code-Review begründet,
  die automatisierte Umgebung kann die Scheibendrehung wegen des
  rAF-Freeze-Problems nicht selbst nachspielen. Falls "immer noch zu leicht"
  oder "jetzt zu hart" als Feedback kommt: `SPEED_STEP_PER_LEVEL`,
  `axeCountFor`/`obstacleCountFor` in `constants.ts` bzw. die
  `PULSE_PERIOD_*`/`REVERSE_PERIOD_*`-Werte in `TargetBoard.tsx` sind die
  Stellschrauben.
- Selbst durchspielen und Feedback zum Balancing geben – die Werte sind
  Schätzungen. Konkret unklar:
  - **Münz-Tempo.** ~15-25 Münzen pro Level plus Boni. Der erste kaufbare Skin
    (150) kommt nach ~7-10 Leveln, der teuerste (5000) sehr viel später.
  - ~~**Sind Boss-Level hart genug?**~~ Nachgeschärft: Tempo-Bonus 12→20°/Sek.,
    zusätzlich ein Hindernis mehr, und das Dreh-Muster ist jetzt für Boss-Level
    fest auf `pulse` gesetzt (`spinPatternFor()` hätte sonst z.B. den allerersten
    Boss auf `steady` gesetzt – ausgerechnet der erste hätte sich dann nicht
    schwerer angefühlt). Per Code-Rechnung begründet (siehe Kommentar in
    `generateLevel()`), NICHT durch echtes Vielspielen bestätigt – falls
    "immer noch zu leicht"/"jetzt zu hart" als Feedback kommt, hier ansetzen.
  - ~~**Apfel-Ausbeute:**~~ `APPLE_HIT_TOLERANCE_DEG` von 24° auf 30° angehoben.
    Nachgerechnet statt nur geraten: bei 4 Äpfeln (90° auseinander, die engste
    Situation ab Level 51) berühren sich die Fangfenster bei 30° gerade so
    nicht (2×30°=60° < 90°) – mehr Großzügigkeit ohne dass sich Äpfel
    gegenseitig die Fenster stehlen können. Ebenfalls noch nicht durch
    echtes Spielen verifiziert.
- Mehr Shop-Inhalte denkbar (Spuren/Trails der Axt, Hintergrund-Kulissen,
  Sound-Sets) – die Struktur trägt das jetzt, Farben sind reine Daten.
- Idee für später: Level-Auswahl statt nur "weiter" – die Bestmarke ist da, ein
  Sprung in einen früheren Block wäre wenig Aufwand.

## Zusammenarbeits-Regeln (siehe auch Anleitung im Chat)

- Immer zuerst `git pull`, bevor man anfängt zu arbeiten.
- Kleine, häufige Commits mit klarer Beschreibung.
- Diese Datei nach jedem größeren Schritt aktualisieren und mit committen.
