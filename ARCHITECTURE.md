# Arquitetura — Nexus Sheets Frontend

## Stack

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| UI Library | React 19 |
| Linguagem | TypeScript |
| Estilização | Inline styles (predominante) + Tailwind CSS (parcial) |
| Estado global | Zustand 5 com persist |
| HTTP Client | Axios com interceptors |
| Ícones | lucide-react |
| Gráficos | Recharts (LineChart, PieChart) |
| Componentes base | shadcn/ui (instalado, pouco utilizado) |
| Push (PWA) | Web Push API (pywebpush no backend) |

---

## 1. Estrutura de Pastas

```
nexus-frontend/
├── app/
│   ├── (auth)/                  # Route group — layout sem sidebar
│   │   ├── layout.tsx           # Layout vazio para páginas públicas
│   │   ├── login/page.tsx       # Autenticação por email/senha
│   │   └── register/page.tsx    # Registro com chave de ativação
│   ├── (dashboard)/             # Route group — layout protegido
│   │   ├── layout.tsx           # Sidebar + Topbar + MobileNav + guarda de rota
│   │   ├── dashboard/page.tsx   # Cards de stats + gráfico + tabela recente
│   │   ├── sheets/page.tsx      # Listagem com filtros, busca, paginação
│   │   ├── sheets/[id]/page.tsx # Editor de planilha individual
│   │   ├── costs/page.tsx       # Gestão de custos mensais
│   │   ├── operators/page.tsx   # CRUD de operadores
│   │   ├── admin/page.tsx       # Painel admin (keys, plataformas, tipos de custo)
│   │   └── settings/page.tsx    # Configurações de perfil e senha
│   ├── calculadora-rodadas/     # Calculadora independente (abre em nova aba)
│   ├── page.tsx                 # Splash screen → redireciona para /login
│   ├── layout.tsx               # Root layout (fontes, metadados)
│   └── globals.css              # Estilos globais + grid responsivo
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Menu principal fixo (desktop, 200px)
│   │   └── MobileNav.tsx        # Menu inferior fixo (mobile, ≤767px)
│   └── ui/                      # Componentes shadcn (pouco usados no projeto)
│       └── badge, button, card, dialog, dropdown-menu, input, label, ...
├── hooks/
│   └── useIsMobile.ts           # Detecta breakpoint ≤767px com resize listener
├── lib/
│   ├── utils.ts                 # cn() — merge de classes Tailwind/clsx
│   └── push.ts                  # Registro de Web Push (PWA)
├── services/
│   └── api.ts                   # Axios instance centralizada com interceptors
├── store/
│   └── authStore.ts             # Estado global de autenticação (Zustand)
├── types/
│   └── index.ts                 # Interfaces TypeScript das entidades
├── public/                      # Assets estáticos
├── next.config.ts               # Config Next.js (vazia)
└── tsconfig.json                # TS config (alias "@/*" → "./*")
```

---

## 2. Rotas

| Path | Acesso | Descrição |
|---|---|---|
| `/` | Público | Splash screen com fade-out → `/login` |
| `/login` | Público | Login por email/senha |
| `/register` | Público | Registro com chave de ativação |
| `/dashboard` | Autenticado | Stats agregadas, gráfico mensal, planilhas recentes |
| `/sheets` | Autenticado | Listagem com filtro por status, busca, paginação |
| `/sheets/[id]` | Autenticado | Editor de planilha (tabela navegável por teclado) |
| `/costs` | Autenticado | Custos mensais por categoria (proxy, SMS, bot, fintech) |
| `/operators` | ADMIN/SUPERVISOR | CRUD de operadores vinculados ao usuário |
| `/admin` | ADMIN | Activation keys, plataformas, tipos de custo |
| `/settings` | Autenticado | Perfil e senha (endpoints de senha não implementados no backend) |
| `/calculadora-rodadas` | Público | Calculadora independente, sem layout do app |

**Proteção de rotas:** O layout `(dashboard)/layout.tsx` verifica `hasHydrated && !isAuthenticated` e redireciona para `/login`. Sem middleware Next.js — a proteção é client-side.

---

## 3. Fluxo de Dados

```
Usuário (interação)
        │
        ▼
   Page Component
        │  useState (estado local de dados, loading, error)
        │  useEffect → chama api.get/post/patch/delete
        │  handler → chama api.post/patch/delete
        ▼
   services/api.ts  (Axios instance)
        │  Interceptor request: injeta Bearer token do localStorage
        │  Interceptor response: 401 → limpa storage + redirect /login
        ▼
   Backend (FastAPI)
        │
        ▼ (resposta)
   Page Component
        │  setData(response.data) → re-render
        ▼
   JSX renderizado ao usuário

Estado global (Zustand — authStore):
   ← lido por Layout, Sidebar, todas as páginas protegidas
   ← escrito por login/page.tsx (setAuth) e logout no Sidebar
```

**Sem React Query:** Não há cache entre navegações, sem retry automático, sem deduplicação de requisições. Cada página busca seus dados do zero ao montar.

---

## 4. Estado Global

**Store:** `store/authStore.ts`

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  hasHydrated: boolean        // true após ler do localStorage

  setAuth(user: User, token: string): void
  logout(): void
  setHasHydrated(value: boolean): void
}
```

- Persist middleware: salva em `localStorage["nexus-auth"]`
- `hasHydrated` evita flash de redirect antes de ler o storage
- É o único estado global do app — todos os dados de domínio são estado local por página

---

## 5. Camada HTTP

**`services/api.ts`**

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
})

// Injeta token em toda requisição
api.interceptors.request.use(config => {
  const token = localStorage.getItem("access_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Força logout em token expirado
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)
```

