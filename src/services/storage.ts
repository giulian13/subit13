import type { Child, Exercise, Assignment, AttemptHistory, Badge, ParentUser } from '../types';
import { 
  firestore, 
  isFirebaseConfigured, 
  doc, 
  setDoc, 
  deleteDoc, 
} from './firebase';

const INITIAL_PARENT: ParentUser = {
  uid: 'parent_local',
  email: '',
  displayName: '',
  pin: '1234',
  createdAt: new Date().toISOString()
};

// Copii: listă goală la început — părintele îi adaugă el
const INITIAL_CHILDREN: Child[] = [];

const INITIAL_BADGES: Badge[] = [
  {
    id: 'b1',
    title: 'Primul Pas',
    description: 'Ai rezolvat primul tău exercițiu!',
    icon: '🌟',
    category: 'general',
    requiredStars: 1
  },
  {
    id: 'b2',
    title: 'Micul Matematician',
    description: 'Ai strâns 20 de steluțe la matematică!',
    icon: '🔢',
    category: 'math',
    requiredStars: 20
  },
  {
    id: 'b3',
    title: 'Maestrul Cuvintelor',
    description: 'Ai completat 5 misiuni de comunicare!',
    icon: '📚',
    category: 'language',
    requiredStars: 15
  },
  {
    id: 'b4',
    title: 'Campionul Zilei',
    description: 'Ai terminat o misiune cu scor maxim!',
    icon: '🏆',
    category: 'streak',
    requiredStars: 30
  }
];

const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'm1',
    title: 'Numără merele din coș',
    subject: 'math',
    topic: 'Numărare & Adunare',
    difficulty: 1,
    format: 'multiple_choice',
    prompt: 'Dacă avem 4 mere roșii 🍎 și mai punem încă 3 mere 🍎, câte mere avem în total?',
    stars: 2,
    isTemplate: true,
    data: {
      visualItem: '🍎',
      visualCount: 7,
      options: ['5 mere', '7 mere', '8 mere', '6 mere'],
      correctAnswer: '7 mere',
      hint: 'Numără pe degete: 4... 5, 6, 7!'
    }
  },
  {
    id: 'm2',
    title: 'Adunarea Stelară',
    subject: 'math',
    topic: 'Calcul Rapid',
    difficulty: 2,
    format: 'multiple_choice',
    prompt: 'Calculează: 8 + 6 = ?',
    stars: 3,
    isTemplate: true,
    data: {
      options: ['12', '14', '15', '13'],
      correctAnswer: '14',
      hint: '8 + 2 fac 10, apoi mai adaugi 4.'
    }
  },
  {
    id: 'm3',
    title: 'Ordonează cifrele crescător',
    subject: 'math',
    topic: 'Ordonare Numere',
    difficulty: 1,
    format: 'drag_and_drop',
    prompt: 'Așază cifrele în ordine, de la cel mai mic la cel mai mare:',
    stars: 3,
    isTemplate: true,
    data: {
      items: ['9', '2', '5', '1'],
      targetOrder: ['1', '2', '5', '9'],
      hint: 'Începe cu numărul cel mai mic: 1.'
    }
  },
  {
    id: 'm4',
    title: 'Scăderea cu dinozauri',
    subject: 'math',
    topic: 'Scădere',
    difficulty: 1,
    format: 'multiple_choice',
    prompt: 'Erau 10 dinozauri 🦖. 4 dintre ei au plecat la somn. Câți dinozauri au rămas la joacă?',
    stars: 2,
    isTemplate: true,
    data: {
      visualItem: '🦖',
      visualCount: 6,
      options: ['6 dinozauri', '5 dinozauri', '7 dinozauri', '4 dinozauri'],
      correctAnswer: '6 dinozauri'
    }
  },
  {
    id: 'l1',
    title: 'Găsește cuvântul cu sens opus (Antonim)',
    subject: 'language',
    topic: 'Vocabular & Sensuri',
    difficulty: 1,
    format: 'multiple_choice',
    prompt: 'Care este cuvântul cu sens OPUS pentru cuvântul „CALD"?',
    stars: 2,
    isTemplate: true,
    data: {
      options: ['Fierbinte', 'Rece', 'Luminos', 'Iarnă'],
      correctAnswer: 'Rece',
      hint: 'Dacă vara este cald, iarna cum este afară?'
    }
  },
  {
    id: 'l2',
    title: 'Câte silabe are cuvântul?',
    subject: 'language',
    topic: 'Silabe & Ritm',
    difficulty: 1,
    format: 'multiple_choice',
    prompt: 'Bate din palme și numără silabele pentru: FLUTURAȘ 🦋',
    stars: 2,
    isTemplate: true,
    data: {
      options: ['2 silabe (flu-tur)', '3 silabe (flu-tu-raș)', '4 silabe', '1 silabă'],
      correctAnswer: '3 silabe (flu-tu-raș)',
      hint: 'Flu - tu - raș. Bate din palme de 3 ori!'
    }
  },
  {
    id: 'l3',
    title: 'Potrivește Rima',
    subject: 'language',
    topic: 'Poezie & Rime',
    difficulty: 2,
    format: 'multiple_choice',
    prompt: 'Ce cuvânt rimează frumos cu „SOARE"? ☀️',
    stars: 3,
    isTemplate: true,
    data: {
      options: ['Floare', 'Luna', 'Casă', 'Nori'],
      correctAnswer: 'Floare',
      hint: 'Soare... Floare! Amândouă se termină în -oare.'
    }
  },
  {
    id: 'l4',
    title: 'Formează cuvântul din litere',
    subject: 'language',
    topic: 'Ortografie & Cuvinte',
    difficulty: 2,
    format: 'drag_and_drop',
    prompt: 'Pune literele în ordine pentru a scrie numele animalului 🐱 (PISICĂ):',
    stars: 3,
    isTemplate: true,
    data: {
      items: ['S', 'P', 'C', 'I', 'Ă', 'I'],
      targetOrder: ['P', 'I', 'S', 'I', 'C', 'Ă'],
      hint: 'Începe cu litera P.'
    }
  }
];

