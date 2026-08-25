# finup-web

Painel administrativo do projeto **FinUp** — AGES 2026/2.

React 18 · Vite 6 · TypeScript · Tailwind CSS · React Router 7 · TanStack Query · Axios

> Esqueleto do projeto. As pastas e os arquivos de fronteira estão criados e vazios — nenhuma tela ou regra de negócio foi implementada ainda.

---

## Pré-requisitos

- Node.js 20+ (há um `.nvmrc` no projeto — `nvm use` seleciona a versão certa)
- npm (vem com o Node)

## Como rodar

```bash
cp .env.example .env.development   # já vem versionado, só confira a URL da API
npm install
npm run dev
```

A aplicação sobe em http://localhost:5173.

O backend precisa estar rodando em paralelo (`finup-backend`, porta 8080) para as chamadas de API funcionarem. A URL fica em `VITE_API_BASE_URL`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento com hot reload |
| `npm run build` | typecheck + build de produção em `dist/` |
| `npm run preview` | serve o build local para conferência |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir arquivos |
| `npm run format` | Prettier |

Antes de abrir um PR, rode `npm run lint && npm run typecheck && npm run build` — é exatamente o que o CI executa.

---

## Estrutura de pastas

```
src/
├── main.tsx              bootstrap do React
├── App.tsx               providers globais + rotas
├── vite-env.d.ts         tipagem das variáveis de ambiente
├── assets/               imagens, ícones, fontes
├── components/
│   ├── ui/               componentes visuais genéricos (Button, Input, Card, Table)
│   └── common/           componentes compostos do painel (Header, Sidebar, DataTable)
├── pages/                uma tela por pasta/arquivo
├── layouts/              esqueletos de página (AuthLayout, DashboardLayout)
├── routes/               árvore de rotas, rota protegida e constantes de caminho
├── services/             uma função por endpoint da API
├── hooks/                hooks customizados, incluindo os de TanStack Query
├── contexts/             contextos globais (sessão, tema)
├── types/                tipos e interfaces compartilhados
├── utils/                funções puras (formatação de moeda, data, máscaras)
├── config/               axios, QueryClient e leitura de variáveis de ambiente
└── styles/               CSS global e diretivas do Tailwind
```

Pastas ainda vazias têm um `.gitkeep` com uma linha descrevendo o que vai dentro — o Git não versiona diretório vazio. **Apague o `.gitkeep` quando a pasta receber o primeiro arquivo.**

### Fluxo de dados — a regra mais importante

```
page  →  hook (TanStack Query)  →  service  →  httpClient (axios)  →  API
```

- **`config/httpClient.ts`** é a única instância do Axios do projeto. Concentra `baseURL`, injeção do token, tratamento de 401 e normalização de erro. **Nenhum outro arquivo importa `axios` diretamente.**
- **`services/`** tem uma função por endpoint, tipada. É o único lugar que conhece rotas da API (`/transacoes`, `/usuarios`).
- **`hooks/`** envolve os services em `useQuery` / `useMutation`. É daqui que as telas consomem dados — já com cache, loading e erro resolvidos.
- **`pages/`** monta a tela. Não sabe que existe rede.

Quebrar essa cadeia (uma page chamando axios direto, por exemplo) é o tipo de coisa que o code review deve barrar: espalha URL e tratamento de erro pelo projeto inteiro.

### Convenções

- **Import alias `@/`** configurado: use `@/components/ui/Button` em vez de `../../../components/ui/Button`.
- **TypeScript em modo `strict`**, com `noUnusedLocals` e `noUnusedParameters`. Não relaxe essas flags — retroagir depois é caro.
- **Nenhum segredo em variável `VITE_`.** Tudo com esse prefixo é embutido no bundle e fica visível para qualquer usuário. Chave de API, credencial ou token de terceiro passam pelo backend, nunca pelo front.
- Componentes em `PascalCase.tsx`; hooks em `useAlgumaCoisa.ts`; utilitários em `camelCase.ts`.

---

## O que ainda não está aqui (e por quê)

| Item | Situação |
|---|---|
| **Design tokens** (cores, tipografia, espaçamento) | `tailwind.config.js` está com `theme.extend` vazio, aguardando o Figma do AGES IV |
| **Testes** (Vitest + Testing Library) | fora do escopo desta primeira versão, a incluir quando o time decidir |
| **Formulários** (React Hook Form + Zod) | idem — o painel é majoritariamente formulário, então provavelmente entra cedo |
| **Biblioteca de componentes** | `components/ui/` será construída à mão, sobre Tailwind |
| **Autenticação** | `routes/ProtectedRoute.tsx` e `contexts/` estão criados e vazios, aguardando a definição do fluxo de login no backend |

---

## Estrutura de suporte

```
.github/
├── workflows/ci.yml          lint + typecheck + build em todo PR
├── PULL_REQUEST_TEMPLATE.md  inclui campo de evidência visual
└── CODEOWNERS                revisão obrigatória em config/, services/ e types/
eslint.config.js · .prettierrc · .editorconfig · .nvmrc
```

**Antes do primeiro PR:** ajuste o `@arquitetura` no `CODEOWNERS` para o time ou usuário real da organização no GitHub.
