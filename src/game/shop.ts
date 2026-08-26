// Alle Designs an einem Ort: Äxte, Zielscheiben und die Boss-Früchte.
// Rein kosmetisch – kein Design verändert Balancing (Flugzeit, Hitbox, Tempo).
//
// Die Scheiben-Farben stehen bewusst HIER als Daten und nicht in TargetBoard.css:
// TargetBoard setzt sie als CSS-Variablen inline. So braucht eine neue Frucht nur
// einen Eintrag in dieser Datei statt zusätzlich einen CSS-Block.
import type { Language } from './i18n';

export type SkinKind = 'axe' | 'board';
/**
 * `shop` = für Münzen kaufbar, `gem` = für Diamanten kaufbar ("Legendär"-Reiter im
 * Shop, inzwischen auch die Boss-Beute-Äxte, siehe BOSS_AXE_SKINS/HERO_AXE_SKINS
 * unten), `egg` = Oster-Ei – nur über ein verstecktes Geheimnis freischaltbar, nie
 * kaufbar.
 *
 * Es gab früher zwei weitere Quellen: `boss` (Boss-Äxte gab es geschenkt fürs
 * Levelschaffen – Klaus: "mach die Äxte die man ab einem gewissen Level bekommt
 * weg, einfach für Diamanten stattdessen", die Äxte sind seitdem `gem`-Skins) und
 * kurzzeitig `iap` (Echtgeld-Käufe über RevenueCat/App Store Connect, auf Klaus'
 * Entscheidung "wir machen nur Geld durch Werbung" wieder entfernt, siehe
 * AXE_SKINS unten). Beide Quellen komplett ausgebaut statt nur deaktiviert.
 */
export type SkinSource = 'shop' | 'gem' | 'egg';

export interface SkinDef {
  id: string;
  kind: SkinKind;
  name: string;
  /** Kurze Beschreibung für die Shop-Karte. */
  blurb: string;
  /** Englischer Name/Beschreibung, siehe game/i18n.ts. */
  nameEn: string;
  blurbEn: string;
  /**
   * Preis in Münzen (source 'shop') oder Diamanten (source 'gem'). 0 = von Anfang an
   * dabei. Bei 'egg' ohne Bedeutung.
   */
  price: number;
  source: SkinSource;
}

/** Skin-Name in der aktuellen UI-Sprache (siehe game/i18n.ts). */
export function localizedSkinName(skin: SkinDef, lang: Language): string {
  return lang === 'en' ? skin.nameEn : skin.name;
}

/** Skin-Beschreibung in der aktuellen UI-Sprache (siehe game/i18n.ts). */
export function localizedSkinBlurb(skin: SkinDef, lang: Language): string {
  return lang === 'en' ? skin.blurbEn : skin.blurb;
}

/** Farbwerte einer Zielscheibe. Landen 1:1 als CSS-Variablen auf dem Board-Element. */
export interface BoardStyle {
  rim: string;
  faceInner: string;
  faceOuter: string;
  wedge: string;
  glow: string;
  ringLight: string;
  ringAccent: string;
  core: string;
  coreEdge: string;
  coreGlow: string;
}

/** Farbwerte einer Axt. */
export interface AxeStyle {
  /** Klinge: Glanzkante -> Fläche -> Schattenseite. */
  steel: [string, string, string];
  /** Griff: hell -> dunkel. */
  wood: [string, string];
  /** Wicklungs-Ringe am Griff. */
  wrap: string;
  /** Kontur, hebt die Silhouette vom dunklen Hintergrund ab. */
  outline: string;
  /** Optionaler farbiger Schein um die Klinge. */
  glow?: string;
}

// ---------------------------------------------------------------------------
// Kaufbare Äxte
// ---------------------------------------------------------------------------

export const AXE_SKINS: SkinDef[] = [
  { id: 'axe-standard', kind: 'axe', name: 'Holzfäller', blurb: 'Die treue Standard-Axt.', nameEn: 'Woodcutter', blurbEn: 'The trusty standard axe.', price: 0, source: 'shop' },

  // --- Zwölfer-Set, nach Gemini-Konzeptbildern gestaltet (Farben übernommen,
  // Form bleibt wie bei jeder Axt die gemeinsame Silhouette aus Axe.tsx). ---
  //
  // Preise durchgängig angehoben (Klaus: "generell alle ein Stück teurer") UND
  // Wurzelhieb/Korallenschneide bewusst WEITER NACH UNTEN verschoben (Klaus: "die
  // Äxte teurer machen, also weiter nach unten") – waren bisher die zwei günstigsten
  // Einstiegs-Äxte direkt nach der kostenlosen Start-Axt, jetzt mit deutlich höherem
  // Preis mitten in der Liste einsortiert statt am Anfang.
  { id: 'axe-oldwood', kind: 'axe', name: 'Kiefernhieb', blurb: 'Schlicht, robust, riecht nach frischem Schnitt.', nameEn: 'Pine Chop', blurbEn: 'Simple, sturdy, smells like fresh-cut wood.', price: 2500, source: 'shop' },
  { id: 'axe-black', kind: 'axe', name: 'Schwarzstahl', blurb: 'Mattschwarz geschmiedet, verschluckt jedes Licht.', nameEn: 'Blacksteel', blurbEn: 'Forged matte black, swallows every bit of light.', price: 3300, source: 'shop' },
  { id: 'axe-nature', kind: 'axe', name: 'Wurzelhieb', blurb: 'Lebendiges Holz, das nie ganz aufgehört hat zu wachsen.', nameEn: 'Rootstrike', blurbEn: 'Living wood that never quite stopped growing.', price: 3900, source: 'shop' },
  { id: 'axe-viking', kind: 'axe', name: 'Wikingerbeil', blurb: 'Uraltes Muster, seit Generationen unverändert scharf.', nameEn: 'Viking Axe', blurbEn: 'Ancient pattern, sharp for generations unchanged.', price: 4100, source: 'shop' },
  { id: 'axe-coral', kind: 'axe', name: 'Korallenschneide', blurb: 'Direkt vom Riff, noch feucht vom Meer.', nameEn: 'Coral Edge', blurbEn: 'Straight from the reef, still damp from the sea.', price: 4600, source: 'shop' },
  { id: 'axe-fire', kind: 'axe', name: 'Feuerbeil', blurb: 'Die Glut erlischt nie ganz, egal wie kalt der Wind.', nameEn: 'Fire Axe', blurbEn: 'The embers never fully die, no matter how cold the wind.', price: 4700, source: 'shop' },
  { id: 'axe-frostaxe', kind: 'axe', name: 'Frostbeil', blurb: 'Klirrend kalt, die Klinge beschlägt nie.', nameEn: 'Frost Axe', blurbEn: 'Bitterly cold, the blade never fogs up.', price: 5300, source: 'shop' },
  { id: 'axe-neonaxe', kind: 'axe', name: 'Neonbeil', blurb: 'Grellbunt und laut, genau wie das Viertel, aus dem sie kommt.', nameEn: 'Neon Axe', blurbEn: 'Loud and garish, just like the block it comes from.', price: 6100, source: 'shop' },
  { id: 'axe-crystalaxe', kind: 'axe', name: 'Kristallbeil', blurb: 'Gewachsen statt geschmiedet, bricht das Licht in Splitter.', nameEn: 'Crystal Axe', blurbEn: 'Grown, not forged, shatters light into splinters.', price: 7200, source: 'shop' },
  { id: 'axe-lightning', kind: 'axe', name: 'Blitzbeil', blurb: 'Riecht nach Ozon kurz vor dem Einschlag.', nameEn: 'Lightning Axe', blurbEn: 'Smells of ozone right before impact.', price: 8400, source: 'shop' },
  { id: 'axe-gold', kind: 'axe', name: 'Goldbeil', blurb: 'Zu schade zum Werfen – wirft trotzdem gut.', nameEn: 'Gold Axe', blurbEn: 'Too pretty to throw – throws great anyway.', price: 9700, source: 'shop' },
  { id: 'axe-demon', kind: 'axe', name: 'Dämonenbeil', blurb: 'Flüstert leise, wenn niemand sonst in der Nähe ist.', nameEn: 'Demon Axe', blurbEn: 'Whispers softly when no one else is around.', price: 11000, source: 'shop' },

  // --- Die zehn teuersten/"coolsten" Äxte aus dem Zwölfer-Set. Waren kurzzeitig
  // als Echtgeld-Käufe geplant (`source: 'iap'`), Klaus hat sich dagegen entschieden
  // ("wir machen nur Geld durch Werbung") – die IAP-Infrastruktur (RevenueCat,
  // App-Store-Connect-Produkte) wurde deshalb wieder komplett entfernt (siehe
  // Commit-Nachricht/CLAUDE.md). Die Grafiken waren aber schon fertig, deshalb
  // NICHT gelöscht, sondern zu normalen Münz-Äxten gemacht – oberhalb von
  // `axe-demon` (11000) als neue Preis-Spitze der Liste, in derselben relativen
  // Reihenfolge wie zuvor bei den priceCents-Werten (199 Cent -> günstigste hier,
  // 799 Cent -> teuerste). ---
  { id: 'axe-steampunk', kind: 'axe', name: 'Dampfschmiede', blurb: 'Tickt, zischt und trifft trotzdem präzise.', nameEn: 'Steamforge', blurbEn: 'Ticks, hisses, and still hits dead-on.', price: 12500, source: 'shop' },
  { id: 'axe-rune', kind: 'axe', name: 'Runenbeil', blurb: 'Uralte Runen glimmen schwach im dunklen Stahl.', nameEn: 'Rune Axe', blurbEn: 'Ancient runes glow faintly in the dark steel.', price: 14000, source: 'shop' },
  { id: 'axe-tide', kind: 'axe', name: 'Gezeitenklinge', blurb: 'Formt sich wie eine Welle, die nie ganz bricht.', nameEn: 'Tideblade', blurbEn: 'Shaped like a wave that never quite breaks.', price: 15500, source: 'shop' },
  { id: 'axe-cosmic', kind: 'axe', name: 'Sternenschneide', blurb: 'Ein Splitter Nachthimmel, eingefasst in Silber.', nameEn: 'Starblade', blurbEn: 'A shard of night sky, set in silver.', price: 17000, source: 'shop' },
  { id: 'axe-thorn', kind: 'axe', name: 'Dornengift', blurb: 'Giftgrüne Adern pulsieren unter der Klinge.', nameEn: 'Thornvenom', blurbEn: 'Poison-green veins pulse beneath the blade.', price: 19000, source: 'shop' },
  { id: 'axe-magma', kind: 'axe', name: 'Lavabruch', blurb: 'Frisch erkaltete Kruste, glühend heiß im Kern.', nameEn: 'Magma Break', blurbEn: 'Freshly cooled crust, glowing hot at the core.', price: 21000, source: 'shop' },
  { id: 'axe-plague', kind: 'axe', name: 'Pestbeil', blurb: 'Riecht nach Moor und schlechten Entscheidungen.', nameEn: 'Plague Axe', blurbEn: 'Smells of bog and bad decisions.', price: 23500, source: 'shop' },
  { id: 'axe-royal', kind: 'axe', name: 'Königsbeil', blurb: 'Zeremoniell geschmiedet, kampferprobt trotzdem.', nameEn: 'Royal Axe', blurbEn: 'Ceremonially forged, battle-tested all the same.', price: 26000, source: 'shop' },
  { id: 'axe-cyber', kind: 'axe', name: 'Datenbeil', blurb: 'Firmware-Update inklusive, Klinge bleibt scharf.', nameEn: 'Data Axe', blurbEn: 'Firmware update included, blade stays sharp.', price: 29000, source: 'shop' },
  { id: 'axe-holy', kind: 'axe', name: 'Lichtschwinge', blurb: 'Strahlt, als hätte sie nie Blut gesehen.', nameEn: 'Lightwing', blurbEn: 'Gleams as if it had never seen blood.', price: 32000, source: 'shop' },
];

