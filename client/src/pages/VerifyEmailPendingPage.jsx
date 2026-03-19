import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, RefreshCw, Mail } from 'lucide-react';

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1); // only last char
    setDigits(newDigits);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (value && index === 5) {
      const code = [...newDigits.slice(0, 5), value.slice(-1)].join('');
      if (code.length === 6) handleVerify(code);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    if (!email) return toast.error('Session expired. Please register again.');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/verify-email', { email, code });
      toast.success(data.message);
      login(data.token, data.user);
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) return toast.error('Please enter the full 6-digit code.');
    handleVerify(code);
  };

  const handleResend = async () => {
    if (!email) return toast.error('Email not found. Please register again.');
    setResending(true);
    try {
      await axios.post('/api/auth/resend-verification', { email });
      toast.success('New code sent! Check your inbox.');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow mb-4">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl text-primary">Verify your email</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            We sent a 6-digit code to<br />
            <span className="font-semibold text-primary">{email || 'your email'}</span>
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit}>
            {/* Code inputs */}
            <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
                    ${digit ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-900'}
                    focus:border-primary focus:bg-primary/5`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mb-6">
              ⏱ Code expires in 15 minutes
            </p>

            <button
              type="submit"
              disabled={loading || digits.join('').length < 6}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : 'Verify Email'}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center mt-5">
            {countdown > 0 ? (
              <p className="text-sm text-gray-400">
                Resend code in <span className="font-semibold text-primary">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline mx-auto disabled:opacity-60"
              >
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>
        </div>

        {/* Wrong email? */}
        <div className="text-center mt-5 flex items-center justify-center gap-1.5 text-sm text-gray-400">
          <Mail size={14} />
          <span>Wrong email?</span>
          <a href="/register" className="text-primary font-semibold hover:underline">Register again</a>
        </div>

      </div>
    </div>
  );
}
