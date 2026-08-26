// Zentrale Übersetzungstabelle für die komplette UI (Klaus: "bei Einstellungen soll
// man das gesamte Spiel auf Englisch schalten können"). Bewusst EIN großes, nach
// Komponente gruppiertes Objekt statt verstreuter Einzel-Strings in jeder Datei –
// damit man auf einen Blick sieht, ob eine Übersetzung fehlt, und damit `de`/`en`
// garantiert dieselbe Struktur haben (TypeScript prüft das über `Strings`).
//
// Skin-/Welt-/Boss-NAMEN (z.B. "Kiefernhieb", "Sandkolossos") leben bewusst NICHT
// hier, sondern direkt bei ihrer Definition in shop.ts/worlds.ts (eigenes `nameEn`/
// `blurbEn`-Feld) – die gehören inhaltlich zu den Daten, nicht zur UI-Chrome.

export type Language = 'de' | 'en';

interface Strings {
  common: {
    coins: string;
    gems: string;
  };
  start: {
    highscoreLabel: string;
    activeWorld: string;
    adButtonAria: string;
    secretFound: string;
    rulesTitle: string;
    ruleTimingPre: string;
    ruleTimingStrong: string;
    ruleTimingRest: string;
    ruleApples: string;
    ruleOwnAxePre: string;
    ruleOwnAxeStrong: string;
    ruleOwnAxeRest: string;
    ruleBoss: (bossEvery: number) => string;
    playFirst: string;
    continueLevel: (n: number) => string;
    continueToWorldMap: string;
    worldMap: string;
    shop: string;
    settings: string;
  };
  worldMap: {
    title: string;
    closeAria: string;
    youAreHere: string;
    endlessMode: string;
    endlessHighscore: (n: number) => string;
    nodeAria: (name: string, sublabel: string, bossName: string | null) => string;
    xpSuffix: (n: number) => string;
    bossLabel: (name: string) => string;
    fightBoss: (name: string) => string;
  };
  shop: {
    title: string;
    tabAxes: string;
    tabBoards: string;
    tabLegendary: string;
    tabExtras: string;
    legendaryNote: string;
    extrasNote: string;
    figurinesLabel: (n: number) => string;
    figurinesBlurb: (gemsPerFigurine: number) => string;
    mysteryName: string;
    mysteryBlurb: string;
    equipped: string;
    equip: string;
    close: string;
  };
  hud: {
    worldBoss: string;
    boss: string;
    level: string;
    progressAria: (current: number, total: number) => string;
    openShopAria: string;
  };
  gameOver: {
    title: string;
    body: (level: number) => string;
    highscore: string;
    highscoreValue: (n: number) => string;
    applesLost: (n: number) => string;
    totalCoins: (n: number) => string;
    watchVideo: string;
    playAgain: string;
    backToMenu: string;
  };
  levelComplete: {
    worldBossKicker: string;
    worldBossTitle: (name: string) => string;
    bossKicker: string;
    bossTitle: (name: string) => string;
    levelTitle: (n: number) => string;
    applesBody: (collected: number, total: number) => string;
    breakdownApples: string;
    breakdownLevelDone: string;
    breakdownPerfect: string;
    breakdownBlock: string;
    breakdownStreak: (streak: number) => string;
    breakdownXp: string;
    breakdownGoldenApple: string;
    breakdownFigurine: string;
    totalCoins: (n: number) => string;
    totalGems: (n: number) => string;
    totalXp: (n: number) => string;
    campaignComplete: string;
    openShop: string;
  };
  pause: {
    title: string;
    resume: string;
    backToMenu: string;
  };
  dailyReward: {
    title: string;
    streak: (n: number) => string;
    today: string;
    day: (n: number) => string;
    claim: string;
  };
  videoRescue: {
    loadingTitle: string;
    loadingBodyRescue: string;
    loadingBodyReward: string;
    cancel: string;
    successTitleRescue: string;
    successTitleReward: string;
    successBodyRescue: string;
    successBodyReward: (coins: number) => string;
    successButtonRescue: string;
    successButtonReward: string;
    errorTitle: string;
    errorBody: string;
    retry: string;
  };
  settings: {
    title: string;
    soundLabel: string;
    highscoreLabel: string;
    languageLabel: string;
    done: string;
  };
  stage: {
    hint: string;
    pauseAria: string;
    bossLabel: string;
    worldBossLabel: string;
    outcomeFail: string;
    outcomeWorldBoss: string;
    outcomeBoss: string;
    outcomeWin: string;
    levelIntro: (n: number) => string;
  };
}

