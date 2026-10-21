/** Regras do formulario de categoria, usadas pela tela e pelo mock (como o 400 do backend). */
import type { CategoryPayload } from '../types';

export interface CategoryErrors {
  name?: string;
}

export function validateCategory(values: CategoryPayload): CategoryErrors {
  return values.name.trim() ? {} : { name: 'Informe o nome da categoria.' };
}

/** Remove espacos das pontas antes de enviar. */
export function toCategoryPayload(values: CategoryPayload): CategoryPayload {
  return { name: values.name.trim(), description: values.description.trim() };
}
