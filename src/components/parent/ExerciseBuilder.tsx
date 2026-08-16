import React, { useState } from 'react';
import type { Exercise, SubjectType, ExerciseFormat } from '../../types';
import { db } from '../../services/storage';
import { sounds } from '../../utils/audio';
import { PlusCircle, BookOpen, Calculator, Eye, Check, Edit2, Trash2, X, ListPlus, FileSpreadsheet, ArrowDownCircle } from 'lucide-react';

interface Props {
  onCreated: () => void;
}

export const ExerciseBuilder: React.FC<Props> = ({ onCreated }) => {
  const [exercisesList, setExercisesList] = useState<Exercise[]>(db.getExercises());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk_math'>('single');

  // Stare Formular Unic
  const [subject, setSubject] = useState<SubjectType>('math');
  const [format, setFormat] = useState<ExerciseFormat>('multiple_choice');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [stars, setStars] = useState(2);
  const [hint, setHint] = useState('');

  // Stare Import în Masă (Bulk Math)
  const [bulkText, setBulkText] = useState(`5 + 3 = 8\n12 - 4 = 8\n6 x 7 = 42\n20 : 4 = 5\n9 + 7 = 16`);
  const [bulkStars, setBulkStars] = useState(2);
  const [bulkTopic, setBulkTopic] = useState('Calcul Rapid');
  const [bulkImportSuccess, setBulkImportSuccess] = useState<number | null>(null);

  // Pentru Multiple Choice
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);

  // Pentru Drag & Drop / Ordonare
  const [dragItemsString, setDragItemsString] = useState('1, 2, 3, 4');

  // Preview Mode
  const [showPreview, setShowPreview] = useState(false);

  // Funcție pentru generarea inteligentă de opțiuni greșite pentru grilă
  const generateWrongOptions = (correctAnswerNum: number): string[] => {
    const wrong = new Set<number>();
    const deltas = [1, -1, 2, -2, 3, -3, 10, -10, 4, -4];
    for (const d of deltas) {
      const candidate = correctAnswerNum + d;
      if (candidate >= 0 && candidate !== correctAnswerNum) {
        wrong.add(candidate);
      }
      if (wrong.size >= 3) break;
    }
    while (wrong.size < 3) {
      wrong.add(Math.max(0, correctAnswerNum + Math.floor(Math.random() * 8) - 4));
    }
    return Array.from(wrong).slice(0, 3).map(String);
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      alert('Introdu cel puțin o linie cu calcul și rezultat!');
      return;
    }

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    let importedCount = 0;

    lines.forEach((line, idx) => {
      // Suportă formate ca: "5 + 3 = 8", "12 - 4 = 8", "6 * 7 = 42", "20 / 4 = 5", "8 + 6 = 14" sau separate prin ":" / ","
      let equation = '';
      let result = '';

      if (line.includes('=')) {
        const parts = line.split('=');
        equation = parts[0].trim();
        result = parts[1].trim();
      } else if (line.includes('->')) {
        const parts = line.split('->');
        equation = parts[0].trim();
        result = parts[1].trim();
      } else if (line.includes(':') && !line.includes('+') && !line.includes('-')) {
        const parts = line.split(':');
        equation = parts[0].trim();
        result = parts[1].trim();
      }

      if (!equation || !result) {
        // Încercare de a calcula automat dacă există doar o expresie matematică (ex: "7 + 8")
        try {
          const cleanExpr = line.replace(/x/g, '*').replace(/÷/g, '/').replace(/:/g, '/');
          const evalResult = Function(`"use strict"; return (${cleanExpr})`)();
          if (typeof evalResult === 'number' && !isNaN(evalResult)) {
            equation = line;
            result = String(evalResult);
          }
        } catch {
          return;
        }
      }

      if (equation && result) {
        const correctNum = parseFloat(result);
        const wrongOpts = !isNaN(correctNum)
          ? generateWrongOptions(correctNum)
          : ['0', '10', '100'];

        // Amestecăm opțiunile
        const allOpts = [result, ...wrongOpts].sort(() => Math.random() - 0.5);

        const newEx: Exercise = {
          id: `ex_bulk_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
          title: `Calcul: ${equation} = ?`,
          subject: 'math',
          topic: bulkTopic.trim() || 'Calcul Rapid',
          difficulty: 1,
          format: 'multiple_choice',
          prompt: `Cât face: ${equation} = ?`,
          stars: bulkStars,
          data: {
            options: allOpts,
            correctAnswer: result,
            hint: `Gândește-te pas cu pas la calculul: ${equation}`
          },
          isTemplate: false
        };

        db.saveExercise(newEx);
        importedCount++;
      }
    });

    if (importedCount > 0) {
      sounds.playSuccess();
      setBulkImportSuccess(importedCount);
      setTimeout(() => setBulkImportSuccess(null), 4000);
      refreshList();
      onCreated();
      setBulkText('');
    } else {
      alert('Nu s-a putut recunoaște niciun calcul. Format recomandat:\n5 + 3 = 8\n12 - 4 = 8\n6 x 7 = 42');
    }
  };

  const refreshList = () => {
    setExercisesList(db.getExercises());
  };

  const startEdit = (ex: Exercise) => {
    setEditingId(ex.id);
    setSubject(ex.subject);
    setFormat(ex.format);
    setTitle(ex.title);
    setTopic(ex.topic);
    setPrompt(ex.prompt);
    setStars(ex.stars);
    setHint(ex.data.hint || '');

    if (ex.format === 'multiple_choice' && ex.data.options) {
      const opts = [...ex.data.options];
      while (opts.length < 4) opts.push('');
      setOptions(opts);
      const cIdx = opts.findIndex(o => o === ex.data.correctAnswer);
      setCorrectIndex(cIdx >= 0 ? cIdx : 0);
    } else if (ex.format === 'drag_and_drop' && ex.data.items) {
      setDragItemsString(ex.data.items.join(', '));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setTopic('');
    setPrompt('');
    setHint('');
    setOptions(['', '', '', '']);
  };

  const handleDelete = (id: string, exTitle: string) => {
    if (confirm(`Ești sigur că vrei să ștergi exercițiul "${exTitle}"?`)) {
      db.deleteExercise(id);
      sounds.playPop();
      refreshList();
      onCreated();
    }
  };

  // Preseturi rapide de Matematică
  const loadMathPreset = (type: string) => {
    if (type === 'adunare_mere') {
      setTitle('Adunarea Merelor');
      setTopic('Adunare până la 10');
      setPrompt('Câte mere sunt dacă ai 3 🍎 și mai primești 2 🍎?');
      setFormat('multiple_choice');
      setOptions(['4 mere', '5 mere', '6 mere', '3 mere']);
      setCorrectIndex(1);
      setHint('Numără: 3... 4, 5!');
      setStars(2);
    } else if (type === 'ordonare_numere') {
      setTitle('Trenulețul Numerelor');
      setTopic('Ordonare');
      setPrompt('Așază numerele în ordine de la mic la mare:');
      setFormat('drag_and_drop');
      setDragItemsString('8, 3, 1, 6');
      setHint('Începe cu cel mai mic număr: 1');
      setStars(3);
    }
  };

  // Preseturi rapide de Comunicare
  const loadLanguagePreset = (type: string) => {
    if (type === 'antonime') {
      setTitle('Cuvinte Opuse');
      setTopic('Antonime');
      setPrompt('Care este cuvântul opus pentru „MARE”?');
      setFormat('multiple_choice');
      setOptions(['Uriaș', 'Mic', 'Lat', 'Înalt']);
      setCorrectIndex(1);
      setHint('Gândește-te la un elefant (mare) și la un șoricel (...)');
      setStars(2);
    } else if (type === 'litere_cuvant') {
      setTitle('Scrie numele animalului');
      setTopic('Ortografie');
      setPrompt('Ordonează literele pentru a forma cuvântul C-Â-I-N-E 🐶:');
      setFormat('drag_and_drop');
      setDragItemsString('N, C, I, Â, E');
      setHint('Prima literă este C.');
      setStars(3);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) {
      alert('Te rog să completezi titlul și cerința exercițiului!');
      return;
    }

    let exerciseData: Exercise['data'] = { hint };

    if (format === 'multiple_choice') {
      const filteredOptions = options.filter(o => o.trim() !== '');
      if (filteredOptions.length < 2) {
        alert('Adaugă cel puțin 2 opțiuni de răspuns!');
        return;
      }
      exerciseData = {
        ...exerciseData,
        options: filteredOptions,
        correctAnswer: filteredOptions[correctIndex] || filteredOptions[0]
      };
    } else if (format === 'drag_and_drop') {
      const items = dragItemsString.split(',').map(s => s.trim()).filter(Boolean);
      if (items.length < 2) {
        alert('Introdu cel puțin 2 elemente separate prin virgulă!');
        return;
      }
      const targetOrder = [...items].sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      });

      exerciseData = {
        ...exerciseData,
        items: items,
        targetOrder: targetOrder
      };
    }

    const newExercise: Exercise = {
      id: editingId || ('ex_' + Date.now()),
      title: title.trim(),
      subject,
      topic: topic.trim() || (subject === 'math' ? 'Matematică Generală' : 'Comunicare & Vocabular'),
      difficulty: 1,
      format,
      prompt: prompt.trim(),
      stars,
      data: exerciseData,
      isTemplate: false
    };

    db.saveExercise(newExercise);
    sounds.playSuccess();
    
    cancelEdit();
    refreshList();
    onCreated();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-indigo-600" />
              <span>{editingId ? 'Editare Exercițiu Existent' : 'Studio Creare Exerciții'}</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Personalizează sau editează exerciții pentru nevoile copilului tău.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!editingId && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'single'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Exercițiu Unic</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bulk_math')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'bulk_math'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Import Rapid Listă (Calcul & Rezultat)</span>
                </button>
              </div>
            )}

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
              >
                <X className="w-4 h-4" />
                <span>Anulează Editarea</span>
              </button>
            )}
            
            {activeTab === 'single' && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  showPreview
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Ascunde Previzualizarea' : 'Previzualizare Live Copil'}</span>
              </button>
            )}
          </div>
        </div>

        {!editingId && activeTab === 'single' && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Template-uri Rapide Sugerate:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setSubject('math'); loadMathPreset('adunare_mere'); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5"
              >
                🍎 Adunare cu mere (Matematică)
              </button>
              <button
                type="button"
                onClick={() => { setSubject('math'); loadMathPreset('ordonare_numere'); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5"
              >
                🔢 Ordonare crescătoare
              </button>
              <button
                type="button"
                onClick={() => { setSubject('language'); loadLanguagePreset('antonime'); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1.5"
              >
                🔄 Cuvinte opuse (Comunicare)
              </button>
              <button
                type="button"
                onClick={() => { setSubject('language'); loadLanguagePreset('litere_cuvant'); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1.5"
              >
                🐶 Ordonează literele
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODUL 2: IMPORT ÎN MASĂ MATEMATICĂ */}
      {activeTab === 'bulk_math' && !editingId && (
        <form onSubmit={handleBulkImport} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 animate-pop">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-800">
                  Import Rapid Listă Exerciții Matematice
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Introdu o listă de operații (câte una pe rând), iar platforma va genera automat opțiunile de răspuns (grilă), calculul corect și indiciile.
              </p>
            </div>
            <span className="text-xs font-black bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              Bulk Generator
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Capitol / Subiect Comun
              </label>
              <input
                type="text"
                placeholder="Ex: Adunare & Scădere până la 20, Tabla Înmulțirii"
                value={bulkTopic}
                onChange={(e) => setBulkTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Recompensă Steluțe / Exercițiu (⭐)
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setBulkStars(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                      bulkStars === num
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-105'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>★</span>
                    <span>{num}</span>
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-1">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkStars}
                    onChange={(e) => setBulkStars(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 text-xs font-bold border border-slate-300 rounded-lg text-center focus:border-amber-500 outline-none"
                  />
                  <span className="text-xs text-slate-400 font-semibold">★</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Listă Calcule (Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">operație = rezultat</code>)
              </label>
              <button
                type="button"
                onClick={() => setBulkText(`10 + 5 = 15\n25 - 7 = 18\n8 x 4 = 32\n36 : 6 = 6\n15 + 19 = 34\n50 - 15 = 35`)}
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Încarcă Exemplu
              </button>
            </div>
            <textarea
              rows={6}
              required
              placeholder="Exemplu:&#10;5 + 3 = 8&#10;12 - 4 = 8&#10;7 x 6 = 42&#10;40 : 5 = 8"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 font-mono text-sm leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>💡</span>
              <span>Poți introduce operații cu <strong>+</strong>, <strong>-</strong>, <strong>x / *</strong> sau <strong>: / /</strong>. Răspunsurile greșite din grilă sunt generate inteligent în mod automat!</span>
            </p>
          </div>

          {bulkImportSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Au fost importate cu succes {bulkImportSuccess} exerciții în baza de date!</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Generează & Salvează Toate Exercițiile</span>
            </button>
          </div>
        </form>
      )}

      {/* MODUL 1: FORMULAR CREARE INDIVIDUALĂ */}
      {(activeTab === 'single' || editingId) && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formular Creare / Editare */}
        <form onSubmit={handleSave} className={`space-y-5 ${showPreview ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Materia / Disciplina</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubject('math')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      subject === 'math'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Matematică</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubject('language')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      subject === 'language'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Comunicare</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Format Interacțiune</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('multiple_choice')}
                    className={`p-3 rounded-xl border-2 font-bold text-xs sm:text-sm text-center transition-all ${
                      format === 'multiple_choice'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Grilă Opțiuni
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('drag_and_drop')}
                    className={`p-3 rounded-xl border-2 font-bold text-xs sm:text-sm text-center transition-all ${
                      format === 'drag_and_drop'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Drag & Drop / Ordine
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titlul Exercițiului</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Călătoria Numerelor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subiect / Capitol</label>
                <input
                  type="text"
                  placeholder="Ex: Adunare, Silabe, Antonime"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cerința pentru Copil (poate fi citită la cerere prin buton)
              </label>
              <textarea
                rows={2}
                required
                placeholder="Scrie o întrebare clară, simplă și prietenoasă..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
              />
            </div>

            {format === 'multiple_choice' ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  Opțiuni de Răspuns (bifează răspunsul corect):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                        correctIndex === idx
                          ? 'border-emerald-500 bg-emerald-50/70'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctAnswerRadio"
                        checked={correctIndex === idx}
                        onChange={() => setCorrectIndex(idx)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder={`Varianta ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx] = e.target.value;
                          setOptions(newOpts);
                        }}
                        className="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  Elemente de ordonat (separate prin virgulă):
                </label>
                <input
                  type="text"
                  placeholder="Ex: 5, 2, 9, 1 sau Litere: A, P, Ă"
                  value={dragItemsString}
                  onChange={(e) => setDragItemsString(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                  Copilul va trage piesele tactile pentru a le aranja în ordinea corectă.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Indiciu de ajutor (Opțional)</label>
                <input
                  type="text"
                  placeholder="Ex: Gândește-te la numărul degetelor de la o mână..."
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recompensă Steluțe (⭐)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[1, 2, 3, 4, 5, 10].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setStars(num)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-0.5 border transition-all ${
                        stars === num
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-105'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>★</span>
                      <span>{num}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={stars}
                      onChange={(e) => setStars(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 text-xs font-bold border border-slate-300 rounded-lg text-center focus:border-amber-500 outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold">★</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-3 rounded-xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Anulează
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? 'Salvează Modificările' : 'Publică Exercițiul'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Previzualizare Tabletă */}
        {showPreview && (
          <div className="lg:col-span-5 bg-slate-900 p-5 rounded-3xl border-4 border-slate-800 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-white/70 text-xs mb-4">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Previzualizare Tabletă Copil
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-amber-300 font-bold">
                  +{stars} ★ Steluțe
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  <span>{subject === 'math' ? '🔢 Matematică' : '📚 Comunicare'}</span>
                  <span>•</span>
                  <span>{topic || 'Exercițiu Nou'}</span>
                </div>

                <div className="text-base font-extrabold text-slate-800 leading-snug">
                  {prompt || 'Cerința exercițiului va apărea aici...'}
                </div>

                {format === 'multiple_choice' ? (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {options.filter(Boolean).length > 0 ? (
                      options.filter(Boolean).map((opt, i) => (
                        <div
                          key={i}
                          className="bg-amber-100/70 border-2 border-amber-300 text-amber-900 font-bold p-3 rounded-xl text-center text-sm shadow-sm"
                        >
                          {opt}
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="bg-slate-100 p-3 rounded-xl text-center text-xs text-slate-400 font-bold">Opțiunea 1</div>
                        <div className="bg-slate-100 p-3 rounded-xl text-center text-xs text-slate-400 font-bold">Opțiunea 2</div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {dragItemsString.split(',').map((item, i) => (
                      <div
                        key={i}
                        className="bg-purple-100 border-2 border-purple-300 text-purple-900 font-black px-4 py-2 rounded-xl text-center text-sm shadow-sm"
                      >
                        {item.trim()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {hint && (
              <div className="mt-4 text-xs bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 p-3 rounded-xl">
                💡 <strong>Indiciu ajutător:</strong> {hint}
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Lista Exercițiilor Create cu butoane Editare & Ștergere */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800">
          Exerciții Disponibile în Baza de Date ({exercisesList.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercisesList.map((ex) => (
            <div
              key={ex.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    ex.subject === 'math' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ex.subject === 'math' ? '🔢 Matematică' : '📚 Comunicare'}
                  </span>
                  <span className="text-amber-600 font-bold text-xs">+{ex.stars}★</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{ex.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ex.prompt}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold">{ex.topic}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(ex)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Editează exercițiul"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ex.id, ex.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Șterge exercițiul"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
