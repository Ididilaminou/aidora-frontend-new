// ============================================================
// AIDORA — BARRE LATÉRALE (filtrée par rôle + dark mode)
// ============================================================

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Droplets,
  HeartHandshake,
  ClipboardList,
  Users,
  Building2,
  Settings,
  Bell,
  X,
  ChevronLeft,
  Package,
  CalendarDays,
  BarChart3,
  FileText,
  ScrollText,
  UserCircle2,
  Star,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { APP } from "../../config/constants";
import { ROUTES, LABELS_ROUTES } from "../../config/routes";
import { ROUTES_PAR_ROLE, type Role } from "../../config/roles";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../features/notifications/hooks/useNotifications";
import { estLue } from "../../types/notification";

interface SidebarProps {
  ouverteMobile: boolean;
  onFermerMobile: () => void;
  reduite?: boolean;
  onToggleReduite?: () => void;
}

// ------------------------------------------------------------
// Association route → icône
// ------------------------------------------------------------
const ICONES: Record<string, typeof LayoutDashboard> = {
  [ROUTES.DASHBOARD]:             LayoutDashboard,
  [ROUTES.STOCKS]:                Droplets,
  [ROUTES.DONS]:                  HeartHandshake,
  [ROUTES.POCHES]:                Package,
  [ROUTES.DEMANDES]:              ClipboardList,
  [ROUTES.RDV]:                   CalendarDays,
  [ROUTES.INVITATIONS]:           Users,
  [ROUTES.ETABLISSEMENTS]:        Building2,
  [ROUTES.UTILISATEURS]:          Users,
  [ROUTES.STATISTIQUES]:          BarChart3,
  [ROUTES.RAPPORTS]:              FileText,
  [ROUTES.JOURNAL_AUDIT]:         ScrollText,
  [ROUTES.NOTIFICATIONS]:         Bell,
  [ROUTES.PARAMETRES]:            Settings,

  // Donneur
  [ROUTES.DONNEUR_PROFIL]:        UserCircle2,
  [ROUTES.DONNEUR_DONS]:          HeartHandshake,
  [ROUTES.DONNEUR_RDV]:           CalendarDays,
  [ROUTES.DONNEUR_RATTACHEMENTS]: Star,
};

// ============================================================
// SIDEBAR
// ============================================================

export function Sidebar({
  ouverteMobile,
  onFermerMobile,
  reduite = false,
  onToggleReduite,
}: SidebarProps) {
  const { utilisateur } = useAuth();
  const role = utilisateur?.role as Role | undefined;

  const routesAutorisees = role ? ROUTES_PAR_ROLE[role] ?? [] : [];

  // Badge notifications
  const { notifications } = useNotifications();
  const nonLues = notifications.filter((n) => !estLue(n)).length;

  return (
    <>
      {/* Overlay mobile */}
      {ouverteMobile && (
        <div
          onClick={onFermerMobile}
          className="fixed inset-0 z-30 bg-neutral-900/40 backdrop-blur-sm animate-fade-in lg:hidden"
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-neutral-200 bg-white",
          "dark:border-neutral-800 dark:bg-neutral-900",
          "transition-all duration-300 ease-out",
          reduite ? "w-20" : "w-64",
          ouverteMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* -------- Logo -------- */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm">
              <Droplets size={20} />
            </div>
            {!reduite && (
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {APP.NOM}
              </span>
            )}
          </div>

          <button
            onClick={onFermerMobile}
            aria-label="Fermer le menu"
            className="rounded-lg p-1.5 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* -------- Navigation -------- */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {routesAutorisees.map((route) => {
              const Icone = ICONES[route] ?? LayoutDashboard;
              const label = LABELS_ROUTES[route] ?? route;
              const estNotif = route === ROUTES.NOTIFICATIONS;

              return (
                <li key={route}>
                  <NavLink
                    to={route}
                    onClick={onFermerMobile}
                    title={reduite ? label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                        "transition-all duration-150",
                        isActive
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                          : "text-neutral-600 dark:text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white",
                        reduite && "justify-center"
                      )
                    }
                  >
                    <Icone size={18} className="shrink-0" />
                    {!reduite && (
                      <span className="flex-1 truncate">{label}</span>
                    )}

                    {estNotif && nonLues > 0 && (
                      <span
                        className={cn(
                          "flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-semibold text-white",
                          reduite && "absolute right-1 top-1 h-4 min-w-4"
                        )}
                      >
                        {nonLues > 9 ? "9+" : nonLues}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* -------- Pied -------- */}
        {onToggleReduite && (
          <div className="border-t border-neutral-100 p-3 dark:border-neutral-800">
            <button
              onClick={onToggleReduite}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 dark:text-neutral-500",
                "transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-300",
                "dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white",
                reduite && "justify-center"
              )}
            >
              <ChevronLeft
                size={16}
                className={cn("transition-transform", reduite && "rotate-180")}
              />
              {!reduite && "Réduire"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}