import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, CircleAlert, Clock3, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Field';
import { SmartImage } from '../components/ui/SmartImage';
import { ErrorState, Loading, SampleNote } from '../components/ui/States';
import { Calendar } from '../components/bookings/Calendar';
import { useAuth } from '../context/AuthContext';
import { useStudio } from '../context/StudioContext';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { bookingService } from '../services/bookingService';
import { studioService } from '../services/studioService';
import { addDays, formatDateLong, formatDuration, formatTime, toISODate, todayISO } from '../utils/date';
import { formatPrice } from '../utils/format';
import { isEmail, isPhone } from '../utils/validate';
import { USE_MOCK } from '../config';

const DRAFT_KEY = 'nailstudio.bookingdraft';
const STEPS = ['Service', 'Date & time', 'Your details', 'Review'];

const readDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
  } catch {
    return null;
  }
};

function Slots({ serviceId, date, value, onPick }) {
  const { data, loading, error, retry } = useAsync(() => bookingService.slots({ date, serviceId }), [date, serviceId]);
  if (loading) return <Loading label="Checking times" />;
  if (error) return <ErrorState error={error} onRetry={retry} title="Times did not load" />;
  const open = data.filter((s) => s.available);
  if (!data.length || !open.length) {
    return (
      <p className="notice notice--plain" role="status">
        <Info size={18} aria-hidden />
        <span>No times are free on this day for this service. Please choose another date.</span>
      </p>
    );
  }
  return (
    <div className="slots" role="group" aria-label="Start times">
      {data.map((s) => (
        <button
          key={s.time}
          type="button"
          className="slot"
          disabled={!s.available}
          aria-pressed={value === s.time}
          title={s.available ? undefined : s.reason}
          aria-label={`${formatTime(s.time)}${s.available ? '' : `, unavailable: ${s.reason}`}`}
          onClick={() => onPick(s.time)}
        >
          {formatTime(s.time)}
        </button>
      ))}
    </div>
  );
}

