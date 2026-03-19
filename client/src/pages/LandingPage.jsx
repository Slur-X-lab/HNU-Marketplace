import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Shield, MessageCircle, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="w-full aspect-square max-h-[82vh] rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden relative shadow-2xl flex flex-col">

          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-accent/10" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-white/5" />

          {/* Inner content — logo left, title right */}
          <div className="relative z-10 flex items-center justify-between px-10 pt-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <ShoppingBag size={34} className="text-primary" />
              </div>
              <div className="text-white/80 text-sm font-body leading-tight">
                <p className="font-semibold text-white">Holy Name University</p>
                <p>Tagbilaran City, Bohol</p>
              </div>
            </div>
            <h1 className="font-display text-white text-right leading-tight">
              <span className="text-4xl md:text-5xl block">HNU</span>
              <span className="text-4xl md:text-5xl text-accent block">Marketplace</span>
            </h1>
          </div>

          {/* Center content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8">
            <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-4">Students Only · Verified Accounts</p>
            <h2 className="font-display text-white text-3xl md:text-5xl lg:text-6xl leading-tight max-w-2xl">
              Buy & Sell Within <span className="text-accent">Campus</span>
            </h2>
            <p className="text-white/70 mt-5 max-w-md text-base md:text-lg">
              A safe, verified marketplace exclusively for HNU students.
            </p>
            <div className="flex gap-4 mt-8 flex-wrap justify-center">
              <button onClick={() => navigate('/home')} className="bg-accent hover:bg-accent-light text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-accent/30 text-sm md:text-base flex items-center gap-2">
                Browse Listings <ArrowRight size={18} />
              </button>
              <Link to="/register">
                <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all duration-200 text-sm md:text-base">
                  Create Account
                </button>
              </Link>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="relative z-10 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
            {[
              { label: 'Students Only', icon: Shield },
              { label: 'Real-time Chat', icon: MessageCircle },
              { label: 'Verified Sellers', icon: Users },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center justify-center py-5 gap-2">
                <Icon size={20} className="text-accent" />
                <span className="text-white/80 text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
