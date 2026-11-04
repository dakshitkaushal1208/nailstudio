import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Label + control + hint/error, wired together for assistive tech.
export function Field({ label, error, hint, optional, children, className = '' }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
          {optional && <span className="field__optional"> optional</span>}
        </label>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && !error && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, error, hint, optional, className, wrapperClass, ...rest }, ref) {
  return (
    <Field label={label} error={error} hint={hint} optional={optional} className={wrapperClass}>
      {(a11y) => <input ref={ref} className={`input ${className || ''}`} {...a11y} {...rest} />}
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, optional, className, wrapperClass, rows = 4, ...rest }, ref) {
  return (
    <Field label={label} error={error} hint={hint} optional={optional} className={wrapperClass}>
      {(a11y) => <textarea ref={ref} rows={rows} className={`input textarea ${className || ''}`} {...a11y} {...rest} />}
    </Field>
  );
});

export function Select({ label, error, hint, optional, options, placeholder, className, wrapperClass, ...rest }) {
  return (
    <Field label={label} error={error} hint={hint} optional={optional} className={wrapperClass}>
      {(a11y) => (
        <select className={`input select ${className || ''}`} {...a11y} {...rest}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            );
          })}
        </select>
      )}
    </Field>
  );
}

export function PasswordInput({ label, error, hint, wrapperClass, ...rest }) {
  const [shown, setShown] = useState(false);
  return (
    <Field label={label} error={error} hint={hint} className={wrapperClass}>
      {(a11y) => (
        <div className="input-wrap">
          <input className="input input--padded" type={shown ? 'text' : 'password'} {...a11y} {...rest} />
          <button type="button" className="input-wrap__btn" onClick={() => setShown((s) => !s)} aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown}>
            {shown ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        </div>
      )}
    </Field>
  );
}
