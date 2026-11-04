import { useEffect, useState } from 'react';
import { AdminPage } from '../../components/layout/AdminLayout';
import { Section } from '../../components/admin/AdminBits';
import { Button } from '../../components/ui/Button';
import { Confirm } from '../../components/ui/Confirm';
import { Input, Textarea } from '../../components/ui/Field';
import { ErrorState, Loading } from '../../components/ui/States';
import { useStudio } from '../../context/StudioContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService, resetDevData } from '../../services/adminService';
import { USE_MOCK } from '../../config';

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

export default function SettingsPage() {
  usePageMeta('Settings');
  const toast = useToast();
  const { refresh } = useStudio();
  const { data, loading, error, retry } = useAsync(() => adminService.getSettings(), []);
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);

  if (loading) return <Loading block label="Loading settings" />;
  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (!s) return null;

  const at = (group, key) => (e) => {
    setS((cur) => ({ ...cur, [group]: { ...cur[group], [key]: e.target.value } }));
    setErrors((er) => ({ ...er, [`${group}.${key}`]: '' }));
  };
  const top = (key) => (e) => setS((cur) => ({ ...cur, [key]: e.target.value }));
  const para = (i) => (e) =>
    setS((cur) => ({ ...cur, copy: { ...cur.copy, aboutParagraphs: cur.copy.aboutParagraphs.map((p, j) => (j === i ? e.target.value : p)) } }));

  const save = async (e) => {
    e.preventDefault();
    const next = {};
    if (!s.studioName.trim()) next.studioName = 'The studio needs a name.';
    const b = s.bookingPolicy;
    ['cancelHoursBefore', 'minNoticeHours', 'maxDaysAhead'].forEach((k) => {
      if (!(Number(b[k]) >= 0)) next[`bookingPolicy.${k}`] = 'Enter a number, 0 or more.';
    });
    if (!(Number(b.chairs) >= 1)) next['bookingPolicy.chairs'] = 'At least 1.';
    const d = s.deliveryPolicy;
    if (d.charge !== null && d.charge !== '' && !(Number(d.charge) >= 0)) next['deliveryPolicy.charge'] = 'Enter an amount, or leave blank.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await adminService.saveSettings({
        ...s,
        studioName: s.studioName.trim(),
        bookingPolicy: { ...b, cancelHoursBefore: Number(b.cancelHoursBefore), minNoticeHours: Number(b.minNoticeHours), maxDaysAhead: Number(b.maxDaysAhead), chairs: Number(b.chairs) },
        deliveryPolicy: { ...d, charge: num(d.charge), freeAbove: num(d.freeAbove) },
      });
      await refresh();
      toast('Settings saved.');
    } catch (err) {
      toast(err.message, { tone: 'bad' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      title="Settings"
      intro="The studio’s profile, policies and the wording on the website."
      actions={<Button onClick={save} loading={busy}>Save settings</Button>}
    >
      <form onSubmit={save} noValidate className="sform">
        <Section title="Studio profile">
          <div className="form-grid">
            <Input label="Studio name" value={s.studioName} onChange={top('studioName')} error={errors.studioName} />
            <Input label="Tagline" value={s.tagline} onChange={top('tagline')} />
          </div>
        </Section>

        <Section title="Contact details">
          <p className="muted" style={{ marginTop: 0 }}>Shown in the website footer and on order pages. Leave a field blank to hide it.</p>
          <div className="form-grid">
            <Input label="Phone" type="tel" value={s.contact.phone} onChange={at('contact', 'phone')} />
            <Input label="Email" type="email" value={s.contact.email} onChange={at('contact', 'email')} />
            <Textarea wrapperClass="span-2" label="Address" rows={2} value={s.contact.address} onChange={at('contact', 'address')} />
            <Input wrapperClass="span-2" label="Map link" optional placeholder="https://maps.google.com/…" value={s.contact.mapUrl} onChange={at('contact', 'mapUrl')} />
            <Input label="Instagram" optional placeholder="https://instagram.com/…" value={s.social.instagram} onChange={at('social', 'instagram')} />
            <Input label="Facebook" optional placeholder="https://facebook.com/…" value={s.social.facebook} onChange={at('social', 'facebook')} />
            <Input wrapperClass="span-2" label="WhatsApp link" optional placeholder="https://wa.me/91…" value={s.social.whatsapp} onChange={at('social', 'whatsapp')} />
          </div>
        </Section>

        <Section title="Business hours">
          <p className="muted" style={{ marginTop: 0 }}>Booking times come from Availability. This is the wording shown to visitors.</p>
          <Input label="Hours note" optional placeholder="e.g. Tuesday to Saturday, 10 am to 7 pm" value={s.hoursNote} onChange={top('hoursNote')} />
        </Section>

        <Section title="Booking policy">
          <div className="form-grid form-grid--4">
            <Input label="Cancel up to (hours before)" type="number" min="0" value={s.bookingPolicy.cancelHoursBefore} onChange={at('bookingPolicy', 'cancelHoursBefore')} error={errors['bookingPolicy.cancelHoursBefore']} />
            <Input label="Minimum notice (hours)" type="number" min="0" value={s.bookingPolicy.minNoticeHours} onChange={at('bookingPolicy', 'minNoticeHours')} error={errors['bookingPolicy.minNoticeHours']} />
            <Input label="Book up to (days ahead)" type="number" min="0" value={s.bookingPolicy.maxDaysAhead} onChange={at('bookingPolicy', 'maxDaysAhead')} error={errors['bookingPolicy.maxDaysAhead']} />
            <Input label="Appointments at once" type="number" min="1" value={s.bookingPolicy.chairs} onChange={at('bookingPolicy', 'chairs')} error={errors['bookingPolicy.chairs']} hint="Chairs or artists available." />
          </div>
          <Textarea label="Policy wording" rows={3} value={s.bookingPolicy.text} onChange={at('bookingPolicy', 'text')} hint="Shown on the booking page." wrapperClass="mt" />
        </Section>

        <Section title="Delivery policy">
          <div className="form-grid">
            <Input label="Delivery charge (₹)" optional type="number" min="0" value={s.deliveryPolicy.charge ?? ''} onChange={at('deliveryPolicy', 'charge')} error={errors['deliveryPolicy.charge']} hint="Leave blank if you agree the charge with each customer." />
            <Input label="Free delivery above (₹)" optional type="number" min="0" value={s.deliveryPolicy.freeAbove ?? ''} onChange={at('deliveryPolicy', 'freeAbove')} />
          </div>
          <Textarea label="Policy wording" rows={3} value={s.deliveryPolicy.text} onChange={at('deliveryPolicy', 'text')} hint="Shown at checkout." wrapperClass="mt" />
        </Section>

        <Section title="Website wording">
          <div className="stack">
            <Input label="Homepage headline" value={s.copy.heroTitle} onChange={at('copy', 'heroTitle')} />
            <Textarea label="Homepage introduction" rows={3} value={s.copy.heroText} onChange={at('copy', 'heroText')} />
            <Input label="About heading" value={s.copy.aboutTitle} onChange={at('copy', 'aboutTitle')} />
            {s.copy.aboutParagraphs.map((p, i) => (
              <Textarea key={i} label={`About paragraph ${i + 1}`} rows={4} value={p} onChange={para(i)} />
            ))}
          </div>
        </Section>

        <div className="btn-row pform__save">
          <Button type="submit" size="lg" loading={busy}>Save settings</Button>
        </div>
      </form>

      {USE_MOCK && (
        <Section title="Development data" className="asec--quiet">
          <p className="muted" style={{ marginTop: 0 }}>Everything here is sample data stored in this browser. Reset it to return to the original sample content.</p>
          <Button variant="secondary" onClick={() => setResetting(true)}>Reset sample data</Button>
        </Section>
      )}
      <Confirm
        open={resetting}
        title="Reset all sample data?"
        message="Bookings, orders, products, gallery entries and settings in this browser return to the original samples. Your cart and sign-in are cleared."
        confirmLabel="Reset"
        tone="danger"
        onConfirm={() => {
          resetDevData();
          try {
            localStorage.removeItem('nailstudio.cart');
            sessionStorage.clear();
          } catch {
            /* ignore */
          }
          window.location.assign('/');
        }}
        onClose={() => setResetting(false)}
      />
    </AdminPage>
  );
}
