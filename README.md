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

O login usa o AWS Cognito: preencha também `VITE_COGNITO_REGION` e `VITE_COGNITO_CLIENT_ID` no `.env.development` (veja [Autenticação](#autenticação)).

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
│   ├── dashboard/             painel inicial (rota "/app/dashboard")
│   │   ├── api/               getUserGrowth.ts + mock (VITE_USE_MOCKS)
│   │   ├── hooks/             useUserGrowth.ts
│   │   ├── components/        GraficoCrescimentoUsuario.tsx
│   │   ├── pages/             DashboardPage.tsx
│   │   ├── types.ts           tipos da feature
│   │   └── index.ts           API pública da feature
│   ├── auth/                  login e sessão do painel (rota "/login")
│   │   ├── api/               Cognito (cognitoClient.ts) e backend (getAdminMe.ts)
│   │   ├── components/        AuthProvider e componentes da tela de login
│   │   ├── hooks/             useAuth.ts
│   │   ├── session/           tokens, renovação, logout e mensagens de erro
│   │   ├── pages/             LoginPage.tsx
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
- **Mocks.** Com `VITE_USE_MOCKS=true` (padrão do `.env.example`), as funções de `api/` devolvem os dados simulados da própria feature em vez de chamar o backend. Use enquanto o endpoint não existir.
- **Nenhum segredo em variável `VITE_`.** Tudo com esse prefixo é embutido no bundle e fica visível para qualquer usuário. Chave de API, credencial ou token de terceiro passam pelo backend, nunca pelo front.
- Pastas de feature em `kebab-case`; telas em `XPage.tsx`; componentes em `PascalCase.tsx`; hooks em `useX.ts`; funções de API com verbo (`getX.ts`, `createX.ts`); utilitários em `camelCase.ts`.

---

## O que ainda não está aqui (e por quê)

| Item | Situação |
|---|---|
| **Design tokens** (cores, tipografia, espaçamento) | `tailwind.config.js` está com `theme.extend` vazio, aguardando o Figma do AGES IV |
| **Testes** (Vitest + Testing Library) | entram num PR próprio, que depois recebe os testes do login |
| **Formulários** (React Hook Form + Zod) | fora do escopo desta primeira versão — o painel é majoritariamente formulário, então provavelmente entra cedo |
| **Biblioteca de componentes** | `shared/components/ui/` será construída à mão, sobre Tailwind |
---

## Autenticação

O painel entra pelo AWS Cognito, no mesmo User Pool do app, com um app client próprio. Depois do login, `GET /api/v1/admin/me` (contrato C2) confirma que a pessoa está no grupo `admin`. Só então o painel abre.

```
login (e-mail e senha)  →  Cognito  →  access token  →  GET /api/v1/admin/me  →  /app
```

### Configuração

| Variável | O que é |
|---|---|
| `VITE_COGNITO_REGION` | região do User Pool, o prefixo do `COGNITO_USER_POOL_ID` do backend (`us-east-2_...` → `us-east-2`) |
| `VITE_COGNITO_CLIENT_ID` | ID do app client **do painel**, o mesmo `COGNITO_ADMIN_CLIENT_ID` do backend. Não é o cliente `FinUp` do app mobile |

Nenhum dos dois é segredo: o app client do painel não tem client secret. Ele precisa do fluxo `ALLOW_USER_AUTH`, porque o login usa `USER_AUTH` com senha, como o `finup-mobile`. A conversa com o Cognito é um `fetch` direto para a API pública dele, sem SDK.

### Onde está cada parte

| Arquivo | Papel |
|---|---|
| `features/auth/api/cognitoClient.ts` | único ponto que chama o Cognito |
| `features/auth/session/authSession.ts` | login, renovação do token e logout; onde os tokens ficam |
| `features/auth/components/AuthProvider.tsx` | estado da sessão; confirma o ADMIN com o backend |
| `shared/config/httpClient.ts` | põe o `Authorization: Bearer` e trata o `401` e o `403` |
| `shared/config/apiError.ts` | erro normalizado da API (`status` e o `problem+json`) |
| `app/routes/ProtectedRoute.tsx` | tudo sob `/app` exige sessão |

### Tokens

- O **access token** fica só em memória e vai no `Authorization`. O backend recusa o ID token.
- O **refresh token** fica no `sessionStorage`. A sessão sobrevive a um reload, mas some ao fechar a aba e não é compartilhada entre abas.
- Nenhum token vai para log, para a URL ou para o `localStorage`.
- Perto de expirar, o access token é renovado antes da requisição. Se o backend responder `401` mesmo assim, o painel renova e tenta de novo uma vez. Se não der, a pessoa volta ao login com o aviso de sessão expirada e, depois de entrar, retorna à página onde estava.
- **Sair** revoga o refresh token no Cognito e apaga a sessão local. O access token já emitido continua aceito pelo backend até expirar.

### Respostas do backend

| `GET /api/v1/admin/me` | O que o painel faz |
|---|---|
| `200` com `role: "ADMIN"` | abre o painel; o nome vai para a sidebar |
| `403` | encerra a sessão e mostra "Acesso negado" no login |
| `404` | primeiro acesso: cria o registro local (`POST /api/v1/users`) e pergunta de novo |
| `401` | renova o token e tenta de novo; se não der, volta ao login |
| sem resposta ou `5xx` | mostra erro de conexão; dá para tentar de novo |

Um `403` em qualquer rota de `/api/v1/admin/**` no meio do uso também encerra a sessão e leva ao "Acesso negado". É o caso de quem foi tirado do grupo `admin`.

### Como testar

1. Suba o `finup-backend` com `COGNITO_ADMIN_CLIENT_ID` preenchido e `http://localhost:5173` em `CORS_ALLOWED_ORIGINS`.
2. Preencha `VITE_COGNITO_REGION` e `VITE_COGNITO_CLIENT_ID` no `.env.development` e rode `npm run dev`.
3. Entre com um usuário que **está** no grupo `admin`. O painel abre em `/app` com o nome dele na sidebar. **Sair** volta ao login.
4. Entre com um usuário que **não está** no grupo. Aparece "Acesso negado" e o painel não abre.
5. Com o painel aberto, apague o refresh token (DevTools → Application → Session Storage) e espere o access token vencer, ou tire o usuário do grupo e recarregue. A sessão termina e volta ao login.

O grupo entra no token na hora do login: quem acabou de ser colocado no grupo precisa entrar de novo.

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
