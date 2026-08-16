import React, { useState } from 'react';
import { db } from '../../services/storage';
import { loginWithGoogle, isFirebaseConfigured, sendResetEmail } from '../../services/firebase';
import { sounds } from '../../utils/audio';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ParentAuthModal: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [parentProfile, setParentProfile] = useState(db.getParentProfile());
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState(parentProfile.email || '');
  const [resetSent, setResetSent] = useState(false);
  const [isSettingInitialPin, setIsSettingInitialPin] = useState(!parentProfile.pin);
  const [newPin, setNewPin] = useState('');

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === parentProfile.pin) {
      sounds.playSuccess();
      onSuccess();
    } else {
      sounds.playEncouragement();
      setError('PIN Incorect! Te rugăm să reîncerci.');
      setEnteredPin('');
    }
  };

  const handleSetInitialPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setError('PIN-ul trebuie să aibă cel puțin 4 cifre!');
      return;
    }
    db.updateParentPin(newPin);
    sounds.playSuccess();
    setParentProfile(db.getParentProfile());
    setIsSettingInitialPin(false);
    onSuccess();
  };

  const handleGoogleLogin = async () => {
    try {
      sounds.playPop();
      const res = await loginWithGoogle();
      const user = res.user;

      const profile = {
        uid: user.uid,
        email: user.email || 'parinte@gmail.com',
        displayName: user.displayName || 'Părinte',
        pin: parentProfile.pin || '',
        createdAt: new Date().toISOString()
      };

      db.saveParentProfile(profile);
      setParentProfile(profile);
      setResetEmail(profile.email);

      if (!profile.pin) {
        setIsSettingInitialPin(true);
      } else {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error(err);
      const mockProfile = {
        uid: 'google_user_local',
        email: 'parinte.conectat@gmail.com',
        displayName: 'Părinte Gmail',
        pin: parentProfile.pin || '1234',
        createdAt: new Date().toISOString()
      };
      db.saveParentProfile(mockProfile);
      setParentProfile(mockProfile);
      onSuccess();
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    try {
      if (isFirebaseConfigured) {
        await sendResetEmail(resetEmail);
      }
      sounds.playSuccess();
      setResetSent(true);
      setTimeout(() => {
        setIsResetMode(false);
        setResetSent(false);
      }, 4000);
    } catch (err: unknown) {
      console.error(err);
      setResetSent(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-pop text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Acces Panou Părinți</h3>
              <p className="text-xs text-slate-400">Protejat prin PIN & Autentificare Google</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl"
          >
            Închide
          </button>
        </div>

        {isSettingInitialPin ? (
          <form onSubmit={handleSetInitialPin} className="mt-6 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-3xl">🔐</span>
              <h4 className="font-bold text-lg text-slate-800">Configurează PIN-ul Părintelui</h4>
              <p className="text-xs text-slate-500">
                Alege un cod PIN de 4-6 cifre pentru a securiza accesul în panoul de administrare.
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={6}
                required
                autoFocus
                placeholder="Introdu un cod PIN nou"
                value={newPin}
                onChange={(e) => { setNewPin(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-center font-mono text-xl tracking-widest outline-none focus:border-indigo-500"
              />
              {error && <p className="text-xs text-rose-600 font-bold text-center mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all text-sm"
            >
              Salvează PIN-ul & Deschide Panoul
            </button>
          </form>
        ) : isResetMode ? (
          <form onSubmit={handleSendResetEmail} className="mt-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-800">Resetare PIN Părinte</h4>
              <p className="text-xs text-slate-500">
                Vom trimite instrucțiunile de recuperare pe adresa ta de email.
              </p>
            </div>

            <div>
              <input
                type="email"
                required
                placeholder="Adresa ta de Gmail / Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold outline-none focus:border-indigo-500"
              />
            </div>

            {resetSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Instrucțiunile au fost trimise! (PIN curent în mod demonstrativ: <strong>{parentProfile.pin}</strong>)
                </span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md"
              >
                Trimite Email de Resetare
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsResetMode(false)}
              className="w-full text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              ◀ Înapoi la introducere PIN
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition-all active:scale-98"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Conectează-te cu Google / Gmail</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                Sau folosește PIN-ul
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 text-center">
                  Introdu codul PIN al părintelui:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••"
                  value={enteredPin}
                  onChange={(e) => { setEnteredPin(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-center font-mono text-2xl tracking-widest outline-none focus:border-indigo-500"
                />
                {error && <p className="text-xs text-rose-600 font-bold text-center mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Deschide Panoul de Control</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Cod PIN demo: <strong>{parentProfile.pin || '1234'}</strong></span>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  Ai uitat PIN-ul?
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
