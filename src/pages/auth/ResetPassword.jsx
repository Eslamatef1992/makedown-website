import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function ResetPassword() {
  const { t } = useTranslation();
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
      setError(err.response?.data?.message || t('auth.resetPassword.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('auth.resetPassword.title')} subtitle={t('auth.resetPassword.subtitle')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label={t('auth.resetPassword.email')} type="email" name="email" value={form.email} onChange={onChange} required />
        <TextField label={t('auth.resetPassword.code')} name="code" placeholder={t('auth.resetPassword.codePlaceholder')} value={form.code} onChange={onChange} required maxLength={6} />
        <TextField label={t('auth.resetPassword.newPassword')} type="password" name="newPassword" placeholder={t('auth.resetPassword.newPasswordPlaceholder')} value={form.newPassword} onChange={onChange} required minLength={8} />
        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
        <Button type="submit" loading={loading}>
          {t('auth.resetPassword.submit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
