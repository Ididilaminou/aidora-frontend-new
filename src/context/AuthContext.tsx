// ============================================================
// AIDORA — CONTEXTE D'AUTHENTIFICATION
// ============================================================

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ReponseAuth, Utilisateur } from "../types/utilisateur";
import { storage } from "../services/storage";

interface AuthContextType {
  utilisateur: Utilisateur | null;
  token: string | null;
  estConnecte: boolean;
  chargement: boolean;
  connexion: (reponse: ReponseAuth) => void;
  deconnexion: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  // --------------------------------------------------------
  // Restauration de session au démarrage
  // --------------------------------------------------------
  useEffect(() => {
    const tokenStocke = storage.getToken();
    const utilisateurStocke = storage.getUtilisateur<Utilisateur>();

    if (tokenStocke && utilisateurStocke) {
      setToken(tokenStocke);
      setUtilisateur(utilisateurStocke);
    }
    setChargement(false);
  }, []);

  // --------------------------------------------------------
  // Connexion
  // --------------------------------------------------------
  const connexion = useCallback((reponse: ReponseAuth) => {
    storage.setToken(reponse.token);
    storage.setUtilisateur(reponse.user);
    setToken(reponse.token);
    setUtilisateur(reponse.user);
  }, []);

  // --------------------------------------------------------
  // Déconnexion
  // --------------------------------------------------------
  const deconnexion = useCallback(() => {
    storage.viderSession();
    setToken(null);
    setUtilisateur(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        token,
        estConnecte: !!token,
        chargement,
        connexion,
        deconnexion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}