**Problema:** O token é lido do `localStorage` no interceptor, mas o store Zustand tem o token em memória. Há duas fontes de verdade — o token pode estar no Zustand mas não no localStorage (ou vice-versa em edge cases).

---

## 6. Types / Interfaces

Definidas em `types/index.ts`:

```typescript
User            // id, email, role, is_active, plan_type, plan_expires_at
AuthTokens      // access_token, token_type, user
Platform        // id, name, created_at
SheetLine       // id, sheet_id, line_number, deposit, withdrawal, chest, bonus, result
Sheet           // id, name, owner_id, operator_id, platform_id, status, salary, goal, cooperation_type, lines[]
SheetStatus     // "NOT_STARTED" | "IN_PROGRESS" | "FINISHED"
CostSummary     // proxy, sms, bot, fintech, total
MonthlyPerformance  // month, deposited, received, result
DashboardData   // total_deposited, total_received, total_chest, final_result, costs, monthly_performance[]
Operator        // id, name, email, role, is_active, created_at, last_login
```

**Tipos inline em páginas (não centralizados):**
- `SheetStats`, `RecentSheet` — `dashboard/page.tsx`
- `ActivationKey`, `UserAdmin` — `admin/page.tsx`
- `Cost`, `CostType` — `costs/page.tsx`

---

## 7. Componentes

### Layout

| Componente | Propósito |
|---|---|
| `Sidebar.tsx` | Menu fixo (desktop), filtra itens por role, seção de logout |
| `MobileNav.tsx` | Menu inferior fixo (mobile), 7 ícones, blur backdrop |

### UI (shadcn — instalados, pouco utilizados)

`badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `separator`, `sheet`, `tabs`

O projeto usa inline styles em ~100% dos componentes de página, não os componentes shadcn. Os shadcn components ficam como base disponível mas sem adoção efetiva.

---

## 8. Hooks

| Hook | Arquivo | Propósito |
|---|---|---|
| `useIsMobile` | `hooks/useIsMobile.ts` | Retorna `true` se `window.innerWidth ≤ breakpoint` (default 767px). Adiciona resize listener. |

Sem outros hooks customizados — lógica de fetch, cálculo e efeitos vivem diretamente nas páginas.

---

## 9. Configuração

**Variáveis de ambiente:**

| Variável | Default | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Base URL do backend |

**tsconfig.json:**
- Alias `@/*` → `./*` (raiz do projeto)

**Dependências relevantes:**

| Pacote | Status | Observação |
|---|---|---|
| `@tanstack/react-query` | Instalado | **Não utilizado** — fetch é feito com Axios direto |
| `framer-motion` | Instalado | **Não visto em uso** |
| `axios` | Utilizado | HTTP client principal |
| `zustand` | Utilizado | Estado global |
| `recharts` | Utilizado | Gráficos no dashboard |
| `lucide-react` | Utilizado | Ícones em todo o app |
| `shadcn` | Instalado | Componentes base, pouco usados |

---

## 10. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Usuário (Browser)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  (auth) group        (dashboard) group    /calculadora
  login, register     layout.tsx           independente
                        │ verifica authStore
                        │ redireciona se !authenticated
                        ▼
              ┌─────────────────────┐
              │   Pages (client)    │
              │  dashboard, sheets  │
              │  costs, operators   │
              │  admin, settings    │
              └──────────┬──────────┘
                         │ useState + useEffect
                         ▼
              ┌─────────────────────┐
              │   services/api.ts   │  ← único ponto de saída HTTP
              │   Axios instance    │
              │   + interceptors    │
              └──────────┬──────────┘
                         │ HTTPS
                         ▼
              ┌─────────────────────┐
              │  Backend (FastAPI)  │
              └─────────────────────┘

Estado global (leitura transversal):
  store/authStore.ts ←→ Layout, Sidebar, todas as pages
```

---

## 11. Inconsistências Conhecidas

### Sem React Query (dado que está instalado)

`@tanstack/react-query` está no `package.json` mas nunca é usado. Todo fetch é feito com `axios` direto em `useEffect`. Consequências:
- Sem cache entre navegações
- Sem retry automático
- Sem deduplicação
- Estado de loading/error reimplementado em cada página

### Duas fontes de verdade para o token

O token existe em `authStore.token` (Zustand/localStorage via persist) **e** em `localStorage["access_token"]` separado. O interceptor do Axios lê `localStorage["access_token"]` diretamente, ignorando o Zustand. Se o persist key mudar ou o item não existir, as requisições falham silenciosamente sem autenticação.

### Tipos inline não centralizados

`SheetStats`, `RecentSheet`, `ActivationKey`, `UserAdmin`, `Cost`, `CostType` estão definidos localmente nas páginas que os usam, fora de `types/index.ts`.

### Lógica de negócio em componentes

Cálculos de totais, ROI e formatação de moeda estão embutidos no JSX das páginas (`sheets/page.tsx`, `sheets/[id]/page.tsx`). Não há camada de utilidades para cálculos de domínio.

### Sem validação client-side em formulários

Login e registro chamam a API sem validação prévia. Erros de formato chegam como resposta HTTP, não como feedback imediato ao usuário.

### Proteção de rota client-side

A guarda de rota no `(dashboard)/layout.tsx` é client-side: o HTML da página chega ao browser antes do redirect acontecer. Sem middleware Next.js há um flash inicial antes do redirect.

### Push subscription comentado

Em `sheets/[id]/page.tsx` o registro de push está comentado — não está claro se é intencional ou esquecido.

### Dependências não utilizadas

- `@tanstack/react-query` — instalado, nunca importado
- `framer-motion` — instalado, sem uso confirmado

### Settings não operacional

A página `/settings` exibe formulários de perfil e senha, mas os endpoints correspondentes não existem no backend.
