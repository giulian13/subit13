import React, { useState } from 'react';
import type { Exercise, AttemptHistory, Child } from '../../types';
import { db } from '../../services/storage';
import { sounds, speakText } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, Check, ArrowRight, HelpCircle } from 'lucide-react';

interface Props {
  child: Child;
  exercise: Exercise;
  onFinish: () => void;
}

export const ExercisePlayer: React.FC<Props> = ({ child, exercise, onFinish }) => {
  const [startTime] = useState<number>(Date.now());
  const [attemptsCount, setAttemptsCount] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Stare pentru Drag & Drop / Reordonare
  const [orderedItems, setOrderedItems] = useState<string[]>(
    exercise.data.items ? [...exercise.data.items] : []
  );

  const [feedback, setFeedback] = useState<'idle' | 'success' | 'retry'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);

  // NOTĂ: Am eliminat citirea automată din useEffect!
  // Cerința se citește EXCLUSIV când este apăsat butonul „Ascultă Cerința 📢”.

  // Declanșare Confetti la succes
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Verificare Răspuns Grilă
  const handleOptionSelect = (option: string) => {
    if (feedback === 'success') return;
    setSelectedOption(option);
    sounds.playPop();

    const isCorrect = option === exercise.data.correctAnswer;

    if (isCorrect) {
      handleSuccess();
    } else {
      handleWrong();
    }
  };

  // Verificare Reordonare
  const checkReorder = () => {
    if (!exercise.data.targetOrder) return;
    const isCorrect = JSON.stringify(orderedItems) === JSON.stringify(exercise.data.targetOrder);

    if (isCorrect) {
      handleSuccess();
    } else {
      handleWrong();
    }
  };

  const handleSuccess = () => {
    sounds.playSuccess();
    triggerConfetti();
    setFeedback('success');

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    
    const attempt: AttemptHistory = {
      id: 'at_' + Date.now(),
      childId: child.id,
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      subject: exercise.subject,
      isCorrect: true,
      attemptsCount: attemptsCount,
      durationSeconds,
      starsEarned: exercise.stars,
      timestamp: new Date().toISOString()
    };

    db.recordAttempt(attempt);
  };

  const handleWrong = () => {
    sounds.playEncouragement();
    setFeedback('retry');
    setAttemptsCount(prev => prev + 1);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= orderedItems.length) return;
    sounds.playPop();
    const newItems = [...orderedItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setOrderedItems(newItems);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-200 relative overflow-hidden">
        
        {/* Header Exercițiu */}
        <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b-2 border-amber-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{exercise.subject === 'math' ? '🔢' : '📚'}</span>
            <span className="font-extrabold text-xs sm:text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {exercise.topic}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-400 text-amber-950 font-black px-3.5 py-1.5 rounded-2xl shadow-sm text-sm">
            <Sparkles className="w-4 h-4 fill-amber-950" />
            <span>+{exercise.stars} ★</span>
          </div>
        </div>

        {/* Buton Citire Vocală + Cerința */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <button
              onClick={() => {
                sounds.playPop();
                speakText(exercise.prompt);
              }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold px-4 py-2 rounded-2xl flex items-center gap-2 text-sm shadow-md active:scale-95 transition-all"
            >
              <Volume2 className="w-5 h-5" />
              <span>Ascultă Cerința 📢</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug px-2">
            {exercise.prompt}
          </h2>

          {exercise.data.visualItem && exercise.data.visualCount && (
            <div className="py-4 flex flex-wrap justify-center gap-3 text-4xl sm:text-5xl animate-float">
              {Array.from({ length: exercise.data.visualCount }).map((_, i) => (
                <span key={i} className="hover:scale-125 transition-transform cursor-pointer">
                  {exercise.data.visualItem}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Zona de Interacțiune / Răspuns */}
        <div className="mt-8">
          {exercise.format === 'multiple_choice' && exercise.data.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exercise.data.options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isCorrectAnswer = option === exercise.data.correctAnswer;
                
                let btnStyle = "bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100 hover:border-amber-300";
                if (feedback === 'success' && isCorrectAnswer) {
                  btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-lg scale-105";
                } else if (feedback === 'retry' && isSelected) {
                  btnStyle = "bg-rose-100 border-rose-300 text-rose-800";
                }

                return (
                  <button
                    key={index}
                    disabled={feedback === 'success'}
                    onClick={() => handleOptionSelect(option)}
                    className={`btn-bouncy p-5 rounded-2xl border-4 text-lg sm:text-xl font-extrabold transition-all flex items-center justify-center min-h-[75px] ${btnStyle}`}
                  >
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {exercise.format === 'drag_and_drop' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-3">
                {orderedItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 border-4 border-purple-300 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-purple-950 shadow-md">
                      {item}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0 || feedback === 'success'}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold disabled:opacity-30"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === orderedItems.length - 1 || feedback === 'success'}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold disabled:opacity-30"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {feedback !== 'success' && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={checkReorder}
                    className="btn-bouncy bg-purple-600 hover:bg-purple-700 text-white font-black px-8 py-3.5 rounded-2xl text-lg shadow-lg flex items-center gap-2"
                  >
                    <Check className="w-6 h-6" />
                    <span>Verifică Ordinea!</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feedback la Greșeală */}
        {feedback === 'retry' && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center animate-pop">
            <p className="font-extrabold text-amber-900 text-sm sm:text-base">
              🌟 Ești foarte aproape! Mai încearcă o dată, ai încredere în tine!
            </p>
            {exercise.data.hint && !showHint && (
              <button
                onClick={() => {
                  sounds.playPop();
                  setShowHint(true);
                  speakText(exercise.data.hint || '');
                }}
                className="mt-2 text-xs font-bold text-amber-700 underline flex items-center justify-center gap-1 mx-auto"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Vrei un indiciu ajutător?</span>
              </button>
            )}
          </div>
        )}

        {showHint && exercise.data.hint && (
          <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold text-center">
            💡 Indiciu: {exercise.data.hint}
          </div>
        )}

        {/* Overlay Succes */}
        {feedback === 'success' && (
          <div className="mt-8 pt-6 border-t-2 border-emerald-200 text-center space-y-4 animate-pop">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl font-black mb-1">
              🎉
            </div>
            <h3 className="text-2xl font-black text-emerald-800">
              Bravo, {child.name}! Ai reușit!
            </h3>
            <p className="text-sm font-bold text-emerald-700">
              Ai câștigat <strong className="text-amber-600 font-extrabold">+{exercise.stars} steluțe</strong> pentru colecția ta!
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  sounds.playPop();
                  onFinish();
                }}
                className="btn-bouncy bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg inline-flex items-center gap-2"
              >
                <span>Continuă Misiunea</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
