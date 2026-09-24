// ============================================================
// AIDORA — API ÉVALUATION IA
// ============================================================

import api from "../../services/api";
import type {
  EvaluationIA,
  ReponsesQuestionnaire,
} from "../../types/evaluationIa";

export async function soumettreEvaluation(
  reponses: ReponsesQuestionnaire
): Promise<EvaluationIA> {
  const reponse = await api.post("/evaluations-ia", reponses);
  return reponse.data?.data ?? reponse.data;
}

export async function obtenirDerniereEvaluation(): Promise<EvaluationIA | null> {
  try {
    const reponse = await api.get("/evaluations-ia/derniere");
    return (reponse.data?.data ?? reponse.data) ?? null;
  } catch {
    return null;
  }
}

export async function obtenirHistoriqueEvaluations(): Promise<EvaluationIA[]> {
  try {
    const reponse = await api.get("/evaluations-ia");
    const data = reponse.data?.data ?? reponse.data;
    return Array.isArray(data?.evaluations)
      ? data.evaluations
      : Array.isArray(data)
      ? data
      : [];
  } catch {
    return [];
  }
}