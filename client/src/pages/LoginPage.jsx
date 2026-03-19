import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShoppingBag, Tag, MessageCircle, Shield, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.toLowerCase().endsWith('@hnu.edu.ph'))
      return toast.error('Only @hnu.edu.ph emails are allowed.');
    setLoading(true);
    setUnverified(false);
    try {
      const { data } = await axios.post('/api/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      const res = err.response?.data;
      if (res?.requiresVerification) {
        setUnverified(true);
        toast.error('Please verify your email first.');
      } else {
        toast.error(res?.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post('/api/auth/resend-verification', { email: form.email });
      toast.success('Verification email resent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ fontFamily: 'Inter, sans-serif', background: '#f0faf4' }}>

      {/* ══ CARD BOX ══ */}
      <div className="w-full max-w-3xl flex rounded-3xl min-h-[580px] overflow-hidden shadow-2xl border border-black/8">

        {/* LEFT — green hero */}
        <div className="hidden md:flex w-[45%] flex-col relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #00ab41 0%, #007d30 70%, #005a22 100%)' }}>

          {/* Decorative blobs */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-20 -right-12 w-64 h-64 rounded-full opacity-10 bg-white" />

          <div className="relative z-10 flex flex-col h-full px-8 py-14">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow overflow-hidden">
                <img src="/assets/logo.png" alt="HNU" className="w-9 h-9 object-contain"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                <div style={{display:'none'}} className="w-full h-full items-center justify-center">
                  <ShoppingBag size={22} className="text-[#00ab41]" />
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-base leading-none">HNU Marketplace</p>
                <p className="text-white/55 text-[11px] mt-0.5">Holy Name University</p>
              </div>
            </div>

            {/* Headline */}
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-white font-extrabold text-2xl leading-tight mb-3">
                Buy & Sell<br />
                <span style={{ color: '#a8f0c0' }}>Within Campus.</span>
              </h2>
              <p className="text-white/65 text-xs leading-relaxed mb-7">
                The exclusive marketplace for HNU students. Trade books, gadgets, uniforms — all verified, all trusted.
              </p>

              <div className="space-y-3.5">
                {[
                  { icon: Shield, label: 'Verified students only' },
                  { icon: MessageCircle, label: 'Real-time chat' },
                  { icon: Tag, label: 'Student-friendly prices' },
                  { icon: TrendingUp, label: 'Easy listings' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,255,255,0.18)' }}>
                      <Icon size={14} className="text-white" />
                    </div>
                    <span className="text-white/80 text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-white/35 text-[10px] mt-8">
              🎓 Exclusively for HNU · Tagbilaran City, Bohol
            </p>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 bg-white px-8 py-14 flex flex-col justify-center">
          <h2 className="font-extrabold text-2xl text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-gray-400 text-sm mb-7">Sign in with your HNU student email</p>

          {unverified && (
            <div className="border rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
              style={{ background: '#fffbeb', borderColor: '#fcd34d' }}>
              <span className="text-base mt-0.5">✉️</span>
              <div>
                <p className="text-yellow-800 text-sm font-semibold">Email not verified</p>
                <p className="text-yellow-600 text-xs mt-0.5">Check your inbox for the verification code.</p>
                <button onClick={handleResend} disabled={resending}
                  className="text-xs text-yellow-700 font-bold underline mt-1 disabled:opacity-60">
                  {resending ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">HNU Email</label>
              <input type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[#00ab41]/20"
                style={{ borderColor: form.email && !form.email.endsWith('@hnu.edu.ph') ? '#ef4444' : '' }}
                placeholder="yourname@hnu.edu.ph"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              {form.email && !form.email.toLowerCase().endsWith('@hnu.edu.ph') && (
                <p className="text-red-500 text-xs mt-1">Must end in @hnu.edu.ph</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: '#00ab41' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00ab41]/20 transition-all pr-10"
                  placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-60 shadow mt-1"
              style={{ background: '#00ab41' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            No account yet?{' '}
            <Link to="/register" className="font-bold hover:underline" style={{ color: '#00ab41' }}>Register here</Link>
          </p>
          <p className="text-center mt-3">
            <Link to="/" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
