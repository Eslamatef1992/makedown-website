import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join Make Down and start playing">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Full name" name="fullName" placeholder="Sara Al-Fahad" value={form.fullName} onChange={onChange} required />
        <TextField label="Email" type="email" name="email" placeholder="example@gmail.com" value={form.email} onChange={onChange} required />
        <TextField label="Phone" name="phone" placeholder="+965 5xx xxxxx" value={form.phone} onChange={onChange} />
        <TextField label="Password" type="password" name="password" placeholder="At least 8 characters" value={form.password} onChange={onChange} required minLength={8} />
        <TextField label="Confirm password" type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={onChange} required />

        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

        <Button type="submit" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-espresso-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-carissma-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
