import { useState } from 'react';
import { Apple } from './Apple';
import { Axe } from './Axe';
import { Coin } from './Coin';
import { Gem } from './Gem';
import {
  AXE_SKINS,
  BOARD_SKINS,
  BOSS_AXE_SKINS,
  BOSS_FRUITS,
  EASTER_EGG_SKINS,
  formatIapPrice,
  HERO_AXE_SKINS,
  HERO_BOSSES,
  LEGENDARY_SKINS,
  boardStyleVars,
  isFreeSkin,
  type SkinDef,
} from '../game/shop';
import { getBoardImage } from '../game/boardImages';
import { BOSS_EVERY, GEMS_PER_FIGURINE } from '../game/constants';
import { HERO_WORLD_START } from '../game/worlds';
import { purchaseSkin } from '../game/purchases';
import type { SaveData } from '../game/storage';
import './Shop.css';

type Tab = 'axe' | 'board' | 'legendary' | 'extras';

interface ShopProps {
  save: SaveData;
  onBuy: (skinId: string) => void;
  onEquip: (skinId: string) => void;
  /** Schaltet eine Axt nach einem ECHTEN, vom Store bestätigten Kauf frei (siehe `purchaseSkin` unten). */
  onGrantPurchase: (skinId: string) => void;
  onTradeFigurines: () => void;
  onClose: () => void;
}

/** Kleine Vorschau: Axt-Skins zeigen die Axt, Scheiben-Skins einen Ausschnitt der Scheibe. */
function SkinPreview({ skin }: { skin: SkinDef }) {
  if (skin.kind === 'axe') {
    return (
      <div className="shop-card__preview">
        <Axe size={26} skin={skin.id} />
      </div>
    );
  }
  const boardImage = getBoardImage(skin.id);
  return (
    <div className="shop-card__preview">
      {boardImage ? (
        <img className="shop-card__board-image" src={boardImage} alt="" draggable={false} />
      ) : (
        <div className="shop-card__board" style={boardStyleVars(skin.id) as React.CSSProperties}>
          <div className="shop-card__board-face" />
          <div className="shop-card__board-ring" />
          <div className="shop-card__board-eye" />
        </div>
      )}
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'axe', label: 'Äxte' },
  { id: 'board', label: 'Scheiben' },
  { id: 'legendary', label: 'Legendär' },
  { id: 'extras', label: 'Extras' },
];

