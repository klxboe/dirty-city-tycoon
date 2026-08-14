import { WORLDS, WORLDS_LEVEL_COUNT } from '../game/worlds';
import './WorldMap.css';

/** Kleines Schloss-Symbol für noch nicht erreichte Welten – passend zum sonstigen SVG-Icon-Stil. */
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="world-card__lock-icon">
      <rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface WorldMapProps {
  /** Höchstes je erreichtes Kampagnen-Level (1-basiert), für den Freischalt-Fortschritt. */
  bestLevel: number;
  currentLevelIndex: number;
  onSelectLevel: (levelIndex: number) => void;
  onClose: () => void;
}

/**
 * Weltkarte: zeigt alle 5 Welten mit Fortschritt, springt per Tap zum Levelanfang
 * der gewählten Welt. Eine Welt ist freigeschaltet, sobald ihr erstes Level erreicht
 * wurde – man kann also jederzeit zu einer früheren Welt zurück, aber nicht vorspulen.
 */
export function WorldMap({ bestLevel, currentLevelIndex, onSelectLevel, onClose }: WorldMapProps) {
  return (
    <div className="modal-backdrop">
      <div className="world-map">
        <header className="world-map__head">
          <h2 className="world-map__title">Weltkarte</h2>
        </header>

        <div className="world-map__list">
          {WORLDS.map((world) => {
            const unlocked = bestLevel > world.startLevelIndex;
            const done = Math.max(0, Math.min(WORLDS_LEVEL_COUNT, bestLevel - world.startLevelIndex));
            const isCurrent = currentLevelIndex >= world.startLevelIndex && currentLevelIndex < world.startLevelIndex + WORLDS_LEVEL_COUNT;

            return (
              <button
                key={world.id}
                className={`world-card ${unlocked ? '' : 'world-card--locked'} ${isCurrent ? 'world-card--current' : ''}`}
                style={{ ['--world-accent' as string]: world.colors.accent }}
                disabled={!unlocked}
                onClick={() => {
                  onSelectLevel(world.startLevelIndex);
                  onClose();
                }}
              >
                <span className="world-card__swatch" />
                <span className="world-card__info">
                  <span className="world-card__name">
                    {world.name}
                    {isCurrent && <span className="world-card__current-tag">Aktuell</span>}
                  </span>
                  <span className="world-card__levels">
                    Level {world.startLevelIndex + 1}–{world.startLevelIndex + WORLDS_LEVEL_COUNT}
                  </span>
                  {unlocked ? (
                    <span className="world-card__progress">
                      <span className="world-card__progress-track">
                        <span
                          className="world-card__progress-fill"
                          style={{ width: `${(done / WORLDS_LEVEL_COUNT) * 100}%` }}
                        />
                      </span>
                      <span className="world-card__progress-label">
                        {done}/{WORLDS_LEVEL_COUNT}
                      </span>
                    </span>
                  ) : (
                    <span className="world-card__lock-hint">
                      Erreiche Level {world.startLevelIndex}, um freizuschalten
                    </span>
                  )}
                </span>
                {!unlocked && <LockIcon />}
              </button>
            );
          })}
        </div>

        <button className="world-map__close" onClick={onClose}>
          Schließen
        </button>
      </div>
    </div>
  );
}
