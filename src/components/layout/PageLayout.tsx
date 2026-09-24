// ============================================================
// AIDORA — MISE EN PAGE PRINCIPALE
// ============================================================

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { cn } from "../../utils/cn";

interface PageLayoutProps {
  titre?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageLayout({
  titre,
  description,
  actions,
  children,
}: PageLayoutProps) {
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [sidebarReduite, setSidebarReduite] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar
        ouverteMobile={sidebarMobile}
        onFermerMobile={() => setSidebarMobile(false)}
        reduite={sidebarReduite}
        onToggleReduite={() => setSidebarReduite((v) => !v)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300 ease-out",
          sidebarReduite ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* Header sticky */}
        <Header onOuvrirSidebar={() => setSidebarMobile(true)} />

        {/* Contenu principal */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {(titre || actions) && (
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                {titre && (
                  <h1 className="truncate text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
                    {titre}
                  </h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex flex-wrap gap-2">{actions}</div>
              )}
            </div>
          )}

          <div className="animate-fade-in">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
}