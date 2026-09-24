import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ROUTES } from "./config/routes";

import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { StocksPage } from "./features/stocks/pages/StocksPage";
import { DonsPage } from "./features/dons/pages/DonsPage";
import { DemandesPage } from "./features/demandes/pages/DemandesPage";
import { EtablissementsPage } from "./features/etablissements/pages/EtablissementsPage";
import { PersonnelsPage } from "./features/personnels/pages/PersonnelsPage";
import { NotificationsPage } from "./features/notifications/pages/NotificationsPage";
import { ParametresPage } from "./features/parametres/pages/ParametresPage";
import { PochesPage } from "./features/poches/pages/PochesPage";
import { InvitationsPage } from "./features/invitations/pages/InvitationsPage";
import { StatistiquesPage } from "./features/statistiques/pages/StatistiquesPage";
import { RapportsPage } from "./features/rapports/pages/RapportsPage";
import { JournalAuditPage } from "./features/journalAudit/pages/JournalAuditPage";

import { PageLayout } from "./components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "./components/ui/Card";
import { EmptyState } from "./components/ui/EmptyState";
import { Construction } from "lucide-react";
import { useTheme } from "./hooks/useTheme";
import { ThemeProvider } from "./context/ThemeContext";

//donneu

import { MonProfilPage } from "./features/donneurs/pages/MonProfilPage";
import { MesDonsPage } from "./features/donneurs/pages/MesDonsPage";
import { MesRdvPage } from "./features/donneurs/pages/MesRdvPage";
import { MesRattachementsPage } from "./features/donneurs/pages/MesRattachementsPage";

///


function Placeholder({ titre, description }: { titre: string; description: string }) {
  return (
    <PageLayout titre={titre} description={description}>
      <Card>
        <EmptyState
          icone={<Construction size={22} />}
          titre="Page en construction"
          description="Cette fonctionnalité arrive bientôt."
        />
      </Card>
    </PageLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
                {/* Public */}
                <Route path={ROUTES.CONNEXION} element={<LoginPage />} />
                <Route path={ROUTES.INSCRIPTION} element={<RegisterPage />} />

                {/* Général */}
                <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path={ROUTES.PARAMETRES} element={<ProtectedRoute><ParametresPage /></ProtectedRoute>} />

                {/* Banque */}
                <Route path={ROUTES.DONNEUR_PROFIL} element={<ProtectedRoute><MonProfilPage /></ProtectedRoute>} />
                <Route path={ROUTES.DONNEUR_DONS} element={<ProtectedRoute><MesDonsPage /></ProtectedRoute>} />
                <Route path={ROUTES.DONNEUR_RDV} element={<ProtectedRoute><MesRdvPage /></ProtectedRoute>} />
                <Route path={ROUTES.DONNEUR_RATTACHEMENTS} element={<ProtectedRoute><MesRattachementsPage /></ProtectedRoute>} />

                {/* À construire (placeholders) */}
                <Route path={ROUTES.POCHES} element={<ProtectedRoute><PochesPage /></ProtectedRoute>} />
                <Route path={ROUTES.INVITATIONS} element={<ProtectedRoute><InvitationsPage /></ProtectedRoute>} />            <Route path={ROUTES.RDV} element={<ProtectedRoute><Placeholder titre="Rendez-vous" description="Gestion des créneaux et RDV." /></ProtectedRoute>} />
                <Route path={ROUTES.STATISTIQUES}  element={<ProtectedRoute><StatistiquesPage /></ProtectedRoute>} />
                <Route path={ROUTES.RAPPORTS}      element={<ProtectedRoute><RapportsPage /></ProtectedRoute>} />
                <Route path={ROUTES.JOURNAL_AUDIT} element={<ProtectedRoute><JournalAuditPage /></ProtectedRoute>} />
                {/* Donneur */}
                <Route path={ROUTES.DONNEUR_PROFIL} element={<ProtectedRoute><Placeholder titre="Mon profil" description="Votre profil de donneur." /></ProtectedRoute>} />
                <Route path={ROUTES.DONNEUR_DONS} element={<ProtectedRoute><Placeholder titre="Mes dons" description="Historique de vos dons." /></ProtectedRoute>} />
                <Route path={ROUTES.DONNEUR_RDV} element={<ProtectedRoute><Placeholder titre="Mes rendez-vous" description="Vos RDV passés et à venir." /></ProtectedRoute>} />
                <Route path={ROUTES.DONNEUR_RATTACHEMENTS} element={<ProtectedRoute><Placeholder titre="Mes rattachements" description="Vos liens avec les établissements." /></ProtectedRoute>} />

                {/* Redirections */}
                <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
           </AuthProvider>
         </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}