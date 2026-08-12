import { useState } from 'react';
import { Axe } from './Axe';
import { Coin } from './Coin';
import { AXE_SKINS, BOARD_SKINS, isFreeSkin, type SkinDef } from '../game/shop';
import type { SaveData } from '../game/storage';
import './Shop.css';

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
      <div className={`shop-card__board board-skin board-skin--${skin.id}`}>
        <div className="shop-card__board-face" />
        <div className="shop-card__board-ring" />
        <div className="shop-card__board-eye" />
      </div>
    </div>
  );
}

export function Shop({ save, onBuy, onEquip, onClose }: ShopProps) {
  const [tab, setTab] = useState<'axe' | 'board'>('axe');
  const items = tab === 'axe' ? AXE_SKINS : BOARD_SKINS;
  const equippedId = tab === 'axe' ? save.equippedAxeSkin : save.equippedBoardSkin;

  return (
    <div className="modal-backdrop">
      <div className="shop">
        <header className="shop__head">
          <h2 className="shop__title">Werkstatt</h2>
          <div className="shop__coins">
            <Coin size={20} />
            <span>{save.coins}</span>
          </div>
        </header>

        <div className="shop__tabs">
          <button
            className={`shop__tab ${tab === 'axe' ? 'shop__tab--active' : ''}`}
            onClick={() => setTab('axe')}
          >
            Äxte
          </button>
          <button
            className={`shop__tab ${tab === 'board' ? 'shop__tab--active' : ''}`}
            onClick={() => setTab('board')}
          >
            Scheiben
          </button>
        </div>

        <div className="shop__list">
          {items.map((skin) => {
            const owned = isFreeSkin(skin.id) || save.ownedSkins.includes(skin.id);
            const equipped = equippedId === skin.id;
            const affordable = save.coins >= skin.price;

            return (
              <div key={skin.id} className={`shop-card ${equipped ? 'shop-card--equipped' : ''}`}>
                <SkinPreview skin={skin} />

                <div className="shop-card__info">
                  <span className="shop-card__name">{skin.name}</span>
                  <span className="shop-card__blurb">{skin.blurb}</span>
                </div>

                {equipped ? (
                  <span className="shop-card__badge">Ausgerüstet</span>
                ) : owned ? (
                  <button className="shop-card__action" onClick={() => onEquip(skin.id)}>
                    Anlegen
                  </button>
                ) : (
                  <button
                    className="shop-card__action shop-card__action--buy"
                    disabled={!affordable}
                    onClick={() => onBuy(skin.id)}
                  >
                    <Coin size={15} />
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
