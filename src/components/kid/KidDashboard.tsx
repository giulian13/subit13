import React, { useState } from 'react';
import type { Child, Exercise } from '../../types';
import { db } from '../../services/storage';
import { ExercisePlayer } from './ExercisePlayer';
import { sounds } from '../../utils/audio';
import { Sparkles, Trophy, LogOut, Play, CheckCircle2, Star, Rocket, BookOpen } from 'lucide-react';

interface Props {
  child: Child;
  onLogout: () => void;
  onRefreshChild: () => void;
}

export const KidDashboard: React.FC<Props> = ({ child, onLogout, onRefreshChild }) => {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<'missions' | 'practice' | 'badges'>('missions');

  const assignments = db.getAssignments(child.id);
  const allExercises = db.getExercises();
  const allBadges = db.getBadges();

  const handleFinishExercise = () => {
    setActiveExercise(null);
    onRefreshChild();
  };

  if (activeExercise) {
    return (
      <div className="min-h-screen bg-amber-50/50">
        <header className="bg-white border-b-2 border-amber-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={() => {
              sounds.playPop();
              setActiveExercise(null);
            }}
            className="flex items-center gap-1 text-sm font-black text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl"
          >
            ◀ Înapoi la Misiuni
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xl">{child.avatar}</span>
            <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-black text-sm">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{child.totalStars}</span>
            </div>
          </div>
        </header>

        <ExercisePlayer
          child={child}
          exercise={activeExercise}
          onFinish={handleFinishExercise}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between select-none">
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30 animate-pulse-subtle">
              {child.avatar}
            </div>
            <div>
              <h1 className="text-xl font-black leading-tight">Salut, {child.name}! 🌟</h1>
              <p className="text-xs font-bold text-white/80">Ești gata pentru noi aventuri?</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-yellow-400 text-yellow-950 font-black px-4 py-2 rounded-2xl shadow-md text-base">
              <Sparkles className="w-5 h-5 fill-yellow-950" />
              <span>{child.totalStars} ★</span>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onLogout();
              }}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
              title="Schimbă Copilul"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex gap-2 pt-4">
          <button
            onClick={() => { setActiveTab('missions'); sounds.playPop(); }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'missions'
                ? 'bg-white text-indigo-900 shadow-md scale-102'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Misiunile Mele</span>
          </button>

          <button
            onClick={() => { setActiveTab('practice'); sounds.playPop(); }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'practice'
                ? 'bg-white text-indigo-900 shadow-md scale-102'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Antrenament Liber</span>
          </button>

          <button
            onClick={() => { setActiveTab('badges'); sounds.playPop(); }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'badges'
                ? 'bg-white text-indigo-900 shadow-md scale-102'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Trofeele Mele ({child.unlockedBadges.length})</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-1">
        {activeTab === 'missions' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>🚀 Misiuni Pregătite de Părinți</span>
            </h2>

            {assignments.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-200 space-y-3">
                <div className="text-5xl">🎈</div>
                <h3 className="font-extrabold text-slate-700 text-lg">Ai terminat toate misiunile!</h3>
                <p className="text-xs text-slate-500">
                  Mergi la secțiunea de <strong>Antrenament Liber</strong> pentru a câștiga mai multe steluțe.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-3xl p-5 border-4 border-indigo-100 shadow-md flex flex-col justify-between hover:border-indigo-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                          {assignment.subject === 'math' ? '🔢 Matematică' : '📚 Comunicare'}
                        </span>
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          Misiune Activă
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-800">{assignment.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Conține {assignment.exerciseIds.length} exerciții captivante!
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          const firstEx = allExercises.find(e => assignment.exerciseIds.includes(e.id));
                          if (firstEx) {
                            sounds.playPop();
                            setActiveExercise(firstEx);
                          }
                        }}
                        className="btn-bouncy w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-base shadow-md"
                      >
                        <Play className="w-5 h-5 fill-white" />
                        <span>Începe Aventura!</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>🎯 Alege ce vrei să exersezi</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => {
                    sounds.playPop();
                    setActiveExercise(ex);
                  }}
                  className="btn-bouncy bg-white rounded-3xl p-5 border-4 border-amber-200 shadow-md cursor-pointer hover:border-amber-400 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-2xl font-black">
                      {ex.subject === 'math' ? '🔢' : '📚'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base">{ex.title}</h4>
                      <span className="text-xs font-bold text-slate-400">{ex.topic}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                      +{ex.stars} ★
                    </span>
                    <Play className="w-5 h-5 text-indigo-500 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>🏆 Colecția Ta de Insigne Magice</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {allBadges.map((badge) => {
                const isUnlocked = child.unlockedBadges.includes(badge.id) || child.totalStars >= badge.requiredStars;
                return (
                  <div
                    key={badge.id}
                    className={`rounded-3xl p-4 text-center border-4 transition-all ${
                      isUnlocked
                        ? 'bg-white border-yellow-300 shadow-lg scale-102'
                        : 'bg-slate-100 border-slate-200 opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-5xl mb-2 animate-float">{badge.icon}</div>
                    <h4 className="font-black text-slate-800 text-sm">{badge.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{badge.description}</p>
                    <div className="mt-3">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Deblocat
                        </span>
                      ) : (
                        <span className="inline-block bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Necesar: {badge.requiredStars} ★
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-xs text-slate-400 font-bold">
        Învață, joacă-te și adună cât mai multe steluțe! ⭐
      </footer>
    </div>
  );
};
