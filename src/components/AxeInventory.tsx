import { Axe } from './Axe';
import './AxeInventory.css';

interface AxeInventoryProps {
  total: number;
  thrown: number;
  skin: string;
}

/** Zeigt alle Äxte des Levels als Reihe: verbraucht = grau, übrig = normal. */
export function AxeInventory({ total, thrown, skin }: AxeInventoryProps) {
  return (
    <div className="axe-inventory">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`axe-inventory__slot ${i < thrown ? 'axe-inventory__slot--used' : ''}`}
          style={{ ['--bob-delay' as string]: `${(i % 4) * 0.2}s` }}
        >
          <Axe size={30} skin={skin} />
        </div>
      ))}
    </div>
  );
}
