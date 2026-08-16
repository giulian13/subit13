# Subit13 - Platformă Educațională Interactivă (Matematică & Comunicare)

O aplicație web modernă, optimizată complet pentru tablete și telefoane (Touch-First), dedicată părinților și copiilor.

---

## 🌟 Funcționalități Principale

### 🛡️ Panoul Părinților
- **Autentificare cu Google / Gmail** și **Protecție prin cod PIN**.
- **Resetare PIN prin email**.
- **Gestiune profiluri copii** (nume, vârstă, avatare emoji amuzante, PIN facil).
- **Studio de creare exerciții** (Matematică & Comunicare) cu formate multiple choice și drag & drop.
- **Editare și ștergere** pentru exerciții și teme/misiuni create.
- **Asignare misiuni personalizate** pentru fiecare copil.
- **Rapoarte și grafice detaliate**: acuratețe generală, ritm de gândire (timp alocat) și evoluție pe discipline.
- **Optimizare stocare**: buton de curățare a rezolvărilor vechi pentru a rămâne în planul gratuit Firebase.

### 🚀 Spațiul Copiilor (Gamificat)
- Conectare facilă cu avatar + tastieră PIN tactilă mare.
- **Sunet vocal la cerere**: cerințele nu se mai citesc automat, ci doar la apăsarea butonului „Ascultă Cerința 📢”.
- Recompense instant: **steluțe animate** și **confetti 🎉**.
- Vitrină de **trofee și insigne deblocate**.

---

## ⚙️ Configurare Firebase (Opțional, dar recomandat pentru Cloud Sync)

1. Creează un proiect gratuit pe [Firebase Console](https://console.firebase.google.com/).
2. Activează **Authentication** (cu furnizorul *Google* activat).
3. Activează **Firestore Database** în *Test mode* sau cu reguli de autentificare.
4. Înregistrează o aplicație Web (`</>`) în setările proiectului.
5. Creează un fișier numit `.env.local` în rădăcina proiectului și adaugă cheile:

```env
VITE_FIREBASE_API_KEY=cheia_ta_de_la_firebase
VITE_FIREBASE_AUTH_DOMAIN=proiectul-tau.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=proiectul-tau
VITE_FIREBASE_STORAGE_BUCKET=proiectul-tau.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=numar_sender
VITE_FIREBASE_APP_ID=app_id
```

*Notă: Dacă aceste variabile nu sunt setate, aplicația funcționează perfect în mod local (LocalStorage).*

---

## 🚀 Publicare pe GitHub & Netlify

### Pasul 1: Urcare pe GitHub
```bash
git init
git add .
git commit -m "Initial commit EduSmart"
git branch -M main
git remote add origin https://github.com/UTILIZATORUL_TAU/platforma_teme.git
git push -u origin main
```

### Pasul 2: Deploy pe Netlify
1. Creează cont pe [Netlify](https://www.netlify.com/) și selectează **Add new site** -> **Import an existing project** -> **GitHub**.
2. Selectează depozitul `platforma_teme`.
3. Setările de build sunt detectate automat (`npm run build` și directorul `dist`).
4. Adaugă variabilele de mediu `VITE_FIREBASE_*` în secțiunea **Environment variables**.
5. Apasă **Deploy site**.