export function Shop({ save, onBuy, onEquip, onGrantPurchase, onTradeFigurines, onClose }: ShopProps) {
  const [tab, setTab] = useState<Tab>('axe');
  /** Fehlermeldung nach einem gescheiterten Echtgeld-Kauf (siehe `handlePurchase` unten). */
  const [iapNotice, setIapNotice] = useState<string | null>(null);
  /** Welche Karte gerade einen Kauf-Vorgang laufen hat – zeigt "Wird gekauft…" statt des Preis-Buttons. */
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  /**
   * Echter Kauf-Flow über RevenueCat/StoreKit (siehe game/purchases.ts). Schaltet
   * die Axt NUR über `onGrantPurchase` frei, wenn der Store den Kauf tatsächlich
   * bestätigt hat – ein Abbruch durch den Nutzer selbst zeigt bewusst KEINE
   * Fehlermeldung (kein Fehler, nur eine Entscheidung), alles andere schon.
   */
  const handlePurchase = async (skin: SkinDef) => {
    if (!skin.productId || purchasingId) return;
    setPurchasingId(skin.id);
    const result = await purchaseSkin(skin.productId);
    setPurchasingId(null);
    if (result.success) {
      onGrantPurchase(skin.id);
      return;
    }
    if (result.error === 'cancelled') return;
    setIapNotice(
      result.error === 'not-configured' || result.error === 'product-not-found'
        ? `${skin.name} ist im Store noch nicht verfügbar – versuch es später nochmal.`
        : `Kauf von ${skin.name} hat nicht geklappt – versuch es nochmal.`,
    );
  };

  const items =
    tab === 'axe'
      ? // Echtgeld-Äxte (source: 'iap') für die App-Store-Einreichung ausgeblendet
        // (Audit 2026-08-22): es gibt noch KEINE echte StoreKit-Anbindung (braucht das
        // native Projekt), ein Kauf-Button, der offen "kommt mit dem App-Store-Release"
        // zeigt, wäre eine nicht-funktionale Kauf-UI und ein sicherer Ablehnungsgrund.
        // Reiner Anzeige-Filter, KEINE Datenänderung – sobald StoreKit angebunden ist,
        // reicht das Entfernen dieses `.filter(...)`, um sie wieder sichtbar zu machen.
        AXE_SKINS.filter((skin) => skin.source !== 'iap')
      : tab === 'board'
        ? BOARD_SKINS
        : tab === 'legendary'
          ? LEGENDARY_SKINS
          : [...BOSS_AXE_SKINS, ...HERO_AXE_SKINS, ...EASTER_EGG_SKINS];

  return (
    <div className="modal-backdrop">
      <div className="shop">
        <header className="shop__head">
          <h2 className="shop__title">Werkstatt</h2>
          <div className="shop__wallet">
            <div className="shop__coins">
              <Coin size={18} />
              <span>{save.coins}</span>
            </div>
            {save.gems > 0 && (
              <div className="shop__gems">
                <Gem size={14} />
                <span>{save.gems}</span>
              </div>
            )}
          </div>
        </header>

        <div className="shop__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`shop__tab ${tab === t.id ? 'shop__tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'legendary' && (
          <p className="shop__note">Aufwendige Designs für Diamanten – die gibt's nur durch goldene Äpfel.</p>
        )}
        {tab === 'extras' && (
          <p className="shop__note">
            Boss-Beute und Geheimnisse – nicht käuflich, nur zu erspielen oder zu finden.
          </p>
        )}

        {/* Sammelfiguren aus Heldenstadt: reiner Vorrat statt einzeln verwalteter
            Sammlung, deshalb ein einfacher Gesamt-Eintausch statt einer Liste. Nur
            sichtbar, sobald überhaupt eine Figur im Inventar ist. */}
        {tab === 'extras' && save.figurines > 0 && (
          <div className="shop-card shop-card--figurines">
            <div className="shop-card__preview">
              <Apple size={26} figurine />
            </div>
            <div className="shop-card__info">
              <span className="shop-card__name">Sammelfiguren: {save.figurines}</span>
              <span className="shop-card__blurb">Eingetauscht bringt jede Figur {GEMS_PER_FIGURINE} Diamanten.</span>
            </div>
            <button className="shop-card__action shop-card__action--buy" onClick={onTradeFigurines}>
              <Gem size={15} />
              {save.figurines * GEMS_PER_FIGURINE}
            </button>
          </div>
        )}

        <div className="shop__list">
          {items.map((skin) => {
            const owned = isFreeSkin(skin.id) || save.ownedSkins.includes(skin.id);
            const equipped =
              skin.kind === 'board' ? save.equippedBoardSkin === skin.id : save.equippedAxeSkin === skin.id;
            const currency = skin.source === 'gem' ? save.gems : save.coins;
            // Echtgeld-Items sind nie "erschwinglich/nicht erschwinglich" im Münz-Sinne
            // – der Button ist immer aktiv, zeigt aber (noch) nur den Platzhalter-Hinweis.
            const affordable = skin.source === 'iap' || currency >= skin.price;

            // Bei Boss-Beute zeigen wir statt eines Preises, welches Level sie freischaltet.
            // Zwei getrennte Rotationen (Boss-Früchte vs. Heldenstadt-Bosse, siehe
            // bossFruitForLevel in constants.ts) brauchen unterschiedliche Rechnungen:
            // die Helden-Bosse fangen erst bei HERO_WORLD_START an.
            const fruitIndex = BOSS_FRUITS.findIndex((f) => f.axeSkinId === skin.id);
            const heroIndex = HERO_BOSSES.findIndex((b) => b.axeSkinId === skin.id);
            const bossLevel =
              fruitIndex >= 0
                ? (fruitIndex + 1) * BOSS_EVERY
                : heroIndex >= 0
                  ? HERO_WORLD_START + (heroIndex + 1) * BOSS_EVERY
                  : null;
            const isMystery = skin.source === 'egg';

            return (
              <div
                key={skin.id}
                className={`shop-card ${equipped ? 'shop-card--equipped' : ''} ${
                  !owned && (skin.source === 'boss' || skin.source === 'egg') ? 'shop-card--locked' : ''
                } ${skin.source === 'iap' ? 'shop-card--premium' : ''}`}
              >
                {skin.source === 'iap' && !owned && <span className="shop-card__premium-tag">Premium</span>}
                {isMystery && !owned ? <div className="shop-card__preview shop-card__preview--mystery">?</div> : <SkinPreview skin={skin} />}

                <div className="shop-card__info">
                  <span className="shop-card__name">{isMystery && !owned ? '???' : skin.name}</span>
                  <span className="shop-card__blurb">{isMystery && !owned ? 'Ein gut gehütetes Geheimnis.' : skin.blurb}</span>
                </div>

                {equipped ? (
                  <span className="shop-card__badge">Ausgerüstet</span>
                ) : owned ? (
                  <button className="shop-card__action" onClick={() => onEquip(skin.id)}>
                    Anlegen
                  </button>
                ) : skin.source === 'boss' ? (
                  <span className="shop-card__locked">Level {bossLevel}</span>
                ) : skin.source === 'egg' ? (
                  <span className="shop-card__locked">???</span>
                ) : skin.source === 'iap' ? (
                  <button
                    className="shop-card__action shop-card__action--iap"
                    disabled={purchasingId === skin.id}
                    onClick={() => handlePurchase(skin)}
                  >
                    {purchasingId === skin.id ? 'Wird gekauft…' : `💎 ${formatIapPrice(skin.priceCents ?? 0)}`}
                  </button>
                ) : (
                  <button
                    className="shop-card__action shop-card__action--buy"
                    disabled={!affordable}
                    onClick={() => onBuy(skin.id)}
                  >
                    {skin.source === 'gem' ? <Gem size={15} /> : <Coin size={15} />}
                    {skin.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {iapNotice && (
          <div className="shop__iap-notice" onClick={() => setIapNotice(null)}>
            {iapNotice}
          </div>
        )}

        <button className="shop__close" onClick={onClose}>
          Weiter werfen
        </button>
      </div>
    </div>
  );
}
