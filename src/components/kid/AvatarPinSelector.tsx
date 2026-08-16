import React, { useState } from 'react';
import type { Child } from '../../types';
import { sounds } from '../../utils/audio';
import { ShieldAlert, Delete, Sparkles } from 'lucide-react';

interface Props {
  childrenList: Child[];
  onSelectChild: (child: Child) => void;
  onOpenParentGate: () => void;
}

export const AvatarPinSelector: React.FC<Props> = ({
  childrenList,
  onSelectChild,
  onOpenParentGate,
}) => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorAnimation, setErrorAnimation] = useState<boolean>(false);

  const handleSelectAvatar = (child: Child) => {
    sounds.playPop();
    if (!child.pin || child.pin === '0000') {
      onSelectChild(child);
      return;
    }
    setSelectedChild(child);
    setEnteredPin('');
  };

  const handlePinPress = (digit: string) => {
    if (enteredPin.length >= 4) return;
    sounds.playPop();
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);

    if (newPin.length === 4 && selectedChild) {
      if (newPin === selectedChild.pin) {
        sounds.playSuccess();
        setTimeout(() => {
          onSelectChild(selectedChild);
        }, 200);
      } else {
        sounds.playEncouragement();
        setErrorAnimation(true);
        setTimeout(() => {
          setEnteredPin('');
          setErrorAnimation(false);
        }, 600);
      }
    }
  };

  const handleDeleteDigit = () => {
    sounds.playPop();
    setEnteredPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-600 flex flex-col justify-between p-4 sm:p-6 text-white select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="font-extrabold text-sm tracking-wide">EduSmart Kids</span>
        </div>

        <button
          onClick={() => {
            sounds.playPop();
            onOpenParentGate();
          }}
          className="flex items-center gap-1.5 bg-black/25 hover:bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
        >
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          <span>Zona Părinților</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto my-auto text-center space-y-6">
        {!selectedChild ? (
          <div className="space-y-6 animate-pop">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-yellow-300 drop-shadow-md">
                Cine se joacă astăzi?
              </h1>
              <p className="text-sm font-bold text-white/80 mt-1">
                Apasă pe avatarul tău magic pentru a începe!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {childrenList.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleSelectAvatar(child)}
                  className="btn-bouncy bg-white text-slate-800 p-5 rounded-3xl flex flex-col items-center gap-2 shadow-xl border-4 border-yellow-300 transition-all hover:scale-105 active:scale-95"
                >
                  <span className="text-5xl sm:text-6xl animate-float">{child.avatar}</span>
                  <span className="text-xl font-black">{child.name}</span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-0.5 rounded-full">
                    ★ {child.totalStars} steluțe
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-lg p-6 rounded-3xl text-slate-800 shadow-2xl border-4 border-yellow-300 space-y-5 animate-pop">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedChild(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ◀ Schimbă Avatarul
              </button>
              <div className="text-3xl">{selectedChild.avatar}</div>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-800">
                Introdu codul tău secret, {selectedChild.name}!
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">PIN-ul tău din 4 cifre</p>
            </div>

            <div className={`flex justify-center gap-3 py-2 ${errorAnimation ? 'animate-bounce text-rose-500' : ''}`}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    enteredPin.length > idx
                      ? 'bg-indigo-600 border-indigo-600 scale-110'
                      : 'border-slate-300 bg-slate-100'
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handlePinPress(digit)}
                  className="btn-bouncy h-14 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-950 font-black text-2xl flex items-center justify-center active:bg-indigo-200"
                >
                  {digit}
                </button>
              ))}
              <div className="flex items-center justify-center text-xs text-slate-400 font-bold">
                Cod: {selectedChild.pin}
              </div>
              <button
                onClick={() => handlePinPress('0')}
                className="btn-bouncy h-14 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-950 font-black text-2xl flex items-center justify-center active:bg-indigo-200"
              >
                0
              </button>
              <button
                onClick={handleDeleteDigit}
                className="btn-bouncy h-14 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-600 font-black flex items-center justify-center active:bg-rose-200"
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-white/60 font-semibold">
        Platformă Educațională Interactivă • Matematică & Comunicare
      </div>
    </div>
  );
};