// ---------------------------------------------------------------------------
// Kaufbare Zielscheiben
// ---------------------------------------------------------------------------

export const BOARD_SKINS: SkinDef[] = [
  { id: 'board-oak', kind: 'board', name: 'Eiche', blurb: 'Klassisches helles Zielholz.', nameEn: 'Oak', blurbEn: 'Classic light target wood.', price: 0, source: 'shop' },
  { id: 'board-walnut', kind: 'board', name: 'Nussbaum', blurb: 'Dunkles Holz, messingfarbener Ring.', nameEn: 'Walnut', blurbEn: 'Dark wood, brass-colored ring.', price: 230, source: 'shop' },
  { id: 'board-ice', kind: 'board', name: 'Gletscher', blurb: 'Gefrorene Scheibe mit blauem Schimmer.', nameEn: 'Glacier', blurbEn: 'Frozen board with a blue shimmer.', price: 700, source: 'shop' },
  { id: 'board-volcano', kind: 'board', name: 'Vulkan', blurb: 'Erkaltete Lava mit glühenden Rissen.', nameEn: 'Volcano', blurbEn: 'Cooled lava with glowing cracks.', price: 1600, source: 'shop' },
  { id: 'board-ebony', kind: 'board', name: 'Ebenholz', blurb: 'Tiefschwarzes Holz mit Silberadern.', nameEn: 'Ebony', blurbEn: 'Deep black wood with silver veins.', price: 3000, source: 'shop' },
  {
    id: 'board-webslinger',
    kind: 'board',
    name: 'Spinnennetz',
    blurb: 'Die Speichen sehen verdächtig nach einem Netz aus der Nachbarschaft aus.',
    nameEn: 'Web',
    blurbEn: 'The spokes suspiciously resemble a web from the neighborhood.',
    price: 1150,
    source: 'shop',
  },

  // --- Zweites Zehner-Set (siehe Kommentar bei AXE_SKINS oben – dieselbe Logik:
  // Farb-Skin auf der bestehenden Scheiben-Darstellung, bis die Gemini-Bilder da sind) ---
  { id: 'board-oldwood', kind: 'board', name: 'Kiefernscheibe', blurb: 'Hell, einfach, riecht nach Werkstatt.', nameEn: 'Pine Board', blurbEn: 'Light, simple, smells like a workshop.', price: 400, source: 'shop' },
  { id: 'board-dark', kind: 'board', name: 'Dunkelscheibe', blurb: 'Fast schwarz, nur der Kern glimmt schwach.', nameEn: 'Dark Board', blurbEn: 'Almost black, only the core glows faintly.', price: 1050, source: 'shop' },
  { id: 'board-frost', kind: 'board', name: 'Frostscheibe', blurb: 'Reif statt Rinde, knirscht bei jedem Treffer.', nameEn: 'Frost Board', blurbEn: 'Frost instead of bark, crunches with every hit.', price: 950, source: 'shop' },
  { id: 'board-crystalboard', kind: 'board', name: 'Quarzscheibe', blurb: 'Gewachsener Quarz statt Holz, klar bis auf den Grund.', nameEn: 'Quartz Board', blurbEn: 'Grown quartz instead of wood, clear to the core.', price: 2500, source: 'shop' },
  { id: 'board-magic', kind: 'board', name: 'Magische Scheibe', blurb: 'Die Maserung verändert sich, wenn niemand hinsieht.', nameEn: 'Magic Board', blurbEn: 'The grain shifts when no one’s looking.', price: 3300, source: 'shop' },
  { id: 'board-ash', kind: 'board', name: 'Aschescheibe', blurb: 'Erkaltete Asche, innen noch spürbar warm.', nameEn: 'Ash Board', blurbEn: 'Cooled ash, still noticeably warm inside.', price: 1400, source: 'shop' },
  { id: 'board-cursed', kind: 'board', name: 'Verfluchte Scheibe', blurb: 'Die Risse heilen von selbst nach – jedes Mal ein bisschen anders.', nameEn: 'Cursed Board', blurbEn: 'The cracks heal themselves – a little differently each time.', price: 2900, source: 'shop' },
  { id: 'board-golden', kind: 'board', name: 'Goldscheibe', blurb: 'Schwer, glänzend, unverschämt teuer aussehend.', nameEn: 'Gold Board', blurbEn: 'Heavy, shiny, outrageously expensive-looking.', price: 4000, source: 'shop' },
  { id: 'board-tech', kind: 'board', name: 'Technikscheibe', blurb: 'Leise Lüftergeräusche bei jedem Treffer.', nameEn: 'Tech Board', blurbEn: 'Faint fan noise with every hit.', price: 2100, source: 'shop' },
  { id: 'board-fantasyboss', kind: 'board', name: 'Fantasy-Scheibe', blurb: 'Sieht aus, als käme sie direkt aus einem Bosskampf.', nameEn: 'Fantasy Board', blurbEn: 'Looks like it came straight out of a boss fight.', price: 3600, source: 'shop' },
];

