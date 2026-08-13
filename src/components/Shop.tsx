import { useState } from 'react';
import { Axe } from './Axe';
import { Coin } from './Coin';
import {
  AXE_SKINS,
  BOARD_SKINS,
  BOSS_AXE_SKINS,
  BOSS_FRUITS,
  boardStyleVars,
  isFreeSkin,
  type SkinDef,
} from '../game/shop';
import { BOSS_EVERY } from '../game/constants';
import type { SaveData } from '../game/storage';
import './Shop.css';

type Tab = 'axe' | 'board' | 'boss';

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

export function Shop({ save, onBuy, onEquip, onClose }: ShopProps) {
  const [tab, setTab] = useState<Tab>('axe');

  const items = tab === 'axe' ? AXE_SKINS : tab === 'board' ? BOARD_SKINS : BOSS_AXE_SKINS;
  const equippedId = tab === 'board' ? save.equippedBoardSkin : save.equippedAxeSkin;

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
          <button className={`shop__tab ${tab === 'axe' ? 'shop__tab--active' : ''}`} onClick={() => setTab('axe')}>
            Äxte
          </button>
          <button className={`shop__tab ${tab === 'board' ? 'shop__tab--active' : ''}`} onClick={() => setTab('board')}>
            Scheiben
          </button>
          <button className={`shop__tab ${tab === 'boss' ? 'shop__tab--active' : ''}`} onClick={() => setTab('boss')}>
            Beute
          </button>
        </div>

        {tab === 'boss' && (
          <p className="shop__note">Diese Äxte gibt es nicht zu kaufen – nur als Beute aus den Boss-Leveln.</p>
        )}

        <div className="shop__list">
          {items.map((skin) => {
            const owned = isFreeSkin(skin.id) || save.ownedSkins.includes(skin.id);
            const equipped = equippedId === skin.id;
            const affordable = save.coins >= skin.price;

            // Bei Boss-Beute zeigen wir statt eines Preises, welches Level sie freischaltet.
            const bossIndex = BOSS_FRUITS.findIndex((f) => f.axeSkinId === skin.id);
            const bossLevel = bossIndex >= 0 ? (bossIndex + 1) * BOSS_EVERY : null;

            return (
              <div
                key={skin.id}
                className={`shop-card ${equipped ? 'shop-card--equipped' : ''} ${
                  !owned && skin.source === 'boss' ? 'shop-card--locked' : ''
                }`}
              >
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
                ) : skin.source === 'boss' ? (
                  <span className="shop-card__locked">Level {bossLevel}</span>
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
