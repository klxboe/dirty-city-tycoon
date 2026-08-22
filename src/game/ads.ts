// Echtes Rewarded Video (Google AdMob) für die einmalige Game-Over-Rettung
// (`rescueRun()` in useAxeGame.ts, UI in VideoRescueModal.tsx). Baut 1:1 auf dem
// Muster auf, das sich bei Habituo (Klaus' erster App, siehe momentum-preview/
// STATUS.md Punkt 10) im echten Betrieb bewährt hat – inklusive der beiden Bugs,
// die dort erst nach der Einreichung auffielen, hier von Anfang an vermieden:
//
// 1. "No ViewController"-Init-Fehler: `AdMob.initialize()` MUSS vor
//    `requestConsentInfo()`/`showConsentForm()` laufen, sonst hat die native
//    Consent-Form keine View-Hierarchie zum Andocken (siehe
//    https://github.com/capacitor-community/admob/issues/277).
// 2. Hänger-Bug: schnelles Hintereinander-Anfordern von Videos kann iOS' Vollbild-
//    Präsentation einfrieren lassen (Race zwischen Dismiss-Animation der vorigen
//    und Präsentation der nächsten Anzeige) – deshalb eine kurze Pause nach jedem
//    Dismiss-Event UND ein Timeout-Watchdog, damit der Aufruf garantiert irgendwann
//    auflöst statt für immer zu hängen.
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import type { AdMobRewardItem, RewardAdOptions } from '@capacitor-community/admob';

/**
 * MUSS auf `false` stehen für echten Betrieb/Einreichung. `true` zeigt Googles
 * garantiert funktionierende Test-Anzeige statt einer echten – nützlich, um gegen
 * Consent-/Init-Fehler zu debuggen, ohne dass ein Fill-Problem der echten Anzeige
 * das Ergebnis verfälscht. Test-IDs unten sind Googles offizielle, öffentlich
 * dokumentierte Test-Werte (https://developers.google.com/admob/ios/test-ads) –
 * KEINE erfundenen Platzhalter, die funktionieren garantiert, sobald das SDK läuft.
 */
export const USE_TEST_AD = true;

/**
 * ECHTE IDs fehlen noch – müssen in der AdMob-Konsole für EINE NEUE, EIGENE
 * "Axe Throw"-App angelegt werden (nicht die IDs von Habituo wiederverwenden,
 * jede App braucht ihre eigene AdMob-App + Ad Unit). Bis dahin bewusst auf
 * Googles Test-IDs gesetzt, damit der Code schon lauffähig ist:
 * - App ID gehört zusätzlich in Info.plist (`GADApplicationIdentifier`) UND
 *   `AndroidManifest.xml` (falls Android dazukommt) – nicht nur hierhin.
 * - Sobald echte IDs existieren: hier UND in Info.plist ersetzen, `USE_TEST_AD`
 *   auf `false`.
 */
export const REAL_APP_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX';
const REAL_REWARDED_AD_UNIT_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

const TEST_REWARDED_AD_UNIT_ID = 'ca-app-pub-3940256099942544/1712485313';

const REWARDED_AD_UNIT_ID = USE_TEST_AD ? TEST_REWARDED_AD_UNIT_ID : REAL_REWARDED_AD_UNIT_ID;

/** Nach einem `Dismissed`-Event kurz warten, bevor die nächste Anzeige startet (siehe Kommentar oben). */
const MIN_GAP_AFTER_DISMISS_MS = 1000;
/** Watchdog: `showRewardedAd()` löst spätestens nach dieser Zeit auf, egal was das SDK tut. */
const SHOW_TIMEOUT_MS = 45000;

let initialized = false;
let lastDismissAt = 0;

/**
 * Einmalig beim App-Start aufzurufen (nur auf nativer Plattform relevant – im
 * Browser/Web-Preview ist `AdMob` nicht verfügbar, Aufrufe laufen ins Leere statt
 * zu crashen, da Capacitor-Web-Stubs vorhanden sind). Reihenfolge ist bewusst FEST:
 * erst `initialize()`, danach EU/UK-Consent (Googles UMP-Flow) – siehe Bug 1 oben.
 */
export async function initAds(): Promise<void> {
  if (initialized) return;
  try {
    await AdMob.initialize({
      initializeForTesting: USE_TEST_AD,
    });
    initialized = true;

    const consentInfo = await AdMob.requestConsentInfo();
    if (consentInfo.isConsentFormAvailable && consentInfo.status !== 'NOT_REQUIRED') {
      await AdMob.showConsentForm();
    }
  } catch {
    // Kein Internet, kein Fill, Consent-Anbieter nicht erreichbar o.ä. – die App muss
    // trotzdem weiterlaufen, `showRewardedAd()` scheitert dann später sauber mit
    // `success: false` statt hier schon alles zu blockieren.
  }
}

/** Öffnet erneut Googles Consent-Verwaltung (Pflicht-Einstiegspunkt, z.B. aus den Einstellungen). */
export async function showAdPrivacyOptions(): Promise<void> {
  try {
    await AdMob.showConsentForm();
  } catch {
    // Kein Consent-Formular verfügbar (z.B. Nutzer außerhalb EU/UK) – nichts zu tun.
  }
}

/**
 * Zeigt das Rewarded Video. Löst NUR mit `true` auf, wenn das `Rewarded`-Event
 * tatsächlich gefeuert hat (Nutzer hat wirklich bis zur Belohnung geschaut) –
 * ein Wegklicken vor Ende zählt nicht. Löst IMMER auf (nie für immer hängend),
 * dank Timeout-Watchdog.
 */
export async function showRewardedAd(): Promise<{ success: boolean; error?: string }> {
  const gap = performance.now() - lastDismissAt;
  if (gap < MIN_GAP_AFTER_DISMISS_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_GAP_AFTER_DISMISS_MS - gap));
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: { success: boolean; error?: string }) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const rewardedListener = AdMob.addListener(RewardAdPluginEvents.Rewarded, (_reward: AdMobRewardItem) => {
      finish({ success: true });
    });
    const dismissedListener = AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      lastDismissAt = performance.now();
      // Nur relevant, falls kein Rewarded-Event davor kam (weggeklickt statt zu Ende geschaut).
      finish({ success: false });
    });
    const failedListener = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: unknown) => {
      finish({ success: false, error: String(error) });
    });
    const failedToShowListener = AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error: unknown) => {
      finish({ success: false, error: String(error) });
    });

    const cleanup = () => {
      rewardedListener.then((l) => l.remove());
      dismissedListener.then((l) => l.remove());
      failedListener.then((l) => l.remove());
      failedToShowListener.then((l) => l.remove());
    };

    const timeout = setTimeout(() => finish({ success: false, error: 'timeout' }), SHOW_TIMEOUT_MS);

    const options: RewardAdOptions = {
      adId: REWARDED_AD_UNIT_ID,
      isTesting: USE_TEST_AD,
      // Nicht-personalisierte Anzeige: kein ATT-Prompt nötig (ATT betrifft nur
      // IDFA-basiertes Tracking, das hier nicht genutzt wird) – DSGVO/DMA-Consent für
      // EU/UK-Nutzer läuft trotzdem separat über Googles UMP-Flow in initAds().
      npa: true,
    };

    AdMob.prepareRewardVideoAd(options)
      .then(() => AdMob.showRewardVideoAd())
      .catch((error) => finish({ success: false, error: String(error) }))
      .finally(() => clearTimeout(timeout));
  });
}
