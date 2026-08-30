import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const CODE_LENGTH = 4;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

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
    if (!isComplete) {
      setError(`Enter the full ${CODE_LENGTH}-digit code`);
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
      setCooldown(60);
    } catch {
      setError('Could not resend the code. Try again shortly.');
    }
  };

  return (
    <AuthLayout title="OTP Code" subtitle="The Verification Code Has Been Sent To This Email Address">
      <form onSubmit={onSubmit} className="space-y-6">
        <p className="text-center text-sm font-bold text-espresso-900">{email}</p>

        <div className="flex justify-center gap-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-16 w-16 rounded-2xl border border-carissma-200 bg-white text-center text-xl font-bold text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-400"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-carissma-400">
            Remaining time: <span className="font-bold text-espresso-900">{formatTime(cooldown)} S</span>
          </span>
          <button
            type="button"
            onClick={onResend}
            disabled={cooldown > 0}
            className="font-bold text-espresso-900 underline decoration-espresso-900/50 disabled:cursor-not-allowed disabled:text-espresso-400 disabled:no-underline"
          >
            Resend Code
          </button>
        </div>

        {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

        <Button type="submit" loading={loading} variant={isComplete ? 'primary' : 'soft'} disabled={!isComplete}>
          Verify Account
        </Button>
      </form>
    </AuthLayout>
  );
}
