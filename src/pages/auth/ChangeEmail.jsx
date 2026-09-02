import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';

export default function ChangeEmail() {
  const { t } = useTranslation();
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
      setError(t('auth.changeEmail.invalidEmail'));
      return;
    }
    navigate('/account-verification', { state: { ...signupData, email } });
  };

  return (
    <AuthLayout title={t('auth.changeEmail.title')}>
      <form onSubmit={onSubmit} className="space-y-5">
        <TextField
          label={t('auth.changeEmail.yourEmail')}
          type="email"
          placeholder={t('auth.changeEmail.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
        <Button type="submit">{t('common.save')}</Button>
      </form>
    </AuthLayout>
  );
}
