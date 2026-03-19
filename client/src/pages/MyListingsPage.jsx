import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusCircle, Tag, Pencil, Trash2 } from 'lucide-react';

const statusColors = { available: 'bg-green-100 text-green-700', sold: 'bg-gray-100 text-gray-500', reserved: 'bg-yellow-100 text-yellow-700' };

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = () => {
    axios.get('/api/products/user/my-listings')
      .then(r => setListings(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const markSold = async (id) => {
    try {
      await axios.put(`/api/products/${id}`, { status: 'sold' });
      toast.success('Marked as sold!');
      fetchListings();
    } catch { toast.error('Failed to update.'); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Listing deleted.');
      setListings(prev => prev.filter(p => p.id !== id));
    } catch { toast.error('Failed to delete.'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-primary">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">{listings.length} item{listings.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link to="/sell" className="btn-accent flex items-center gap-2 text-sm">
          <PlusCircle size={16} /> New Listing
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24">
          <Tag size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No listings yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Start selling to your fellow HNU students!</p>
          <Link to="/sell" className="btn-primary">List Your First Item</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(p => {
            const images = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
            return (
              <div key={p.id} className="card p-4 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {images[0] ? <img src={images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Tag size={20} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${p.id}`} className="font-semibold text-gray-900 hover:text-primary truncate block">{p.title}</Link>
                  <p className="text-primary font-bold text-sm">₱{parseFloat(p.price).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{p.category_name} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge ${statusColors[p.status]}`}>{p.status}</span>
                  {p.status === 'available' && (
                    <button onClick={() => markSold(p.id)} className="text-xs text-gray-500 hover:text-primary border border-gray-200 rounded-lg px-3 py-1.5 hover:border-primary transition-colors">
                      Mark Sold
                    </button>
                  )}
                  <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
