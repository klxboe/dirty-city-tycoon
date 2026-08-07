import type { ReactNode } from 'react';
import { HardHat, Truck, Warehouse } from 'lucide-react';
import { formatNumber, formatRate } from '../utils/format';
import './ShopPanel.css';

interface ShopItemProps {
  icon: ReactNode;
  name: string;
  effect: string;
  owned: number;
  cost: number;
  affordable: boolean;
  onBuy: () => void;
}

function ShopItem({ icon, name, effect, owned, cost, affordable, onBuy }: ShopItemProps) {
  return (
    <button className="shop-item" disabled={!affordable} onClick={onBuy}>
      <div className="shop-item__icon">{icon}</div>
      <div className="shop-item__info">
        <div className="shop-item__name-row">
          <span className="shop-item__name">{name}</span>
          <span className="shop-item__owned">×{owned}</span>
        </div>
        <span className="shop-item__effect">{effect}</span>
      </div>
      <div className="shop-item__cost">{formatNumber(cost)}</div>
    </button>
  );
}

interface ShopPanelProps {
  workers: number;
  workerCost: number;
  workerRate: number;
  transporters: number;
  transporterCost: number;
  transporterRate: number;
  storages: number;
  storageCost: number;
  storageCapacity: number;
  money: number;
  onBuyWorker: () => void;
  onBuyTransporter: () => void;
  onBuyStorage: () => void;
}

export function ShopPanel({
  workers,
  workerCost,
  workerRate,
  transporters,
  transporterCost,
  transporterRate,
  storages,
  storageCost,
  storageCapacity,
  money,
  onBuyWorker,
  onBuyTransporter,
  onBuyStorage,
}: ShopPanelProps) {
  return (
    <div className="shop-panel">
      <ShopItem
        icon={<HardHat size={22} />}
        name="Arbeiter"
        effect={`+${formatRate(workerRate)} Müll/s sammeln`}
        owned={workers}
        cost={workerCost}
        affordable={money >= workerCost}
        onBuy={onBuyWorker}
      />
      <ShopItem
        icon={<Truck size={22} />}
        name="Transporter"
        effect={`+${formatRate(transporterRate)} Müll/s abfahren`}
        owned={transporters}
        cost={transporterCost}
        affordable={money >= transporterCost}
        onBuy={onBuyTransporter}
      />
      <ShopItem
        icon={<Warehouse size={22} />}
        name="Lager"
        effect={`+${formatNumber(storageCapacity)} Puffer-Kapazität`}
        owned={storages}
        cost={storageCost}
        affordable={money >= storageCost}
        onBuy={onBuyStorage}
      />
    </div>
  );
}
