import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CircleAlert } from 'lucide-react';
import { AuthShell } from '../components/forms/AuthShell';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { isEmail, isPhone, passwordIssues } from '../utils/validate';

const EMPTY = { name: '', email: '', phone: '', password: '', confirm: '' };

export default function RegisterPage() {
  usePageMeta('Create an account');
  const { user, ready, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = location.state?.from;

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (ready && user && !busy) return <Navigate to={from || '/account'} replace />;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
    setFormError('');
  };

  const validate = () => {
    const issues = passwordIssues(form.password);
    return {
      name: form.name.trim().length < 2 ? 'Enter your full name.' : '',
      email: !form.email.trim() ? 'Enter your email address.' : !isEmail(form.email) ? 'That does not look like an email address.' : '',
      phone: !form.phone.trim() ? 'Enter a phone number so the studio can reach you.' : !isPhone(form.phone) ? 'Enter a valid 10-digit mobile number.' : '',
      password: issues.length ? `Your password needs ${issues.join(' and ')}.` : '',
      confirm: form.confirm !== form.password ? 'The two passwords do not match.' : '',
    };
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setBusy(true);
    setFormError('');
    try {
      const { name, email, phone, password } = form;
      const u = await register({ name, email, phone, password });
      toast(`Welcome, ${u.name.split(' ')[0]}. Your account is ready.`);
      navigate(from || '/account', { replace: true });
    } catch (err) {
      setFormError(err.message || 'We could not create your account. Please try again.');
      setErrors((er) => ({ ...er, ...err.fieldErrors }));
      setBusy(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Join the studio"
      title={
        <>
          Create <em>an account.</em>
        </>
      }
      intro="One account for your appointment requests and your press-on orders."
      footer={
        <>
          Already registered? <Link to="/login" state={{ from }}>Log in</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="auth__form">
        {formError && (
          <div className="notice notice--bad" role="alert">
            <CircleAlert size={18} aria-hidden />
            <p>{formError}</p>
          </div>
        )}
        <Input label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <div className="form-grid">
          <Input label="Email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} error={errors.email} />
          <Input label="Phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} error={errors.phone} hint="Used only to confirm bookings and orders." />
        </div>
        <div className="form-grid">
          <PasswordInput label="Password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="At least 8 characters, with a letter and a number." />
          <PasswordInput label="Confirm password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        </div>
        <Button type="submit" size="lg" loading={busy} className="btn--block">
          Create account
        </Button>
        <p className="auth__fine">
          By creating an account you agree to the <Link to="/terms">terms</Link> and acknowledge the <Link to="/privacy">privacy policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
