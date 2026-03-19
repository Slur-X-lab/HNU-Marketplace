import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, X, PlusCircle } from 'lucide-react';

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export default function NewListingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', category_id: '', condition_type: 'good' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) return toast.error('Max 5 images allowed.');
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return toast.error('Title and price are required.');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      const { data } = await axios.post('/api/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item listed successfully! 🎉');
      navigate(`/product/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-primary">List an Item</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to post your listing</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Photos <span className="text-gray-400 font-normal">(up to 5)</span></label>
          <div className="flex gap-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                <img src={src} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                  <X size={12} className="text-red-500" />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary text-gray-400 hover:text-primary transition-colors">
                <Upload size={20} />
                <span className="text-[10px] mt-1">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
          <input className="input" placeholder="e.g. Calculus Textbook 7th Edition" value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea className="input resize-none" rows={4} placeholder="Describe your item — condition details, why you're selling, etc." value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₱) *</label>
            <input type="number" min="0" step="0.01" className="input" placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} required />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <select className="input" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
          <div className="flex gap-2 flex-wrap">
            {CONDITIONS.map(c => (
              <button key={c.value} type="button" onClick={() => set('condition_type', c.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${form.condition_type === c.value ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-60 mt-2">
          <PlusCircle size={20} />
          {loading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  );
}
