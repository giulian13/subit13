import { useState } from 'react';
import type { Child } from './types';
import { db } from './services/storage';
import { ParentPortal } from './components/parent/ParentPortal';
import { ParentAuthModal } from './components/parent/ParentAuthModal';
import { AvatarPinSelector } from './components/kid/AvatarPinSelector';
import { KidDashboard } from './components/kid/KidDashboard';

export function App() {
  const [viewMode, setViewMode] = useState<'kid_login' | 'kid_play' | 'parent'>('parent');
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>(db.getChildren());

  // Modal autentificare părinte (PIN + Google Login)
  const [isParentAuthOpen, setIsParentAuthOpen] = useState<boolean>(false);

  const refreshChildren = () => {
    const updated = db.getChildren();
    setChildrenList(updated);
    if (activeChild) {
      const current = updated.find(c => c.id === activeChild.id);
      if (current) setActiveChild(current);
    }
  };

  return (
    <div className="min-h-screen">
      {/* 1. PORTALUL PĂRINȚILOR */}
      {viewMode === 'parent' && (
        <ParentPortal
          onSwitchToKidMode={(child) => {
            setActiveChild(child);
            setViewMode('kid_play');
          }}
          onLockParentPortal={() => {
            setViewMode('kid_login');
          }}
        />
      )}

      {/* 2. ECRAN SELECTARE AVATAR & PIN COPIL */}
      {viewMode === 'kid_login' && (
        <AvatarPinSelector
          childrenList={childrenList}
          onSelectChild={(child) => {
            setActiveChild(child);
            setViewMode('kid_play');
          }}
          onOpenParentGate={() => setIsParentAuthOpen(true)}
        />
      )}

      {/* 3. HUB-UL DE JOC ȘI MISIUNI AL COPILULUI */}
      {viewMode === 'kid_play' && activeChild && (
        <KidDashboard
          child={activeChild}
          onLogout={() => {
            setActiveChild(null);
            setViewMode('kid_login');
          }}
          onRefreshChild={refreshChildren}
        />
      )}

      {/* Modal Autentificare Părinte (Google Sign-In + PIN + Resetare Email) */}
      {isParentAuthOpen && (
        <ParentAuthModal
          onSuccess={() => {
            setIsParentAuthOpen(false);
            setViewMode('parent');
          }}
          onCancel={() => setIsParentAuthOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
