import { useState } from 'react';
import { Apple } from './Apple';
import { Axe } from './Axe';
import { Coin } from './Coin';
import { Gem } from './Gem';
import {
  AXE_SKINS,
  BOARD_SKINS,
  EASTER_EGG_SKINS,
  LEGENDARY_SKINS,
  boardStyleVars,
  isFreeSkin,
  localizedSkinBlurb,
  localizedSkinName,
  type SkinDef,
} from '../game/shop';
import { getBoardImage } from '../game/boardImages';
import { GEMS_PER_FIGURINE } from '../game/constants';
import { getStrings, type Language } from '../game/i18n';
import type { SaveData } from '../game/storage';
import './Shop.css';

type Tab = 'axe' | 'board' | 'legendary' | 'extras';

interface ShopProps {
  save: SaveData;
  lang: Language;
  onBuy: (skinId: string) => void;
  onEquip: (skinId: string) => void;
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

export function Shop({ save, lang, onBuy, onEquip, onTradeFigurines, onClose }: ShopProps) {
  const [tab, setTab] = useState<Tab>('axe');
  const t = getStrings(lang);
  const TABS: { id: Tab; label: string }[] = [
    { id: 'axe', label: t.shop.tabAxes },
    { id: 'board', label: t.shop.tabBoards },
    { id: 'legendary', label: t.shop.tabLegendary },
    { id: 'extras', label: t.shop.tabExtras },
  ];

  const items =
    tab === 'axe'
      ? AXE_SKINS
      : tab === 'board'
        ? BOARD_SKINS
        : tab === 'legendary'
          ? LEGENDARY_SKINS
          : EASTER_EGG_SKINS;

  return (
    <div className="modal-backdrop">
      <div className="shop">
        <header className="shop__head">
          <h2 className="shop__title">{t.shop.title}</h2>
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
          {TABS.map((tabDef) => (
            <button
              key={tabDef.id}
              className={`shop__tab ${tab === tabDef.id ? 'shop__tab--active' : ''}`}
              onClick={() => setTab(tabDef.id)}
            >
              {tabDef.label}
            </button>
          ))}
        </div>

        {tab === 'legendary' && <p className="shop__note">{t.shop.legendaryNote}</p>}
        {tab === 'extras' && <p className="shop__note">{t.shop.extrasNote}</p>}

        {/* Sammelfiguren aus Heldenstadt: reiner Vorrat statt einzeln verwalteter
            Sammlung, deshalb ein einfacher Gesamt-Eintausch statt einer Liste. Nur
            sichtbar, sobald überhaupt eine Figur im Inventar ist. */}
        {tab === 'extras' && save.figurines > 0 && (
          <div className="shop-card shop-card--figurines">
            <div className="shop-card__preview">
              <Apple size={26} figurine />
            </div>
            <div className="shop-card__info">
              <span className="shop-card__name">{t.shop.figurinesLabel(save.figurines)}</span>
              <span className="shop-card__blurb">{t.shop.figurinesBlurb(GEMS_PER_FIGURINE)}</span>
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
            const affordable = currency >= skin.price;
            const isMystery = skin.source === 'egg';

            return (
              <div
                key={skin.id}
                className={`shop-card ${equipped ? 'shop-card--equipped' : ''} ${
                  !owned && skin.source === 'egg' ? 'shop-card--locked' : ''
                }`}
              >
                {isMystery && !owned ? <div className="shop-card__preview shop-card__preview--mystery">?</div> : <SkinPreview skin={skin} />}

                <div className="shop-card__info">
                  <span className="shop-card__name">{isMystery && !owned ? t.shop.mysteryName : localizedSkinName(skin, lang)}</span>
                  <span className="shop-card__blurb">{isMystery && !owned ? t.shop.mysteryBlurb : localizedSkinBlurb(skin, lang)}</span>
                </div>

                {equipped ? (
                  <span className="shop-card__badge">{t.shop.equipped}</span>
                ) : owned ? (
                  <button className="shop-card__action" onClick={() => onEquip(skin.id)}>
                    {t.shop.equip}
                  </button>
                ) : skin.source === 'egg' ? (
                  <span className="shop-card__locked">{t.shop.mysteryName}</span>
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
          {t.shop.close}
        </button>
      </div>
    </div>
  );
}
