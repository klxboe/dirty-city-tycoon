import { WorkerSprite } from './WorkerSprite';
import { TruckSprite } from './TruckSprite';
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

const FLIES = [
  { left: '46%', top: '28%', delay: '0s' },
  { left: '54%', top: '36%', delay: '0.7s' },
];

export function CityStage({ progress, workers, transporters, bufferRatio }: CityStageProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const clampedBuffer = Math.min(1, Math.max(0, bufferRatio));
  const dirtOpacity = 1 - clampedProgress;
  const saturation = 0.55 + clampedProgress * 0.45;

  const visibleWorkers = Math.min(workers, MAX_VISIBLE_WORKERS);
  const extraWorkers = workers - visibleWorkers;
  const visibleTrucks = Math.min(transporters, MAX_VISIBLE_TRUCKS);
  const extraTrucks = transporters - visibleTrucks;

  // Müllhalde: klein bis fast bis zum Anschlag, je nach Pufferstand.
  const pileHeight = 30 + clampedBuffer * 46;
  const pileWidth = 46 + clampedBuffer * 34;

  return (
    <div className="city-stage" style={{ filter: `saturate(${saturation})` }}>
      <div className="city-stage__sky">
        <div className="city-stage__sun" style={{ opacity: 0.35 + clampedProgress * 0.65 }} />
        <div className="city-stage__cloud city-stage__cloud--1" style={{ opacity: clampedProgress }} />
        <div className="city-stage__cloud city-stage__cloud--2" style={{ opacity: clampedProgress }} />
        <div className="city-stage__skyline">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`city-stage__building city-stage__building--${i}`} />
          ))}
        </div>
      </div>

      {/* Grime-Wäsche über dem Himmel, blendet mit dem Fortschritt aus. */}
      <div className="city-stage__haze" style={{ opacity: dirtOpacity * 0.6 }} />

      <div className="city-stage__ground">
        {FLIES.map((fly, i) => (
          <div
            key={i}
            className="city-stage__fly"
            style={{ left: fly.left, top: fly.top, opacity: dirtOpacity, animationDelay: fly.delay }}
          />
        ))}

        <div className="city-stage__actors">
          <div className="city-stage__group city-stage__group--workers">
            {Array.from({ length: visibleWorkers }).map((_, i) => (
              <WorkerSprite key={i} variant={i} size={34} />
            ))}
            {extraWorkers > 0 && <span className="city-stage__badge">+{extraWorkers}</span>}
          </div>

          <div className="city-stage__pile-zone">
            {clampedBuffer > 0.03 && (
              <div
                className="city-stage__pile"
                style={{ width: pileWidth, height: pileHeight }}
                title="Zwischenlager"
              >
                <div className="city-stage__pile-shape" />
              </div>
            )}
          </div>

          <div className="city-stage__group city-stage__group--trucks">
            {extraTrucks > 0 && <span className="city-stage__badge">+{extraTrucks}</span>}
            {Array.from({ length: visibleTrucks }).map((_, i) => (
              <TruckSprite key={i} variant={i} flip size={46} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
