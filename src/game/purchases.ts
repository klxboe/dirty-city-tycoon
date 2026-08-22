// Echte In-App-Käufe (RevenueCat) für die Echtgeld-Äxte (siehe `source: 'iap'` in
// shop.ts). Baut auf demselben Muster auf, das sich bei Habituo (Klaus' erster App,
// siehe momentum-preview/STATUS.md Punkt 9) bewährt hat: `Purchases.getProducts` +
// `Purchases.purchaseStoreProduct` DIREKT, ohne Offerings/Entitlements – das braucht
// man nur für Abos, nicht für einzelne, unabhängige Kosmetik-Käufe.
import { Purchases } from '@revenuecat/purchases-capacitor';

/**
 * ECHTER Key fehlt noch – muss im RevenueCat-Dashboard für ein NEUES, EIGENES
 * "Axe Throw"-Projekt erzeugt werden (nicht den Habituo-Key wiederverwenden, jedes
 * RevenueCat-Projekt ist an eine App/Bundle-ID gebunden). Ohne gültigen Key bleibt
 * `configure()` wirkungslos (bzw. schlägt fehl) – `initPurchases()` fängt das ab,
 * damit die App trotzdem startet.
 */
export const REVENUECAT_API_KEY_IOS = 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXX';

let configured = false;

export async function initPurchases(): Promise<void> {
  if (configured) return;
  try {
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
    configured = true;
  } catch {
    // Kein natives RevenueCat verfügbar (Web-Preview) oder ungültiger Platzhalter-Key –
    // Käufe schlagen dann später sauber in purchaseSkin() fehl statt die App zu blockieren.
  }
}

export interface PurchaseResult {
  success: boolean;
  /** 'cancelled' = Nutzer hat den Kauf-Dialog selbst abgebrochen, kein echter Fehler. */
  error?: 'cancelled' | 'not-configured' | 'product-not-found' | string;
}

/**
 * Kauft eine Axt per `productId` (siehe `SkinDef.productId` in shop.ts – MUSS als
 * Produkt in App Store Connect angelegt UND in RevenueCat gespiegelt sein, siehe
 * Kommentar dort). Gibt `success: true` NUR zurück, wenn der Kauf durch den Store
 * tatsächlich bestätigt wurde – ruft NIE selbst `ownedSkins` o.ä. an, das entscheidet
 * ausschließlich `grantPurchasedSkin()` in useAxeGame.ts nach einem echten Erfolg hier.
 */
export async function purchaseSkin(productId: string): Promise<PurchaseResult> {
  if (!configured) return { success: false, error: 'not-configured' };
  try {
    const { products } = await Purchases.getProducts({ productIdentifiers: [productId] });
    const product = products[0];
    if (!product) return { success: false, error: 'product-not-found' };
    await Purchases.purchaseStoreProduct({ product });
    return { success: true };
  } catch (error) {
    const err = error as { userCancelled?: boolean; message?: string };
    if (err?.userCancelled) return { success: false, error: 'cancelled' };
    return { success: false, error: err?.message ?? String(error) };
  }
}