// ---------------------------------------------------------------------------
// Boss-Früchte: jedes 5. Level ist ein Boss mit einer Frucht als Zielscheibe.
// Die passende Axt gab es früher geschenkt fürs Schaffen – Klaus: "mach die
// Äxte die man ab einem gewissen Level bekommt weg, einfach für Diamanten
// stattdessen" (siehe BOSS_AXE_SKINS unten, jetzt `source: 'gem'` statt der
// früheren freien Belohnung, siehe computeReward() in useAxeGame.ts).
// ---------------------------------------------------------------------------

export interface BossFruit {
  id: string;
  name: string;
  /** Englischer Name, siehe game/i18n.ts. */
  nameEn: string;
  /** Scheiben-Design des Boss-Levels (überschreibt das ausgerüstete). */
  boardSkinId: string;
  /** Axt, die es als Belohnung gibt. */
  axeSkinId: string;
}

export const BOSS_FRUITS: BossFruit[] = [
  { id: 'melon', name: 'Wassermelone', nameEn: 'Watermelon', boardSkinId: 'board-melon', axeSkinId: 'axe-melon' },
  { id: 'orange', name: 'Orange', nameEn: 'Orange', boardSkinId: 'board-orange', axeSkinId: 'axe-orange' },
  { id: 'kiwi', name: 'Kiwi', nameEn: 'Kiwi', boardSkinId: 'board-kiwi', axeSkinId: 'axe-kiwi' },
  { id: 'dragon', name: 'Drachenfrucht', nameEn: 'Dragon Fruit', boardSkinId: 'board-dragon', axeSkinId: 'axe-dragon' },
  { id: 'pineapple', name: 'Ananas', nameEn: 'Pineapple', boardSkinId: 'board-pineapple', axeSkinId: 'axe-pineapple' },
  { id: 'lemon', name: 'Zitrone', nameEn: 'Lemon', boardSkinId: 'board-lemon', axeSkinId: 'axe-lemon' },
  { id: 'berry', name: 'Blaubeere', nameEn: 'Blueberry', boardSkinId: 'board-berry', axeSkinId: 'axe-berry' },
  { id: 'pomegranate', name: 'Granatapfel', nameEn: 'Pomegranate', boardSkinId: 'board-pomegranate', axeSkinId: 'axe-pomegranate' },
  { id: 'coconut', name: 'Kokosnuss', nameEn: 'Coconut', boardSkinId: 'board-coconut', axeSkinId: 'axe-coconut' },
  { id: 'grape', name: 'Traube', nameEn: 'Grape', boardSkinId: 'board-grape', axeSkinId: 'axe-grape' },
];

/**
 * Die Frucht-Äxte als Skins – standen früher unter "Boss-Beute" (kostenlos fürs
 * Levelschaffen), jetzt für Diamanten kaufbar im Legendär-Reiter (siehe Shop.tsx).
 * Preise steigen leicht mit der Boss-Reihenfolge (Level 5 -> Level 50).
 */
const BOSS_AXE_PRICES = [15, 18, 21, 24, 27, 30, 34, 38, 42, 46];
export const BOSS_AXE_SKINS: SkinDef[] = BOSS_FRUITS.map((fruit, i) => ({
  id: fruit.axeSkinId,
  kind: 'axe',
  name: `${fruit.name}-Axt`,
  blurb: `Erinnert an den ${fruit.name}-Boss.`,
  nameEn: `${fruit.nameEn} Axe`,
  blurbEn: `Themed after the ${fruit.nameEn} boss.`,
  price: BOSS_AXE_PRICES[i] ?? 20,
  source: 'gem',
}));

// ---------------------------------------------------------------------------
// Heldenstadt-Bosse: die 6. Welt (Level 101-120) hat eigene Bosse statt der
// Boss-Früchte-Rotation. Bewusst EIGENE, unbenannte Gegner-Konzepte statt
// Marvel-Figuren (Green Goblin, Doc Ock, Electro, Venom ...) – die sind
// urheberrechtlich geschützt, ein Nachbau (auch mit anderem Namen) wäre eine
// Verletzung. Die Bosse drehen sich stattdessen um Großstadt-Gefahren, passend
// zum "Netzschwinger"-Skin-Thema, ohne eine bestimmte Figur zu kopieren.
// Nutzt bewusst dieselbe BossFruit-Struktur wie die Boss-Früchte (identisches
// Schema: id/name/boardSkinId/axeSkinId) statt eines eigenen Typs – erspart
// doppelten Code in `bossFruitForLevel()` und der Shop-Anzeige.
// ---------------------------------------------------------------------------

export const HERO_BOSSES: BossFruit[] = [
  { id: 'drone', name: 'Drohnenwächter', nameEn: 'Drone Warden', boardSkinId: 'board-drone', axeSkinId: 'axe-drone' },
  { id: 'neon', name: 'Neonmaske', nameEn: 'Neon Mask', boardSkinId: 'board-neon', axeSkinId: 'axe-neon' },
  { id: 'gargoyle', name: 'Wasserspeier', nameEn: 'Gargoyle', boardSkinId: 'board-gargoyle', axeSkinId: 'axe-gargoyle' },
  { id: 'antenna', name: 'Antennentitan', nameEn: 'Antenna Titan', boardSkinId: 'board-antenna', axeSkinId: 'axe-antenna' },
];

/**
 * Die Helden-Bossäxte als Skins – wie BOSS_AXE_SKINS, nur für die
 * Heldenstadt-Bosse (Level 105-120), entsprechend teurer.
 */
const HERO_AXE_PRICES = [55, 60, 65, 70];
export const HERO_AXE_SKINS: SkinDef[] = HERO_BOSSES.map((boss, i) => ({
  id: boss.axeSkinId,
  kind: 'axe',
  name: `${boss.name}-Axt`,
  blurb: `Erinnert an den Kampf gegen den ${boss.name}.`,
  nameEn: `${boss.nameEn} Axe`,
  blurbEn: `Themed after the fight against the ${boss.nameEn}.`,
  price: HERO_AXE_PRICES[i] ?? 60,
  source: 'gem',
}));

// ---------------------------------------------------------------------------
// Legendär: für Diamanten statt Münzen, deutlich aufwendigere Designs.
// ---------------------------------------------------------------------------

export const LEGENDARY_AXE_SKINS: SkinDef[] = [
  {
    id: 'axe-legendary-meteor',
    kind: 'axe',
    name: 'Sternenhagel',
    blurb: 'Aus einem Meteoriten geschmiedet, glüht noch immer nach.',
    nameEn: 'Meteor Shower',
    blurbEn: 'Forged from a meteorite, still glowing faintly.',
    price: 52,
    source: 'gem',
  },
  {
    id: 'axe-legendary-phoenix',
    kind: 'axe',
    name: 'Phönixfeder',
    blurb: 'Verbrennt nie ganz – die Glut erlischt nur, um neu zu entfachen.',
    nameEn: 'Phoenix Feather',
    blurbEn: 'Never fully burns out – the embers only fade to reignite.',
    price: 70,
    source: 'gem',
  },
];

export const LEGENDARY_BOARD_SKINS: SkinDef[] = [
  {
    id: 'board-legendary-galaxy',
    kind: 'board',
    name: 'Galaxie',
    blurb: 'Ein Ausschnitt Sternennebel, eingefangen in Holz.',
    nameEn: 'Galaxy',
    blurbEn: 'A slice of nebula, captured in wood.',
    price: 58,
    source: 'gem',
  },
  {
    id: 'board-legendary-crystal',
    kind: 'board',
    name: 'Kristallkern',
    blurb: 'Gewachsener Kristall statt Holz – hart, klar, kalt.',
    nameEn: 'Crystal Core',
    blurbEn: 'Grown crystal instead of wood – hard, clear, cold.',
    price: 80,
    source: 'gem',
  },
];

