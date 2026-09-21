import React, { useState } from 'react';
import { useKanban } from '../../context/KanbanContext';
import { User, X, Check, Feather, Sparkles, Compass, Sun, Leaf, Heart } from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 'fox', label: 'Rubah Petualang', icon: Compass, bg: 'bg-terracotta-light text-terracotta' },
  { id: 'owl', label: 'Burung Hantu Bijak', icon: Feather, bg: 'bg-sage-light text-sage' },
  { id: 'ginkgo', label: 'Daun Ginkgo', icon: Leaf, bg: 'bg-amber-100 text-amber-800' },
  { id: 'sun', label: 'Matahari Hangat', icon: Sun, bg: 'bg-orange-100 text-orange-700' },
  { id: 'sparkles', label: 'Bintang Alami', icon: Sparkles, bg: 'bg-purple-100 text-purple-800' },
  { id: 'heart', label: 'Jiwa Mindful', icon: Heart, bg: 'bg-rose-100 text-rose-700' }
];

export const ProfileModal: React.FC = () => {
  const { profile, updateProfile, isProfileModalOpen, closeProfileModal } = useKanban();
  const [name, setName] = useState(profile.name);
  const [roleTitle, setRoleTitle] = useState(profile.roleTitle);
  const [avatarId, setAvatarId] = useState(profile.avatarId);

  if (!isProfileModalOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name: name.trim() || 'Sahabat', roleTitle: roleTitle.trim() || 'Creator', avatarId });
    closeProfileModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-boho-linen border border-boho-canvas rounded-2xl p-6 shadow-2xl font-sans text-boho-espresso">
        <div className="flex items-center justify-between pb-3 border-b border-boho-canvas/60 mb-5">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-terracotta" />
            <h2 className="text-xl font-serif font-bold text-boho-espresso">Persona Profile</h2>
          </div>
          <button
            onClick={closeProfileModal}
            className="p-1 text-boho-clay hover:text-boho-espresso rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-boho-walnut mb-2">
              Pilih Avatar Karakter
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = avatarId === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setAvatarId(opt.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-terracotta bg-terracotta-light/40 shadow-sm ring-2 ring-terracotta/30'
                        : 'border-boho-canvas hover:border-boho-clay bg-boho-sand/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${opt.bg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-boho-walnut text-center">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-boho-walnut mb-1.5">
              Nama Pengguna
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Lee"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-boho-canvas rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-boho-walnut mb-1.5">
              Peran / Title
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Contoh: Mindful Craftsman"
              className="w-full px-3.5 py-2.5 bg-white border border-boho-canvas rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-all"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={closeProfileModal}
              className="px-4 py-2 text-sm font-medium text-boho-walnut hover:bg-boho-sand rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-terracotta text-white font-medium text-sm rounded-xl hover:bg-terracotta-deep transition-all shadow-md shadow-terracotta/20"
            >
              <Check className="w-4 h-4" />
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
