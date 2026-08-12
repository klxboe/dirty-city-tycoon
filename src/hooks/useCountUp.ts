import { useEffect, useState } from 'react';

/**
 * Zählt von 0 auf `target` hoch, für Belohnungs-Anzeigen. Läuft über
 * requestAnimationFrame statt über einen Interval-Timer, damit die Zahl
 * mit der Bildwiederholrate mitläuft und nicht ruckelt.
 */
export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }

    let frameId: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      // Weich ausklingen (easeOutCubic), damit die letzten Zahlen langsamer kommen.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs]);

  return value;
}
