import { useState, useEffect, useCallback } from 'react';
import { isFirebaseConfigured, firestore, auth, onAuthStateChanged } from '../services/firebase';
import { collection, getDocs } from '../services/firebase';

export type SyncStatus = 'local' | 'synced' | 'syncing' | 'error' | 'offline';

interface SyncState {
  status: SyncStatus;
  lastSynced: Date | null;
  errorMessage: string | null;
}

// Emitter simplu pentru a semnala o sincronizare din exterior
type SyncListener = (status: SyncStatus) => void;
const syncListeners = new Set<SyncListener>();

export const notifySyncStart = () => syncListeners.forEach(fn => fn('syncing'));
export const notifySyncDone = () => syncListeners.forEach(fn => fn('synced'));
export const notifySyncError = () => syncListeners.forEach(fn => fn('error'));

export function useSyncStatus(): SyncState & { retry: () => void } {
  const [state, setState] = useState<SyncState>({
    status: isFirebaseConfigured ? 'syncing' : 'local',
    lastSynced: null,
    errorMessage: null,
  });

  const checkConnection = useCallback(async () => {
    if (!isFirebaseConfigured || !firestore) {
      setState({ status: 'local', lastSynced: null, errorMessage: null });
      return;
    }

    setState(prev => ({ ...prev, status: 'syncing', errorMessage: null }));

    try {
      // Ping Firebase cu o operație lightweight
      await getDocs(collection(firestore, '_ping_'));
      setState({ status: 'synced', lastSynced: new Date(), errorMessage: null });
    } catch (err: unknown) {
      const isOffline =
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'unavailable';

      setState({
        status: isOffline ? 'offline' : 'error',
        lastSynced: null,
        errorMessage: isOffline
          ? 'Fără conexiune la internet'
          : 'Eroare sincronizare Firebase',
      });
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // Verificare inițială
    checkConnection();

    // Re-verificare la fiecare 30 secunde
    const interval = setInterval(checkConnection, 30_000);

    // Ascultă schimbări de stare auth (re-login = re-ping)
    let unsubAuth: (() => void) | undefined;
    if (auth) {
      unsubAuth = onAuthStateChanged(auth, () => checkConnection());
    }

    // Ascultă semnale externe (ex: după un save/delete)
    const listener: SyncListener = (status) => {
      if (status === 'synced') {
        setState({ status: 'synced', lastSynced: new Date(), errorMessage: null });
      } else if (status === 'syncing') {
        setState(prev => ({ ...prev, status: 'syncing' }));
      } else if (status === 'error') {
        setState(prev => ({ ...prev, status: 'error', errorMessage: 'Eroare sincronizare' }));
      }
    };
    syncListeners.add(listener);

    // Detectare online/offline din browser
    const handleOnline = () => checkConnection();
    const handleOffline = () =>
      setState(prev => ({ ...prev, status: 'offline', errorMessage: 'Fără conexiune la internet' }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      unsubAuth?.();
      syncListeners.delete(listener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  return { ...state, retry: checkConnection };
}