// Boss-Beute-Äxte (siehe oben) sind jetzt ebenfalls Diamanten-Käufe – landen deshalb
// im selben "Legendär"-Reiter wie die klassischen Legendär-Skins, statt einer
// eigenen Kategorie. Reihenfolge: erst die "echten" Legendär-Designs, dann die
// (günstigeren) Boss-Beute-Äxte.
export const LEGENDARY_SKINS: SkinDef[] = [
  ...LEGENDARY_AXE_SKINS,
  ...LEGENDARY_BOARD_SKINS,
  ...BOSS_AXE_SKINS,
  ...HERO_AXE_SKINS,
];

// ---------------------------------------------------------------------------
// Oster-Ei: kein Hinweis im Tutorial, nur über ein verstecktes Geheimnis zu
// finden (siehe StartScreen.tsx). Rein zum Spaß, kein Balancing-Effekt.
// ---------------------------------------------------------------------------

export const EASTER_EGG_SKINS: SkinDef[] = [
  {
    id: 'axe-egg-duck',
    kind: 'axe',
    name: 'Quietsche-Ente',
    blurb: 'Wie sie hier hineingeraten ist, weiß niemand.',
    nameEn: 'Rubber Duck',
    blurbEn: 'Nobody knows how it ended up here.',
    price: 0,
    source: 'egg',
  },
];

// BOSS_AXE_SKINS/HERO_AXE_SKINS stecken schon in LEGENDARY_SKINS (siehe oben) –
// hier nicht nochmal einzeln aufführen, sonst wären sie doppelt drin.
export const ALL_SKINS: SkinDef[] = [...AXE_SKINS, ...BOARD_SKINS, ...LEGENDARY_SKINS, ...EASTER_EGG_SKINS];

export const DEFAULT_AXE_SKIN = AXE_SKINS[0].id;
export const DEFAULT_BOARD_SKIN = BOARD_SKINS[0].id;

export function getSkin(id: string): SkinDef | undefined {
  return ALL_SKINS.find((skin) => skin.id === id);
}

/** Skins mit Preis 0 aus dem Shop gehören dem Spieler immer (Boss-Beute NICHT). */
export function isFreeSkin(id: string): boolean {
  const skin = getSkin(id);
  return skin?.source === 'shop' && skin.price === 0;
}

export function getBossFruit(id: string): BossFruit | undefined {
  return BOSS_FRUITS.find((fruit) => fruit.id === id) ?? HERO_BOSSES.find((boss) => boss.id === id);
}

/** Boss-Frucht-/Helden-Boss-Name in der aktuellen UI-Sprache (siehe game/i18n.ts). */
export function localizedBossFruitName(fruit: BossFruit, lang: Language): string {
  return lang === 'en' ? fruit.nameEn : fruit.name;
}

// ---------------------------------------------------------------------------
// Farbwerte
// ---------------------------------------------------------------------------

