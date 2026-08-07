import { useState } from 'react';
import { HUD } from './components/HUD';
import { CleanlinessBar } from './components/CleanlinessBar';
import { CityStage } from './components/CityStage';
import { BufferBar } from './components/BufferBar';
import { TapButton } from './components/TapButton';
import { ShopPanel } from './components/ShopPanel';
import { OfflineModal } from './components/OfflineModal';
import { PrestigeModal } from './components/PrestigeModal';
import { useGameEngine } from './hooks/useGameEngine';
import { multiplierForStars } from './game/engine';
import {
  getCityForIndex,
  STORAGE_CAPACITY_PER_UNIT,
  TAP_BASE_VALUE,
  TRANSPORTER_RATE,
  WORKER_RATE,
} from './game/constants';
import './App.css';

function App() {
  const game = useGameEngine();
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false);

  const nextCityDef = getCityForIndex(game.state.cityIndex + 1);
  const newMultiplier = multiplierForStars(game.state.totalStars + game.projectedStars);

  return (
    <div className="app">
      <HUD
        money={game.state.money}
        effectiveRate={game.effectiveRate}
        cityName={game.cityDef.name}
        cityTier={game.cityDef.tier}
        cityNumber={game.state.cityIndex + 1}
        totalStars={game.state.totalStars}
        prestigeMultiplier={game.state.prestigeMultiplier}
      />

      <CleanlinessBar
        progress={game.cleanlinessProgress}
        cityTier={game.cityDef.tier}
        cityName={game.cityDef.name}
        canMoveToNextCity={game.canMoveToNextCity}
        projectedStars={game.projectedStars}
        onRequestMove={() => setShowPrestigeConfirm(true)}
      />

      <CityStage progress={game.cleanlinessProgress} />

      <BufferBar buffer={game.state.buffer} capacity={game.bufferCapacity} bottlenecked={game.bottlenecked} />

      <TapButton tapValue={TAP_BASE_VALUE * game.state.prestigeMultiplier} onTap={game.tap} />

      <ShopPanel
        workers={game.state.workers}
        workerCost={game.workerCost}
        workerRate={WORKER_RATE}
        transporters={game.state.transporters}
        transporterCost={game.transporterCost}
        transporterRate={TRANSPORTER_RATE}
        storages={game.state.storages}
        storageCost={game.storageCost}
        storageCapacity={STORAGE_CAPACITY_PER_UNIT}
        money={game.state.money}
        onBuyWorker={game.buyWorker}
        onBuyTransporter={game.buyTransporter}
        onBuyStorage={game.buyStorage}
      />

      {game.offlineReport && (
        <OfflineModal
          earned={game.offlineReport.earned}
          elapsedMs={game.offlineReport.elapsedMs}
          onClaim={game.dismissOfflineReport}
        />
      )}

      {showPrestigeConfirm && (
        <PrestigeModal
          fromCityLabel={`${game.cityDef.tier} ${game.cityDef.name}`}
          toCityLabel={`${nextCityDef.tier} ${nextCityDef.name}`}
          stars={game.projectedStars}
          newMultiplier={newMultiplier}
          onConfirm={() => {
            game.moveToNextCity();
            setShowPrestigeConfirm(false);
          }}
          onCancel={() => setShowPrestigeConfirm(false)}
        />
      )}
    </div>
  );
}

export default App;
