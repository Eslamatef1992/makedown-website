import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      setTimeout(() => navigate('/reset-password', { state: { email } }), 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="We'll email you a reset code">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Email" type="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {sent && <p className="rounded-xl bg-carissma-50 px-3 py-2 text-sm text-carissma-700">Check your inbox for a reset code.</p>}
        <Button type="submit" loading={loading}>
          Send reset code
        </Button>
      </form>
    </AuthLayout>
  );
}