export const BOARD_STYLES: Record<string, BoardStyle> = {
  'board-oak': {
    rim: 'linear-gradient(150deg, #c98a45, #8a5420 55%, #5c3512)',
    faceInner: '#ffd9a0',
    faceOuter: '#f0a94e',
    wedge: 'rgba(255, 255, 255, 0.55)',
    glow: 'rgba(255, 159, 28, 0.4)',
    ringLight: 'rgba(255, 255, 255, 0.5)',
    ringAccent: 'rgba(196, 106, 20, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #fff1d4, #f5c98a 70%, #d99a4e 100%)',
    coreEdge: 'rgba(140, 80, 20, 0.5)',
    coreGlow: 'rgba(255, 190, 90, 0.55)',
  },
  'board-walnut': {
    rim: 'linear-gradient(150deg, #a8843c, #6b4c10 55%, #40300a)',
    faceInner: '#c99a5e',
    faceOuter: '#8a5a34',
    wedge: 'rgba(255, 232, 190, 0.35)',
    glow: 'rgba(201, 153, 47, 0.35)',
    ringLight: 'rgba(255, 235, 190, 0.35)',
    ringAccent: 'rgba(60, 38, 10, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #ffe9b0, #c9992f 70%, #6b4c10 100%)',
    coreEdge: 'rgba(40, 26, 6, 0.6)',
    coreGlow: 'rgba(201, 153, 47, 0.5)',
  },
  'board-ice': {
    rim: 'linear-gradient(150deg, #eaf7ff, #7fb4d0 55%, #3d6f8c)',
    faceInner: '#f2fbff',
    faceOuter: '#a8d8ef',
    wedge: 'rgba(255, 255, 255, 0.85)',
    glow: 'rgba(140, 220, 255, 0.5)',
    ringLight: 'rgba(255, 255, 255, 0.7)',
    ringAccent: 'rgba(58, 166, 216, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #8ed6f2 70%, #2b7fa5 100%)',
    coreEdge: 'rgba(23, 90, 120, 0.6)',
    coreGlow: 'rgba(94, 196, 234, 0.7)',
  },
  'board-volcano': {
    rim: 'linear-gradient(150deg, #5c5c5c, #2e2e2e 55%, #141414)',
    faceInner: '#6b4a3a',
    faceOuter: '#33241e',
    wedge: 'rgba(255, 110, 40, 0.65)',
    glow: 'rgba(255, 110, 40, 0.5)',
    ringLight: 'rgba(255, 150, 80, 0.4)',
    ringAccent: 'rgba(255, 110, 40, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffe08a, #ff6e28 60%, #8a1c00 100%)',
    coreEdge: 'rgba(92, 20, 0, 0.7)',
    coreGlow: 'rgba(255, 110, 40, 0.85)',
  },
  'board-ebony': {
    rim: 'linear-gradient(150deg, #4a4a52, #23232a 55%, #0e0e12)',
    faceInner: '#3a3a44',
    faceOuter: '#1c1c22',
    wedge: 'rgba(200, 210, 230, 0.5)',
    glow: 'rgba(150, 170, 210, 0.3)',
    ringLight: 'rgba(210, 220, 240, 0.35)',
    ringAccent: 'rgba(150, 165, 195, 0.4)',
    core: 'radial-gradient(circle at 38% 32%, #e8ecf5, #9aa5bd 65%, #4a5266 100%)',
    coreEdge: 'rgba(20, 22, 30, 0.8)',
    coreGlow: 'rgba(170, 190, 225, 0.5)',
  },

  // --- Boss-Früchte ---
  'board-melon': {
    rim: 'linear-gradient(150deg, #7cc24a, #3f7a24 55%, #24501a)',
    faceInner: '#ff7a80',
    faceOuter: '#e0323f',
    wedge: 'rgba(255, 220, 220, 0.5)',
    glow: 'rgba(226, 60, 70, 0.5)',
    ringLight: 'rgba(255, 235, 235, 0.4)',
    ringAccent: 'rgba(120, 20, 26, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffd0d2, #ff6b72 65%, #b81f2a 100%)',
    coreEdge: 'rgba(90, 14, 18, 0.7)',
    coreGlow: 'rgba(255, 100, 110, 0.7)',
  },
  'board-orange': {
    rim: 'linear-gradient(150deg, #ffb648, #e07a10 55%, #9c4e00)',
    faceInner: '#ffd89a',
    faceOuter: '#ff9a2e',
    wedge: 'rgba(255, 248, 230, 0.85)',
    glow: 'rgba(255, 154, 46, 0.55)',
    ringLight: 'rgba(255, 250, 235, 0.6)',
    ringAccent: 'rgba(200, 100, 0, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #fff2d0, #ffb44a 65%, #d97c00 100%)',
    coreEdge: 'rgba(140, 70, 0, 0.6)',
    coreGlow: 'rgba(255, 180, 74, 0.7)',
  },
  'board-kiwi': {
    rim: 'linear-gradient(150deg, #a8794a, #6b4526 55%, #3f2814)',
    faceInner: '#f2f6d8',
    faceOuter: '#8dc63f',
    wedge: 'rgba(255, 255, 240, 0.75)',
    glow: 'rgba(141, 198, 63, 0.45)',
    ringLight: 'rgba(250, 255, 230, 0.55)',
    ringAccent: 'rgba(80, 120, 30, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #eef4d0 65%, #b8c98a 100%)',
    coreEdge: 'rgba(70, 100, 30, 0.6)',
    coreGlow: 'rgba(200, 230, 140, 0.6)',
  },
  'board-dragon': {
    rim: 'linear-gradient(150deg, #ff5fa2, #c41e6e 55%, #7a0f42)',
    faceInner: '#ffffff',
    faceOuter: '#f0e2ec',
    wedge: 'rgba(60, 40, 55, 0.55)',
    glow: 'rgba(255, 95, 162, 0.5)',
    ringLight: 'rgba(120, 90, 110, 0.35)',
    ringAccent: 'rgba(196, 30, 110, 0.45)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #ffd8ea 65%, #ff86bb 100%)',
    coreEdge: 'rgba(150, 20, 85, 0.6)',
    coreGlow: 'rgba(255, 130, 185, 0.7)',
  },
  'board-pineapple': {
    rim: 'linear-gradient(150deg, #b8862f, #7a5412 55%, #47300a)',
    faceInner: '#fff3b0',
    faceOuter: '#f2c53d',
    wedge: 'rgba(180, 130, 20, 0.5)',
    glow: 'rgba(242, 197, 61, 0.5)',
    ringLight: 'rgba(255, 245, 200, 0.55)',
    ringAccent: 'rgba(150, 105, 15, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #fffbe0, #ffe071 65%, #d9a800 100%)',
    coreEdge: 'rgba(110, 78, 0, 0.6)',
    coreGlow: 'rgba(255, 224, 113, 0.65)',
  },
  'board-lemon': {
    rim: 'linear-gradient(150deg, #fff07a, #e0c400 55%, #8a7500)',
    faceInner: '#fffce0',
    faceOuter: '#ffe94a',
    wedge: 'rgba(255, 255, 255, 0.9)',
    glow: 'rgba(255, 233, 74, 0.55)',
    ringLight: 'rgba(255, 255, 255, 0.7)',
    ringAccent: 'rgba(190, 165, 0, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #fff59a 65%, #e0c400 100%)',
    coreEdge: 'rgba(130, 112, 0, 0.55)',
    coreGlow: 'rgba(255, 245, 154, 0.7)',
  },
  'board-berry': {
    rim: 'linear-gradient(150deg, #6b7fd4, #3a4a9c 55%, #1e2657)',
    faceInner: '#9aa8e8',
    faceOuter: '#4a5aa8',
    wedge: 'rgba(210, 220, 255, 0.5)',
    glow: 'rgba(106, 127, 212, 0.5)',
    ringLight: 'rgba(220, 228, 255, 0.4)',
    ringAccent: 'rgba(30, 38, 87, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #e2e8ff, #8b9be0 65%, #3f4d9e 100%)',
    coreEdge: 'rgba(20, 26, 62, 0.7)',
    coreGlow: 'rgba(139, 155, 224, 0.7)',
  },
  'board-pomegranate': {
    rim: 'linear-gradient(150deg, #d4a04a, #8a5a1c 55%, #4a2c0a)',
    faceInner: '#ff8a8a',
    faceOuter: '#a8142c',
    wedge: 'rgba(255, 210, 210, 0.45)',
    glow: 'rgba(168, 20, 44, 0.5)',
    ringLight: 'rgba(255, 220, 220, 0.35)',
    ringAccent: 'rgba(90, 8, 22, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #ffc4c4, #e03a52 65%, #8a0f24 100%)',
    coreEdge: 'rgba(70, 6, 16, 0.7)',
    coreGlow: 'rgba(224, 58, 82, 0.7)',
  },
  'board-coconut': {
    rim: 'linear-gradient(150deg, #8a6440, #4f381f 55%, #2a1c0e)',
    faceInner: '#fffaf0',
    faceOuter: '#e8dcc4',
    wedge: 'rgba(150, 120, 85, 0.45)',
    glow: 'rgba(232, 220, 196, 0.35)',
    ringLight: 'rgba(255, 255, 255, 0.5)',
    ringAccent: 'rgba(120, 90, 55, 0.45)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #f0e6d2 65%, #c4b295 100%)',
    coreEdge: 'rgba(90, 66, 38, 0.6)',
    coreGlow: 'rgba(240, 230, 210, 0.5)',
  },
  'board-grape': {
    rim: 'linear-gradient(150deg, #a86bd4, #6b2f9c 55%, #3a1657)',
    faceInner: '#e0c4f5',
    faceOuter: '#9a4fd0',
    wedge: 'rgba(245, 230, 255, 0.55)',
    glow: 'rgba(154, 79, 208, 0.5)',
    ringLight: 'rgba(240, 225, 255, 0.45)',
    ringAccent: 'rgba(58, 22, 87, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #f5e6ff, #c48ae8 65%, #7a35b0 100%)',
    coreEdge: 'rgba(45, 16, 68, 0.7)',
    coreGlow: 'rgba(196, 138, 232, 0.7)',
  },

  // --- Heldenstadt-Bosse (siehe HERO_BOSSES oben) ---
  'board-drone': {
    rim: 'linear-gradient(150deg, #6b7280, #374151 55%, #1a1d24)',
    faceInner: '#c7cdd6',
    faceOuter: '#5b6270',
    wedge: 'rgba(255, 60, 60, 0.5)',
    glow: 'rgba(120, 130, 150, 0.4)',
    ringLight: 'rgba(220, 225, 235, 0.5)',
    ringAccent: 'rgba(224, 36, 47, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffe0e0, #e0242f 60%, #6b0f16 100%)',
    coreEdge: 'rgba(30, 32, 38, 0.7)',
    coreGlow: 'rgba(224, 36, 47, 0.7)',
  },
  'board-neon': {
    rim: 'linear-gradient(150deg, #b453e0, #6b1f9c 55%, #2e0a4a)',
    faceInner: '#f0c8ff',
    faceOuter: '#9a3fd0',
    wedge: 'rgba(80, 240, 255, 0.6)',
    glow: 'rgba(180, 83, 224, 0.5)',
    ringLight: 'rgba(160, 245, 255, 0.55)',
    ringAccent: 'rgba(80, 240, 255, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #80f0ff 55%, #b453e0 100%)',
    coreEdge: 'rgba(40, 10, 74, 0.7)',
    coreGlow: 'rgba(80, 240, 255, 0.8)',
  },
  'board-gargoyle': {
    rim: 'linear-gradient(150deg, #5c6b5c, #33402e 55%, #181f14)',
    faceInner: '#9cae94',
    faceOuter: '#4a5c42',
    wedge: 'rgba(180, 200, 160, 0.4)',
    glow: 'rgba(120, 150, 100, 0.35)',
    ringLight: 'rgba(200, 215, 185, 0.4)',
    ringAccent: 'rgba(60, 80, 45, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #e0ead0, #8ca87a 60%, #3a4a2e 100%)',
    coreEdge: 'rgba(20, 26, 15, 0.7)',
    coreGlow: 'rgba(140, 168, 122, 0.6)',
  },
  'board-antenna': {
    rim: 'linear-gradient(150deg, #ff9a2e, #b3560a 55%, #5c2a04)',
    faceInner: '#3a3a3e',
    faceOuter: '#18181a',
    wedge: 'rgba(255, 170, 60, 0.5)',
    glow: 'rgba(255, 154, 46, 0.5)',
    ringLight: 'rgba(255, 200, 130, 0.45)',
    ringAccent: 'rgba(255, 154, 46, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #fff0d0, #ffb44a 60%, #7a3800 100%)',
    coreEdge: 'rgba(30, 16, 4, 0.75)',
    coreGlow: 'rgba(255, 154, 46, 0.8)',
  },

  // --- Weltbosse (siehe WORLD_BOSSES in worlds.ts) – eigenes Scheiben-Design pro
  // Weltboss-Kampf, analog zu den Boss-Früchten oben. Kein eigener Shop-Eintrag (wie
  // die Boss-Beute-Scheiben), wird nur automatisch während des jeweiligen Weltboss-
  // Levels angezeigt. ---
  'board-boss-desert': {
    rim: 'linear-gradient(150deg, #e0b25a, #a5701e 55%, #5c3a0a)',
    faceInner: '#ffe0a0',
    faceOuter: '#d4913a',
    wedge: 'rgba(255, 240, 200, 0.5)',
    glow: 'rgba(212, 145, 58, 0.5)',
    ringLight: 'rgba(255, 240, 200, 0.5)',
    ringAccent: 'rgba(140, 85, 20, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #fff4d8, #e8a84a 65%, #a5701e 100%)',
    coreEdge: 'rgba(80, 48, 10, 0.65)',
    coreGlow: 'rgba(232, 168, 74, 0.75)',
  },
  'board-boss-ice': {
    rim: 'linear-gradient(150deg, #cdeaff, #4a7fa0 55%, #1c3a4a)',
    faceInner: '#eafbff',
    faceOuter: '#7ec4e0',
    wedge: 'rgba(255, 255, 255, 0.85)',
    glow: 'rgba(120, 200, 240, 0.55)',
    ringLight: 'rgba(255, 255, 255, 0.7)',
    ringAccent: 'rgba(30, 90, 120, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #7fd0ee 65%, #1c5a78 100%)',
    coreEdge: 'rgba(10, 40, 55, 0.7)',
    coreGlow: 'rgba(130, 215, 245, 0.8)',
  },
  'board-boss-volcano': {
    rim: 'linear-gradient(150deg, #4a3028, #2a1810 55%, #120906)',
    faceInner: '#5c2818',
    faceOuter: '#240e08',
    wedge: 'rgba(255, 90, 30, 0.6)',
    glow: 'rgba(255, 90, 30, 0.55)',
    ringLight: 'rgba(255, 140, 70, 0.4)',
    ringAccent: 'rgba(255, 90, 30, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #ffcf7a, #ff5a1e 55%, #6b0f00 100%)',
    coreEdge: 'rgba(60, 10, 0, 0.75)',
    coreGlow: 'rgba(255, 90, 30, 0.9)',
  },
  'board-boss-cosmos': {
    rim: 'linear-gradient(150deg, #5c3fb0, #2a1860 55%, #0e0730)',
    faceInner: '#c8b0ff',
    faceOuter: '#5c3ec4',
    wedge: 'rgba(230, 215, 255, 0.5)',
    glow: 'rgba(140, 100, 230, 0.55)',
    ringLight: 'rgba(225, 210, 255, 0.5)',
    ringAccent: 'rgba(255, 210, 255, 0.4)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #a878ff 60%, #3a1c8a 100%)',
    coreEdge: 'rgba(20, 10, 50, 0.75)',
    coreGlow: 'rgba(170, 130, 255, 0.85)',
  },
  'board-boss-metro': {
    rim: 'linear-gradient(150deg, #5a6270, #2c313a 55%, #101216)',
    faceInner: '#8a92a0',
    faceOuter: '#33383f',
    wedge: 'rgba(224, 36, 47, 0.55)',
    glow: 'rgba(224, 36, 47, 0.45)',
    ringLight: 'rgba(200, 210, 225, 0.45)',
    ringAccent: 'rgba(224, 36, 47, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #ffd8da, #e0242f 60%, #4a0a10 100%)',
    coreEdge: 'rgba(15, 16, 20, 0.8)',
    coreGlow: 'rgba(224, 36, 47, 0.85)',
  },

  // --- Netzschwinger: rot-blauer Held-Look, absichtlich unbenannt/unbranded
  // (siehe CLAUDE.md) ---
  'board-webslinger': {
    rim: 'linear-gradient(150deg, #3a5fd9, #1a2a6b 55%, #0a1030)',
    faceInner: '#ff6b73',
    faceOuter: '#c4242f',
    wedge: 'rgba(255, 255, 255, 0.6)',
    glow: 'rgba(224, 36, 47, 0.5)',
    ringLight: 'rgba(255, 255, 255, 0.55)',
    ringAccent: 'rgba(26, 42, 107, 0.6)',
    core: 'radial-gradient(circle at 38% 32%, #fff0f0, #ff5b63 60%, #8a0f16 100%)',
    coreEdge: 'rgba(20, 30, 80, 0.7)',
    coreGlow: 'rgba(255, 91, 99, 0.75)',
  },

  // --- Zweites Zehner-Set (siehe BOARD_SKINS oben) ---
  'board-oldwood': {
    rim: 'linear-gradient(150deg, #d9b988, #a5793e 55%, #6b4a20)',
    faceInner: '#fff0d0',
    faceOuter: '#e8c48a',
    wedge: 'rgba(255, 255, 255, 0.5)',
    glow: 'rgba(232, 196, 138, 0.4)',
    ringLight: 'rgba(255, 255, 255, 0.5)',
    ringAccent: 'rgba(165, 121, 62, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #fff8e8, #f0d8a8 70%, #c9992f 100%)',
    coreEdge: 'rgba(110, 78, 30, 0.5)',
    coreGlow: 'rgba(240, 216, 168, 0.55)',
  },
  'board-dark': {
    rim: 'linear-gradient(150deg, #3a3a40, #1a1a1e 55%, #060607)',
    faceInner: '#2a2a30',
    faceOuter: '#0e0e10',
    wedge: 'rgba(140, 145, 160, 0.35)',
    glow: 'rgba(80, 85, 100, 0.3)',
    ringLight: 'rgba(160, 165, 180, 0.3)',
    ringAccent: 'rgba(20, 20, 24, 0.6)',
    core: 'radial-gradient(circle at 38% 32%, #9aa0b0, #4a4e58 65%, #16171a 100%)',
    coreEdge: 'rgba(5, 5, 6, 0.8)',
    coreGlow: 'rgba(120, 128, 145, 0.5)',
  },
  'board-frost': {
    rim: 'linear-gradient(150deg, #d8f2ff, #6fa8c4 55%, #2e5a70)',
    faceInner: '#eafbff',
    faceOuter: '#9adcef',
    wedge: 'rgba(255, 255, 255, 0.8)',
    glow: 'rgba(130, 210, 245, 0.5)',
    ringLight: 'rgba(255, 255, 255, 0.65)',
    ringAccent: 'rgba(52, 140, 180, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #7fcbe8 70%, #235f7a 100%)',
    coreEdge: 'rgba(20, 75, 100, 0.6)',
    coreGlow: 'rgba(130, 210, 245, 0.7)',
  },
  'board-crystalboard': {
    rim: 'linear-gradient(150deg, #e0d0ff, #a880e0 55%, #5c3894)',
    faceInner: '#f5ecff',
    faceOuter: '#c9a8f0',
    wedge: 'rgba(255, 255, 255, 0.75)',
    glow: 'rgba(160, 120, 230, 0.5)',
    ringLight: 'rgba(255, 255, 255, 0.6)',
    ringAccent: 'rgba(92, 56, 148, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #d0b0ff 65%, #7a4ec0 100%)',
    coreEdge: 'rgba(50, 26, 84, 0.65)',
    coreGlow: 'rgba(190, 150, 255, 0.75)',
  },
  'board-magic': {
    rim: 'linear-gradient(150deg, #ff9ae0, #a04fd0 55%, #4a1a7a)',
    faceInner: '#f8e0ff',
    faceOuter: '#d074e8',
    wedge: 'rgba(255, 240, 255, 0.6)',
    glow: 'rgba(200, 90, 230, 0.55)',
    ringLight: 'rgba(255, 220, 255, 0.5)',
    ringAccent: 'rgba(120, 40, 160, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #e8a0ff 65%, #9030c0 100%)',
    coreEdge: 'rgba(60, 16, 90, 0.65)',
    coreGlow: 'rgba(220, 130, 255, 0.8)',
  },
  'board-ash': {
    rim: 'linear-gradient(150deg, #7a6f68, #453d38 55%, #201b18)',
    faceInner: '#5c5148',
    faceOuter: '#2a2420',
    wedge: 'rgba(255, 140, 90, 0.3)',
    glow: 'rgba(255, 110, 60, 0.3)',
    ringLight: 'rgba(200, 190, 180, 0.3)',
    ringAccent: 'rgba(255, 110, 60, 0.35)',
    core: 'radial-gradient(circle at 38% 32%, #d8c8b8, #8a6e58 65%, #3a2a1e 100%)',
    coreEdge: 'rgba(40, 20, 10, 0.7)',
    coreGlow: 'rgba(255, 130, 70, 0.55)',
  },
  'board-cursed': {
    rim: 'linear-gradient(150deg, #5c8a5a, #2a4a2e 55%, #0e1e10)',
    faceInner: '#4a6b48',
    faceOuter: '#1c2e1c',
    wedge: 'rgba(150, 255, 140, 0.35)',
    glow: 'rgba(90, 200, 90, 0.4)',
    ringLight: 'rgba(160, 230, 150, 0.3)',
    ringAccent: 'rgba(20, 50, 20, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #b8e8b0, #5a9a54 65%, #1e3a1c 100%)',
    coreEdge: 'rgba(10, 26, 10, 0.75)',
    coreGlow: 'rgba(120, 230, 110, 0.65)',
  },
  'board-golden': {
    rim: 'linear-gradient(150deg, #fff2b8, #d9a520 55%, #8a6200)',
    faceInner: '#fff6d0',
    faceOuter: '#f0c848',
    wedge: 'rgba(255, 250, 230, 0.75)',
    glow: 'rgba(240, 200, 72, 0.55)',
    ringLight: 'rgba(255, 250, 230, 0.6)',
    ringAccent: 'rgba(150, 110, 0, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #fffbe0, #f5d060 65%, #b8860a 100%)',
    coreEdge: 'rgba(90, 62, 0, 0.6)',
    coreGlow: 'rgba(245, 208, 96, 0.75)',
  },
  'board-tech': {
    rim: 'linear-gradient(150deg, #7ab8e0, #2a6b94 55%, #123a52)',
    faceInner: '#2a3a44',
    faceOuter: '#14202a',
    wedge: 'rgba(90, 220, 255, 0.5)',
    glow: 'rgba(80, 190, 255, 0.4)',
    ringLight: 'rgba(150, 230, 255, 0.4)',
    ringAccent: 'rgba(80, 190, 255, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #d0f0ff, #5aa8d0 65%, #1a4258 100%)',
    coreEdge: 'rgba(10, 30, 42, 0.7)',
    coreGlow: 'rgba(90, 220, 255, 0.8)',
  },
  'board-fantasyboss': {
    rim: 'linear-gradient(150deg, #ff8a4a, #b83fd0 55%, #3a1a7a)',
    faceInner: '#ffd8a0',
    faceOuter: '#c060e0',
    wedge: 'rgba(255, 240, 220, 0.55)',
    glow: 'rgba(220, 90, 200, 0.5)',
    ringLight: 'rgba(255, 220, 200, 0.45)',
    ringAccent: 'rgba(120, 40, 160, 0.5)',
    core: 'radial-gradient(circle at 38% 32%, #fff0d0, #e8905c 45%, #a03fc0 100%)',
    coreEdge: 'rgba(50, 16, 74, 0.65)',
    coreGlow: 'rgba(220, 130, 220, 0.8)',
  },

  // --- Legendär (Diamanten) ---
  'board-legendary-galaxy': {
    rim: 'linear-gradient(150deg, #6b4fd4, #2e1a6b 55%, #12082e)',
    faceInner: '#c8b8ff',
    faceOuter: '#4a2f9c',
    wedge: 'rgba(230, 220, 255, 0.5)',
    glow: 'rgba(154, 110, 255, 0.55)',
    ringLight: 'rgba(220, 210, 255, 0.5)',
    ringAccent: 'rgba(255, 200, 255, 0.4)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #b48aff 55%, #4a2f9c 100%)',
    coreEdge: 'rgba(30, 16, 74, 0.7)',
    coreGlow: 'rgba(180, 138, 255, 0.8)',
  },
  'board-legendary-crystal': {
    rim: 'linear-gradient(150deg, #eafcff, #7fd8e8 55%, #1c6b7a)',
    faceInner: '#ffffff',
    faceOuter: '#a0eaf5',
    wedge: 'rgba(255, 255, 255, 0.9)',
    glow: 'rgba(140, 240, 255, 0.6)',
    ringLight: 'rgba(255, 255, 255, 0.8)',
    ringAccent: 'rgba(60, 200, 220, 0.55)',
    core: 'radial-gradient(circle at 38% 32%, #ffffff, #baf5ff 60%, #3ec4d8 100%)',
    coreEdge: 'rgba(20, 90, 100, 0.6)',
    coreGlow: 'rgba(140, 240, 255, 0.85)',
  },
};

