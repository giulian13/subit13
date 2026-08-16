import React, { useState } from 'react';
import type { Child } from '../../types';
import { db } from '../../services/storage';
import { sounds } from '../../utils/audio';
import { UserPlus, Edit2, Trash2, KeyRound, Sparkles, X, Check } from 'lucide-react';

interface Props {
  childrenList: Child[];
  onRefresh: () => void;
}

const AVATAR_OPTIONS = ['🚀', '🦄', '🦊', '🦁', '🐼', '🦖', '🐬', '🦉', '🐱', '🐶', '🤖', '👑'];
const THEME_COLORS = [
  { name: 'Albastru', value: 'blue', bg: 'bg-blue-500' },
  { name: 'Roz', value: 'pink', bg: 'bg-pink-500' },
  { name: 'Verde', value: 'green', bg: 'bg-emerald-500' },
  { name: 'Mov', value: 'purple', bg: 'bg-purple-500' },
  { name: 'Portocaliu', value: 'orange', bg: 'bg-amber-500' },
];

export const ChildManager: React.FC<Props> = ({ childrenList, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(7);
  const [avatar, setAvatar] = useState('🚀');
  const [pin, setPin] = useState('1234');
  const [themeColor, setThemeColor] = useState('blue');

  const openAddModal = () => {
    setEditingChild(null);
    setName('');
    setAge(7);
    setAvatar('🚀');
    setPin('1234');
    setThemeColor('blue');
    setIsModalOpen(true);
  };

  const openEditModal = (child: Child) => {
    setEditingChild(child);
    setName(child.name);
    setAge(child.age);
    setAvatar(child.avatar);
    setPin(child.pin);
    setThemeColor(child.themeColor || 'blue');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const childToSave: Child = {
      id: editingChild ? editingChild.id : 'c_' + Date.now(),
      name: name.trim(),
      age: Number(age),
      avatar,
      pin: pin.trim() || '1234',
      totalStars: editingChild ? editingChild.totalStars : 0,
      unlockedBadges: editingChild ? editingChild.unlockedBadges : ['b1'],
      themeColor
    };

    db.saveChild(childToSave);
    sounds.playSuccess();
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = (id: string, childName: string) => {
    if (confirm(`Ești sigur că vrei să ștergi profilul lui ${childName}?`)) {
      db.deleteChild(id);
      sounds.playPop();
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>Profilurile Copiilor</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {childrenList.length} activi
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configurează avatarul, vârsta și PIN-ul de acces facil pentru fiecare copil.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Adaugă Copil Nou</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {childrenList.map((child) => (
          <div
            key={child.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl shadow-inner">
                  {child.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{child.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{child.age} ani</span>
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {child.totalStars} steluțe
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(child)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Editează profilul"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(child.id, child.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Șterge profilul"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>PIN Acces: <strong className="text-slate-700 tracking-widest">{child.pin}</strong></span>
              </div>
              <div className="flex items-center gap-1 text-indigo-600 font-semibold">
                <span>{child.unlockedBadges.length} insigne</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-pop">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {editingChild ? `Editează Profilul: ${editingChild.name}` : 'Adaugă Copil Nou'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Numele Copilului</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matei sau Sofia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vârstă (Ani)</label>
                  <input
                    type="number"
                    min="3"
                    max="14"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Simplu (4 cifre)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold tracking-widest text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Alege Avatarul</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => {
                        setAvatar(emoji);
                        sounds.playPop();
                      }}
                      className={`text-2xl h-11 flex items-center justify-center rounded-xl border-2 transition-all ${
                        avatar === emoji
                          ? 'border-indigo-500 bg-indigo-50 scale-105 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Culoarea Interfeței</label>
                <div className="flex gap-2">
                  {THEME_COLORS.map((theme) => (
                    <button
                      type="button"
                      key={theme.value}
                      onClick={() => setThemeColor(theme.value)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border-2 transition-all ${
                        themeColor === theme.value
                          ? 'border-slate-800 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.bg}`}></span>
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvează Profilul</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
