import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const { t } = useTranslation();
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
    <AuthLayout title={t('auth.forgotPassword.title')} subtitle={t('auth.forgotPassword.subtitle')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label={t('auth.forgotPassword.email')} type="email" placeholder={t('auth.forgotPassword.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
        {sent && <p className="rounded-xl bg-carissma-50 px-3 py-2 text-sm text-carissma-700">{t('auth.forgotPassword.checkInbox')}</p>}
        <Button type="submit" loading={loading}>
          {t('auth.forgotPassword.submit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