const de: Strings = {
  common: {
    coins: 'Münzen',
    gems: 'Diamanten',
  },
  start: {
    highscoreLabel: '🏆 Highscore',
    activeWorld: 'Aktuelle Welt:',
    adButtonAria: 'Werbevideo für 350 Münzen ansehen',
    secretFound: 'Geheimnis gefunden! Schau in der Werkstatt vorbei.',
    rulesTitle: 'So geht’s',
    ruleTimingPre: 'Tippen wirft eine Axt – immer geradeaus. Es zählt nur, ',
    ruleTimingStrong: 'wann',
    ruleTimingRest: ' du tippst.',
    ruleApples: 'Triff nah an den Äpfeln, das gibt Münzen für neue Äxte und Scheiben.',
    ruleOwnAxePre: 'Triffst du deine ',
    ruleOwnAxeStrong: 'eigene Axt',
    ruleOwnAxeRest: ', ist der Lauf vorbei. Timing zählt.',
    ruleBoss: (bossEvery) => `Jedes ${bossEvery}. Level ist ein Boss – schaffst du ihn, gehört dir seine Axt.`,
    playFirst: 'Los geht’s',
    continueLevel: (n) => `Weiter – Level ${n}`,
    continueToWorldMap: 'Weiter zur Weltkarte',
    worldMap: 'Weltkarte',
    shop: 'Werkstatt',
    settings: 'Einstellungen',
  },
  worldMap: {
    title: 'Weltkarte',
    closeAria: 'Schließen',
    youAreHere: 'Du bist hier',
    endlessMode: 'Endlos-Modus',
    endlessHighscore: (n) => `Highscore Level ${n}`,
    nodeAria: (name, sublabel, bossName) => `${name}, ${sublabel}${bossName ? `, Weltboss ${bossName}` : ''}`,
    xpSuffix: (n) => `${n} XP`,
    bossLabel: (name) => `⚔ ${name}`,
    fightBoss: (name) => `⚔ Gegen ${name} kämpfen`,
  },
  shop: {
    title: 'Werkstatt',
    tabAxes: 'Äxte',
    tabBoards: 'Scheiben',
    tabLegendary: 'Legendär',
    tabExtras: 'Extras',
    legendaryNote: 'Aufwendige Designs für Diamanten – die gibt’s nur durch goldene Äpfel.',
    extrasNote: 'Geheimnisse – nicht käuflich, nur zu finden.',
    figurinesLabel: (n) => `Sammelfiguren: ${n}`,
    figurinesBlurb: (gemsPerFigurine) => `Eingetauscht bringt jede Figur ${gemsPerFigurine} Diamanten.`,
    mysteryName: '???',
    mysteryBlurb: 'Ein gut gehütetes Geheimnis.',
    equipped: 'Ausgerüstet',
    equip: 'Anlegen',
    close: 'Weiter werfen',
  },
  hud: {
    worldBoss: '⚔ Weltboss',
    boss: 'Boss',
    level: 'Level',
    progressAria: (current, total) => `Level ${current} von ${total} im Block`,
    openShopAria: 'Werkstatt öffnen',
  },
  gameOver: {
    title: 'Axt zersplittert!',
    body: (level) => `Du hast deine eigene Axt getroffen – in Level ${level}.`,
    highscore: 'Highscore:',
    highscoreValue: (n) => `Level ${n}`,
    applesLost: (n) => `${n} ${n === 1 ? 'Apfel' : 'Äpfel'} aus diesem Level verloren.`,
    totalCoins: (n) => `Münzen insgesamt: ${n}`,
    watchVideo: '📺 Fortschritt',
    playAgain: 'Nochmal spielen',
    backToMenu: 'Zum Hauptmenü',
  },
  levelComplete: {
    worldBossKicker: 'Weltboss besiegt',
    worldBossTitle: (name) => `${name} bezwungen!`,
    bossKicker: 'Boss besiegt',
    bossTitle: (name) => `${name} geknackt!`,
    levelTitle: (n) => `Level ${n} geschafft!`,
    applesBody: (collected, total) => `${collected} von ${total} ${total === 1 ? 'Apfel' : 'Äpfeln'} eingesammelt.`,
    breakdownApples: 'Äpfel',
    breakdownLevelDone: 'Level geschafft',
    breakdownPerfect: 'Alle Äpfel!',
    breakdownBlock: 'Block geschafft',
    breakdownStreak: (streak) => `Serie ×${streak}`,
    breakdownXp: 'XP',
    breakdownGoldenApple: 'Goldener Apfel',
    breakdownFigurine: 'Sammelfigur',
    totalCoins: (n) => `Münzen insgesamt: ${n}`,
    totalGems: (n) => `Diamanten insgesamt: ${n}`,
    totalXp: (n) => `XP insgesamt: ${n}`,
    campaignComplete: 'Alle 100 Level gemeistert! 🎉',
    openShop: 'Werkstatt öffnen',
  },
  pause: {
    title: 'Pausiert',
    resume: 'Fortsetzen',
    backToMenu: 'Zurück zum Menü',
  },
  dailyReward: {
    title: 'Tägliche Belohnung!',
    streak: (n) => `${n} ${n === 1 ? 'Tag' : 'Tage'} in Folge`,
    today: 'Heute',
    day: (n) => `Tag ${n}`,
    claim: 'Abholen',
  },
  videoRescue: {
    loadingTitle: 'Werbevideo läuft …',
    loadingBodyRescue: 'Danke fürs Anschauen – gleich geht’s weiter.',
    loadingBodyReward: 'Danke fürs Anschauen!',
    cancel: 'Abbrechen',
    successTitleRescue: 'Fortschritt gerettet!',
    successTitleReward: 'Belohnung erhalten!',
    successBodyRescue: 'Du machst genau da weiter, wo du aufgehört hast.',
    successBodyReward: (coins) => `+${coins} Münzen gutgeschrieben!`,
    successButtonRescue: 'Weiter geht’s',
    successButtonReward: 'Super!',
    errorTitle: 'Video nicht verfügbar',
    errorBody: 'Gerade ist kein Video verfügbar – bitte prüfe deine Internetverbindung und versuch es nochmal.',
    retry: 'Erneut versuchen',
  },
  settings: {
    title: 'Einstellungen',
    soundLabel: 'Ton & Vibration',
    highscoreLabel: 'Highscore',
    languageLabel: 'Sprache',
    done: 'Fertig',
  },
  stage: {
    hint: 'Tippen zum Werfen – triff die Lücke',
    pauseAria: 'Pause',
    bossLabel: 'Boss',
    worldBossLabel: '⚠ Weltboss',
    outcomeFail: 'Axt zersplittert!',
    outcomeWorldBoss: 'Weltboss besiegt!',
    outcomeBoss: 'Boss besiegt!',
    outcomeWin: 'Geschafft!',
    levelIntro: (n) => `Level ${n}`,
  },
};

