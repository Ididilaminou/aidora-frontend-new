
# 🩸 Aidora — Frontend

Interface web de la plateforme **Aidora** : gestion du don de sang, des banques de sang et des hôpitaux au **Cameroun**.

![Version](https://img.shields.io/badge/version-1.0.0-red)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)
![License](https://img.shields.io/badge/license-Academic-green)

---

## 📖 À propos

Aidora connecte les **donneurs de sang** aux **banques de sang** et **hôpitaux** en temps réel. La plateforme permet de :

- 🩸 Trouver un donneur compatible en urgence
- 📅 Prendre rendez-vous pour un don
- 📊 Gérer les stocks de poches de sang
- 🏥 Gérer les demandes inter-établissements
- 📍 Visualiser les établissements sur une carte interactive
- 🔔 Recevoir des notifications en temps réel

---

## 🚀 Stack technique

| Catégorie | Technologie |
|---|---|
| **Framework** | React 19 |
| **Langage** | TypeScript 5 |
| **Bundler** | Vite 6 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router 7 |
| **Data fetching** | TanStack Query (React Query) |
| **Cartographie** | Leaflet + React Leaflet |
| **Graphiques** | Recharts |
| **Icônes** | Lucide React |
| **HTTP** | Axios |
| **Validation** | Zod (via API) |

---

## 📋 Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Backend Aidora** démarré (par défaut : `http://localhost:4000`)

---

## ⚙️ Installation

```bash
# 1. Cloner le repo
git clone https://github.com/Ididilaminou/aidora-frontend-new.git
cd aidora-frontend-new

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.example .env
```

### Fichier `.env`

```env
# Backend local
VITE_API_URL=http://localhost:4000/api

# OU Backend en production (Render)
# VITE_API_URL=https://aidora-backend-voj6.onrender.com/api
```

### Lancer l'application

```bash
npm run dev
```

➡️ Application disponible sur **http://localhost:5173**

---

## 📜 Scripts npm

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (Vite) |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build de production |
| `npm run lint` | Analyse ESLint |

---

## 📁 Structure du projet

```
src/
├── components/                # UI réutilisable
│   ├── auth/                  # CanDo (permissions)
│   ├── carte/                 # CarteInteractive, CartePicker
│   ├── charts/                # Graphiques Recharts
│   ├── forms/                 # FormField, FormError
│   ├── layout/                # Header, Sidebar, Footer, PageLayout
│   └── ui/                    # Button, Input, Modal, Card, Toast...
├── config/                    # Configuration
│   ├── constants.ts           # Constantes app (nom, version, slogan)
│   ├── permissions.ts         # Matrice de permissions
│   ├── roles.ts               # Rôles et routes par rôle
│   ├── routes.ts              # Routes et labels
│   └── theme.ts               # Thème (couleurs, tailles)
├── context/                   # Contextes React
│   ├── AuthContext.tsx        # Authentification
│   ├── ThemeContext.tsx       # Mode clair/sombre
│   └── ToastContext.tsx       # Notifications toast
├── features/                  # Modules métier
│   ├── auth/                  # Login, Register, Activation
│   ├── dashboard/             # Dashboards par rôle
│   ├── donneurs/              # Espace donneur
│   ├── dons/                  # Gestion des dons
│   ├── stocks/                # Stocks de poches
│   ├── poches/                # Gestion des poches
│   ├── demandes/              # Demandes inter-établissements
│   ├── rdv/                   # Rendez-vous
│   ├── notifications/         # Notifications
│   ├── etablissements/        # Gestion des établissements
│   ├── personnels/            # Gestion du personnel
│   ├── carte/                 # Carte interactive
│   ├── statistiques/          # Statistiques
│   ├── rapports/              # Rapports
│   ├── journalAudit/          # Journal d'audit
│   ├── sollicitations/        # Sollicitations donneurs
│   ├── ia/                    # Pré-évaluation IA
│   ├── parametres/            # Paramètres utilisateur
│   └── landing/               # Page d'accueil publique
├── hooks/                     # Hooks personnalisés
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   ├── useRechercheGlobale.ts
│   ├── useTheme.ts
│   └── useToast.ts
├── services/                  # Services externes
│   ├── api.ts                 # Instance Axios + intercepteurs
│   └── storage.ts             # LocalStorage (token, user)
├── styles/                    # Styles globaux
│   ├── index.css              # Design system (@theme Tailwind)
│   └── animations.css         # Animations personnalisées
├── types/                     # Types TypeScript
│   ├── banque.ts
│   ├── donneur.ts
│   ├── utilisateur.ts
│   └── ...
├── utils/                     # Utilitaires
│   ├── cn.ts                  # clsx + tailwind-merge
│   ├── format.ts              # Formats (date, nombre)
│   └── validators.ts          # Validateurs
├── App.tsx                    # Routes principales
└── main.tsx                   # Point d'entrée
```

---

## ✨ Fonctionnalités principales

### 🔐 Authentification

- Connexion par email **ou** téléphone
- Inscription donneur avec géolocalisation
- Activation de compte par code (email + SMS)
- Réinitialisation de mot de passe

### 👥 Multi-rôles (4 rôles)

| Rôle | Accès |
|---|---|
| **ADMINISTRATEUR** | Gestion globale, statistiques, validation |
| **PERSONNEL_BANQUE** | Stocks, poches, dons, demandes |
| **PERSONNEL_HOPITAL** | Demandes de sang, réception |
| **DONNEUR** | Profil, RDV, dons, éligibilité |

### 📊 Tableaux de bord

- **Dashboard admin** : vue globale de la plateforme
- **Dashboard banque** : stocks, poches, dons
- **Dashboard hôpital** : demandes, réceptions
- **Dashboard donneur** : RDV, historique, carte

### 🗺️ Carte interactive

- Affichage de **tous les établissements** (banques + hôpitaux)
- Affichage des **donneurs géolocalisés** avec groupe sanguin
- Position de l'utilisateur en temps réel
- Filtres par type (banques, hôpitaux, donneurs)
- Carte locale par rôle (personnel voit son établissement)

### 🩸 Gestion des dons

- Enregistrement des dons
- Génération automatique de poches
- Suivi du cycle de vie (contrôle → disponible → distribuée)
- Alertes de péremption

### 📋 Demandes inter-établissements

- Création de demandes urgentes
- Validation/rejet par la banque
- Livraison et confirmation de réception
- Notifications en temps réel

### 🔔 Notifications

- Notifications système, alertes, urgences
- Marquer comme lu / tout lire
- Badge sur le sidebar

### 🌓 Thème

- Mode **clair** / **sombre** / **auto**
- Sauvegarde dans le localStorage
- Design system centralisé via `src/styles/index.css`

### 🔍 Recherche globale

- Recherche multi-sources (pages, poches, demandes, établissements)
- Filtrée par rôle
- Raccourci clavier (à venir : `Ctrl+K`)

---

## 🔑 Comptes de test

> **⚠️ Ces comptes sont fournis pour le développement et les démos. À supprimer avant la mise en production réelle.**

### Mot de passe commun : `Test1234!`

| Rôle | Email | Mot de passe |
|---|---|---|
| **ADMINISTRATEUR** | `admin@aidora.cm` | `Test1234!` |
| **PERSONNEL_BANQUE** | `paul.kamga@aidora.cm` | `Test1234!` |
| **PERSONNEL_BANQUE** | `sarah.nkemi@aidora.cm` | `Test1234!` |
| **PERSONNEL_BANQUE** | `eric.tchoua@aidora.cm` | `Test1234!` |
| **PERSONNEL_HOPITAL** | `jean.fotso@aidora.cm` | `Test1234!` |
| **PERSONNEL_HOPITAL** | `marie.tabi@aidora.cm` | `Test1234!` |
| **PERSONNEL_HOPITAL** | `andre.mballa@aidora.cm` | `Test1234!` |
| **DONNEUR** | `jean.mbarga0@test.cm` | `Test1234!` |
| **DONNEUR** | `marie.ngo1@test.cm` | `Test1234!` |
| **DONNEUR** | `paul.fonkou2@test.cm` | `Test1234!` |

**Autres donneurs** : voir le script `seed.js` du backend pour la liste complète (30 donneurs).

---

## 🌐 Déploiement

### Frontend — Vercel

| Environnement | URL |
|---|---|
| **Production** | https://aidora-health.vercel.app |
| **Backend API** | https://aidora-backend-voj6.onrender.com/api |

### Variables d'environnement (Vercel)

```env
VITE_API_URL=https://aidora-backend-voj6.onrender.com/api
```

### Comment redéployer

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

→ Vercel redéploie automatiquement en ~1 minute.

---

## 🔧 Configuration du backend

Le frontend attend une API REST avec les endpoints suivants :

- `POST /api/auth/login` — Connexion
- `POST /api/auth/inscription-donneur` — Inscription
- `POST /api/auth/activation` — Activation par code
- `GET /api/donneurs/moi` — Profil donneur
- `GET /api/etablissements` — Liste des établissements
- `GET /api/stocks` — Stocks
- `GET /api/demandes` — Demandes
- `GET /api/notifications` — Notifications
- ... (voir `src/services/api.ts`)

---

## 🎨 Personnalisation du thème

Toute la charte graphique est centralisée dans **`src/styles/index.css`** (bloc `@theme`).

Pour changer la couleur principale :

```css
@theme {
  --color-primary-500: #dc2626;  /* ← modifier ici */
  --color-primary-600: #b91c1c;
  /* ... */
}
```

→ **Toute l'application change instantanément.**

---

## 🧪 Tests

```bash
# Lint
npm run lint

# Build de test
npm run build
```

---

## 📝 Conventions de code

- **Composants** : PascalCase (`Button.tsx`, `Card.tsx`)
- **Hooks** : préfixe `use` (`useAuth.ts`, `useToast.ts`)
- **Utilitaires** : camelCase (`formatDate`, `cn`)
- **Types** : PascalCase avec `interface` ou `type`
- **Noms français** : `utilisateur`, `donneur`, `etablissement`, `motDePasse`, etc.
- **Pas de couleur en dur** : toujours utiliser les classes Tailwind du design system

---

## 🐛 Résolution de problèmes

### Le frontend n'arrive pas à joindre le backend

1. Vérifier que `VITE_API_URL` est bien défini dans `.env`
2. Vérifier que le backend tourne (`http://localhost:4000/api/health`)
3. Vérifier CORS côté backend (`FRONTEND_URL` dans `.env` backend)

### Erreur CORS

Sur le backend, ajouter l'URL du frontend dans `FRONTEND_URL` :

```env
FRONTEND_URL=https://aidora-health.vercel.app
```

### La carte ne s'affiche pas

Vérifier que `leaflet/dist/leaflet.css` est bien importé dans `src/styles/index.css`.

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m "feat: ma feature"`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Projet académique — **Aidora © 2026**

Tous droits réservés.

---

## 👥 Auteurs

- **Souleymane Laminou** — Développeur Full-Stack
- **Encadreur académique** — [Nom à compléter]
- **Encadreur professionnel** — [Nom à compléter]

---

## 📞 Contact

- 📧 Email : `contact@aidora.cm`
- 🌐 Site : https://aidora-health.vercel.app
- 📱 Téléphone : +237 6XX XX XX XX

---

## 🙏 Remerciements

- L'équipe **React** et **Vite** pour leurs outils exceptionnels
- **Vercel** et **Render** pour l'hébergement gratuit
- **TiDB Cloud** pour la base de données MySQL compatible
- **Brevo** pour l'envoi d'emails transactionnels
- La communauté **OpenStreetMap** pour les données cartographiques


<p align="center">
  <strong>🩸 Aidora — Chaque goutte sauve une vie.</strong>
</p>
