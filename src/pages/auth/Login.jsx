import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { EyeIcon } from '../../components/ui/icons';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
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
      const message = err.response?.data?.message || t('common.somethingWentWrong');
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
    <AuthLayout title={t('auth.login.title')}>
      <form onSubmit={onSubmit} className="space-y-5">
        <TextField
          label={t('auth.login.email')}
          required
          type="email"
          name="email"
          placeholder="example@gmail.com"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
        />
        <TextField
          label={t('auth.login.password')}
          required
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="enter password"
          value={form.password}
          onChange={onChange}
          autoComplete="current-password"
          suffix={
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-carissma-300" tabIndex={-1}>
              <EyeIcon off={showPassword} />
            </button>
          }
        />

        <div className="flex items-center justify-end text-sm">
          <Link to="/forgot-password" className="font-bold text-carissma-400 hover:underline">
            {t('auth.login.forgetPassword')}
          </Link>
        </div>

        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

        <Button type="submit" loading={loading}>
          {t('auth.login.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-espresso-900">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-bold text-carissma-400 hover:underline">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  );
}
