// Kosmetik-Shop: Axt- und Scheiben-Designs, die man mit Münzen kauft.
// Rein optisch – kein Skin verändert Balancing (Flugzeit, Hitbox, Tempo).
// Neue Skins hier eintragen; Aussehen dann in Axe.tsx bzw. TargetBoard.css
// unter der jeweiligen ID ergänzen.

export type SkinKind = 'axe' | 'board';

export interface SkinDef {
  id: string;
  kind: SkinKind;
  name: string;
  /** Kurze Beschreibung für die Shop-Karte. */
  blurb: string;
  /** Preis in Münzen. 0 = von Anfang an dabei. */
  price: number;
}

export const AXE_SKINS: SkinDef[] = [
  { id: 'axe-standard', kind: 'axe', name: 'Holzfäller', blurb: 'Die treue Standard-Axt.', price: 0 },
  { id: 'axe-bronze', kind: 'axe', name: 'Bronzeklinge', blurb: 'Warmer Bronzeschimmer, dunkles Nussholz.', price: 150 },
  { id: 'axe-frost', kind: 'axe', name: 'Frostkante', blurb: 'Eisblaue Klinge mit Raureif am Stiel.', price: 400 },
  { id: 'axe-ember', kind: 'axe', name: 'Glutspalter', blurb: 'Glühende Schneide, rußgeschwärzter Griff.', price: 900 },
  { id: 'axe-gold', kind: 'axe', name: 'Goldrausch', blurb: 'Massives Gold. Wirft sich erstaunlich gut.', price: 2000 },
];

export const BOARD_SKINS: SkinDef[] = [
  { id: 'board-oak', kind: 'board', name: 'Eiche', blurb: 'Klassisches helles Zielholz.', price: 0 },
  { id: 'board-walnut', kind: 'board', name: 'Nussbaum', blurb: 'Dunkles Holz, messingfarbener Ring.', price: 200 },
  { id: 'board-ice', kind: 'board', name: 'Gletscher', blurb: 'Gefrorene Scheibe mit blauem Schimmer.', price: 600 },
  { id: 'board-volcano', kind: 'board', name: 'Vulkan', blurb: 'Erkaltete Lava mit glühenden Rissen.', price: 1400 },
];

export const ALL_SKINS: SkinDef[] = [...AXE_SKINS, ...BOARD_SKINS];

export const DEFAULT_AXE_SKIN = AXE_SKINS[0].id;
export const DEFAULT_BOARD_SKIN = BOARD_SKINS[0].id;

export function getSkin(id: string): SkinDef | undefined {
  return ALL_SKINS.find((skin) => skin.id === id);
}

/** Skins mit Preis 0 gehören dem Spieler immer, ohne dass sie gespeichert werden müssen. */
export function isFreeSkin(id: string): boolean {
  return getSkin(id)?.price === 0;
}
