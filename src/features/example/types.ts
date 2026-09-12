/**
 * Tipos da feature "example".
 * Tipos usados por mais de uma feature vao para shared/types/.
 */

/** Formato bruto devolvido pela API. */
export interface ExampleDTO {
  id: string;
  name: string;
}

/** Formato pronto para exibicao — as telas nao conhecem o DTO da API. */
export interface ExampleItem {
  id: string;
  title: string;
}
