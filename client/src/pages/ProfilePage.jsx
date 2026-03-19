import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, BookOpen, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', course: user?.course || '', year_level: user?.year_level || '' });

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSave = async () => {
    try {
      await axios.put('/api/auth/profile', form);
      setUser(prev => ({ ...prev, ...form }));
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Could not update profile.');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 page-enter">
      <h1 className="font-display text-3xl text-primary mb-8">Profile</h1>

      <div className="card p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="font-display text-xl mt-3">{user?.name}</h2>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="mt-2 badge bg-primary/10 text-primary text-xs">HNU Student</span>
        </div>

        {/* Info */}
        {!editing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Full Name</p>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <BookOpen size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Course & Year</p>
                <p className="text-sm font-medium text-gray-900">{user?.course || '—'} · {user?.year_level || '—'}</p>
              </div>
            </div>
            <button onClick={() => setEditing(true)} className="btn-outline w-full py-2.5 text-sm mt-2">Edit Profile</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
              <input className="input" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Year Level</label>
              <input className="input" value={form.year_level} onChange={e => setForm(f => ({ ...f, year_level: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="btn-primary flex-1 py-2.5 text-sm">Save Changes</button>
              <button onClick={() => setEditing(false)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <button onClick={handleLogout} className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-colors text-sm font-medium">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
