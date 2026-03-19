import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, ChevronLeft, ChevronRight, Tag, LogIn } from 'lucide-react';

const conditionLabels = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' };

export default function ProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const startChat = async () => {
    if (!user) {
      toast('Sign in to chat with the seller', { icon: '🔒' });
      return navigate('/login');
    }
    if (product.seller_id === user.id) return toast.error("That's your own listing!");
    setChatLoading(true);
    try {
      const { data } = await axios.post('/api/chat/conversations', {
        product_id: product.id,
        seller_id: product.seller_id,
      });
      navigate(`/chat/${data.id}`);
    } catch {
      toast.error('Could not start chat.');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return <div className="text-center py-24 text-gray-400">Product not found.</div>;

  const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
            {images.length > 0 ? (
              <>
                <img src={images[imgIndex]} alt={product.title} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setImgIndex(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300"><Tag size={60} /></div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIndex(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${i === imgIndex ? 'border-primary' : 'border-transparent'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="font-display text-2xl text-gray-900 leading-tight">{product.title}</h1>
            <span className={`badge shrink-0 mt-1 ${product.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {product.status === 'available' ? 'Available' : product.status}
            </span>
          </div>

          <p className="text-3xl font-bold text-primary mb-4">₱{parseFloat(product.price).toLocaleString()}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge bg-accent/10 text-accent-dark">{product.category_name || 'General'}</span>
            <span className="badge bg-gray-100 text-gray-600">Condition: {conditionLabels[product.condition_type] || product.condition_type}</span>
          </div>

          {product.description && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-1">Description</p>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Seller */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Seller</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {product.seller_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{product.seller_name}</p>
                <p className="text-gray-400 text-xs">{product.seller_course || 'HNU Student'}</p>
              </div>
            </div>
          </div>

          {/* Action button */}
          {!user ? (
            <div className="space-y-3">
              <button onClick={startChat} className="btn-primary flex items-center justify-center gap-2 py-3.5 text-base w-full">
                <LogIn size={20} /> Sign in to Chat with Seller
              </button>
              <p className="text-center text-xs text-gray-400">
                Don't have an account?{' '}
                <a href="/register" className="text-primary font-semibold hover:underline">Register here</a>
              </p>
            </div>
          ) : product.seller_id === user.id ? (
            <div className="text-center py-3 bg-primary/5 rounded-xl text-primary text-sm font-medium">
              This is your listing
            </div>
          ) : product.status === 'available' ? (
            <button onClick={startChat} disabled={chatLoading} className="btn-primary flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60">
              <MessageCircle size={20} />
              {chatLoading ? 'Opening chat...' : 'Chat with Seller'}
            </button>
          ) : (
            <div className="text-center py-3 bg-red-50 rounded-xl text-red-500 text-sm font-medium">
              This item is no longer available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
