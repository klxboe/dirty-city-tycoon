// Alle Datentypen für den Spielzustand an einem Ort.

export interface CityDef {
  /** Anzeigename der Stadt (fiktiv). */
  name: string;
  /** Größen-Kategorie, wird als Zusatz zum Namen angezeigt. */
  tier: string;
  /** Wie viel Geld in dieser Stadt insgesamt verdient werden muss, um "sauber" zu sein. */
  goal: number;
}

export interface GameState {
  /** Für zukünftige Speicherstand-Migrationen. */
  version: number;

  money: number;
  /** Insgesamt in der AKTUELLEN Stadt verdientes Geld (Basis für die Sauberkeits-Leiste). Sinkt nie. */
  totalEarnedThisCity: number;

  workers: number;
  transporters: number;
  storages: number;

  /** Aktueller Füllstand des Zwischenlagers. */
  buffer: number;
  /**
   * War der Puffer im letzten Tick so voll, dass gesammelter Müll verloren ging?
   * Wird bei jedem Tick neu berechnet (siehe engine.ts) und für die Engpass-Warnung genutzt,
   * weil `buffer` selbst durch das gleichzeitige Abfahren fast nie exakt auf der Kapazitätsgrenze steht.
   */
  bufferOverflowing: boolean;

  /** Index in CITIES (siehe constants.ts). Kann über die Array-Länge hinauswachsen. */
  cityIndex: number;

  /** Dauerhafter Multiplikator aus gesammelten Sternen (1 = kein Bonus). */
  prestigeMultiplier: number;
  totalStars: number;

  /** Zeitstempel (ms) des letzten Speicherns, für die Offline-Verdienst-Berechnung. */
  lastSavedAt: number;
}

export interface OfflineReport {
  earned: number;
  elapsedMs: number;
}
