import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const CODE_LENGTH = 6;

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = digits.join('');
    if (code.length !== CODE_LENGTH) {
      setError('Enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const result = await verifyOtp({ email, code, purpose: 'register' });
      navigate(result?.accessToken ? '/' : '/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    try {
      await resendOtp({ email, purpose: 'register' });
      setCooldown(30);
    } catch {
      setError('Could not resend the code. Try again shortly.');
    }
  };

  return (
    <AuthLayout title="Enter verification code" subtitle={email ? `We sent a code to ${email}` : ''}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-2xl border border-linen-300 text-center text-xl font-semibold text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          ))}
        </div>

        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

        <Button type="submit" loading={loading}>
          Verify
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-espresso-600">
        Didn't get the code?{' '}
        <button
          onClick={onResend}
          disabled={cooldown > 0}
          className="font-semibold text-carissma-600 hover:underline disabled:cursor-not-allowed disabled:text-espresso-400"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </p>
    </AuthLayout>
  );
}
