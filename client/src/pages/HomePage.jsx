import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Search, X, LogIn, UserPlus, Bell, ShoppingBag, LogOut, PlusCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const CAT_IMAGES = {
  'Books & Modules':     '/categories/books.png',
  'Electronics':         '/categories/electronics.png',
  'Uniforms & Clothing': '/categories/uniform.png',
  'School Supplies':     '/categories/supplies.png',
  'Food & Beverages':    '/categories/food.png',
  'Services':            '/categories/services.png',
  'Dormitory Items':     '/categories/dorm.png',
  'Others':              '/categories/others.png',
};

const CAT_EMOJI = {
  'Books & Modules': '📚', 'Electronics': '💻', 'Uniforms & Clothing': '👕',
  'School Supplies': '✏️', 'Food & Beverages': '🍱', 'Services': '🛠️',
  'Dormitory Items': '🛏️', 'Others': '📦',
};

export default function HomePage() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      params.sort = sort;
      const { data } = await axios.get('/api/products', { params });
      setProducts(data);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [search, selectedCategory, sort]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };
  const handleCategory = (cat) => {
    if (selectedCategory == cat.id) { setSelectedCategory(''); setSelectedCategoryName(''); }
    else { setSelectedCategory(cat.id); setSelectedCategoryName(cat.name); }
  };

  return (
    <div className="min-h-screen" style={{ background: '#f0faf4', fontFamily: 'Inter, sans-serif' }}>

      {/* ══ HEADER ══ */}
      <header className="sticky top-0 z-50 shadow-md" style={{ background: '#00ab41' }}>

        {/* Row 1: Logo + Auth */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none" onClick={() => navigate('/')}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden border-2 border-white/40">
              <img src="/assets/logo.png" alt="HNU" className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div style={{display:'none'}} className="w-full h-full items-center justify-center">
                <ShoppingBag size={24} className="text-[#00ab41]" />
              </div>
            </div>
            <div className="leading-none">
              <p className="text-white font-extrabold text-lg sm:text-xl tracking-tight leading-none">HNU</p>
              <p className="text-white/75 text-[10px] font-medium mt-0.5">Marketplace</p>
            </div>
          </div>

          {/* Search — visible on md+ inline, hidden on small (shown below) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 rounded-xl overflow-hidden border-2 border-white/25 focus-within:border-white/60 transition-all shadow-sm">
            <input
              className="flex-1 px-4 py-2.5 text-sm bg-white outline-none text-gray-800 placeholder-gray-400"
              placeholder="Search products, books, uniforms..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); }}
                className="bg-white px-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={14} />
              </button>
            )}
            <button type="submit" className="px-5 text-white transition-colors flex items-center gap-1.5 text-sm font-semibold" style={{ background: '#007d30' }}>
              <Search size={16} /> Search
            </button>
          </form>

          {/* Auth / User */}
          <div className="shrink-0 flex items-center gap-1.5 ml-auto md:ml-0">
            {user ? (
              <>
                <button onClick={() => navigate('/sell')}
                  className="hidden sm:flex bg-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors items-center gap-1.5 text-sm"
                  style={{ color: '#00ab41' }}>
                  <PlusCircle size={15} /> Sell
                </button>
                <button onClick={() => navigate('/chat')}
                  className="relative text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 border-2 border-[#00ab41]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <button onClick={() => navigate('/profile')}
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center font-extrabold text-sm cursor-pointer shadow-md"
                  style={{ color: '#00ab41' }}>
                  {user.name?.[0]?.toUpperCase()}
                </button>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <button onClick={() => navigate('/login')}
                  className="text-white/90 hover:text-white text-sm font-medium flex items-center gap-1 px-3 py-2 hover:bg-white/10 rounded-xl transition-colors">
                  <LogIn size={14} /> Sign In
                </button>
                <button onClick={() => navigate('/register')}
                  className="bg-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors text-sm"
                  style={{ color: '#00ab41' }}>
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Search on mobile (shown only on small screens) */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="flex rounded-xl overflow-hidden border-2 border-white/25 focus-within:border-white/60 transition-all shadow-sm">
            <input
              className="flex-1 px-4 py-2.5 text-sm bg-white outline-none text-gray-800 placeholder-gray-400"
              placeholder="Search products, books, uniforms..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); }}
                className="bg-white px-2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
            <button type="submit" className="px-4 text-white flex items-center" style={{ background: '#007d30' }}>
              <Search size={16} />
            </button>
          </form>
        </div>

      </header>

      {/* ══ BODY ══ */}
      <div className="max-w-7xl mx-auto px-5 py-5 space-y-4">

        {/* Guest notice */}
        {!user && (
          <div className="bg-white border border-black/8 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              👋 Browsing as guest —
              <span className="font-semibold" style={{ color: '#00ab41' }}> sign in</span> to view products & chat with sellers.
            </p>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => navigate('/login')}
                className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:text-white"
                style={{ color: '#00ab41', borderColor: '#00ab41' }}
                onMouseEnter={e => { e.target.style.background='#00ab41'; e.target.style.color='white'; }}
                onMouseLeave={e => { e.target.style.background=''; e.target.style.color='#00ab41'; }}>
                Sign In
              </button>
              <button onClick={() => navigate('/register')}
                className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors"
                style={{ background: '#00ab41' }}>
                Register
              </button>
            </div>
          </div>
        )}

        {/* ══ CATEGORIES ══ */}
        <div className="bg-white border border-black/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-base">Categories</h2>
            {selectedCategoryName && (
              <button onClick={() => { setSelectedCategory(''); setSelectedCategoryName(''); }}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                <X size={12} /> Clear filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {categories.map(c => (
              <button key={c.id} onClick={() => handleCategory(c)}
                className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl transition-all border-2 ${
                  selectedCategory == c.id ? 'bg-[#f0faf4]' : 'border-transparent hover:border-black/8 hover:bg-gray-50'
                }`}
                style={ selectedCategory == c.id ? { borderColor: '#00ab41' } : {} }>
                {/* Category image filled */}
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2"
                  style={{ borderColor: selectedCategory == c.id ? '#00ab41' : 'rgba(0,0,0,0.08)' }}>
                  <img src={CAT_IMAGES[c.name]} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-center leading-tight font-semibold"
                  style={{ color: selectedCategory == c.id ? '#00ab41' : '#6b7280' }}>
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ══ PRODUCTS ══ */}
        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-5 rounded-full" style={{ background: '#00ab41' }} />
              <h2 className="font-bold text-gray-900 text-sm">
                {selectedCategoryName ? selectedCategoryName : search ? `Results for "${search}"` : 'All Listings'}
              </h2>
              {!loading && (
                <span className="text-xs text-gray-400 bg-gray-100 border border-black/5 px-2.5 py-0.5 rounded-full">
                  {products.length} items
                </span>
              )}
            </div>
            <select
              className="text-sm border border-black/10 rounded-xl px-3 py-2 outline-none text-gray-700 bg-white transition-colors"
              value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-black/5 overflow-hidden">
                    <div className="aspect-square bg-gray-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-3">🛍️</p>
                <p className="text-gray-500 font-semibold text-sm">No items found</p>
                <p className="text-gray-400 text-xs mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