export default function BookingPage() {
  usePageMeta('Book an appointment');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useStudio();

  const { data: services, loading, error, retry } = useAsync(() => studioService.listServices(), []);

  const [draft] = useState(() => (params.get('service') ? null : readDraft()));
  const [step, setStep] = useState(draft?.step ?? 0);
  const [serviceId, setServiceId] = useState(params.get('service') || draft?.serviceId || '');
  const [date, setDate] = useState(draft?.date || '');
  const [time, setTime] = useState(draft?.time || '');
  const [contact, setContact] = useState(draft?.contact || { name: '', phone: '', email: '' });
  const [notes, setNotes] = useState(draft?.notes || '');
  const [month, setMonth] = useState(() => {
    const base = draft?.date ? new Date(`${draft.date}T00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  // Start from the first step when arriving from a service link.
  const serviceParam = params.get('service');
  useEffect(() => {
    if (serviceParam) setStep(1);
  }, [serviceParam]);

  // Prefill contact from the account once, without overwriting what was typed.
  useEffect(() => {
    if (user) {
      setContact((c) => ({ name: c.name || user.name, phone: c.phone || user.phone || '', email: c.email || user.email }));
    }
  }, [user]);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, serviceId, date, time, contact, notes }));
    } catch {
      /* draft is a convenience only */
    }
  }, [step, serviceId, date, time, contact, notes]);

  const service = services?.find((s) => s.id === serviceId);

  const range = useMemo(() => {
    const from = new Date(month.getFullYear(), month.getMonth(), 1);
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return { from: toISODate(from), to: toISODate(to) };
  }, [month]);
  const { data: days, loading: daysLoading } = useAsync(() => bookingService.days(range), [range.from]);

  const maxMonth = useMemo(() => {
    const ahead = settings?.bookingPolicy?.maxDaysAhead ?? 60;
    return addDays(new Date(), ahead);
  }, [settings]);

  // A saved draft may point at a service that has since been removed.
  useEffect(() => {
    if (services && serviceId && !services.some((s) => s.id === serviceId)) {
      setServiceId('');
      setTime('');
      setStep(0);
    }
  }, [services, serviceId]);

  const chooseService = (id) => {
    if (id !== serviceId) setTime('');
    setServiceId(id);
    setFormError('');
  };

  const validateContact = () => ({
    name: contact.name.trim().length < 2 ? 'Enter your name.' : '',
    phone: !isPhone(contact.phone) ? 'Enter a valid 10-digit mobile number.' : '',
    email: !isEmail(contact.email) ? 'Enter a valid email address.' : '',
  });

  const canNext = [!!serviceId, !!date && !!time, true, true][step];

  const next = () => {
    if (step === 2) {
      const errs = validateContact();
      setErrors(errs);
      if (Object.values(errs).some(Boolean)) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    setBusy(true);
    setFormError('');
    try {
      const booking = await bookingService.create({
        userId: user.id,
        serviceId,
        date,
        time,
        contact: { name: contact.name.trim(), phone: contact.phone.trim(), email: contact.email.trim() },
        notes,
      });
      sessionStorage.removeItem(DRAFT_KEY);
      navigate(`/my-bookings/${booking.id}?new=1`, { replace: true });
    } catch (err) {
      setFormError(err.message || 'We could not send your request. Please try again.');
      if (err.status === 409) {
        setTime('');
        setStep(1);
      }
      setBusy(false);
    }
  };

  if (loading) return <Loading block label="Loading services" />;
  if (error) return <div className="container"><ErrorState error={error} onRetry={retry} /></div>;

  const policy = settings?.bookingPolicy;

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Appointments</p>
        <h1 className="h-page">
          Request <em>an appointment.</em>
        </h1>
        <p className="lede">{policy?.text || 'Choose a service and a time. The studio reviews every request before it is confirmed.'}</p>
        <SampleNote>Sample services, prices and opening hours for development. Availability shown here is not the studio’s real calendar.</SampleNote>
      </header>

      <ol className="wizard" aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
            <button type="button" onClick={() => i < step && setStep(i)} disabled={i >= step}>
              <span className="wizard__n">{i < step ? <Check size={14} aria-hidden /> : i + 1}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="booking">
        <div className="booking__main">
          {step === 0 && (
            <section aria-labelledby="s0">
              <h2 id="s0" className="booking__h">Choose a service</h2>
              <div className="svc-pick" role="radiogroup" aria-labelledby="s0">
                {services.map((s) => (
                  <button key={s.id} type="button" role="radio" aria-checked={serviceId === s.id} className="svc-pick__item" onClick={() => chooseService(s.id)}>
                    <SmartImage src={s.image} alt="" className="svc-pick__img" />
                    <span className="svc-pick__body">
                      <span className="svc-pick__cat">{s.category}</span>
                      <strong>{s.name}</strong>
                      <span className="svc-pick__desc">{s.description}</span>
                      <span className="svc-pick__meta">
                        <Clock3 size={14} aria-hidden /> {formatDuration(s.durationMin)}
                        {typeof s.price === 'number' && <> · from {formatPrice(s.price)}</>}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 1 && service && (
            <section aria-labelledby="s1">
              <h2 id="s1" className="booking__h">Pick a date and time</h2>
              <div className="when">
                <Calendar
                  month={month}
                  onMonth={setMonth}
                  days={days || {}}
                  loading={daysLoading}
                  value={date}
                  minMonth={new Date()}
                  maxMonth={maxMonth}
                  onSelect={(iso) => {
                    setDate(iso);
                    setTime('');
                  }}
                />
                <div className="when__times">
                  {date ? (
                    <>
                      <h3 className="when__date">{formatDateLong(date)}</h3>
                      <p className="muted when__note">Start times for {service.name.toLowerCase()} ({formatDuration(service.durationMin)}).</p>
                      <Slots serviceId={serviceId} date={date} value={time} onPick={setTime} />
                    </>
                  ) : (
                    <p className="muted when__empty">Choose a highlighted date to see the available start times.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="s2">
              <h2 id="s2" className="booking__h">Your details</h2>
              {!user ? (
                <div className="gate">
                  <p className="gate__title">Sign in to send your request</p>
                  <p className="muted">Your choices are saved. Log in or create an account, then you will return here to finish.</p>
                  <div className="btn-row">
                    <Button as={Link} to="/login" state={{ from: '/book' }}>Log in</Button>
                    <Button as={Link} to="/register" state={{ from: '/book' }} variant="secondary">Create an account</Button>
                  </div>
                </div>
              ) : (
                <div className="form-grid">
                  <Input wrapperClass="span-2" label="Name" autoComplete="name" value={contact.name} error={errors.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                  <Input label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={contact.phone} error={errors.phone} hint="The studio may call to confirm." onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                  <Input label="Email" type="email" autoComplete="email" value={contact.email} error={errors.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                  <Textarea wrapperClass="span-2" label="Notes for the studio" optional rows={4} value={notes} maxLength={500} hint="Shape, length, colours, or a reference you plan to bring." onChange={(e) => setNotes(e.target.value)} />
                </div>
              )}
            </section>
          )}

          {step === 3 && service && (
            <section aria-labelledby="s3">
              <h2 id="s3" className="booking__h">Review your request</h2>
              <dl className="kv review">
                <dt>Service</dt>
                <dd>{service.name}</dd>
                <dt>Date</dt>
                <dd>{formatDateLong(date)}</dd>
                <dt>Time</dt>
                <dd>{formatTime(time)} · about {formatDuration(service.durationMin)}</dd>
                <dt>Contact</dt>
                <dd>
                  {contact.name}
                  <br />
                  {contact.phone} · {contact.email}
                </dd>
                {notes.trim() && (
                  <>
                    <dt>Notes</dt>
                    <dd>{notes}</dd>
                  </>
                )}
              </dl>
              <p className="notice">
                <Info size={18} aria-hidden />
                <span>
                  This is a <strong>request</strong>, not a confirmed booking. It stays <em>awaiting approval</em> until the studio accepts it, and you can follow its status under My Bookings.
                </span>
              </p>
              {USE_MOCK && (
                <p className="notice notice--plain" style={{ marginTop: 12 }}>
                  <Info size={18} aria-hidden />
                  <span>Development mode: the request is saved in this browser only. The studio will not receive it.</span>
                </p>
              )}
              {formError && (
                <div className="notice notice--bad" role="alert" style={{ marginTop: 12 }}>
                  <CircleAlert size={18} aria-hidden />
                  <p>{formError}</p>
                </div>
              )}
            </section>
          )}

          <div className="booking__nav">
            {step > 0 ? (
              <Button variant="ghost" onClick={back} disabled={busy}>
                <ArrowLeft size={16} aria-hidden /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              !(step === 2 && !user) && (
                <Button onClick={next} disabled={!canNext}>
                  Continue
                </Button>
              )
            ) : (
              <Button size="lg" onClick={submit} loading={busy} disabled={!user}>
                Send request
              </Button>
            )}
          </div>
        </div>

        <aside className="booking__side" aria-label="Your request so far">
          <h2>Your request</h2>
          {service ? (
            <>
              <SmartImage src={service.image} alt="" className="booking__thumb" />
              <p className="booking__svc">{service.name}</p>
              <p className="muted booking__meta">
                {formatDuration(service.durationMin)}
                {typeof service.price === 'number' && <> · from {formatPrice(service.price)}</>}
              </p>
            </>
          ) : (
            <p className="muted">No service chosen yet.</p>
          )}
          <dl className="booking__when">
            <div>
              <dt>Date</dt>
              <dd>{date ? formatDateLong(date) : '—'}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{time ? formatTime(time) : '—'}</dd>
            </div>
          </dl>
          <p className="booking__fine">Final prices are confirmed by the studio. Requests can be cancelled up to {policy?.cancelHoursBefore ?? 24} hours beforehand.</p>
        </aside>
      </div>
    </div>
  );
}