export const AXE_STYLES: Record<string, AxeStyle> = {
  'axe-standard': {
    steel: ['#ffffff', '#dbe4ec', '#9aa6b2'],
    wood: ['#a5713c', '#6b4420'],
    wrap: '#4a2c14',
    outline: '#141820',
  },
  // --- Zwölfer-Set, nach Gemini-Konzeptbildern gestaltet ---
  'axe-nature': {
    steel: ['#e0f0b8', '#8aae52', '#3f5222'],
    wood: ['#6b4a2e', '#3a2818'],
    wrap: '#2f4a1a',
    outline: '#1a140a',
    glow: 'rgba(140, 220, 90, 0.55)',
  },
  'axe-coral': {
    steel: ['#ffe4d6', '#ff8a6b', '#c9432c'],
    wood: ['#5aa8a0', '#2e6b64'],
    wrap: '#3a8a82',
    outline: '#1a2e2c',
    glow: 'rgba(255, 138, 107, 0.6)',
  },
  'axe-steampunk': {
    steel: ['#ffe9b0', '#c48a3a', '#6b4a12'],
    wood: ['#8a5a2e', '#4a2f14'],
    wrap: '#5c3a18',
    outline: '#2a1a08',
    glow: 'rgba(255, 200, 120, 0.45)',
  },
  'axe-rune': {
    steel: ['#dfe6ee', '#8b96a6', '#3a4250'],
    wood: ['#8a6440', '#4a3320'],
    wrap: '#2a1c10',
    outline: '#12141a',
    glow: 'rgba(140, 200, 255, 0.55)',
  },
  'axe-tide': {
    steel: ['#eafffb', '#4fd9c9', '#12726b'],
    wood: ['#3a5c50', '#1c2e28'],
    wrap: '#2e6b60',
    outline: '#0a1a18',
    glow: 'rgba(79, 217, 201, 0.7)',
  },
  'axe-cosmic': {
    steel: ['#eaf2ff', '#5a7fd9', '#12204a'],
    wood: ['#e8e8ec', '#a8a8b4'],
    wrap: '#3a5fd9',
    outline: '#0a0e1e',
    glow: 'rgba(120, 160, 255, 0.85)',
  },
  'axe-thorn': {
    steel: ['#9dffb0', '#2f8f2a', '#0a1f08'],
    wood: ['#3a2f1a', '#1a140a'],
    wrap: '#2f6b1a',
    outline: '#0a0f06',
    glow: 'rgba(80, 255, 90, 0.8)',
  },
  'axe-magma': {
    steel: ['#ff8a3d', '#2a1410', '#0a0503'],
    wood: ['#2a2420', '#100d0a'],
    wrap: '#1a1512',
    outline: '#080503',
    glow: 'rgba(255, 110, 40, 0.9)',
  },
  'axe-plague': {
    steel: ['#d0d8b0', '#6b7a4a', '#2e3a1e'],
    wood: ['#8a7a5c', '#4a4030'],
    wrap: '#c4b89a',
    outline: '#141810',
    glow: 'rgba(150, 90, 200, 0.6)',
  },
  'axe-royal': {
    steel: ['#fff8d0', '#e8b830', '#a67a0a'],
    wood: ['#3a281a', '#1e130c'],
    wrap: '#2a1c10',
    outline: '#140d06',
    glow: 'rgba(90, 150, 255, 0.5)',
  },
  'axe-cyber': {
    steel: ['#eafcff', '#4fc8ff', '#1a4a8a'],
    wood: ['#3a4550', '#1c2228'],
    wrap: '#2fa8e0',
    outline: '#0a1218',
    glow: 'rgba(79, 200, 255, 0.9)',
  },
  'axe-holy': {
    steel: ['#ffffff', '#fff0b0', '#e0b03a'],
    wood: ['#e8e4d8', '#b8b0a0'],
    wrap: '#fff0c0',
    outline: '#8a7020',
    glow: 'rgba(255, 230, 150, 0.95)',
  },

  // --- Zweites Zehner-Set (siehe AXE_SKINS oben) ---
  'axe-oldwood': {
    steel: ['#f0ede0', '#c7c0a8', '#8a8368'],
    wood: ['#a5713c', '#6b4420'],
    wrap: '#4a2c14',
    outline: '#141820',
  },
  'axe-black': {
    steel: ['#8a8f98', '#3a3d44', '#0e0f12'],
    wood: ['#2a2a2e', '#121214'],
    wrap: '#0a0a0c',
    outline: '#000000',
    glow: 'rgba(120, 130, 150, 0.35)',
  },
  'axe-gold': {
    steel: ['#fff6d0', '#e8c04a', '#a67912'],
    wood: ['#5c3a14', '#2e1c08'],
    wrap: '#8a6418',
    outline: '#3a2408',
    glow: 'rgba(255, 210, 90, 0.85)',
  },
  'axe-fire': {
    steel: ['#fff2c0', '#ff7a3d', '#a11e0a'],
    wood: ['#3a2018', '#1a0e0a'],
    wrap: '#5c1c0a',
    outline: '#180a04',
    glow: 'rgba(255, 110, 40, 0.9)',
  },
  'axe-frostaxe': {
    steel: ['#ffffff', '#bfeaff', '#4fa8d8'],
    wood: ['#405a66', '#1e2e36'],
    wrap: '#2e6b82',
    outline: '#0a1a20',
    glow: 'rgba(150, 220, 255, 0.75)',
  },
  'axe-crystalaxe': {
    steel: ['#ffffff', '#d4b8ff', '#8a5fd0'],
    wood: ['#e8e0f5', '#a89ac0'],
    wrap: '#6b4fa0',
    outline: '#2a1a4a',
    glow: 'rgba(180, 140, 255, 0.85)',
  },
  'axe-viking': {
    steel: ['#e8e4dc', '#9a9488', '#4a463e'],
    wood: ['#6b4a2e', '#3a2818'],
    wrap: '#8a6a3a',
    outline: '#1a140a',
  },
  'axe-demon': {
    steel: ['#ff8a8a', '#8a1414', '#1a0202'],
    wood: ['#1a0a0a', '#0a0303'],
    wrap: '#3a0808',
    outline: '#000000',
    glow: 'rgba(255, 30, 30, 0.85)',
  },
  'axe-lightning': {
    steel: ['#ffffff', '#fff87a', '#4fc8ff'],
    wood: ['#3a3a44', '#1a1a20'],
    wrap: '#2a2ae0',
    outline: '#0a0a1a',
    glow: 'rgba(255, 248, 130, 0.9)',
  },
  'axe-neonaxe': {
    steel: ['#ffffff', '#ff5fd8', '#50f0ff'],
    wood: ['#1a0a2e', '#0a041a'],
    wrap: '#ff5fd8',
    outline: '#08040e',
    glow: 'rgba(255, 95, 216, 0.9)',
  },

  // --- Boss-Beute: passend zur jeweiligen Frucht ---
  'axe-melon': {
    steel: ['#ffd0d2', '#f0454f', '#9c1420'],
    wood: ['#5fa832', '#2e5c18'],
    wrap: '#1c3a0f',
    outline: '#14240a',
    glow: 'rgba(240, 69, 79, 0.75)',
  },
  'axe-orange': {
    steel: ['#fff0cc', '#ffa53d', '#c46000'],
    wood: ['#8a5a20', '#4a3010'],
    wrap: '#2e1c08',
    outline: '#1e1206',
    glow: 'rgba(255, 165, 61, 0.8)',
  },
  'axe-kiwi': {
    steel: ['#f6ffe0', '#a8d94a', '#5a8a1c'],
    wood: ['#8a6440', '#4a3320'],
    wrap: '#2a1c10',
    outline: '#1a2408',
    glow: 'rgba(168, 217, 74, 0.75)',
  },
  'axe-dragon': {
    steel: ['#ffffff', '#ff86bb', '#c41e6e'],
    wood: ['#3f8a4a', '#204a26'],
    wrap: '#122c16',
    outline: '#2a0a1c',
    glow: 'rgba(255, 134, 187, 0.85)',
  },
  'axe-pineapple': {
    steel: ['#fffbe0', '#ffd94a', '#c49400'],
    wood: ['#6b8a2f', '#3a4a18'],
    wrap: '#22300e',
    outline: '#2a2008',
    glow: 'rgba(255, 217, 74, 0.8)',
  },
  'axe-lemon': {
    steel: ['#ffffff', '#ffe94a', '#c4b000'],
    wood: ['#a8944a', '#5c5020'],
    wrap: '#3a3210',
    outline: '#2e2a06',
    glow: 'rgba(255, 233, 74, 0.85)',
  },
  'axe-berry': {
    steel: ['#e2e8ff', '#7f92e0', '#33409c'],
    wood: ['#3a4470', '#1c2140'],
    wrap: '#101430',
    outline: '#0c1030',
    glow: 'rgba(127, 146, 224, 0.8)',
  },
  'axe-pomegranate': {
    steel: ['#ffc4c4', '#e03a52', '#8a0f24'],
    wood: ['#a8823a', '#5c4418'],
    wrap: '#382a0e',
    outline: '#28060f',
    glow: 'rgba(224, 58, 82, 0.8)',
  },
  'axe-coconut': {
    steel: ['#ffffff', '#f0e6d2', '#b8a68a'],
    wood: ['#6b4d30', '#3a2818'],
    wrap: '#221708',
    outline: '#241c12',
    glow: 'rgba(240, 230, 210, 0.6)',
  },
  'axe-grape': {
    steel: ['#f5e6ff', '#b47ae0', '#6b2f9c'],
    wood: ['#4a6b2f', '#283a18'],
    wrap: '#182410',
    outline: '#22103a',
    glow: 'rgba(180, 122, 224, 0.8)',
  },

  // --- Heldenstadt-Bosse (siehe HERO_BOSSES oben) ---
  'axe-drone': {
    steel: ['#e8ecf2', '#8a94a6', '#3a414f'],
    wood: ['#4a5568', '#1e232c'],
    wrap: '#0e1116',
    outline: '#0a0c10',
    glow: 'rgba(224, 36, 47, 0.6)',
  },
  'axe-neon': {
    steel: ['#e0fbff', '#50f0ff', '#1a8a9c'],
    wood: ['#6b1f9c', '#33124a'],
    wrap: '#1a0a2e',
    outline: '#12081e',
    glow: 'rgba(80, 240, 255, 0.85)',
  },
  'axe-gargoyle': {
    steel: ['#d8e0d0', '#8ca87a', '#3a4a2e'],
    wood: ['#5c5245', '#2a251e'],
    wrap: '#1a1712',
    outline: '#12100c',
    glow: 'rgba(140, 168, 122, 0.6)',
  },
  'axe-antenna': {
    steel: ['#fff0d0', '#ffb44a', '#7a3800'],
    wood: ['#2a2a2e', '#111114'],
    wrap: '#0a0a0c',
    outline: '#0a0604',
    glow: 'rgba(255, 154, 46, 0.85)',
  },

  // --- Legendär (Diamanten) ---
  'axe-legendary-meteor': {
    steel: ['#fff0d0', '#e07a3d', '#6b2f0f'],
    wood: ['#2a2a34', '#121218'],
    wrap: '#0a0a10',
    outline: '#180c04',
    glow: 'rgba(255, 138, 61, 0.95)',
  },
  'axe-legendary-phoenix': {
    steel: ['#fffbe0', '#ff8a3d', '#c41e1e'],
    wood: ['#5c2c14', '#2a1006'],
    wrap: '#1a0a04',
    outline: '#240a02',
    glow: 'rgba(255, 138, 61, 1)',
  },

  // --- Oster-Ei ---
  'axe-egg-duck': {
    steel: ['#fffde0', '#ffe135', '#c49a00'],
    wood: ['#ff8a3d', '#c46000'],
    wrap: '#ffffff',
    outline: '#8a5c00',
    glow: 'rgba(255, 225, 53, 0.7)',
  },
};

export function getBoardStyle(id: string): BoardStyle {
  return BOARD_STYLES[id] ?? BOARD_STYLES[DEFAULT_BOARD_SKIN];
}

export function getAxeStyle(id: string): AxeStyle {
  return AXE_STYLES[id] ?? AXE_STYLES[DEFAULT_AXE_SKIN];
}

/** Die Board-Farben als Inline-Style-Objekt (CSS-Variablen) für ein Element. */
export function boardStyleVars(id: string): Record<string, string> {
  const s = getBoardStyle(id);
  return {
    '--board-rim': s.rim,
    '--board-face-inner': s.faceInner,
    '--board-face-outer': s.faceOuter,
    '--board-wedge': s.wedge,
    '--board-glow': s.glow,
    '--board-ring-light': s.ringLight,
    '--board-ring-accent': s.ringAccent,
    '--board-core': s.core,
    '--board-core-edge': s.coreEdge,
    '--board-core-glow': s.coreGlow,
  };
}
