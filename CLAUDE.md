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

## Architektur (wird laufend erweitert)

_Noch nichts gebaut – Phase 0 ist reines Projekt-Setup ohne Code._
Sobald Phase 1 startet, wird hier die Ordnerstruktur und der Aufbau
(z.B. Game-State, Tick-Loop, Komponenten) dokumentiert.

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
- [ ] Phase 1: Vite+React+TS-Projekt, komplettes Spiel im Browser spielbar (localStorage).
- [ ] Phase 2: Capacitor + iOS-Plattform, Speicherung auf Capacitor Preferences.
- [ ] Phase 3: App-Icon, Splash-Screen, App-Store-Vorbereitung.

## Offene To-dos

- Phase 1 starten, sobald Klaus das Setup getestet hat und OK gibt.

## Zusammenarbeits-Regeln (siehe auch Anleitung im Chat)

- Immer zuerst `git pull`, bevor man anfängt zu arbeiten.
- Kleine, häufige Commits mit klarer Beschreibung.
- Diese Datei nach jedem größeren Schritt aktualisieren und mit committen.
