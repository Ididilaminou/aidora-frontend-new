import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ROUTES } from "./config/routes";
import { useAuth } from "./hooks/useAuth";

// ---------- Public ----------
import { LandingPage } from "./features/landing/pages/LandingPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";


// ---------- Général ----------
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { DashboardHopitalPage } from "./features/dashboard/pages/DashboardHopitalPage";
import { NotificationsPage } from "./features/notifications/pages/NotificationsPage";
import { ParametresPage } from "./features/parametres/pages/ParametresPage";
import { CartePage } from "./features/carte/pages/CartePage";
import { MaCarteLocalePage } from "./features/carte/pages/MaCarteLocalePage";

// ---------- Banque ----------
import { StocksPage } from "./features/stocks/pages/StocksPage";
import { DonsPage } from "./features/dons/pages/DonsPage";
import { PochesPage } from "./features/poches/pages/PochesPage";
import { DemandesPage } from "./features/demandes/pages/DemandesPage";
import { InvitationsPage } from "./features/invitations/pages/InvitationsPage";
import { RdvPage } from "./features/rdv/pages/RdvPage";
import { EtablissementsPage } from "./features/etablissements/pages/EtablissementsPage";
import { PersonnelsPage } from "./features/personnels/pages/PersonnelsPage";
import { SollicitationsPage } from "./features/sollicitations/pages/SollicitationsPage";

// ---------- Admin ----------
import { StatistiquesPage } from "./features/statistiques/pages/StatistiquesPage";
import { RapportsPage } from "./features/rapports/pages/RapportsPage";
import { JournalAuditPage } from "./features/journalAudit/pages/JournalAuditPage";

// ---------- Donneur ----------
import { MonProfilPage } from "./features/donneurs/pages/MonProfilPage";
import { MesDonsPage } from "./features/donneurs/pages/MesDonsPage";
import { MesRdvPage } from "./features/donneurs/pages/MesRdvPage";
import { MesRattachementsPage } from "./features/donneurs/pages/MesRattachementsPage";
import { PrendreRdvPage } from "./features/donneurs/pages/PrendreRdvPage";
import { PreEvaluationPage } from "./features/ia/pages/PreEvaluationPage";
import { DashboardDonneurPage } from "./features/dashboard/pages/DashboardDonneurPage";
import { MaCartePage } from "./features/donneurs/pages/MaCartePage";
import { ActivationPage } from "./features/auth/pages/ActivationPage";
import { DashboardAdminPage } from "./features/dashboard/pages/DashboardAdminPage";
import { DashboardBanquePage } from "./features/dashboard/pages/DashboardBanquePage";

// ============================================================
// DASHBOARD INTELLIGENT (par rôle)
// ============================================================

function DashboardSwitch() {
  const { utilisateur } = useAuth();
  const role = utilisateur?.role;

  // Admin → dashboard global
  if (role === "ADMINISTRATEUR") {
    return <DashboardAdminPage />;
  }

  // Banque → dashboard opérationnel banque
  if (role === "PERSONNEL_BANQUE") {
    return <DashboardBanquePage />;
  }

  // Hôpital → dashboard hôpital (avec ou sans banque)
  if (role === "PERSONNEL_HOPITAL") {
    return <DashboardHopitalPage />;
  }

  // Donneur → dashboard donneur
  if (role === "DONNEUR") {
    return <DashboardDonneurPage />;
  }

  // Fallback
  return <DashboardPage />;
}

// ============================================================
// APP
// ============================================================

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* ============ PUBLIC ============ */}
              <Route path={ROUTES.CONNEXION} element={<LoginPage />} />
              <Route path={ROUTES.INSCRIPTION} element={<RegisterPage />} />

              {/* ============ GÉNÉRAL ============ */}
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <ProtectedRoute>
                    <DashboardSwitch />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.NOTIFICATIONS}
                element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.PARAMETRES}
                element={<ProtectedRoute><ParametresPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.CARTE}
                element={<ProtectedRoute><CartePage /></ProtectedRoute>}
              />

              {/* ============ BANQUE ============ */}
              <Route
                path={ROUTES.STOCKS}
                element={<ProtectedRoute><StocksPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.DONS}
                element={<ProtectedRoute><DonsPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.POCHES}
                element={<ProtectedRoute><PochesPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.DEMANDES}
                element={<ProtectedRoute><DemandesPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.INVITATIONS}
                element={<ProtectedRoute><InvitationsPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.RDV}
                element={<ProtectedRoute><RdvPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.SOLLICITATIONS}
                element={<ProtectedRoute><SollicitationsPage /></ProtectedRoute>}
              />

              <Route
                path={ROUTES.CARTE_LOCALE}
                element={<ProtectedRoute><MaCarteLocalePage /></ProtectedRoute>}
              />

              {/* ============ ADMIN ============ */}
              <Route
                path={ROUTES.ETABLISSEMENTS}
                element={<ProtectedRoute><EtablissementsPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.UTILISATEURS}
                element={<ProtectedRoute><PersonnelsPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.STATISTIQUES}
                element={<ProtectedRoute><StatistiquesPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.RAPPORTS}
                element={<ProtectedRoute><RapportsPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.JOURNAL_AUDIT}
                element={<ProtectedRoute><JournalAuditPage /></ProtectedRoute>}
              />

              {/* ============ DONNEUR ============ */}
              <Route
                path={ROUTES.DONNEUR_PROFIL}
                element={<ProtectedRoute><MonProfilPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.DONNEUR_DONS}
                element={<ProtectedRoute><MesDonsPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.DONNEUR_RDV}
                element={<ProtectedRoute><MesRdvPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.DONNEUR_RATTACHEMENTS}
                element={<ProtectedRoute><MesRattachementsPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.DONNEUR_PRENDRE_RDV}
                element={<ProtectedRoute><PrendreRdvPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.DONNEUR_EVALUATION}
                element={<ProtectedRoute><PreEvaluationPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.DONNEUR_CARTE}
                element={<ProtectedRoute><MaCartePage /></ProtectedRoute>}
              />

              <Route path={ROUTES.ACTIVATION} element={<ActivationPage />} />

              {/* ============ REDIRECTIONS ============ */}
              <Route path="/" element={<LandingPage />} />
              
              <Route
                path="*"
                element={<Navigate to={ROUTES.DASHBOARD} replace />}
              />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}