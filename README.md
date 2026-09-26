# finup-web (variante Feature-Driven)

Painel administrativo do projeto **FinUp** — AGES 2026/2.

React 18 · Vite 6 · TypeScript · Tailwind CSS · React Router 7 · TanStack Query · Axios

> **Variante para comparação.** Este projeto é um clone do `finup-web` organizado por **funcionalidade (Feature-Driven)** em vez de por camada (MVVM). Stack, scripts, configurações e telas são idênticos — muda apenas onde cada arquivo mora e as regras de dependência entre pastas.
>
> Esqueleto do projeto: nenhuma tela ou regra de negócio foi implementada ainda.

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

A aplicação sobe em http://localhost:5173. Se a versão MVVM já estiver rodando nessa porta, o Vite usa automaticamente a próxima livre (5174) — confira a URL no terminal.

O backend precisa estar rodando em paralelo (`finup-backend`, porta 8080) para as chamadas de API funcionarem. A URL fica em `VITE_API_BASE_URL`.

## Docker

No PowerShell, primeiro carregue `VITE_API_BASE_URL` na sessão atual usando o mesmo valor definido em `.env.development`. Por exemplo, se o arquivo contém `VITE_API_BASE_URL=http://localhost:8080`, execute:

```powershell
$env:VITE_API_BASE_URL = "http://localhost:8080"
```

Depois, gere e execute a imagem:

```powershell
docker build --build-arg VITE_API_BASE_URL="$env:VITE_API_BASE_URL" -t finup-web .
docker run --rm -p 5173:80 finup-web
```

Acesse http://localhost:5173. A imagem usa Node.js 20 (mesma versão do `.nvmrc` e da CI) para compilar a aplicação e Nginx para servir os arquivos, com suporte às rotas do React Router.

A variável definida com `$env:` permanece disponível apenas na sessão atual do PowerShell. O Docker recebe seu valor pelo argumento `--build-arg`; ele não lê o arquivo `.env.development` automaticamente. O argumento é obrigatório: sem ele, o build falha. A pipeline poderá fornecer o valor correspondente a cada ambiente ao gerar a imagem. Como o Vite incorpora variáveis no bundle durante o build, a URL deve ser acessível pelo navegador do usuário e não pode conter segredos.

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
├── main.tsx                   bootstrap do React
├── vite-env.d.ts              tipagem das variáveis de ambiente
├── app/                       o que "liga" a aplicação
│   ├── App.tsx                providers globais + rotas
│   ├── routes/                árvore de rotas, rota protegida e constantes de caminho
│   ├── providers/             providers globais (QueryClient, sessão, tema)
│   └── styles/                CSS global e diretivas do Tailwind
├── features/                  uma pasta por funcionalidade de negócio
│   ├── welcome/               tela inicial (rota "/")
│   │   ├── pages/             WelcomePage.tsx
│   │   └── index.ts           API pública da feature
│   └── example/               feature de referência, com dados da API
│       ├── api/               chamadas HTTP da feature (getExample.ts)
│       ├── hooks/             hooks de dados com TanStack Query (useExample.ts)
│       ├── components/        componentes usados só nesta feature (ExampleList.tsx)
│       ├── pages/             telas da feature (ExamplePage.tsx)
│       ├── types.ts           tipos da feature
│       └── index.ts           API pública da feature
└── shared/                    código usado por mais de uma feature
    ├── components/
    │   ├── ui/                componentes visuais genéricos (Button, Input, Card, Table)
    │   └── common/            componentes compostos do painel (Header, Sidebar, DataTable)
    ├── layouts/               esqueletos de página (AuthLayout, DashboardLayout)
    ├── hooks/                 hooks genéricos, sem regra de negócio (useDebounce)
    ├── config/                axios, QueryClient e leitura de variáveis de ambiente
    ├── types/                 tipos e interfaces compartilhados entre features
    ├── utils/                 funções puras (formatação de moeda, data, máscaras)
    └── assets/                imagens, ícones, fontes
