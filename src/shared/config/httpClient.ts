/**
 * Instancia unica do Axios.
 * Concentra: baseURL por ambiente, injecao do token de autenticacao,
 * tratamento de 401 e normalizacao de erro da API.
 *
 * Somente arquivos de features/<nome>/api/ importam este cliente. Pages, hooks e
 * components nunca importam axios nem httpClient diretamente.
 */
import axios from 'axios';
import { env } from '@/shared/config/env';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
});

// TODO: implementar em tarefa futura — interceptors de token, tratamento de 401 e normalizacao de erro.
