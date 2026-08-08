# Dirty City Tycoon – Projektstatus

Diese Datei ist die "Quelle der Wahrheit" für den aktuellen Stand des Projekts.
Bei jedem größeren Fortschritt wird sie aktualisiert, damit man beim Öffnen des
Projekts auf einem anderen PC sofort weiß, wo wir stehen.

## Was ist das Spiel?

Ein simples Idle-/Tycoon-Handyspiel (Vorbild: "Idle Miner Tycoon", Thema: Müll statt Erz).
Der Spieler macht eine dreckige Stadt sauber, kauft Arbeiter und Transporter,
muss den Engpass zwischen beiden im Gleichgewicht halten, und reist am Ende
per Prestige-System in immer größere, dreckigere Städte.

Ausführliches Spieldesign (Mechaniken, Balancing-Zahlen, UI/Look) steht in der
ursprünglichen Anforderung – wird nach und nach in diese Datei bzw. in Code-Kommentare
übernommen, sobald die jeweilige Phase gebaut wird.

## Tech-Stack

- Vite + React + TypeScript
- Capacitor (kommt in Phase 2) für die native iOS-Verpackung
- Speicherung: localStorage im Web, später Capacitor Preferences auf iOS
- Kein Backend, keine Accounts, kein externes Game-Framework. Alles läuft lokal.

## Architektur

```
src/
  game/
    types.ts       Alle Datentypen (GameState, CityDef, OfflineReport)
    constants.ts    Alle Balancing-Zahlen + Städte-Liste an einem Ort
    engine.ts       Reine Spiellogik (kein React): tick(), Kauf-Funktionen,
                     Prestige-Berechnung, Offline-Verdienst-Berechnung
    storage.ts      localStorage laden/speichern (wird in Phase 2 auf
                     Capacitor Preferences umgestellt)
  hooks/
    useGameEngine.ts  Verbindet engine.ts mit React: State, 100ms-Tick-Loop,
                       Autosave (alle 5s + beim Verstecken/Schließen der Seite),
                       Offline-Verdienst beim Start berechnen
  components/
    HUD, CleanlinessBar, CityStage, BufferBar, TapButton, ShopPanel,
    OfflineModal, PrestigeModal – je eine .tsx + eigene .css Datei
    WorkerSprite, TruckSprite – kleine Cartoon-Figuren als Inline-SVG
    (kein Bild-Asset, direkt Code), werden in CityStage je nach Anzahl
    gekaufter Einheiten mehrfach angezeigt (mit Obergrenze + "+N"-Badge)
  styles/theme.css  Alle Design-Werte als CSS-Variablen (Farben, Radien, Abstände).
    Heller, knalliger Mobile-Game-Look als Standard, dunkles Pendant über
    prefers-color-scheme: dark.
  utils/format.ts   Zahlen-Kurzformat (1,5k / 2,3 Mio) und Prozent-Format
```

Prinzip: `game/` kennt React nicht (pure Funktionen, leicht nachvollziehbar/testbar),
`hooks/useGameEngine.ts` ist die einzige Brücke zu React, `components/` sind reine
Anzeige-Komponenten ohne eigene Spiellogik.

## Spielregeln (Kurzfassung, Details siehe Balancing unten)

- Tick alle 100ms.
- Tippen auf "Selber kehren" gibt Geld pro Tipp.
- Arbeiter sammeln Müll in einen Puffer (Zwischenlager).
- Transporter leeren den Puffer und wandeln Müll in Geld um.
- Effektiver Verdienst/s = Minimum aus Sammelrate und Abfahrrate (Engpass!).
- Lager vergrößert den Puffer.
- Sauberkeits-Fortschritt pro Stadt = insgesamt in dieser Stadt verdientes Geld.
- Bei Erreichen des Stadt-Ziels: Umzug in nächste Stadt = Prestige-Reset mit
  dauerhaftem Multiplikator (+10% pro gewonnenem Stern).
- Offline-Einkommen beim Wiedereröffnen, gedeckelt auf 8 Stunden.

