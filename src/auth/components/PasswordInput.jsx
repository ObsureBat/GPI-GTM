import { useState } from 'react';

export function PasswordInput({ label, error, id, className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  const inputId = id || props.name;
  return (
    <label className={`auth-field ${className}`.trim()} htmlFor={inputId}>
      {label && <span className="auth-field__label">{label}</span>}
      <div className="auth-field__password">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`auth-field__input${error ? ' auth-field__input--error' : ''}`}
          {...props}
        />
        <button
          type="button"
          className="auth-field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? '🙈' : '👁'}
        </button>
      </div>
      {error && <span className="auth-field__error">{error}</span>}
    </label>
  );
}
