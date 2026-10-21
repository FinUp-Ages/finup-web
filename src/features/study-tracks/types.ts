/**
 * Tipos da Trilha de estudos (contrato C6).
 *
 * Os DTOs espelham o corpo e a resposta da API em /api/v1/admin/study-tracks.
 */

/** Corpo do POST e do PUT de uma categoria. */
export interface CategoryPayload {
  name: string;
  description: string;
}

/** Resposta do POST (201), do PUT e de cada item do GET de categorias. */
export interface CategoryDTO {
  id: string;
  name: string;
  description: string;
  /** Perguntas em rascunho na categoria. */
  draftCount: number;
  /** Perguntas publicadas na categoria. */
  publishedCount: number;
  createdAt: string;
  updatedAt: string;
}
