import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function AccountVerification() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state;

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signupData?.email) navigate('/register');
  }, [signupData, navigate]);

  if (!signupData?.email) return null;

  const onSendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await register(signupData);
      navigate('/verify-otp', { state: { email: signupData.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Account Verification">
      <div className="space-y-2">
        <span className="block text-sm font-bold text-espresso-900">Your Email</span>
        <div className="flex items-center justify-between rounded-2xl border border-carissma-200 bg-carissma-100/70 px-4 py-3">
          <span className="text-sm font-semibold text-espresso-900">{signupData.email}</span>
          <Link
            to="/change-email"
            state={signupData}
            className="text-sm font-bold text-carissma-400 hover:underline"
          >
            Change Email
          </Link>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-espresso-800">
        You Will Recive An OTP Code By Email To Verify Your Account
      </p>

      {error && <p className="mt-4 rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

      <Button type="button" onClick={onSendOtp} loading={loading} className="mt-6">
        Send OTP
      </Button>
    </AuthLayout>
  );
}
