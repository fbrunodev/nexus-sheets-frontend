# nexus-sheets-frontend

Dashboard para gestão de operações de apostas. Consome a API do [nexus-sheets-api](https://github.com/fbrunodev/nexus-sheets-api) para registrar planilhas (depósitos, saques, baú, bônus), custos operacionais e métricas de performance.

---

## Stack

- **Next.js 16** com App Router — React 19, TypeScript 5
- **Zustand 5** — gerenciamento de estado e persistência de auth
- **Axios** — camada HTTP com interceptors de autenticação
- **Recharts** — gráficos de linha e pizza no dashboard
- **Tailwind CSS 4** — estilização base; maioria das páginas usa `style` inline
- **Radix UI + shadcn** — primitivos de UI (botão, dialog, tabs etc.)
- **Framer Motion** — animações (importado, uso pontual)
- **lucide-react** — ícones

---

## Destaques técnicos

### Autenticação

O token JWT fica em dois lugares ao mesmo tempo: `localStorage` (chave `access_token`) e no store do Zustand (chave `nexus-auth`). O `setAuth` em `store/authStore.ts` grava nos dois. O `axios` lê direto do `localStorage` via interceptor de request — independente do React.

O interceptor de response trata 401 automaticamente: limpa o storage e redireciona para `/login` via `window.location.href`. Nenhuma lógica de refresh token — se o token expirar, o usuário vai para o login.

Proteção de rota acontece no `app/(dashboard)/layout.tsx`: o layout aguarda `hasHydrated` (flag que o Zustand seta quando termina de ler o localStorage) antes de verificar `isAuthenticated`. Sem esse controle, o redirect dispararia antes do Zustand hidratar e quebraria o primeiro render.

### Data fetching

Sem TanStack Query nas páginas (está no `package.json` mas não é usado nos componentes). As páginas chamam `api.get()` e `api.post()` diretamente em `useEffect`, com estado local via `useState`. Paginação na listagem de planilhas é manual com `offset` e botão "Carregar mais".

### Estrutura de componentes

Componentes de layout (`Sidebar`, `MobileNav`) ficam em `components/layout`. Primitivos UI gerados pelo shadcn ficam em `components/ui`. Não há componentes específicos de feature — cada página é um arquivo de página Next.js que contém todo o estado e lógica localmente. Resulta em páginas longas mas sem dependências cruzadas.

### Push notifications

O dashboard registra um service worker (`/sw.js`) e assina push via Web Push API ao carregar. A chave VAPID vem do endpoint `/push/vapid-public-key` da API. Implementação em `lib/push.ts`.

### Sem testes

Não há testes no projeto.

---

## Estrutura do projeto

```
app/
  (auth)/               # login e cadastro (sem sidebar)
  (dashboard)/          # área autenticada
    dashboard/          # métricas gerais, gráficos, últimas planilhas
    sheets/             # listagem e criação de planilhas
    sheets/[id]/        # planilha individual com edição de linhas
    costs/              # registro de custos operacionais
    operators/          # gestão de operadores
    settings/           # configurações do usuário
    admin/              # painel de admin
  calculadora-rodadas/  # calculadora standalone (sem auth)

components/
  layout/               # Sidebar e MobileNav
  ui/                   # primitivos shadcn (button, dialog, tabs etc.)

services/
  api.ts                # instância axios com interceptors de auth

store/
  authStore.ts          # store Zustand com persist (user, token, isAuthenticated)

types/
  index.ts              # todas as interfaces TypeScript do projeto

lib/
  push.ts               # registro de push notification via Service Worker
  utils.ts              # cn() helper do shadcn
```

---

## Como rodar localmente

**Pré-requisito:** nexus-sheets-api rodando (padrão em `http://localhost:8000`).

```bash
npm install
```

Crie um `.env.local` na raiz:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Se não criar o arquivo, a aplicação usa `http://localhost:8000/api/v1` como fallback (definido em `services/api.ts`).

```bash
npm run dev
```

Acessa em `http://localhost:3000`.
