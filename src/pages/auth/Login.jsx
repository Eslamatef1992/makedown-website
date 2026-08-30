import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || '/');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      if (status === 403) {
        navigate('/verify-otp', { state: { email: form.email } });
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to Make Down">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          name="email"
          placeholder="example@gmail.com"
          value={form.email}
          onChange={onChange}
          required
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={onChange}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-espresso-700">
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={onChange} className="rounded" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-carissma-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

        <Button type="submit" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-espresso-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-carissma-600 hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
