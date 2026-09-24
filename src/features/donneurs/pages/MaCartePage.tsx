// ============================================================
// AIDORA — MA CARTE DE DONNEUR
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  HeartHandshake, RefreshCw, AlertTriangle, Droplets, Award,
  Printer, Download, Star, TrendingUp,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import {
  obtenirMonProfil,
  obtenirMesDons,
} from "../api";
import {
  groupeAfficheDonneur,
  ageDepuis,
  type ProfilDonneur,
} from "../../../types/donneur";
import type { Don } from "../../../types/don";

// ------------------------------------------------------------
// Niveau donneur selon total de dons
// ------------------------------------------------------------
function niveauDonneur(total: number): {
  label: string;
  couleur: "neutral" | "warning" | "info" | "success";
  emoji: string;
} {
  if (total >= 10) return { label: "Or",     couleur: "warning", emoji: "🥇" };
  if (total >= 5)  return { label: "Argent", couleur: "info",    emoji: "🥈" };
  if (total >= 1)  return { label: "Bronze", couleur: "success", emoji: "🥉" };
  return { label: "Nouveau", couleur: "neutral", emoji: "🩸" };
}

// ============================================================
// PAGE
// ============================================================

export function MaCartePage() {
  const { utilisateur } = useAuth();
  const carteRef = useRef<HTMLDivElement>(null);

  const [profil, setProfil] = useState<ProfilDonneur | null>(null);
  const [dons, setDons] = useState<Don[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const p = await obtenirMonProfil();
      setProfil(p);
      try {
        setDons(await obtenirMesDons(p.id));
      } catch {
        setDons([]);
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // --------------------------------------------------------
  const donsValides = dons.filter((d) => d.statut === "VALIDE");
  const totalDons = donsValides.length;
  const viesSauvees = totalDons * 3;
  const groupe = groupeAfficheDonneur(profil);
  const age = ageDepuis(profil?.date_naissance);
  const niveau = niveauDonneur(totalDons);

  // --------------------------------------------------------
  // QR Code — contenu lisible par la banque
  // --------------------------------------------------------
  const qrContent = profil
    ? JSON.stringify({
        id: profil.id,
        nom: `${profil.prenom} ${profil.nom}`,
        groupe,
        tel: profil.telephone ?? "",
        role: "DONNEUR",
        v: 1,
      })
    : "";

  // --------------------------------------------------------
  // Impression
  // --------------------------------------------------------
  function imprimer() {
    window.print();
  }

  // --------------------------------------------------------
  // Téléchargement PNG
  // --------------------------------------------------------
  function telecharger() {
    if (!carteRef.current) return;

    // Utilise le SVG pour l'export
    const svg = carteRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `carte-aidora-${profil?.id ?? "donneur"}.png`;
      link.click();
    };

    img.src = url;
  }

  return (
    <PageLayout
      titre="Ma carte de donneur"
      description="Votre carte numérique Aidora, à présenter en banque."
      actions={
        <>
          <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
            onClick={charger} disabled={chargement}>
            Actualiser
          </Button>
          <Button variante="outline" iconeGauche={<Download size={16} />}
            onClick={telecharger} disabled={!profil}>
            PNG
          </Button>
          <Button iconeGauche={<Printer size={16} />}
            onClick={imprimer} disabled={!profil}>
            Imprimer
          </Button>
        </>
      }
    >
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">Impossible de charger votre carte</p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={charger}>Réessayer</Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (<Card><Loader texte="Chargement de votre carte…" /></Card>)}

      {!chargement && !erreur && profil && (
        <div className="flex justify-center">
          {/* ============ CARTE ============ */}
          <div
            ref={carteRef}
            className="w-full max-w-md"
            style={{ aspectRatio: "1.586 / 1" }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-6 text-white shadow-2xl">
              {/* Motif de fond */}
              <div className="pointer-events-none absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white" />
                <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white" />
                <div className="absolute right-10 top-20 h-20 w-20 rounded-full bg-white" />
              </div>

              {/* En-tête */}
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <p className="text-base font-bold leading-none">AIDORA</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest opacity-80">
                      Donneur de sang
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider opacity-80">
                    Niveau
                  </p>
                  <p className="text-sm font-bold">
                    {niveau.emoji} {niveau.label}
                  </p>
                </div>
              </div>

              {/* Groupe sanguin */}
              <div className="relative mt-5 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <span className="text-2xl font-black">{groupe}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xl font-bold">
                    {profil.prenom} {profil.nom}
                  </p>
                  <p className="mt-0.5 text-xs opacity-80">
                    {age ? `${age} ans · ` : ""}
                    {profil.telephone ?? "—"}
                  </p>
                </div>
              </div>

              {/* Pied de carte : stats + QR */}
              <div className="relative mt-5 flex items-end justify-between gap-3">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider opacity-80">
                      Dons
                    </p>
                    <p className="text-lg font-bold">{totalDons}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider opacity-80">
                      Vies sauvées
                    </p>
                    <p className="text-lg font-bold">{viesSauvees}</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="rounded-lg bg-white p-1.5">
                  <QRCodeSVG
                    value={qrContent}
                    size={56}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>
              </div>

              {/* Identifiant bas de carte */}
              <div className="relative mt-3 flex items-center justify-between text-[10px] opacity-70">
                <span>ID #{String(profil.id).padStart(6, "0")}</span>
                <span>Aidora • Ensemble, sauvons des vies</span>
              </div>
            </div>
            <div ref={carteRef} className="print:carte w-full max-w-md" style={{ aspectRatio: "1.586 / 1" }}></div>
          </div>
        </div>
      )}

      {/* ============ INFOS UTILES ============ */}
      {!chargement && !erreur && profil && (
        <>
          {/* Légende de niveau */}
          <Card className="mt-6">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Votre progression
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Plus vous donnez, plus votre niveau augmente.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <NiveauCard emoji="🩸" label="Nouveau" seuil="0 don" actif={totalDons === 0} />
              <NiveauCard emoji="🥉" label="Bronze" seuil="1 - 4 dons" actif={totalDons >= 1 && totalDons < 5} />
              <NiveauCard emoji="🥈" label="Argent" seuil="5 - 9 dons" actif={totalDons >= 5 && totalDons < 10} />
              <NiveauCard emoji="🥇" label="Or" seuil="10+ dons" actif={totalDons >= 10} />
            </div>
          </Card>

          {/* Conseils */}
          <Card className="mt-6 border-info-500/30 bg-info-50 dark:bg-info-500/5">
            <div className="flex items-start gap-3">
              <Star className="mt-0.5 shrink-0 text-info-600" size={20} />
              <div className="text-sm text-info-700 dark:text-info-400">
                <p className="font-medium">Présentez cette carte à chaque visite</p>
                <p className="mt-1 text-info-700/80 dark:text-info-400/80">
                  Le personnel de la banque peut scanner le QR code pour accéder
                  rapidement à votre profil et enregistrer votre don.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </PageLayout>
  );
}

// ------------------------------------------------------------
function NiveauCard({
  emoji, label, seuil, actif,
}: {
  emoji: string;
  label: string;
  seuil: string;
  actif: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center transition ${
        actif
          ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
          : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      }`}
    >
      <p className="text-2xl">{emoji}</p>
      <p className={`mt-1 text-sm font-semibold ${
        actif ? "text-primary-700 dark:text-primary-400" : "text-neutral-700 dark:text-neutral-300"
      }`}>
        {label}
      </p>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{seuil}</p>
    </div>
  );
}