## Balancing (Startwerte)

- Tippen: +1 Geld/Tipp × Prestige-Multiplikator. Startkapital: 0.
- Arbeiter: Grundpreis 15, +1.5 Sammelrate/Stück.
- Transporter: Grundpreis 22, +1.5 Abfahrrate/Stück, Start: 1 gratis.
- Lager: Grundpreis 120, +40 Pufferkapazität/Stück. Basis-Puffer ohne Lager: 50.
- Kostensteigerung: grundpreis × 1.15^anzahl.
- Städte-Ziele: Dorf 2.500 → Kleinstadt 20.000 → Mittelstadt 160.000 →
  Großstadt 1.28 Mio → Metropole 10.24 Mio (jeweils ×8).
- Sterne beim Umzug: floor(sqrt(verdientes_Geld_dieser_Stadt / 5000)), je Stern +10% Multiplikator.
- Offline-Cap: 8 Stunden.

## Aktueller Stand

- [x] Phase 0: Git-Repo initialisiert, .gitignore, CLAUDE.md angelegt.
- [x] Phase 1: Vite+React+TS-Projekt, komplettes Spiel im Browser spielbar (localStorage).
      Alle Kernmechaniken durchgetestet (Tippen, Kaufen, Engpass-Warnung,
      Offline-Verdienst, Prestige-Umzug).
      Nach erstem Feedback ("wirkt zu abstrakt, soll wie ein echtes Handyspiel
      aussehen, Vorbild Idle Lumber Factory") komplett überarbeitetes Design:
      helle, knallige Farbpalette, echte Cartoon-Arbeiter/Transporter-Figuren
      (SVG) statt Balken/Icons, Müllhalde in der Stadt-Bühne visualisiert
      direkt den Pufferstand.
      Zweite Design-Runde nach Referenzbild "Idle Miner Tycoon": HUD als
      Pillen-Badges (Coins/Rate/Sterne, dunkle Navy-Leiste), Stadt-Bühne als
      mehrstöckiger Turm-Aufbau (Arbeiter-Depot links, Transporter-Garage
      rechts, je mit "×Anzahl"-Badge, Berge im Hintergrund, fallende Funken
      zwischen den Türmen), Figuren chibi-hafter (größere Köpfe).
      Dritte Design-Runde ("Turm-Optik wirkt billig, will echte Straßen-Szene
      mit Bewegung sehen") - Stadt-Bühne nochmal komplett neu: Häuserzeile von
      oben, Straße mit Mittellinie, verstreute Müll-Icons (Dose/Papier/
      Bananenschale/Flasche, TrashItem.tsx), Arbeiter patrouillieren mit
      Lauf+Bück-Animation, Transporter fahren per CSS-Loop-Animation von
      rechts rein, halten kurz, fahren links wieder raus. Bewusste
      Erwartungshaltung kommuniziert: volle AAA-Studio-Illustrationsqualität
      (siehe Referenzbild) ist per Hand-SVG in dieser Form nicht 1:1 erreichbar,
      Fokus liegt auf "wirkt lebendig, Leute putzen wirklich, Transporter
      fahren wirklich hin und weg".
- [ ] Phase 2: Capacitor + iOS-Plattform, Speicherung auf Capacitor Preferences.
- [ ] Phase 3: App-Icon, Splash-Screen, App-Store-Vorbereitung.

## Offene To-dos

- Phase 2 starten, sobald Klaus Phase 1 final getestet hat und OK gibt.
- Feinjustierung des Balancings folgt nach Bauchgefühl-Test durch Klaus
  (Tempo: erster Arbeiter ~15-20s, erster Engpass ~1-2 Min, erster Umzug ~15-20 Min).

## Zusammenarbeits-Regeln (siehe auch Anleitung im Chat)

- Immer zuerst `git pull`, bevor man anfängt zu arbeiten.
- Kleine, häufige Commits mit klarer Beschreibung.
- Diese Datei nach jedem größeren Schritt aktualisieren und mit committen.
