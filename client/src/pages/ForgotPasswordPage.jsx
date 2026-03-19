import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, ShoppingBag, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@hnu.edu.ph'))
      return toast.error('Only @hnu.edu.ph emails are allowed.');
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow mb-4">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl text-primary">Forgot Password</h1>
          <p className="text-gray-500 mt-1 text-sm">We'll send a reset link to your HNU email</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="card p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">HNU Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="yourname@hnu.edu.ph"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="card p-8 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-display text-xl text-primary mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm">
              If <span className="font-semibold text-primary">{email}</span> is registered, you'll receive a password reset link shortly.
            </p>
            <p className="text-gray-400 text-xs mt-3">The link expires in 1 hour.</p>
          </div>
        )}

        <p className="text-center mt-5">
          <Link to="/login" className="text-sm text-gray-400 hover:text-primary transition-colors">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
