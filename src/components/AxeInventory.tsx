import { Axe } from './Axe';
import './AxeInventory.css';

interface AxeInventoryProps {
  total: number;
  thrown: number;
}

/** Zeigt alle Äxte des Levels als Reihe: verbraucht = grau, übrig = normal. */
export function AxeInventory({ total, thrown }: AxeInventoryProps) {
  return (
    <div className="axe-inventory">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`axe-inventory__slot ${i < thrown ? 'axe-inventory__slot--used' : ''}`}>
          <Axe size={22} />
        </div>
      ))}
    </div>
  );
}
