import React, { useState } from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { isFirebaseConfigured } from '../../services/firebase';
import { Cloud, CloudOff, RefreshCw, Wifi, WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SyncIndicator: React.FC = () => {
  const { status, lastSynced, errorMessage, retry } = useSyncStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isFirebaseConfigured) {
    return (
      <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 cursor-default select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">Local</span>
        </div>
        {showTooltip && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl z-50">
            <p className="font-semibold mb-1">Mod Local</p>
            <p className="text-slate-300">Firebase nu este configurat. Datele sunt salvate local în browser.</p>
          </div>
        )}
      </div>
    );
  }

  const config = {
    synced: {
      dot: 'bg-emerald-500',
      pulse: 'animate-ping bg-emerald-400',
      badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'Sincronizat',
      pulsing: true,
    },
    syncing: {
      dot: 'bg-amber-500',
      pulse: 'animate-ping bg-amber-400',
      badge: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
      label: 'Sincronizare...',
      pulsing: true,
    },
    error: {
      dot: 'bg-red-500',
      pulse: 'animate-ping bg-red-400',
      badge: 'bg-red-50 border-red-200 text-red-700',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,
      label: 'Eroare',
      pulsing: false,
    },
    offline: {
      dot: 'bg-slate-400',
      pulse: '',
      badge: 'bg-slate-50 border-slate-200 text-slate-600',
      icon: <WifiOff className="w-3.5 h-3.5 text-slate-500" />,
      label: 'Offline',
      pulsing: false,
    },
    local: {
      dot: 'bg-slate-400',
      pulse: '',
      badge: 'bg-slate-100 border-slate-200 text-slate-500',
      icon: <CloudOff className="w-3.5 h-3.5 text-slate-400" />,
      label: 'Local',
      pulsing: false,
    },
  };

  const c = config[status];

  const formatTime = (d: Date | null) => {
    if (!d) return null;
    return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Badge principal */}
      <button
        onClick={status === 'error' || status === 'offline' ? retry : undefined}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-default select-none ${c.badge} ${
          (status === 'error' || status === 'offline') ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''
        }`}
        title={status === 'error' || status === 'offline' ? 'Click pentru a reîncerca' : undefined}
      >
        {/* Dot animat */}
        <span className="relative flex h-2 w-2">
          {c.pulsing && (
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${c.pulse}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
        </span>

        {/* Iconiță */}
        {c.icon}

        {/* Text */}
        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{c.label}</span>
      </button>

      {/* Tooltip detaliat */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 text-white text-xs rounded-xl p-3.5 shadow-2xl z-50 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm text-white">Firebase Cloud</span>
          </div>

          <div className={`flex items-center gap-2 py-1.5 px-2 rounded-lg mb-2 ${
            status === 'synced' ? 'bg-emerald-900/50 text-emerald-300' :
            status === 'syncing' ? 'bg-amber-900/50 text-amber-300' :
            status === 'error' ? 'bg-red-900/50 text-red-300' :
            'bg-slate-700 text-slate-300'
          }`}>
            {c.icon}
            <span className="font-semibold">
              {status === 'synced' && 'Conectat și sincronizat'}
              {status === 'syncing' && 'Se sincronizează...'}
              {status === 'error' && (errorMessage || 'Eroare de sincronizare')}
              {status === 'offline' && 'Fără conexiune la internet'}
              {status === 'local' && 'Mod local (Firebase inactiv)'}
            </span>
          </div>

          {lastSynced && (
            <p className="text-slate-400 flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              Ultima sincronizare: <span className="text-slate-200 font-medium">{formatTime(lastSynced)}</span>
            </p>
          )}

          {(status === 'error' || status === 'offline') && (
            <button
              onClick={retry}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reîncercați conexiunea
            </button>
          )}

          {status === 'synced' && (
            <p className="mt-2 text-slate-500 text-[10px]">Actualizare automată la fiecare 30s</p>
          )}
        </div>
      )}
    </div>
  );
};
