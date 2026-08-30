import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';

export default function ChangeEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state;

  const [email, setEmail] = useState(signupData?.email || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!signupData?.email) navigate('/register');
  }, [signupData, navigate]);

  if (!signupData?.email) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    navigate('/account-verification', { state: { ...signupData, email } });
  };

  return (
    <AuthLayout title="Change Email">
      <form onSubmit={onSubmit} className="space-y-5">
        <TextField
          label="Your Email"
          type="email"
          placeholder="dina@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
        <Button type="submit">Save</Button>
      </form>
    </AuthLayout>
  );
}
