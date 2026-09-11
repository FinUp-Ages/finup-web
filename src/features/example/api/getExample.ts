/**
 * Chamadas de API da feature "example".
 *
 * Unico ponto da feature que conhece a rota da API.
 * Sem hooks do React, sem estado, sem JSX e sem formatacao para exibicao.
 */
import { httpClient } from '@/shared/config/httpClient';
import type { ExampleDTO } from '../types';

export async function getExample(): Promise<ExampleDTO[]> {
  // TODO: implementar em tarefa futura — trocar pelo endpoint real do finup-backend.
  const { data } = await httpClient.get<ExampleDTO[]>('/example');
  return data;
}
