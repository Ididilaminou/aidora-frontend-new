import { theme } from "./src/config/theme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: theme.couleurs.primary,
        secondary: theme.couleurs.secondary,
        success: theme.couleurs.success,
        warning: theme.couleurs.warning,
        danger: theme.couleurs.danger,
        neutral: theme.couleurs.neutral,
      },
      fontFamily: {
        sans: theme.typographie.police.sans,
        mono: theme.typographie.police.mono,
      },
      fontSize: theme.typographie.taille,
      borderRadius: theme.bordures.rayon,
      boxShadow: theme.bordures.ombre,
      transitionDuration: theme.animations.duree,
    },
  },
  plugins: [],
};