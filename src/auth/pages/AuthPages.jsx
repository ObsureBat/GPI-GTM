import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { Input } from '../components/Input.jsx';
import { PasswordInput } from '../components/PasswordInput.jsx';
import { Button } from '../components/Button.jsx';
import '../auth.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRedirect(user, searchParams) {
  const custom = searchParams.get('redirect');
  if (custom) return decodeURIComponent(custom);
  return user.role === 'admin' ? '/admin/dashboard' : '/';
}

export function SignIn() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={getRedirect(user, searchParams)} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const u = await login(email.trim(), password, rememberMe);
      toast.success('Signed in successfully');
      navigate(getRedirect(u, searchParams), { replace: true });
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      toast.error(err.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your GPI account"
      footer={
        <p className="auth-card__footer">
          Don&apos;t have an account? <Link to="/sign-up">Sign Up</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <label className="auth-check">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember me</span>
        </label>
        <Button type="submit" loading={busy} className="auth-btn--block">
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
}

export function SignUp() {
  const { user, signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={getRedirect(user, searchParams)} replace />;

  function validate() {
    const next = {};
    if (!name.trim()) next.name = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Invalid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    return next;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const u = await signup(name.trim(), email.trim(), password, confirmPassword);
      toast.success('Account created successfully');
      navigate(getRedirect(u, searchParams), { replace: true });
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      toast.error(err.message || 'Sign up failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join GPI Industries store"
      footer={
        <p className="auth-card__footer">
          Already have an account? <Link to="/sign-in">Sign In</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <Input
          label="Full Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
        <Button type="submit" loading={busy} className="auth-btn--block">
          Sign Up
        </Button>
      </form>
    </AuthLayout>
  );
}
