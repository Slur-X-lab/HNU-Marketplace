import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShoppingBag, Tag, MessageCircle, Shield, TrendingUp } from 'lucide-react';

const COURSES = ['BS Computer Science','BS Information Technology','BS Nursing','BS Education','BS Business Administration','BS Accountancy','BS Criminology','BS Tourism','BS Architecture','BS Engineering','Other'];
const YEARS = ['1st Year','2nd Year','3rd Year','4th Year','5th Year','Graduate'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', course: '', year_level: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.toLowerCase().endsWith('@hnu.edu.ph'))
      return toast.error('Only @hnu.edu.ph emails are allowed.');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await axios.post('/api/auth/register', form);
      toast.success('Account created! Please verify your email 📧');
      navigate('/verify-pending', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ fontFamily: 'Inter, sans-serif', background: '#f0faf4' }}>

      {/* ══ CARD BOX ══ */}
      <div className="w-full max-w-3xl flex rounded-3xl min-h-[640px] overflow-hidden shadow-2xl border border-black/8">

        {/* LEFT — green hero */}
        <div className="hidden md:flex w-[45%] flex-col relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #00ab41 0%, #007d30 70%, #005a22 100%)' }}>

          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-20 -right-12 w-64 h-64 rounded-full opacity-10 bg-white" />

          <div className="relative z-10 flex flex-col h-full px-8 py-12">
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

            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-white font-extrabold text-2xl leading-tight mb-3">
                Join the<br />
                <span style={{ color: '#a8f0c0' }}>HNU Community.</span>
              </h2>
              <p className="text-white/65 text-xs leading-relaxed mb-7">
                Create your free account and start buying and selling with verified HNU students today.
              </p>

              <div className="space-y-3.5">
                {[
                  { icon: Shield, label: 'Verified students only' },
                  { icon: Tag, label: 'Free to list items' },
                  { icon: MessageCircle, label: 'Chat with buyers & sellers' },
                  { icon: TrendingUp, label: 'Sell fast on campus' },
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
        <div className="flex-1 bg-white px-8 py-12 flex flex-col justify-center overflow-y-auto">
          <h2 className="font-extrabold text-2xl text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-400 text-sm mb-6">HNU students only · Use your university email</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00ab41]/20 transition-all"
                placeholder="Juan dela Cruz" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">HNU Email</label>
              <input type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00ab41]/20 transition-all"
                placeholder="yourname@hnu.edu.ph" value={form.email} onChange={e => set('email', e.target.value)} required />
              {form.email && !form.email.toLowerCase().endsWith('@hnu.edu.ph') && (
                <p className="text-red-500 text-xs mt-1">Must end in @hnu.edu.ph</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00ab41]/20 transition-all pr-10"
                  placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00ab41]/20 transition-all bg-white"
                  value={form.course} onChange={e => set('course', e.target.value)}>
                  <option value="">Select</option>
                  {COURSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year Level</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00ab41]/20 transition-all bg-white"
                  value={form.year_level} onChange={e => set('year_level', e.target.value)}>
                  <option value="">Select</option>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-60 shadow mt-1"
              style={{ background: '#00ab41' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-bold hover:underline" style={{ color: '#00ab41' }}>Sign in</Link>
          </p>
          <p className="text-center mt-3">
            <Link to="/" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
