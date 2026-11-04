import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, formatDateLong, toISODate, todayISO } from '../../utils/date';

const HEAD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Month grid, Monday first. `days` maps ISO date -> bookable (true/false);
// anything not marked bookable cannot be chosen. `renderDay` lets the admin
// calendar reuse the grid with its own content.
export function Calendar({ month, onMonth, days = {}, value, onSelect, loading, minMonth, maxMonth, renderDay, selectable, className = '' }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const rows = cells.slice(35).every((d) => d.getMonth() !== month.getMonth()) ? 35 : 42;

  const label = month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const prev = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const canPrev = !minMonth || prev >= new Date(minMonth.getFullYear(), minMonth.getMonth(), 1);
  const canNext = !maxMonth || next <= new Date(maxMonth.getFullYear(), maxMonth.getMonth(), 1);
  const today = todayISO();

  return (
    <div className={`cal ${className} ${loading ? 'is-loading' : ''}`} aria-busy={loading || undefined}>
      <div className="cal__head">
        <button type="button" className="icon-btn" onClick={() => onMonth(prev)} disabled={!canPrev} aria-label="Previous month">
          <ChevronLeft size={18} aria-hidden />
        </button>
        <h3 aria-live="polite">{label}</h3>
        <button type="button" className="icon-btn" onClick={() => onMonth(next)} disabled={!canNext} aria-label="Next month">
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>
      <div className="cal__grid" role="grid" aria-label={label}>
        {HEAD.map((h) => (
          <span key={h} className="cal__dow" role="columnheader">
            {h}
          </span>
        ))}
        {cells.slice(0, rows).map((d) => {
          const iso = toISODate(d);
          const inMonth = d.getMonth() === month.getMonth();
          const ok = selectable ? selectable(iso) : !!days[iso];
          const cls = ['cal__day', !inMonth && 'is-out', ok && 'is-open', iso === value && 'is-selected', iso === today && 'is-today'].filter(Boolean).join(' ');
          if (renderDay) {
            return (
              <div key={iso} className={cls} role="gridcell">
                {renderDay(iso, d, inMonth)}
              </div>
            );
          }
          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              className={cls}
              disabled={!ok || !inMonth}
              aria-pressed={iso === value}
              aria-label={`${formatDateLong(iso)}${ok ? '' : ', not available'}`}
              onClick={() => onSelect(iso)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
