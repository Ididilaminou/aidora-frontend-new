// ============================================================
// AIDORA — EN-TÊTE
// ------------------------------------------------------------
// Menu burger, recherche (avec dropdown), notifications, profil.
// ============================================================

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Settings,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertOctagon,
  Loader2,
  X as XIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { ROUTES } from "../../config/routes";
import { useNotifications } from "../../features/notifications/hooks/useNotifications";
import {
  marquerCommeLue,
  marquerToutesCommeLues,
} from "../../features/notifications/api";
import { extraireMessageErreur } from "../../services/api";
import {
  estLue,
  dateNotification,
  type Notification,
} from "../../types/notification";
import { useRechercheGlobale } from "../../hooks/useRechercheGlobale";
import { ThemeToggle } from "../ui/ThemeToggle";
import { SearchDropdown } from "./SearchDropdown";

interface HeaderProps {
  onOuvrirSidebar: () => void;
}

// ------------------------------------------------------------
// Icône selon le type de notification
// ------------------------------------------------------------
function IconeNotif({ type }: { type?: string }) {
  switch (type) {
    case "SUCCES":  return <CheckCircle2 size={16} className="text-success-500" />;
    case "ALERTE":  return <AlertTriangle size={16} className="text-warning-500" />;
    case "URGENT":  return <AlertOctagon size={16} className="text-danger-500" />;
    case "SYSTEME": return <Bell size={16} className="text-primary-500" />;
    default:        return <Info size={16} className="text-info-500" />;
  }
}

