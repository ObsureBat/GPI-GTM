export function Button({ children, loading, variant = 'primary', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`auth-btn auth-btn--${variant}${loading ? ' auth-btn--loading' : ''} ${className}`.trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="auth-btn__spinner" aria-hidden="true" /> : null}
      <span>{loading ? 'Please wait…' : children}</span>
    </button>
  );
}
