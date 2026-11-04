import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AdminPage } from '../../components/layout/AdminLayout';
import { Section, Switch } from '../../components/admin/AdminBits';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { ErrorState, Loading } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService } from '../../services/adminService';
import { uid } from '../../services/mock/db';
import { WEEKDAYS, minutes } from '../../utils/date';

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const INTERVALS = [15, 30, 45, 60].map((n) => ({ value: String(n), label: `Every ${n} minutes` }));

export default function AvailabilityPage() {
  usePageMeta('Availability');
  const toast = useToast();
  const { data, loading, error, retry } = useAsync(() => adminService.getAvailability(), []);
  const [form, setForm] = useState(null);
  const [problems, setProblems] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading) return <Loading block label="Loading availability" />;
  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (!form) return null;

  const setDay = (d, patch) => setForm((f) => ({ ...f, weekly: { ...f.weekly, [d]: { ...f.weekly[d], ...patch } } }));
  const setList = (key, id, patch) => setForm((f) => ({ ...f, [key]: f[key].map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const remove = (key, id) => setForm((f) => ({ ...f, [key]: f[key].filter((x) => x.id !== id) }));

  const validate = () => {
    const out = [];
    ORDER.forEach((d) => {
      const day = form.weekly[d];
      if (day.open && minutes(day.end) <= minutes(day.start)) out.push(`${WEEKDAYS[d]}: closing time must be after opening time.`);
    });
    form.breaks.forEach((b) => {
      if (!b.start || !b.end || minutes(b.end) <= minutes(b.start)) out.push(`Break “${b.label || 'untitled'}”: end must be after start.`);
    });
    form.blocked.forEach((b) => {
      if (!b.start || !b.end || b.end < b.start) out.push(`Blocked period “${b.label || 'untitled'}”: choose a start date and an end date on or after it.`);
    });
    return out;
  };

  const save = async () => {
    const out = validate();
    setProblems(out);
    if (out.length) return;
    setBusy(true);
    try {
      await adminService.saveAvailability({ ...form, slotIntervalMin: Number(form.slotIntervalMin) });
      toast('Availability saved.');
    } catch (err) {
      toast(err.message, { tone: 'bad' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      title="Availability"
      intro="Opening days and hours, breaks, and dates when the studio is closed. Customers can only request times that fit."
      actions={<Button onClick={save} loading={busy}>Save availability</Button>}
    >
      {problems.length > 0 && (
        <div className="notice notice--bad" role="alert" style={{ marginBottom: 24 }}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {problems.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      )}

      <div className="avail">
        <Section title="Weekly hours">
          <ul className="hours">
            {ORDER.map((d) => {
              const day = form.weekly[d];
              return (
                <li key={d} className={day.open ? '' : 'is-closed'}>
                  <Switch checked={day.open} onChange={(open) => setDay(d, { open })} label={WEEKDAYS[d]} />
                  {day.open ? (
                    <div className="hours__times">
                      <Input aria-label={`${WEEKDAYS[d]} opens`} type="time" value={day.start} onChange={(e) => setDay(d, { start: e.target.value })} />
                      <span aria-hidden>to</span>
                      <Input aria-label={`${WEEKDAYS[d]} closes`} type="time" value={day.end} onChange={(e) => setDay(d, { end: e.target.value })} />
                    </div>
                  ) : (
                    <span className="muted">Closed</span>
                  )}
                </li>
              );
            })}
          </ul>
          <div style={{ marginTop: 22, maxWidth: 260 }}>
            <Select label="Appointment start times" value={String(form.slotIntervalMin)} onChange={(e) => setForm({ ...form, slotIntervalMin: e.target.value })} options={INTERVALS} />
          </div>
        </Section>

        <div className="avail__side">
          <Section title="Breaks" action={<Button size="sm" variant="secondary" onClick={() => setForm((f) => ({ ...f, breaks: [...f.breaks, { id: uid('brk'), label: '', start: '13:00', end: '14:00' }] }))}><Plus size={14} aria-hidden /> Add</Button>}>
            <p className="muted" style={{ marginTop: 0 }}>Daily pauses on open days. No appointment can overlap one.</p>
            {form.breaks.length === 0 && <p className="muted">No breaks set.</p>}
            <ul className="rowlist">
              {form.breaks.map((b) => (
                <li key={b.id}>
                  <Input aria-label="Break name" placeholder="Name, e.g. Lunch" value={b.label} onChange={(e) => setList('breaks', b.id, { label: e.target.value })} />
                  <Input aria-label="Break starts" type="time" value={b.start} onChange={(e) => setList('breaks', b.id, { start: e.target.value })} />
                  <Input aria-label="Break ends" type="time" value={b.end} onChange={(e) => setList('breaks', b.id, { end: e.target.value })} />
                  <button type="button" className="icon-btn" onClick={() => remove('breaks', b.id)} aria-label="Remove break"><Trash2 size={16} aria-hidden /></button>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Holidays & blocked dates" action={<Button size="sm" variant="secondary" onClick={() => setForm((f) => ({ ...f, blocked: [...f.blocked, { id: uid('blk'), label: '', start: '', end: '' }] }))}><Plus size={14} aria-hidden /> Add</Button>}>
            <p className="muted" style={{ marginTop: 0 }}>Whole days when no appointments can be requested.</p>
            {form.blocked.length === 0 && <p className="muted">No dates blocked.</p>}
            <ul className="rowlist rowlist--stack">
              {form.blocked.map((b) => (
                <li key={b.id}>
                  <Input aria-label="Reason" placeholder="Reason, e.g. Diwali" value={b.label} onChange={(e) => setList('blocked', b.id, { label: e.target.value })} />
                  <Input aria-label="From" type="date" value={b.start} onChange={(e) => setList('blocked', b.id, { start: e.target.value, end: b.end && b.end >= e.target.value ? b.end : e.target.value })} />
                  <Input aria-label="To" type="date" min={b.start} value={b.end} onChange={(e) => setList('blocked', b.id, { end: e.target.value })} />
                  <button type="button" className="icon-btn" onClick={() => remove('blocked', b.id)} aria-label="Remove blocked dates"><Trash2 size={16} aria-hidden /></button>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </AdminPage>
  );
}
