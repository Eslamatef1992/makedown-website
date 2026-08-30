import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      setError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.acceptTerms) {
      setError('Please accept the Terms And Conditions');
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
    <AuthLayout title="Create Account" cardClassName="max-w-lg">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Enter First Name" required name="firstName" placeholder="enter first name" value={form.firstName} onChange={onChange} />
          <TextField label="Enter Last Name" required name="lastName" placeholder="enter last name" value={form.lastName} onChange={onChange} />
        </div>

        <TextField label="Enter Email" required type="email" name="email" placeholder="example@gmail.com" value={form.email} onChange={onChange} />

        <TextField
          label="Birth Date"
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
            Phone Number<span className="ms-1 text-carnation-600">*</span>
          </span>
          <div className="flex items-stretch overflow-hidden rounded-2xl border border-carissma-200 bg-white">
            <span className="flex items-center gap-1.5 border-e border-carissma-200 bg-carissma-50 px-3 text-sm font-semibold text-espresso-900">
              <span aria-hidden="true">🇰🇼</span>
              +965
            </span>
            <input
              name="phone"
              type="tel"
              placeholder="enter phone number"
              value={form.phone}
              onChange={onChange}
              className="w-full bg-transparent px-3 py-3 text-espresso-900 placeholder:text-carissma-300 focus:outline-none"
            />
          </div>
        </label>

        <TextField
          label="Enter Password"
          required
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="enter password"
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
          label="Confirm Password"
          required
          type={showConfirm ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="confirm password"
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
          <span className="underline decoration-espresso-900/50">Acceptance Of Terms And Conditions.</span>
        </label>

        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

        <Button type="submit">Sign Up</Button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-espresso-900">
        Already Have An Account?{' '}
        <Link to="/login" className="font-bold text-carissma-400 hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
