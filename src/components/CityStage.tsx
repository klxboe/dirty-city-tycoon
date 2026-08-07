import './CityStage.css';

interface CityStageProps {
  /** 0 = maximal dreckig, 1 = komplett sauber. */
  progress: number;
}

// Statische Positionen für Müllhaufen & Flecken, damit sie nicht bei jedem Render neu "springen".
const TRASH_PILES = [
  { left: '10%', bottom: '6%', size: 46 },
  { left: '68%', bottom: '4%', size: 60 },
  { left: '40%', bottom: '2%', size: 38 },
  { left: '85%', bottom: '10%', size: 30 },
];

const FLIES = [
  { left: '20%', top: '30%', delay: '0s' },
  { left: '72%', top: '22%', delay: '0.6s' },
  { left: '50%', top: '40%', delay: '1.1s' },
];

export function CityStage({ progress }: CityStageProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const dirtOpacity = 1 - clampedProgress;
  const saturation = 0.35 + clampedProgress * 0.65;

  return (
    <div className="city-stage" style={{ filter: `saturate(${saturation})` }}>
      {/* Saubere Szene: immer da, wird durch die Dreck-Schicht darüber verdeckt. */}
      <div className="city-stage__clean">
        <div className="city-stage__sun" style={{ opacity: clampedProgress }} />
        <div className="city-stage__skyline">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`city-stage__building city-stage__building--${i}`} />
          ))}
        </div>
        <div className="city-stage__ground" />
        <div className="city-stage__tree city-stage__tree--1" style={{ opacity: clampedProgress }} />
        <div className="city-stage__tree city-stage__tree--2" style={{ opacity: clampedProgress }} />
      </div>

      {/* Dreck-Schicht: blendet mit dem Fortschritt aus. */}
      <div className="city-stage__dirt" style={{ opacity: dirtOpacity }}>
        {TRASH_PILES.map((pile, i) => (
          <div
            key={i}
            className="city-stage__trash"
            style={{ left: pile.left, bottom: pile.bottom, width: pile.size, height: pile.size * 0.7 }}
          />
        ))}
        {FLIES.map((fly, i) => (
          <div
            key={i}
            className="city-stage__fly"
            style={{ left: fly.left, top: fly.top, animationDelay: fly.delay }}
          />
        ))}
      </div>
    </div>
  );
}
