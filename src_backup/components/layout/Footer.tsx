// ============================================================
// AIDORA — PIED DE PAGE
// ============================================================

import { APP } from "../../config/constants";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {APP.NOM} — {APP.SLOGAN}
        </p>
        <p>Version {APP.VERSION}</p>
      </div>
    </footer>
  );
}