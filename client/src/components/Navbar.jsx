import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ShoppingBag, MessageCircle, PlusCircle, LogOut, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (location.pathname === '/' || location.pathname === '/home') return null;

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ background: '#00ab41', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
            <img src="/assets/logo.png" alt="HNU" className="w-7 h-7 object-contain"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <ShoppingBag size={16} className="text-[#00ab41] hidden" />
          </div>
          <span className="text-white font-bold text-sm">HNU <span className="text-white/70">Market</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Browse</Link>
          {user && (
            <>
              <Link to="/sell" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive('/sell') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Sell</Link>
              <Link to="/my-listings" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive('/my-listings') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>My Listings</Link>
            </>
          )}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {/* Messages with badge */}
              <Link to="/chat" className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <MessageCircle size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[#00ab41]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/sell" className="bg-white text-[#00ab41] hover:bg-green-50 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <PlusCircle size={13} /> List Item
              </Link>
              <Link to="/profile" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#00ab41] font-bold text-xs">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-white/90 text-xs font-medium">{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white/80 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors px-3 py-1.5 hover:bg-white/10 rounded-lg">
                <LogIn size={13} /> Sign In
              </Link>
              <Link to="/register" className="bg-white text-[#00ab41] hover:bg-green-50 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <UserPlus size={13} /> Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <button className="md:hidden p-1.5 text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1" style={{ background: '#009938' }}>
          <Link to="/" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-white/80">Browse</Link>
          {user ? (
            <>
              <Link to="/sell" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-white/80">Sell</Link>
              <Link to="/my-listings" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-white/80">My Listings</Link>
              <Link to="/chat" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-white/80 flex items-center gap-2">
                Messages
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-white/80">Profile</Link>
              <button onClick={handleLogout} className="py-2 text-sm text-red-300 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-white/80">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-white font-semibold">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
