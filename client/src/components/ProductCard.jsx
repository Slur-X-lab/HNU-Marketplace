import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tag, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const conditionLabels = {
  new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor'
};
const conditionColors = {
  new: 'bg-green-100 text-green-700 border-green-200',
  like_new: 'bg-sky-100 text-sky-700 border-sky-200',
  good: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  fair: 'bg-orange-50 text-orange-600 border-orange-200',
  poor: 'bg-red-50 text-red-500 border-red-200',
};

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const images = typeof product.images === 'string'
    ? JSON.parse(product.images || '[]')
    : (product.images || []);
  const thumb = images[0] || null;

  const handleClick = () => {
    if (!user) {
      toast('Sign in to view product details', { icon: '🔒' });
      navigate('/login');
      return;
    }
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-black/8 rounded-xl overflow-hidden cursor-pointer group hover:shadow-md hover:border-[#00ab41]/30 transition-all duration-200"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#f8fbf9] overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <Tag size={32} />
          </div>
        )}

        {/* Condition badge */}
        <span className={`absolute top-2 left-2 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${conditionColors[product.condition_type] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
          {conditionLabels[product.condition_type] || product.condition_type}
        </span>

        {/* Guest lock overlay */}
        {!user && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white border border-black/10 text-gray-700 text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
              <Lock size={10} /> Sign in to view
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-gray-800 text-xs font-medium line-clamp-2 leading-snug min-h-[2.4rem] mb-1.5">
          {product.title}
        </p>
        <p className="text-[#00ab41] font-bold text-sm">
          ₱{parseFloat(product.price).toLocaleString()}
        </p>
        <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-black/5">
          <div className="w-4 h-4 bg-[#00ab41]/10 border border-[#00ab41]/20 rounded-full flex items-center justify-center text-[#00ab41] font-bold text-[9px] shrink-0">
            {product.seller_name?.[0]?.toUpperCase()}
          </div>
          <span className="text-[10px] text-gray-400 truncate">{product.seller_name}</span>
        </div>
      </div>
    </div>
  );
}
