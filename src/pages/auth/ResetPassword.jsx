import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', code: '', newPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter the code we emailed you">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Email" type="email" name="email" value={form.email} onChange={onChange} required />
        <TextField label="Code" name="code" placeholder="6-digit code" value={form.code} onChange={onChange} required maxLength={6} />
        <TextField label="New password" type="password" name="newPassword" placeholder="At least 8 characters" value={form.newPassword} onChange={onChange} required minLength={8} />
        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
        <Button type="submit" loading={loading}>
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}