```

Pastas ainda vazias têm um `.gitkeep` com uma linha descrevendo o que vai dentro — o Git não versiona diretório vazio. **Apague o `.gitkeep` quando a pasta receber o primeiro arquivo.**

### Regras de dependência — a regra mais importante

```
app  →  features  →  shared
```

1. **Sentido único.** `app/` importa `features/` e `shared/`; `features/` importa `shared/`; `shared/` **nunca** importa `features/` nem `app/`.
2. **Features isoladas.** Uma feature não importa o interior de outra. Quando for inevitável, importe só pela API pública (`@/features/example`), nunca `@/features/example/hooks/useExample`. Muita dependência entre duas features é sinal de que elas são uma só, ou de que algo deveria estar em `shared/`.
3. **Imports.** Dentro da própria feature, caminho relativo (`../api/getExample`); fora dela, alias `@/`.
4. **Promoção para `shared/`.** Um componente, hook ou tipo nasce dentro da feature e só sobe para `shared/` quando uma segunda feature precisar dele.

### Fluxo de dados dentro de uma feature

```
pages  →  hooks (TanStack Query)  →  api  →  shared/config/httpClient (axios)  →  API
```

- **`shared/config/httpClient.ts`** é a única instância do Axios do projeto. Concentra `baseURL`, injeção do token, tratamento de 401 e normalização de erro. **Nenhum outro arquivo importa `axios` diretamente.**
- **`features/<nome>/api/`** tem uma função por endpoint, tipada. É o único lugar da feature que conhece rotas da API (`/transacoes`, `/usuarios`).
- **`features/<nome>/hooks/`** envolve as funções de `api/` em `useQuery` / `useMutation` e entrega o dado pronto para a tela — já com cache, loading e erro resolvidos.
- **`features/<nome>/pages/`** monta a tela com `components/` da feature e de `shared/`. Não sabe que existe rede.

A feature `example/` é a referência completa do padrão.

### Equivalência com a versão MVVM

| MVVM (`finup-web`) | Feature-Driven (este projeto) |
|---|---|
| `models/exampleModel.ts` | `features/example/api/getExample.ts` |
| `viewmodels/useExampleViewModel.ts` | `features/example/hooks/useExample.ts` |
| `views/ExampleView.tsx` | `features/example/pages/ExamplePage.tsx` (+ `components/ExampleList.tsx`) |
| `views/WelcomeView.tsx` | `features/welcome/pages/WelcomePage.tsx` |
| `routes/` · `App.tsx` · `styles/` | `app/routes/` · `app/App.tsx` · `app/styles/` |
| `contexts/` | `app/providers/` (sessão tende a virar `features/auth/`) |
| `components/` · `layouts/` · `config/` · `types/` · `utils/` · `assets/` | mesmas pastas, dentro de `shared/` |

### Convenções

- **Import alias `@/`** configurado: use `@/shared/components/ui/Button` em vez de `../../../shared/components/ui/Button`.
- **TypeScript em modo `strict`**, com `noUnusedLocals` e `noUnusedParameters`. Não relaxe essas flags — retroagir depois é caro.
- **Nenhum segredo em variável `VITE_`.** Tudo com esse prefixo é embutido no bundle e fica visível para qualquer usuário. Chave de API, credencial ou token de terceiro passam pelo backend, nunca pelo front.
- Pastas de feature em `kebab-case`; telas em `XPage.tsx`; componentes em `PascalCase.tsx`; hooks em `useX.ts`; funções de API com verbo (`getX.ts`, `createX.ts`); utilitários em `camelCase.ts`.

---

## O que ainda não está aqui (e por quê)

| Item | Situação |
|---|---|
| **Design tokens** (cores, tipografia, espaçamento) | `tailwind.config.js` está com `theme.extend` vazio, aguardando o Figma do AGES IV |
| **Testes** (Vitest + Testing Library) | fora do escopo desta primeira versão, a incluir quando o time decidir |
| **Formulários** (React Hook Form + Zod) | idem — o painel é majoritariamente formulário, então provavelmente entra cedo |
| **Biblioteca de componentes** | `shared/components/ui/` será construída à mão, sobre Tailwind |
| **Autenticação** | `app/routes/ProtectedRoute.tsx` e `app/providers/` estão criados e vazios, aguardando a definição do fluxo de login no backend (a lógica tende a virar `features/auth/`) |
---

## Estrutura de suporte

```
.github/
├── workflows/ci.yml          lint + typecheck + build em todo PR
├── PULL_REQUEST_TEMPLATE.md  inclui campo de evidência visual
└── CODEOWNERS                revisão obrigatória em shared/config/, features/*/api/ e shared/types/
eslint.config.js · .prettierrc · .editorconfig · .nvmrc
```

**Antes do primeiro PR:** ajuste o `@arquitetura` no `CODEOWNERS` para o time ou usuário real da organização no GitHub.
