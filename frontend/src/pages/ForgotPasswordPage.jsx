import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleAlert, MailCheck } from 'lucide-react';
import { AuthShell } from '../components/forms/AuthShell';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Field';
import { useToast } from '../context/ToastContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { authService } from '../services/authService';
import { USE_MOCK } from '../config';
import { isEmail, passwordIssues } from '../utils/validate';

const RESEND_SECONDS = 60;

// Step 1: enter your email -> we email a 6-digit code.  Step 2: enter the code + a new password.
export default function ForgotPasswordPage() {
  usePageMeta('Reset password');
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [info, setInfo] = useState('');
  const [devCode, setDevCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = async () => {
    setBusy(true);
    setFormError('');
    try {
      const res = await authService.forgotPassword({ email: email.trim() });
      setDevCode(USE_MOCK ? res?.devCode || '' : '');
      setInfo('If an account exists for that email, we have sent a 6-digit code. It expires in 10 minutes.');
      setStep('code');
      setWait(RESEND_SECONDS);
    } catch (err) {
      setFormError(err.message || 'We could not send the code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    const msg = !email.trim() ? 'Enter your email address.' : !isEmail(email) ? 'That does not look like an email address.' : '';
    setErrors({ email: msg });
    if (!msg) await sendCode();
  };

  const submitReset = async (e) => {
    e.preventDefault();
    const issues = passwordIssues(password);
    const next = {
      code: /^\d{6}$/.test(code.trim()) ? '' : 'Enter the 6-digit code from your email.',
      password: issues.length ? `Your password needs ${issues.join(' and ')}.` : '',
      confirm: confirm !== password ? 'The two passwords do not match.' : '',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setBusy(true);
    setFormError('');
    try {
      await authService.resetPassword({ email: email.trim(), code: code.trim(), newPassword: password });
      toast('Your password has been changed. Please log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      setFormError(err.message || 'We could not reset your password. Please try again.');
      setErrors((er) => ({ ...er, ...err.fieldErrors }));
      setBusy(false);
    }
  };

  const clear = (key) => () => {
    setErrors((er) => ({ ...er, [key]: '' }));
    setFormError('');
  };

  const error = formError && (
    <div className="notice notice--bad" role="alert">
      <CircleAlert size={18} aria-hidden />
      <p>{formError}</p>
    </div>
  );

  return (
    <AuthShell
      eyebrow="Account help"
      title={
        <>
          Reset <em>your password.</em>
        </>
      }
      intro={step === 'email' ? 'Enter your email and we will send you a 6-digit verification code.' : 'Enter the code we emailed you and choose a new password.'}
      footer={
        <>
          Remembered it? <Link to="/login">Log in</Link>
        </>
      }
    >
      {step === 'email' ? (
        <form onSubmit={submitEmail} noValidate className="auth__form">
          {error}
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear('email')();
            }}
            error={errors.email}
          />
          <Button type="submit" size="lg" loading={busy} className="btn--block">
            Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={submitReset} noValidate className="auth__form">
          <p className="notice notice--plain" role="status">
            <MailCheck size={18} aria-hidden />
            <span>{info}</span>
          </p>
          {USE_MOCK && devCode && (
            <p className="notice notice--plain">
              <span>
                Demo mode: no email is sent. Your code is <strong>{devCode}</strong>.
              </span>
            </p>
          )}
          {error}
          <Input
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              clear('code')();
            }}
            error={errors.code}
          />
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear('password')();
            }}
            error={errors.password}
            hint="At least 8 characters, with a letter and a number."
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              clear('confirm')();
            }}
            error={errors.confirm}
          />
          <Button type="submit" size="lg" loading={busy} className="btn--block">
            Change password
          </Button>
          <p className="auth__fine">
            Did not get it? Check your spam folder, or{' '}
            <button type="button" className="linklike" disabled={wait > 0 || busy} onClick={sendCode}>
              {wait > 0 ? `send a new code in ${wait}s` : 'send a new code'}
            </button>
            . <button type="button" className="linklike" onClick={() => { setStep('email'); setCode(''); setFormError(''); }}>Use a different email</button>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
