import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminPage } from '../../components/layout/AdminLayout';
import { Switch, Thumb } from '../../components/admin/AdminBits';
import { Button } from '../../components/ui/Button';
import { Confirm } from '../../components/ui/Confirm';
import { Input, Textarea } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, Loading } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService } from '../../services/adminService';
import { formatDuration } from '../../utils/date';
import { formatPrice } from '../../utils/format';

const BLANK = { name: '', category: '', description: '', durationMin: 60, price: '', image: '', active: true };

function ServiceForm({ service, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(service ? { ...service, price: service.price ?? '' } : BLANK);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: '' }));
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminService.saveService(form);
      toast(service ? 'Service saved.' : 'Service added.');
      onSaved();
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setBusy(false);
      if (!Object.keys(err.fieldErrors || {}).length) toast(err.message, { tone: 'bad' });
    }
  };

  return (
    <Modal open onClose={busy ? undefined : onClose} title={service ? 'Edit service' : 'Add a service'} size="lg">
      <form onSubmit={save} noValidate>
        <div className="form-grid">
          <Input label="Name" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Category" value={form.category} onChange={set('category')} hint="e.g. Gel polish, Extensions." />
          <Textarea wrapperClass="span-2" label="Description" rows={3} value={form.description} onChange={set('description')} />
          <Input label="Duration (minutes)" type="number" min="15" step="15" inputMode="numeric" value={form.durationMin} onChange={set('durationMin')} error={errors.durationMin} hint="Used to decide which start times are free." />
          <Input label="Price (₹)" optional type="number" min="0" step="50" inputMode="numeric" value={form.price} onChange={set('price')} error={errors.price} hint="Leave blank to show no price." />
          <Input wrapperClass="span-2" label="Image address" optional placeholder="https://… or /images/…" value={form.image} onChange={set('image')} />
        </div>
        <div style={{ marginTop: 22 }}>
          <Switch checked={form.active} onChange={(v) => setForm((f) => ({ ...f, active: v }))} label={form.active ? 'Bookable by customers' : 'Hidden from customers'} />
        </div>
        <div className="btn-row" style={{ marginTop: 26 }}>
          <Button type="submit" loading={busy}>{service ? 'Save changes' : 'Add service'}</Button>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function ServicesAdminPage() {
  usePageMeta('Services');
  const toast = useToast();
  const { data, loading, error, retry, reload } = useAsync(() => adminService.listServices(), []);
  const [editing, setEditing] = useState(undefined);
  const [removing, setRemoving] = useState(null);

  const toggle = async (s) => {
    try {
      await adminService.saveService({ ...s, active: !s.active });
      toast(s.active ? `${s.name} is hidden.` : `${s.name} is bookable.`);
      reload();
    } catch (err) {
      toast(err.message, { tone: 'bad' });
    }
  };

  return (
    <AdminPage
      title="Services"
      intro="What customers can book, how long it takes, and what it costs."
      actions={<Button onClick={() => setEditing(null)}><Plus size={16} aria-hidden /> Add service</Button>}
    >
      {loading && !data && <Loading block label="Loading services" />}
      {error && <ErrorState error={error} onRetry={retry} />}
      {data && data.length === 0 && <EmptyState title="No services yet">Add the treatments you offer so customers can book them.</EmptyState>}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Duration</th>
                <th className="t-right">Price</th>
                <th>Bookable</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className={s.active ? '' : 'is-off'}>
                  <td>
                    <div className="cellprod">
                      <Thumb src={s.image} />
                      <div>
                        <strong>{s.name}</strong>
                        <span className="muted clamp">{s.description}</span>
                      </div>
                    </div>
                  </td>
                  <td>{s.category}</td>
                  <td>{formatDuration(s.durationMin)}</td>
                  <td className="t-right num">{typeof s.price === 'number' ? formatPrice(s.price) : '—'}</td>
                  <td><Switch checked={s.active} onChange={() => toggle(s)} label={s.active ? 'Yes' : 'No'} /></td>
                  <td>
                    <div className="table-actions">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(s)}><Pencil size={14} aria-hidden /> Edit</Button>
                      <button type="button" className="icon-btn" onClick={() => setRemoving(s)} aria-label={`Delete ${s.name}`}><Trash2 size={16} aria-hidden /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && <ServiceForm service={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); reload(); }} />}
      <Confirm
        open={!!removing}
        title="Delete this service?"
        message={removing ? `${removing.name} will be removed from the list. Existing bookings keep their record. To stop it being booked without deleting, switch it off instead.` : ''}
        confirmLabel="Delete service"
        tone="danger"
        onConfirm={async () => {
          try {
            await adminService.removeService(removing.id);
            toast('Service deleted.');
            reload();
          } catch (err) {
            toast(err.message, { tone: 'bad' });
            throw err;
          }
        }}
        onClose={() => setRemoving(null)}
      />
    </AdminPage>
  );
}