const en: Strings = {
  common: {
    coins: 'Coins',
    gems: 'Gems',
  },
  start: {
    highscoreLabel: '🏆 High Score',
    activeWorld: 'Current world:',
    adButtonAria: 'Watch an ad for 350 coins',
    secretFound: 'Secret found! Check out the workshop.',
    rulesTitle: 'How to play',
    ruleTimingPre: 'Tapping throws an axe – always straight up. All that matters is ',
    ruleTimingStrong: 'when',
    ruleTimingRest: ' you tap.',
    ruleApples: 'Hit close to the apples to earn coins for new axes and boards.',
    ruleOwnAxePre: 'Hit your ',
    ruleOwnAxeStrong: 'own axe',
    ruleOwnAxeRest: ' and the run is over. Timing is everything.',
    ruleBoss: (bossEvery) => `Every ${bossEvery}th level is a boss – beat it and its axe is yours.`,
    playFirst: 'Let’s go',
    continueLevel: (n) => `Continue – Level ${n}`,
    continueToWorldMap: 'Continue to world map',
    worldMap: 'World Map',
    shop: 'Workshop',
    settings: 'Settings',
  },
  worldMap: {
    title: 'World Map',
    closeAria: 'Close',
    youAreHere: 'You are here',
    endlessMode: 'Endless Mode',
    endlessHighscore: (n) => `High score: Level ${n}`,
    nodeAria: (name, sublabel, bossName) => `${name}, ${sublabel}${bossName ? `, World Boss ${bossName}` : ''}`,
    xpSuffix: (n) => `${n} XP`,
    bossLabel: (name) => `⚔ ${name}`,
    fightBoss: (name) => `⚔ Fight ${name}`,
  },
  shop: {
    title: 'Workshop',
    tabAxes: 'Axes',
    tabBoards: 'Boards',
    tabLegendary: 'Legendary',
    tabExtras: 'Extras',
    legendaryNote: 'Elaborate designs for gems – only obtainable from golden apples.',
    extrasNote: 'Secrets – not for sale, only discovered.',
    figurinesLabel: (n) => `Figurines: ${n}`,
    figurinesBlurb: (gemsPerFigurine) => `Trading in figurines gives ${gemsPerFigurine} gems each.`,
    mysteryName: '???',
    mysteryBlurb: 'A well-kept secret.',
    equipped: 'Equipped',
    equip: 'Equip',
    close: 'Back to throwing',
  },
  hud: {
    worldBoss: '⚔ World Boss',
    boss: 'Boss',
    level: 'Level',
    progressAria: (current, total) => `Level ${current} of ${total} in this block`,
    openShopAria: 'Open workshop',
  },
  gameOver: {
    title: 'Axe shattered!',
    body: (level) => `You hit your own axe – on level ${level}.`,
    highscore: 'High score:',
    highscoreValue: (n) => `Level ${n}`,
    applesLost: (n) => `Lost ${n} ${n === 1 ? 'apple' : 'apples'} from this level.`,
    totalCoins: (n) => `Total coins: ${n}`,
    watchVideo: '📺 Recover',
    playAgain: 'Play again',
    backToMenu: 'Main menu',
  },
  levelComplete: {
    worldBossKicker: 'World boss defeated',
    worldBossTitle: (name) => `${name} defeated!`,
    bossKicker: 'Boss defeated',
    bossTitle: (name) => `${name} cracked!`,
    levelTitle: (n) => `Level ${n} complete!`,
    applesBody: (collected, total) => `Collected ${collected} of ${total} ${total === 1 ? 'apple' : 'apples'}.`,
    breakdownApples: 'Apples',
    breakdownLevelDone: 'Level complete',
    breakdownPerfect: 'All apples!',
    breakdownBlock: 'Block complete',
    breakdownStreak: (streak) => `Streak ×${streak}`,
    breakdownXp: 'XP',
    breakdownGoldenApple: 'Golden apple',
    breakdownFigurine: 'Figurine',
    totalCoins: (n) => `Total coins: ${n}`,
    totalGems: (n) => `Total gems: ${n}`,
    totalXp: (n) => `Total XP: ${n}`,
    campaignComplete: 'All 100 levels mastered! 🎉',
    openShop: 'Open workshop',
  },
  pause: {
    title: 'Paused',
    resume: 'Resume',
    backToMenu: 'Back to menu',
  },
  dailyReward: {
    title: 'Daily reward!',
    streak: (n) => `${n} day${n === 1 ? '' : 's'} in a row`,
    today: 'Today',
    day: (n) => `Day ${n}`,
    claim: 'Claim',
  },
  videoRescue: {
    loadingTitle: 'Ad playing …',
    loadingBodyRescue: 'Thanks for watching – almost there.',
    loadingBodyReward: 'Thanks for watching!',
    cancel: 'Cancel',
    successTitleRescue: 'Progress saved!',
    successTitleReward: 'Reward claimed!',
    successBodyRescue: 'You’ll continue right where you left off.',
    successBodyReward: (coins) => `+${coins} coins credited!`,
    successButtonRescue: 'Continue',
    successButtonReward: 'Great!',
    errorTitle: 'Ad unavailable',
    errorBody: 'No ad is available right now – please check your internet connection and try again.',
    retry: 'Try again',
  },
  settings: {
    title: 'Settings',
    soundLabel: 'Sound & Vibration',
    highscoreLabel: 'High score',
    languageLabel: 'Language',
    done: 'Done',
  },
  stage: {
    hint: 'Tap to throw – hit the gap',
    pauseAria: 'Pause',
    bossLabel: 'Boss',
    worldBossLabel: '⚠ World Boss',
    outcomeFail: 'Axe shattered!',
    outcomeWorldBoss: 'World boss defeated!',
    outcomeBoss: 'Boss defeated!',
    outcomeWin: 'Cleared!',
    levelIntro: (n) => `Level ${n}`,
  },
};

const DICTIONARIES: Record<Language, Strings> = { de, en };

export function getStrings(lang: Language): Strings {
  return DICTIONARIES[lang];
}