// ============================================================
// PANNEAU NOTIFICATIONS (dropdown)
// ============================================================
function PanneauNotifications({ onFermer }: { onFermer: () => void }) {
  const navigate = useNavigate();
  const { afficher } = useToast();
  const { notifications, chargement, recharger } = useNotifications();
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);

  const dernieres: Notification[] = notifications.slice(0, 5);
  const nonLues = notifications.filter((n) => !estLue(n)).length;

  async function gererMarquerLue(id: number) {
    setActionEnCours(id);
    try {
      await marquerCommeLue(id);
      await recharger();
    } catch (err) {
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    } finally {
      setActionEnCours(null);
    }
  }

  async function gererToutLire() {
    try {
      await marquerToutesCommeLues();
      afficher("Toutes marquées comme lues", "success");
      await recharger();
    } catch (err) {
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    }
  }

  return (
    <div
      className={cn(
        "absolute right-0 mt-2 w-[22rem] max-w-[90vw] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-float",
        "animate-scale-in"
      )}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            Notifications
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {nonLues > 0
              ? `${nonLues} non lue${nonLues > 1 ? "s" : ""}`
              : "Tout est à jour"}
          </p>
        </div>
        {nonLues > 0 && (
          <button
            onClick={gererToutLire}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary-600 transition hover:bg-primary-50"
          >
            <CheckCheck size={12} />
            Tout lire
          </button>
        )}
      </div>

      {/* Corps */}
      <div className="max-h-[24rem] overflow-y-auto">
        {chargement && (
          <div className="flex items-center justify-center py-8 text-neutral-400 dark:text-neutral-500">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}

        {!chargement && dernieres.length === 0 && (
          <div className="px-4 py-10 text-center">
            <Bell size={24} className="mx-auto mb-2 text-neutral-300" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Aucune notification
            </p>
          </div>
        )}

        {!chargement &&
          dernieres.map((n) => {
            const lue = estLue(n);
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 border-b border-neutral-100 px-4 py-3 last:border-0 transition",
                  lue ? "bg-white" : "bg-primary-50/40"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  <IconeNotif type={n.type} />
                </div>
                <div className="min-w-0 flex-1">
                  {n.titre && (
                    <p
                      className={cn(
                        "text-xs",
                        lue ? "font-medium" : "font-semibold",
                        "text-neutral-900 dark:text-white"
                      )}
                    >
                      {n.titre}
                    </p>
                  )}
                  <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                    {dateNotification(n)}
                  </p>
                </div>
                {!lue && (
                  <button
                    aria-label="Marquer comme lue"
                    onClick={() => gererMarquerLue(n.id)}
                    disabled={actionEnCours === n.id}
                    className="shrink-0 rounded-md p-1 text-neutral-400 dark:text-neutral-500 transition hover:bg-primary-100 hover:text-primary-600"
                  >
                    {actionEnCours === n.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                  </button>
                )}
              </div>
            );
          })}
      </div>

      {/* Pied */}
      <div className="border-t border-neutral-100 p-2">
        <Button
          variante="ghost"
          taille="sm"
          className="w-full justify-center"
          onClick={() => {
            onFermer();
            navigate(ROUTES.NOTIFICATIONS);
          }}
        >
          Voir toutes les notifications
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================
export function Header({ onOuvrirSidebar }: HeaderProps) {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();

  const [menuProfil, setMenuProfil] = useState(false);
  const [menuNotifs, setMenuNotifs] = useState(false);

  // Recherche globale
  const [recherche, setRecherche] = useState("");
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const refRecherche = useRef<HTMLDivElement>(null);
  const resultats = useRechercheGlobale(recherche);

  const refProfil = useRef<HTMLDivElement>(null);
  const refNotifs = useRef<HTMLDivElement>(null);

  // Compteur de non lues
  const { notifications } = useNotifications();
  const nonLues = notifications.filter((n) => !estLue(n)).length;

  // Fermer les menus au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (refProfil.current && !refProfil.current.contains(e.target as Node)) {
        setMenuProfil(false);
      }
      if (refNotifs.current && !refNotifs.current.contains(e.target as Node)) {
        setMenuNotifs(false);
      }
      if (refRecherche.current && !refRecherche.current.contains(e.target as Node)) {
        setRechercheOuverte(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function seDeconnecter() {
    deconnexion();
    navigate(ROUTES.CONNEXION);
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-900/80 lg:px-6">
      {/* Burger mobile */}
      <button
        onClick={onOuvrirSidebar}
        aria-label="Ouvrir le menu"
        className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* ---------- RECHERCHE ---------- */}
      <div
        ref={refRecherche}
        className="relative hidden flex-1 max-w-md md:block"
      >
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
        />
        <input
          type="text"
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value);
            setRechercheOuverte(true);
          }}
          onFocus={() => setRechercheOuverte(true)}
          placeholder="Rechercher une page…"
          className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-9 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400"
        />

        {/* Bouton X pour vider */}
        {recherche && (
          <button
            onClick={() => {
              setRecherche("");
              setRechercheOuverte(false);
            }}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-white"
          >
            <XIcon size={14} />
          </button>
        )}

        {/* Dropdown résultats */}
        {rechercheOuverte && recherche.trim() && (
          <SearchDropdown
            resultats={resultats}
            requete={recherche}
            onSelectionner={(route) => {
              navigate(route);
              setRecherche("");
              setRechercheOuverte(false);
            }}
          />
        )}
      </div>

      <div className="flex-1 md:hidden" />

      {/* ---------- ACTIONS À DROITE ---------- */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle />

        {/* Notifications */}
        <div ref={refNotifs} className="relative">
          <button
            aria-label="Notifications"
            onClick={() => {
              setMenuNotifs((v) => !v);
              setMenuProfil(false);
            }}
            className={cn(
              "relative rounded-lg p-2 transition",
              menuNotifs
                ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            <Bell size={18} />
            {nonLues > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-neutral-900">
                {nonLues > 9 ? "9+" : nonLues}
              </span>
            )}
          </button>

          {menuNotifs && (
            <PanneauNotifications onFermer={() => setMenuNotifs(false)} />
          )}
        </div>

        {/* Profil */}
        <div ref={refProfil} className="relative">
          <button
            onClick={() => {
              setMenuProfil((v) => !v);
              setMenuNotifs(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1 pr-3 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Avatar taille="sm" prenom={utilisateur?.prenom} nom={utilisateur?.nom} />
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-xs font-medium text-neutral-900 dark:text-white">
                {utilisateur?.prenom} {utilisateur?.nom}
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {utilisateur?.role ?? "Utilisateur"}
              </p>
            </div>
          </button>

          {menuProfil && (
            <div
              className={cn(
                "absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-float dark:border-neutral-800 dark:bg-neutral-900",
                "animate-scale-in"
              )}
            >
              <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {utilisateur?.prenom} {utilisateur?.nom}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {utilisateur?.email}
                </p>
              </div>

              <div className="p-1.5">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
                  <UserIcon size={16} />
                  Mon profil
                </button>
                <button
                  onClick={() => {
                    setMenuProfil(false);
                    navigate(ROUTES.PARAMETRES);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Settings size={16} />
                  Paramètres
                </button>
              </div>

              <div className="border-t border-neutral-100 p-1.5 dark:border-neutral-800">
                <button
                  onClick={seDeconnecter}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger-700 transition hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-500/10"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}