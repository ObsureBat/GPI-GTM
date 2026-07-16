export function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`auth-field ${className}`.trim()} htmlFor={inputId}>
      {label && <span className="auth-field__label">{label}</span>}
      <input id={inputId} className={`auth-field__input${error ? ' auth-field__input--error' : ''}`} {...props} />
      {error && <span className="auth-field__error">{error}</span>}
    </label>
  );
}