// Teme: listă goală la început — părintele le creează el
const INITIAL_ASSIGNMENTS: Assignment[] = [];

// Încercări: listă goală la început
const INITIAL_ATTEMPTS: AttemptHistory[] = [];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`subit_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`subit_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // --- PARENT AUTH & PIN ---
  getParentProfile(): ParentUser {
    return this.get('parent_profile', INITIAL_PARENT);
  }

  saveParentProfile(parent: ParentUser): void {
    this.set('parent_profile', parent);
    if (isFirebaseConfigured && firestore) {
      setDoc(doc(firestore, 'parents', parent.uid), parent, { merge: true }).catch(console.error);
    }
  }

  updateParentPin(newPin: string): void {
    const parent = this.getParentProfile();
    parent.pin = newPin;
    this.saveParentProfile(parent);
  }

  // --- CHILDREN ---
  getChildren(): Child[] {
    return this.get('children', INITIAL_CHILDREN);
  }

  saveChild(child: Child): void {
    const children = this.getChildren();
    const index = children.findIndex(c => c.id === child.id);
    if (index >= 0) {
      children[index] = child;
    } else {
      children.push(child);
    }
    this.set('children', children);

    if (isFirebaseConfigured && firestore) {
      setDoc(doc(firestore, 'children', child.id), child, { merge: true }).catch(console.error);
    }
  }

  deleteChild(id: string): void {
    const children = this.getChildren().filter(c => c.id !== id);
    this.set('children', children);
    if (isFirebaseConfigured && firestore) {
      deleteDoc(doc(firestore, 'children', id)).catch(console.error);
    }
  }

  // --- EXERCISES ---
  getExercises(): Exercise[] {
    return this.get('exercises', INITIAL_EXERCISES);
  }

  saveExercise(exercise: Exercise): void {
    const exercises = this.getExercises();
    const index = exercises.findIndex(e => e.id === exercise.id);
    if (index >= 0) {
      exercises[index] = exercise;
    } else {
      exercises.unshift(exercise);
    }
    this.set('exercises', exercises);

    if (isFirebaseConfigured && firestore) {
      setDoc(doc(firestore, 'exercises', exercise.id), exercise, { merge: true }).catch(console.error);
    }
  }

  deleteExercise(id: string): void {
    const exercises = this.getExercises().filter(e => e.id !== id);
    this.set('exercises', exercises);
    if (isFirebaseConfigured && firestore) {
      deleteDoc(doc(firestore, 'exercises', id)).catch(console.error);
    }
  }

  // --- ASSIGNMENTS ---
  getAssignments(childId?: string): Assignment[] {
    const all = this.get('assignments', INITIAL_ASSIGNMENTS);
    if (childId) {
      return all.filter(a => a.childId === childId);
    }
    return all;
  }

  saveAssignment(assignment: Assignment): void {
    const assignments = this.get('assignments', INITIAL_ASSIGNMENTS);
    const index = assignments.findIndex(a => a.id === assignment.id);
    if (index >= 0) {
      assignments[index] = assignment;
    } else {
      assignments.unshift(assignment);
    }
    this.set('assignments', assignments);

    if (isFirebaseConfigured && firestore) {
      setDoc(doc(firestore, 'assignments', assignment.id), assignment, { merge: true }).catch(console.error);
    }
  }

  deleteAssignment(id: string): void {
    const assignments = this.get('assignments', INITIAL_ASSIGNMENTS).filter(a => a.id !== id);
    this.set('assignments', assignments);
    if (isFirebaseConfigured && firestore) {
      deleteDoc(doc(firestore, 'assignments', id)).catch(console.error);
    }
  }

  // --- BADGES ---
  getBadges(): Badge[] {
    return INITIAL_BADGES;
  }

  // --- ATTEMPTS & PROGRESS ---
  getAttempts(childId?: string): AttemptHistory[] {
    const all = this.get('attempts', INITIAL_ATTEMPTS);
    if (childId) {
      return all.filter(a => a.childId === childId);
    }
    return all;
  }

  recordAttempt(attempt: AttemptHistory): void {
    const attempts = this.getAttempts();
    attempts.unshift(attempt);
    this.set('attempts', attempts);

    if (isFirebaseConfigured && firestore) {
      setDoc(doc(firestore, 'attempts', attempt.id), attempt, { merge: true }).catch(console.error);
    }

    if (attempt.isCorrect && attempt.starsEarned > 0) {
      const children = this.getChildren();
      const child = children.find(c => c.id === attempt.childId);
      if (child) {
        child.totalStars += attempt.starsEarned;
        
        INITIAL_BADGES.forEach(badge => {
          if (child.totalStars >= badge.requiredStars && !child.unlockedBadges.includes(badge.id)) {
            child.unlockedBadges.push(badge.id);
          }
        });

        this.saveChild(child);
      }
    }
  }

  cleanOldAttempts(daysThreshold = 30): number {
    const cutoff = Date.now() - daysThreshold * 86400000;
    const all = this.getAttempts();
    const kept = all.filter(a => new Date(a.timestamp).getTime() >= cutoff);
    const removedCount = all.length - kept.length;
    this.set('attempts', kept);
    return removedCount;
  }

  resetToDefault(): void {
    localStorage.clear();
    window.location.reload();
  }
}

export const db = new StorageService();
