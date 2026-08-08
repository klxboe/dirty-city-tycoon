import { WorkerSprite } from './WorkerSprite';
import { TruckSprite } from './TruckSprite';
import { TrashItem } from './TrashItem';
import './CityStage.css';

interface CityStageProps {
  /** 0 = maximal dreckig, 1 = komplett sauber. */
  progress: number;
  workers: number;
  transporters: number;
  /** 0 = Puffer leer, 1 = Puffer voll. Bestimmt die Größe der Müllhalde. */
  bufferRatio: number;
}

const MAX_VISIBLE_WORKERS = 3;
const MAX_VISIBLE_TRUCKS = 2;

const HOUSES = [
  { color: '#ff9db8', roof: '#e0567f' },
  { color: '#8fd9ff', roof: '#3a9bd6' },
  { color: '#ffd479', roof: '#e0a52f' },
  { color: '#a8e6a1', roof: '#4fa53f' },
];

const LITTER_SPOTS = [
  { left: '14%', top: '58%' },
  { left: '68%', top: '48%' },
  { left: '40%', top: '68%' },
  { left: '82%', top: '62%' },
  { left: '26%', top: '40%' },
];

const WORKER_DELAYS = ['-0.5s', '-3.2s', '-6.1s'];
const TRUCK_DELAYS = ['0s', '-4s'];

export function CityStage({ progress, workers, transporters, bufferRatio }: CityStageProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const clampedBuffer = Math.min(1, Math.max(0, bufferRatio));
  const dirtOpacity = 1 - clampedProgress;
  const saturation = 0.6 + clampedProgress * 0.4;

  const visibleWorkers = Math.min(workers, MAX_VISIBLE_WORKERS);
  const visibleTrucks = Math.min(transporters, MAX_VISIBLE_TRUCKS);

  // Müllhalde an der Ladestelle: klein bis groß, je nach Pufferstand.
  const pileSize = 20 + clampedBuffer * 26;

  return (
    <div className="city-stage" style={{ filter: `saturate(${saturation})` }}>
      <div className="city-stage__sky">
        <div className="city-stage__sun" style={{ opacity: 0.35 + clampedProgress * 0.65 }} />
      </div>

      <div className="city-stage__houses">
        {HOUSES.map((house, i) => (
          <div className="house" key={i} style={{ background: house.color }}>
            <div className="house__roof" style={{ background: house.roof }} />
            <div className="house__window" />
            <div className="house__window house__window--right" />
            <div className="house__door" />
          </div>
        ))}
      </div>

      {/* Grime-Wäsche, blendet mit dem Fortschritt aus. */}
      <div className="city-stage__haze" style={{ opacity: dirtOpacity * 0.55 }} />

      <div className="city-stage__road">
        <div className="city-stage__road-line" />

        {LITTER_SPOTS.map((spot, i) => (
          <div
            key={i}
            className="city-stage__litter"
            style={{ left: spot.left, top: spot.top, opacity: dirtOpacity }}
          >
            <TrashItem variant={i} size={18} />
          </div>
        ))}

        {clampedBuffer > 0.05 && (
          <div
            className="city-stage__pile"
            style={{ width: pileSize, height: pileSize * 0.72 }}
            title="Zwischenlager"
          >
            <div className="city-stage__pile-shape" />
          </div>
        )}

        <div className="city-stage__worker-lane">
          {Array.from({ length: visibleWorkers }).map((_, i) => (
            <div
              key={i}
              className="city-stage__worker-slot"
              style={{ animationDelay: WORKER_DELAYS[i % WORKER_DELAYS.length], bottom: `${8 + i * 15}%` }}
            >
              <WorkerSprite variant={i} size={30} flip={i % 2 === 1} />
            </div>
          ))}
        </div>

        <div className="city-stage__truck-lane">
          {Array.from({ length: visibleTrucks }).map((_, i) => (
            <div
              key={i}
              className="city-stage__truck-slot"
              style={{ animationDelay: TRUCK_DELAYS[i % TRUCK_DELAYS.length], bottom: `${6 + i * 26}%` }}
            >
              <TruckSprite variant={i} size={50} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
