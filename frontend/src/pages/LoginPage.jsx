import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CircleAlert, KeyRound } from 'lucide-react';
import { AuthShell } from '../components/forms/AuthShell';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { DEV_ACCOUNTS } from '../services/authService';
import { USE_MOCK } from '../config';
import { isEmail } from '../utils/validate';

export default function LoginPage() {
  usePageMeta('Log in');
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (ready && user && !busy) return <Navigate to={from || (user.role === 'ADMIN' ? '/admin' : '/account')} replace />;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
    setFormError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {
      email: !form.email.trim() ? 'Enter your email address.' : !isEmail(form.email) ? 'That does not look like an email address.' : '',
      password: form.password ? '' : 'Enter your password.',
    };
    setErrors(next);
    if (next.email || next.password) return;

    setBusy(true);
    setFormError('');
    try {
      const u = await login({ email: form.email.trim(), password: form.password });
      navigate(from || (u.role === 'ADMIN' ? '/admin' : '/account'), { replace: true });
    } catch (err) {
      setFormError(err.message || 'We could not log you in. Please try again.');
      setErrors((er) => ({ ...er, ...err.fieldErrors }));
      setBusy(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={
        <>
          Log in to <em>your account.</em>
        </>
      }
      intro="See your appointment requests, follow your orders and check out faster."
      footer={
        <>
          New here? <Link to="/register" state={{ from }}>Create an account</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="auth__form">
        {from && <p className="notice notice--plain"><KeyRound size={18} aria-hidden /><span>Please log in to continue.</span></p>}
        {formError && (
          <div className="notice notice--bad" role="alert">
            <CircleAlert size={18} aria-hidden />
            <p>{formError}</p>
          </div>
        )}
        <Input label="Email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} error={errors.email} />
        <PasswordInput label="Password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        <p className="auth__fine"><Link to="/forgot-password">Forgot your password?</Link></p>
        <Button type="submit" size="lg" loading={busy} className="btn--block">
          Log in
        </Button>
      </form>

      {USE_MOCK && (
        <div className="devbox">
          <p className="devbox__title">Development accounts</p>
          <p className="devbox__text">Sample sign-ins for testing only. They exist in this browser and nowhere else.</p>
          <ul>
            {DEV_ACCOUNTS.map((a) => (
              <li key={a.email}>
                <div>
                  <strong>{a.label}</strong>
                  <span>
                    {a.email} · {a.password}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setForm({ email: a.email, password: a.password });
                    setErrors({});
                    setFormError('');
                  }}
                >
                  Fill in
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AuthShell>
  );
}
