import { ChevronUp, HardHat, Truck } from 'lucide-react';
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

const SPARKS = [
  { left: '46%', delay: '0s' },
  { left: '52%', delay: '0.5s' },
  { left: '49%', delay: '1s' },
];

const FLIES = [
  { left: '20%', top: '40%', delay: '0s' },
  { left: '76%', top: '48%', delay: '0.7s' },
];

export function CityStage({ progress, workers, transporters, bufferRatio }: CityStageProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const clampedBuffer = Math.min(1, Math.max(0, bufferRatio));
  const dirtOpacity = 1 - clampedProgress;
  const saturation = 0.6 + clampedProgress * 0.4;

  const visibleWorkers = Math.min(workers, MAX_VISIBLE_WORKERS);
  const extraWorkers = workers - visibleWorkers;
  const visibleTrucks = Math.min(transporters, MAX_VISIBLE_TRUCKS);
  const extraTrucks = transporters - visibleTrucks;

  // Müllhalde: klein bis fast bis zum Anschlag, je nach Pufferstand.
  const pileHeight = 26 + clampedBuffer * 40;
  const pileWidth = 42 + clampedBuffer * 30;

  return (
    <div className="city-stage" style={{ filter: `saturate(${saturation})` }}>
      <div className="city-stage__sky">
        <div className="city-stage__sun" style={{ opacity: 0.35 + clampedProgress * 0.65 }} />
        <div className="city-stage__cloud city-stage__cloud--1" style={{ opacity: clampedProgress }} />
        <div className="city-stage__cloud city-stage__cloud--2" style={{ opacity: clampedProgress }} />
        <div className="city-stage__mountains">
          <div className="city-stage__mountain city-stage__mountain--1" />
          <div className="city-stage__mountain city-stage__mountain--2" />
          <div className="city-stage__mountain city-stage__mountain--3" />
        </div>
        <div className="city-stage__skyline">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`city-stage__building city-stage__building--${i}`} />
          ))}
        </div>
      </div>

      {/* Grime-Wäsche über dem Himmel, blendet mit dem Fortschritt aus. */}
      <div className="city-stage__haze" style={{ opacity: dirtOpacity * 0.6 }} />

      {/* Türme: links Arbeiter-Depot, rechts Transporter-Garage, dazwischen der Trichter zur Halde. */}
      <div className="city-stage__towers">
        <div className="tower tower--worker">
          <div className="tower__badge">
            ×{workers}
            <ChevronUp size={12} strokeWidth={3} />
          </div>
          <div className="tower__cap" />
          <div className="tower__body">
            <div className="tower__window">
              <HardHat size={18} />
            </div>
          </div>
        </div>

        <div className="city-stage__funnel">
          {SPARKS.map((spark, i) => (
            <span
              key={i}
              className="city-stage__spark"
              style={{ left: spark.left, animationDelay: spark.delay }}
            />
          ))}
        </div>

        <div className="tower tower--truck">
          <div className="tower__badge">
            ×{transporters}
            <ChevronUp size={12} strokeWidth={3} />
          </div>
          <div className="tower__cap tower__cap--truck" />
          <div className="tower__body tower__body--truck">
            <div className="tower__window">
              <Truck size={18} />
            </div>
          </div>
        </div>
      </div>

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
              <WorkerSprite key={i} variant={i} size={32} />
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
              <TruckSprite key={i} variant={i} flip size={44} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
