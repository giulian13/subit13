import React, { useState } from 'react';
import type { Child, AttemptHistory } from '../../types';
import { TrendingUp, Clock, Award, CheckCircle2, XCircle, BarChart3, Filter } from 'lucide-react';

interface Props {
  childrenList: Child[];
  attempts: AttemptHistory[];
}

export const AnalyticsDashboard: React.FC<Props> = ({ childrenList, attempts }) => {
  const [selectedChildId, setSelectedChildId] = useState<string>('all');

  const filteredAttempts = selectedChildId === 'all'
    ? attempts
    : attempts.filter(a => a.childId === selectedChildId);

  // Calcule statistice
  const totalAttempts = filteredAttempts.length;
  const correctAttempts = filteredAttempts.filter(a => a.isCorrect).length;
  const accuracyPercent = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  
  const totalDuration = filteredAttempts.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const avgDuration = totalAttempts > 0 ? Math.round(totalDuration / totalAttempts) : 0;

  const mathAttempts = filteredAttempts.filter(a => a.subject === 'math');
  const mathCorrect = mathAttempts.filter(a => a.isCorrect).length;
  const mathAccuracy = mathAttempts.length > 0 ? Math.round((mathCorrect / mathAttempts.length) * 100) : 0;

  const langAttempts = filteredAttempts.filter(a => a.subject === 'language');
  const langCorrect = langAttempts.filter(a => a.isCorrect).length;
  const langAccuracy = langAttempts.length > 0 ? Math.round((langCorrect / langAttempts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header cu Filtru Copil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Rapoarte & Evoluție Învățare</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Urmărește rata de succes, timpul alocat și progresul pe fiecare disciplină.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Toți Copiii</option>
            {childrenList.map(c => (
              <option key={c.id} value={c.id}>
                {c.avatar} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Carduri KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acuratețe Generală</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{accuracyPercent}%</div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {correctAttempts} din {totalAttempts} exerciții
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            🎯
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timp Mediu / Exercițiu</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{avgDuration} sec</div>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              Ritm bun de gândire
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
            ⏱️
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scor Matematică</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{mathAccuracy}%</div>
            <span className="text-xs text-slate-500 mt-1 block">
              {mathAttempts.length} rezolvate
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
            🔢
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scor Comunicare</span>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">{langAccuracy}%</div>
            <span className="text-xs text-slate-500 mt-1 block">
              {langAttempts.length} rezolvate
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">
            📚
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Performanță pe Discipline</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Matematică (Adunare, Scădere, Logică)
                </span>
                <span>{mathAccuracy}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${mathAccuracy}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  Comunicare & Limbaj (Silabe, Rime, Vocabular)
                </span>
                <span>{langAccuracy}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${langAccuracy}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Istoricul Ultimelor Încercări</span>
          </h3>

          {filteredAttempts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Niciun exercițiu finalizat încă.</p>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredAttempts.slice(0, 5).map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {attempt.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 block truncate max-w-[180px] sm:max-w-xs">
                        {attempt.exerciseTitle}
                      </span>
                      <span className="text-slate-400">
                        {new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {attempt.durationSeconds}s
                      </span>
                    </div>
                  </div>

                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    +{attempt.starsEarned} ★
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
