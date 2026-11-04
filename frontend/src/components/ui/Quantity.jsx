import { Minus, Plus } from 'lucide-react';

export function Quantity({ value, onChange, max = 99, min = 1, label = 'Quantity', disabled }) {
  const set = (n) => onChange(Math.min(Math.max(n, min), max));
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => set(value - 1)} disabled={disabled || value <= min} aria-label="Decrease quantity">
        <Minus size={15} aria-hidden />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => set(value + 1)} disabled={disabled || value >= max} aria-label="Increase quantity">
        <Plus size={15} aria-hidden />
      </button>
    </div>
  );
}
