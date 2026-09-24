// ============================================================
// AIDORA — CONTENU DE LA LANDING PAGE
// ------------------------------------------------------------
// Tous les TEXTES et DONNÉES de la page d'accueil.
// Pour modifier la landing, tu n'as qu'à éditer CE fichier.
// ============================================================

import {
  UserPlus,
  ClipboardCheck,
  CalendarPlus,
  Heart,
  Search,
  BellRing,
  CalendarDays,
  Building2,
  LineChart,
  ShieldCheck,
  Users,
  Award,
  Droplets,
} from "lucide-react";

// ------------------------------------------------------------
// NAVBAR — liens du menu
// ------------------------------------------------------------
export const NAV_LINKS = [
  { label: "Accueil",        href: "#accueil" },
  { label: "Fonctionnement", href: "#fonctionnement" },
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Compatibilité",  href: "#compatibilite" },
  { label: "Contact",        href: "#contact" },
];

// ------------------------------------------------------------
// HERO — section d'accroche
// ------------------------------------------------------------
export const HERO = {
  badge: "Nouvelle plateforme de don de sang au Cameroun",
  titreLigne1: "Chaque goutte",
  titreLigne2: "sauve une vie.",
  description:
    "Aidora connecte les donneurs de sang aux banques et hôpitaux en temps réel. Trouvez un donneur, prenez rendez-vous et sauvez des vies — en quelques clics.",
  ctaPrimaire: "Devenir donneur",
  ctaSecondaire: "Comment ça marche",
  preuveSociale: "+2 500 donneurs",
  preuveSocialeSous: "déjà inscrits",
  badgeGratuit: "100 % gratuit",
  badgeFlottantHaut: { label: "Compatible", valeur: "O− disponible" },
  badgeFlottantBas:  { label: "Banques proches", valeur: "12 établissements" },
  badgeFlottantDroite: { label: "Ce mois", valeur: "+248 dons" },
  badgeFlottantGauche: { label: "Niveau", valeur: "Donneur Or" },
};

// ------------------------------------------------------------
// STATS — chiffres clés (avec compteur animé)
// ------------------------------------------------------------
export const STATS = [
  { valeur: 2500, suffixe: "+", libelle: "Donneurs inscrits",           icone: Users },
  { valeur: 180,  suffixe: "+", libelle: "Établissements partenaires",  icone: Building2 },
  { valeur: 4200, suffixe: "+", libelle: "Dons réalisés",               icone: Droplets },
  { valeur: 98,   suffixe: "%", libelle: "Taux de satisfaction",        icone: Award },
];

// ------------------------------------------------------------
// FONCTIONNEMENT — 4 étapes
// ------------------------------------------------------------
export const ETAPES = [
  {
    icone: UserPlus,
    titre: "Créez votre compte",
    description:
      "Inscrivez-vous en tant que donneur ou établissement de santé en moins de 2 minutes.",
  },
  {
    icone: ClipboardCheck,
    titre: "Vérifiez votre éligibilité",
    description:
      "Répondez à un questionnaire médical rapide pour confirmer que vous pouvez donner.",
  },
  {
    icone: CalendarPlus,
    titre: "Prenez rendez-vous",
    description:
      "Choisissez l'établissement et l'heure qui vous conviennent. Confirmation instantanée.",
  },
  {
    icone: Heart,
    titre: "Sauvez une vie",
    description:
      "Présentez-vous au rendez-vous. Votre don peut sauver jusqu'à 3 vies.",
  },
];

// ------------------------------------------------------------
// FONCTIONNALITÉS — 6 cartes
// ------------------------------------------------------------
export const FONCTIONNALITES = [
  {
    icone: Search,
    titre: "Recherche en temps réel",
    description:
      "Trouvez instantanément un donneur compatible près de chez vous grâce à notre moteur géolocalisé.",
  },
  {
    icone: BellRing,
    titre: "Alertes d'urgence",
    description:
      "Recevez une notification lorsqu'un hôpital proche a un besoin urgent de votre groupe sanguin.",
  },
  {
    icone: CalendarDays,
    titre: "Rendez-vous en ligne",
    description:
      "Planifiez votre don en quelques clics et recevez une confirmation immédiate par email et SMS.",
  },
  {
    icone: Building2,
    titre: "Multi-établissements",
    description:
      "Hôpitaux et banques de sang gèrent stocks, donneurs et demandes depuis un seul tableau de bord.",
  },
  {
    icone: LineChart,
    titre: "Suivi personnalisé",
    description:
      "Suivez votre historique de dons, votre éligibilité et vos prochains rendez-vous depuis votre espace.",
  },
  {
    icone: ShieldCheck,
    titre: "Données sécurisées",
    description:
      "Vos informations médicales sont chiffrées et accessibles uniquement aux professionnels autorisés.",
  },
];

