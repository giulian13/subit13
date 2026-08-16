import React, { useState } from 'react';
import type { Child, Exercise, Assignment, AttemptHistory } from '../../types';
import { db } from '../../services/storage';
import { ChildManager } from './ChildManager';
import { ExerciseBuilder } from './ExerciseBuilder';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { logoutParent, isFirebaseConfigured } from '../../services/firebase';
import { sounds } from '../../utils/audio';
import { 
  Users, 
  Sparkles, 
  BarChart2, 
  Send, 
  Gamepad2, 
  Plus,
  LogOut,
  Edit2,
  Trash2,
  Lock,
  Cloud,
  X
} from 'lucide-react';

interface Props {
  onSwitchToKidMode: (child: Child) => void;
  onLockParentPortal: () => void;
}

export const ParentPortal: React.FC<Props> = ({ onSwitchToKidMode, onLockParentPortal }) => {
  const [activeTab, setActiveTab] = useState<'children' | 'create' | 'assignments' | 'analytics' | 'settings'>('children');
  
  // State
  const [childrenList, setChildrenList] = useState<Child[]>(db.getChildren());
  const [exercises, setExercises] = useState<Exercise[]>(db.getExercises());
  const [assignments, setAssignments] = useState<Assignment[]>(db.getAssignments());
  const [attempts, setAttempts] = useState<AttemptHistory[]>(db.getAttempts());
  const [parentProfile, setParentProfile] = useState(db.getParentProfile());

  // Form Asignare / Editare Teme
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignChildId, setAssignChildId] = useState<string>(childrenList[0]?.id || '');
  const [assignTitle, setAssignTitle] = useState('');
  const [selectedExIds, setSelectedExIds] = useState<string[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Settings State: Schimbare PIN
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState(false);
  const [cleanCount, setCleanCount] = useState<number | null>(null);

  const refreshData = () => {
    setChildrenList(db.getChildren());
    setExercises(db.getExercises());
    setAssignments(db.getAssignments());
    setAttempts(db.getAttempts());
    setParentProfile(db.getParentProfile());
  };

  const openCreateAssignmentModal = () => {
    setEditingAssignmentId(null);
    setAssignChildId(childrenList[0]?.id || '');
    setAssignTitle('');
    setSelectedExIds([]);
    setIsAssignModalOpen(true);
  };

  const openEditAssignmentModal = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id);
    setAssignChildId(assignment.childId);
    setAssignTitle(assignment.title);
    setSelectedExIds([...assignment.exerciseIds]);
    setIsAssignModalOpen(true);
  };

  const handleDeleteAssignment = (id: string, title: string) => {
    if (confirm(`Ești sigur că vrei să ștergi misiunea "${title}"?`)) {
      db.deleteAssignment(id);
      sounds.playPop();
      refreshData();
    }
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || selectedExIds.length === 0) {
      alert('Alege un titlu și cel puțin un exercițiu!');
      return;
    }

    const firstEx = exercises.find(e => e.id === selectedExIds[0]);
    const assignmentToSave: Assignment = {
      id: editingAssignmentId || ('as_' + Date.now()),
      childId: assignChildId,
      title: assignTitle.trim(),
      subject: firstEx ? firstEx.subject : 'math',
      exerciseIds: selectedExIds,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.saveAssignment(assignmentToSave);
    sounds.playSuccess();
    setIsAssignModalOpen(false);
    setAssignTitle('');
    setSelectedExIds([]);
    setEditingAssignmentId(null);
    refreshData();
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      alert('PIN-ul trebuie să aibă cel puțin 4 cifre!');
      return;
    }
    db.updateParentPin(newPin);
    sounds.playSuccess();
    setPinSuccessMsg(true);
    setTimeout(() => setPinSuccessMsg(false), 3000);
    setNewPin('');
    refreshData();
  };

  const handleCleanOldData = () => {
    if (confirm('Vrei să ștergi istoricul încercărilor mai vechi de 30 de zile pentru a elibera spațiu?')) {
      const removed = db.cleanOldAttempts(30);
      setCleanCount(removed);
      sounds.playPop();
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-12">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              E
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-lg leading-tight flex items-center gap-2">
                <span>EduSmart Studio</span>
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  isFirebaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <Cloud className="w-3 h-3" />
                  {isFirebaseConfigured ? 'Cloud Sync (Firebase)' : 'Mod Local'}
                </span>
              </h1>
              <p className="text-xs text-slate-400">Autentificat ca: {parentProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {childrenList.length > 0 && (
              <button
                onClick={() => {
                  sounds.playPop();
                  onSwitchToKidMode(childrenList[0]);
                }}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Deschide Zona Copilului</span>
                <span className="sm:hidden">Copil</span>
              </button>
            )}

            <button
              onClick={() => {
                sounds.playPop();
                onLockParentPortal();
              }}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              title="Blochează Panoul (Revino la PIN)"
            >
              <Lock className="w-5 h-5" />
            </button>

            <button
              onClick={async () => {
                sounds.playPop();
                await logoutParent();
                onLockParentPortal();
              }}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Deconectare Google"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('children'); sounds.playPop(); }}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'children'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Copii & Profiluri</span>
          </button>

          <button
            onClick={() => { setActiveTab('create'); sounds.playPop(); }}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Exerciții ({exercises.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('assignments'); sounds.playPop(); }}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'assignments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Teme & Misiuni ({assignments.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('analytics'); sounds.playPop(); }}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Rapoarte & Grafice</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); sounds.playPop(); }}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Securitate & Firebase</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'children' && (
          <ChildManager childrenList={childrenList} onRefresh={refreshData} />
        )}

        {activeTab === 'create' && (
          <ExerciseBuilder onCreated={refreshData} />
        )}

        {/* Tab Teme & Misiuni cu Editare și Ștergere */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  <span>Seturi de Misiuni / Teme Asignate</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Grupează exerciții, editează conținutul sau șterge misiunile vechi.
                </p>
              </div>

              <button
                onClick={openCreateAssignmentModal}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Asignează Misiune Nouă</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => {
                const assignedChild = childrenList.find(c => c.id === assignment.childId);
                return (
                  <div
                    key={assignment.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          assignment.subject === 'math' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {assignment.subject === 'math' ? '🔢 Matematică' : '📚 Comunicare'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditAssignmentModal(assignment)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Editează Misiunea"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Șterge Misiunea"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-800 text-base">{assignment.title}</h3>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                          {assignedChild?.avatar || '👤'}
                        </span>
                        <span>Pentru: <strong>{assignedChild?.name || 'Copil'}</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {assignment.exerciseIds.length} exerciții incluse
                      </span>
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Activă
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard childrenList={childrenList} attempts={attempts} />
        )}

        {/* Tab Securitate & Firebase */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schimbare PIN Părinte */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-800">Securitate PIN Părinte</h3>
              </div>
              <p className="text-xs text-slate-500">
                Acest PIN este folosit pentru a deschide panoul de administrare direct din zona copilului.
              </p>

              <form onSubmit={handleUpdatePin} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Curent: {parentProfile.pin}</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="Introdu noul PIN (4-6 cifre)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm tracking-widest outline-none"
                  />
                </div>
                {pinSuccessMsg && (
                  <p className="text-xs text-emerald-600 font-bold">
                    ✓ PIN-ul a fost actualizat cu succes!
                  </p>
                )}
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                >
                  Actualizează PIN-ul
                </button>
              </form>
            </div>

            {/* Mentenanță & Curățare Date Vechi Firebase */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-800">Optimizare Bază de Date (Plan Gratuit)</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pentru a menține consumul Firestore în limitele gratuite (1 GB stocare), poți curăța istoricul vechi de rezolvări.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div>Total Încercări Salvate: <strong>{attempts.length}</strong></div>
                <div>Exerciții Stocate: <strong>{exercises.length}</strong></div>
              </div>

              {cleanCount !== null && (
                <p className="text-xs text-emerald-600 font-bold">
                  ✓ S-au eliminat {cleanCount} înregistrări vechi!
                </p>
              )}

              <button
                onClick={handleCleanOldData}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-4 py-2.5 rounded-xl"
              >
                Curăță Rezolvările mai vechi de 30 zile
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal Asignare / Editare Misiune */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-pop max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {editingAssignmentId ? 'Editează Misiunea' : 'Creează o Misiune Nouă'}
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alege Copilul</label>
                <select
                  value={assignChildId}
                  onChange={(e) => setAssignChildId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm outline-none"
                >
                  {childrenList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.avatar} {c.name} ({c.age} ani)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titlul Misiunii</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Misiunea Magică de Vineri 🚀"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Selectează Exercițiile Incluse ({selectedExIds.length} selectate):
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {exercises.map((ex) => {
                    const isSelected = selectedExIds.includes(ex.id);
                    return (
                      <div
                        key={ex.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedExIds(selectedExIds.filter(id => id !== ex.id));
                          } else {
                            setSelectedExIds([...selectedExIds, ex.id]);
                          }
                          sounds.playPop();
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{ex.subject === 'math' ? '🔢' : '📚'}</span>
                          <span>{ex.title}</span>
                        </div>
                        <span className="text-amber-500 font-bold">{ex.stars}★</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm"
                >
                  {editingAssignmentId ? 'Salvează Modificările' : 'Trimite Misiunea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
