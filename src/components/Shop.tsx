import { useState } from 'react';
import { Axe } from './Axe';
import { Coin } from './Coin';
import { Gem } from './Gem';
import {
  AXE_SKINS,
  BOARD_SKINS,
  BOSS_AXE_SKINS,
  BOSS_FRUITS,
  EASTER_EGG_SKINS,
  HERO_AXE_SKINS,
  HERO_BOSSES,
  LEGENDARY_SKINS,
  boardStyleVars,
  isFreeSkin,
  type SkinDef,
} from '../game/shop';
import { BOSS_EVERY } from '../game/constants';
import { HERO_WORLD_START } from '../game/worlds';
import type { SaveData } from '../game/storage';
import './Shop.css';

type Tab = 'axe' | 'board' | 'legendary' | 'extras';

interface ShopProps {
  save: SaveData;
  onBuy: (skinId: string) => void;
  onEquip: (skinId: string) => void;
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
  return (
    <div className="shop-card__preview">
      <div className="shop-card__board" style={boardStyleVars(skin.id) as React.CSSProperties}>
        <div className="shop-card__board-face" />
        <div className="shop-card__board-ring" />
        <div className="shop-card__board-eye" />
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'axe', label: 'Äxte' },
  { id: 'board', label: 'Scheiben' },
  { id: 'legendary', label: 'Legendär' },
  { id: 'extras', label: 'Extras' },
];

export function Shop({ save, onBuy, onEquip, onClose }: ShopProps) {
  const [tab, setTab] = useState<Tab>('axe');

  const items =
    tab === 'axe'
      ? AXE_SKINS
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

        <div className="shop__list">
          {items.map((skin) => {
            const owned = isFreeSkin(skin.id) || save.ownedSkins.includes(skin.id);
            const equipped =
              skin.kind === 'board' ? save.equippedBoardSkin === skin.id : save.equippedAxeSkin === skin.id;
            const currency = skin.source === 'gem' ? save.gems : save.coins;
            const affordable = currency >= skin.price;

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
                }`}
              >
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

        <button className="shop__close" onClick={onClose}>
          Weiter werfen
        </button>
      </div>
    </div>
  );
}