// ------------------------------------------------------------
// COMPATIBILITÉ SANGUINE
// ------------------------------------------------------------
export const GROUPES = ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"];

// donneur → receveurs compatibles
export const COMPATIBILITE: Record<string, string[]> = {
  "O−":  ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"],
  "O+":  ["O+", "A+", "B+", "AB+"],
  "A−":  ["A−", "A+", "AB−", "AB+"],
  "A+":  ["A+", "AB+"],
  "B−":  ["B−", "B+", "AB−", "AB+"],
  "B+":  ["B+", "AB+"],
  "AB−": ["AB−", "AB+"],
  "AB+": ["AB+"],
};

// ------------------------------------------------------------
// CTA FINAL
// ------------------------------------------------------------
export const CTA = {
  badge: "Rejoignez le mouvement",
  titre: "Prêt à sauver une vie aujourd'hui ?",
  description:
    "Rejoignez des milliers de donneurs à travers le Cameroun. L'inscription ne prend que 2 minutes.",
  ctaPrimaire: "Je deviens donneur",
  ctaSecondaire: "Espace professionnel",
};

// ------------------------------------------------------------
// FOOTER
// ------------------------------------------------------------
export const FOOTER = {
  description:
    "Aidora est la première plateforme camerounaise qui connecte les donneurs de sang aux banques de sang et hôpitaux. Ensemble, sauvons plus de vies.",
  statusLabel: "En ligne",
  statusSous: "Disponible 24/7",
  contact: {
    adresse: "Yaounde, Cameroun",
    email: "contact@aidora.cm",
    telephone: "+237 6 92 99 16 10",
  },
  liensLegaux: [
    { label: "Mentions légales", href: "#" },
    { label: "Confidentialité",  href: "#" },
    { label: "CGU",              href: "#" },
  ],
};

// ============================================================
// TÉMOIGNAGES — avis de donneurs
// ============================================================

export const TEMOIGNAGES = [
  {
    nom: "Marie N.",
    ville: "Douala",
    initiales: "MN",
    role: "Donneuse depuis 2023",
    note: 5,
    texte:
      "Grâce à Aidora, j'ai pu prendre rendez-vous en 30 secondes. L'équipe m'a accueillie avec le sourire et j'ai su que mon don avait sauvé 3 personnes.",
    couleur: "primary" as const,
  },
  {
    nom: "Paul K.",
    ville: "Yaoundé",
    initiales: "PK",
    role: "Donneur régulier",
    note: 5,
    texte:
      "Ce que j'aime, c'est la transparence. Je vois exactement quand mon don est utilisé et où il va. Ça donne vraiment envie de recommencer.",
    couleur: "success" as const,
  },
  {
    nom: "Aïcha M.",
    ville: "Bafoussam",
    initiales: "AM",
    role: "Donneuse O−",
    note: 5,
    texte:
      "J'ai reçu une alerte pour un besoin urgent de mon groupe sanguin. En 20 minutes, j'étais sur place. C'est une sensation incroyable de sauver une vie.",
    couleur: "warning" as const,
  },
];

// ============================================================
// FAQ — questions fréquentes
// ============================================================

export const FAQ = [
  {
    question: "Qui peut donner son sang ?",
    reponse:
      "Toute personne en bonne santé, âgée de 18 à 65 ans, pesant au moins 50 kg. Un questionnaire médical rapide permet de vérifier votre éligibilité en moins de 2 minutes depuis votre espace donneur.",
  },
  {
    question: "Combien de temps dure un don de sang ?",
    reponse:
      "Le prélèvement lui-même dure entre 8 et 10 minutes. Avec l'accueil, le questionnaire et la collation, comptez environ 45 minutes au total.",
  },
  {
    question: "À quelle fréquence puis-je donner ?",
    reponse:
      "Pour un homme : toutes les 8 semaines. Pour une femme : toutes les 12 semaines. Aidora vous rappelle automatiquement lorsque vous êtes à nouveau éligible.",
  },
  {
    question: "Le don de sang est-il douloureux ?",
    reponse:
      "Non, ce n'est pas douloureux. Vous ressentez une petite piqûre au moment de l'insertion de l'aiguille, puis plus rien. Une collation vous est offerte après le don.",
  },
  {
    question: "Comment fonctionne la prise de rendez-vous ?",
    reponse:
      "Depuis votre espace donneur, choisissez l'établissement le plus proche, la date et l'heure qui vous conviennent. Vous recevez une confirmation immédiate par email et SMS.",
  },
  {
    question: "Mes données sont-elles protégées ?",
    reponse:
      "Absolument. Toutes vos informations médicales sont chiffrées et accessibles uniquement aux professionnels de santé de votre établissement. Aidora respecte le RGPD et les normes camerounaises.",
  },
];