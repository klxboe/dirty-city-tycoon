// Echte Bild-Skins für Zielscheiben (siehe axeShapes.ts für dasselbe Prinzip bei
// Äxten). Skins hier ersetzen NUR die dekorative Fläche (Holz/Ringe/Kern) in
// TargetBoard.tsx – Rotation, steckende Äxte, hängende Äpfel und der
// Riss-Effekt bleiben eigene Ebenen obendrauf und sind davon unberührt.

export const BOARD_IMAGES: Record<string, string> = {
  'board-oak': '/boards/board-oak.png',
  'board-walnut': '/boards/board-walnut.png',
  'board-ice': '/boards/board-ice.png',
  'board-volcano': '/boards/board-volcano.png',
  'board-ebony': '/boards/board-ebony.png',
  'board-webslinger': '/boards/board-webslinger.png',
  'board-legendary-galaxy': '/boards/board-legendary-galaxy.png',
  'board-legendary-crystal': '/boards/board-legendary-crystal.png',

  // --- Boss-Beute-Scheiben: kein eigener Shop-Eintrag, ersetzen die Scheibe
  // nur automatisch WÄHREND des jeweiligen Boss-Levels (siehe bossFruit.boardSkinId
  // in useAxeGame.ts -> activeBoardSkin) ---
  'board-melon': '/boards/board-melon.png',
  'board-grape': '/boards/board-grape.png',
  'board-orange': '/boards/board-orange.png',
  'board-kiwi': '/boards/board-kiwi.png',
  'board-dragon': '/boards/board-dragon.png',
  'board-pineapple': '/boards/board-pineapple.png',
  'board-lemon': '/boards/board-lemon.png',
  'board-pomegranate': '/boards/board-pomegranate.png',
  'board-berry': '/boards/board-berry.png',
  'board-coconut': '/boards/board-coconut.png',
  'board-drone': '/boards/board-drone.png',
  'board-neon': '/boards/board-neon.png',
  'board-gargoyle': '/boards/board-gargoyle.png',
  'board-antenna': '/boards/board-antenna.png',

  // --- Weltboss-Scheiben (siehe WORLD_BOSSES in worlds.ts) - Gemini-Bilder von
  // Klaus geliefert, ersetzen den bisherigen Farbverlauf-Fallback ---
  'board-boss-desert': '/boards/board-boss-desert.png',
  'board-boss-ice': '/boards/board-boss-ice.png',
  'board-boss-volcano': '/boards/board-boss-volcano.png',
  'board-boss-cosmos': '/boards/board-boss-cosmos.png',
  'board-boss-metro': '/boards/board-boss-metro.png',
};

export function getBoardImage(id: string): string | undefined {
  return BOARD_IMAGES[id];
}
