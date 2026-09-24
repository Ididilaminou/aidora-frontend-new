# Aidora — Frontend

Interface web de la plateforme **Aidora** : gestion du don de sang, des banques de sang et des hôpitaux (Cameroun).

Stack : **React 19** + **TypeScript** + **Vite** + **Tailwind CSS** + **React Router** + **TanStack Query** + **Leaflet** + **Recharts**.

## Prérequis

- Node.js 20+
- npm
- Backend Aidora démarré (par défaut `http://localhost:4000`)

## Installation

```bash
npm install
cp .env.example .env   # si le fichier existe, sinon créer VITE_API_URL
npm run dev
```

Application disponible sur : `http://localhost:5173`

## Scripts

| Commande        | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Serveur de développement |
| `npm run build` | Build de production      |
| `npm run preview` | Prévisualiser le build |
| `npm run lint`  | ESLint                   |

## Structure

```
src/
├── components/     # UI réutilisable (layout, forms, charts, carte...)
├── config/         # routes, roles, permissions, theme, constants
├── context/        # Auth, Theme, Toast
├── features/       # Pages par domaine (auth, dashboard, carte, dons...)
├── hooks/
├── services/       # Appels API (axios)
├── styles/
├── types/
└── utils/
```

## Fonctionnalités principales

- Authentification (login, inscription donneur, activation)
- Tableaux de bord (admin, personnel, donneur)
- Carte interactive (Leaflet)
- Gestion des dons, stocks, demandes, RDV
- Graphiques (Recharts)
- Thème clair / sombre
- Permissions par rôle

## Configuration

Variable d'environnement recommandée :

```env
VITE_API_URL=http://localhost:4000/api
```

## Licence

Projet académique — Aidora © 2026


https://aidora-backend-voj6.onrender.com