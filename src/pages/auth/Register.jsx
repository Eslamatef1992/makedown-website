import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/layout/AuthLayout';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { CalendarIcon, EyeIcon } from '../../components/ui/icons';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  birthDate: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const birthDateRef = useRef(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const openDatePicker = () => {
    if (birthDateRef.current?.showPicker) birthDateRef.current.showPicker();
    else birthDateRef.current?.focus();
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName || !form.lastName || !form.email || !form.birthDate || !form.phone || !form.password || !form.confirmPassword) {
      setError(t('auth.register.errors.fillRequired'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('auth.register.errors.passwordLength'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('auth.register.errors.passwordMismatch'));
      return;
    }
    if (!form.acceptTerms) {
      setError(t('auth.register.errors.acceptTerms'));
      return;
    }

    navigate('/account-verification', {
      state: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        birthDate: form.birthDate,
        phone: `+965 ${form.phone}`,
        password: form.password,
        acceptTerms: form.acceptTerms,
      },
    });
  };

  return (
    <AuthLayout title={t('auth.register.title')} cardClassName="max-w-lg">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <TextField label={t('auth.register.firstName')} required name="firstName" placeholder={t('auth.register.firstNamePlaceholder')} value={form.firstName} onChange={onChange} />
          <TextField label={t('auth.register.lastName')} required name="lastName" placeholder={t('auth.register.lastNamePlaceholder')} value={form.lastName} onChange={onChange} />
        </div>

        <TextField label={t('auth.register.email')} required type="email" name="email" placeholder={t('auth.login.emailPlaceholder')} value={form.email} onChange={onChange} />

        <TextField
          label={t('auth.register.birthDate')}
          required
          type="date"
          name="birthDate"
          ref={birthDateRef}
          value={form.birthDate}
          onChange={onChange}
          max={new Date().toISOString().slice(0, 10)}
          className="[&::-webkit-calendar-picker-indicator]:opacity-0"
          suffix={
            <button type="button" onClick={openDatePicker} className="text-carissma-300" tabIndex={-1}>
              <CalendarIcon />
            </button>
          }
        />

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-espresso-900">
            {t('auth.register.phone')}<span className="ms-1 text-carnation-600">*</span>
          </span>
          <div className="flex items-stretch overflow-hidden rounded-2xl border border-carissma-200 bg-white">
            <span className="flex items-center gap-1.5 border-e border-carissma-200 bg-carissma-50 px-3 text-sm font-semibold text-espresso-900">
              <span aria-hidden="true">🇰🇼</span>
              +965
            </span>
            <input
              name="phone"
              type="tel"
              placeholder={t('auth.register.phonePlaceholder')}
              value={form.phone}
              onChange={onChange}
              className="w-full bg-transparent px-3 py-3 text-espresso-900 placeholder:text-carissma-300 focus:outline-none"
            />
          </div>
        </label>

        <TextField
          label={t('auth.register.password')}
          required
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder={t('auth.login.passwordPlaceholder')}
          value={form.password}
          onChange={onChange}
          minLength={8}
          suffix={
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-carissma-300" tabIndex={-1}>
              <EyeIcon off={showPassword} />
            </button>
          }
        />
        <TextField
          label={t('auth.register.confirmPassword')}
          required
          type={showConfirm ? 'text' : 'password'}
          name="confirmPassword"
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          value={form.confirmPassword}
          onChange={onChange}
          suffix={
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-carissma-300" tabIndex={-1}>
              <EyeIcon off={showConfirm} />
            </button>
          }
        />

        <label className="flex items-start gap-2 text-sm font-bold text-espresso-900">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={form.acceptTerms}
            onChange={onChange}
            className="mt-0.5 h-4 w-4 rounded accent-carissma-400"
          />
          <span className="underline decoration-espresso-900/50">{t('auth.register.acceptTerms')}</span>
        </label>

        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

        <Button type="submit">{t('auth.register.submit')}</Button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-espresso-900">
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className="font-bold text-carissma-400 hover:underline">
          {t('auth.register.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
