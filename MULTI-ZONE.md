# Multi-Zone com o Legado — Resumo das Alterações

Este projeto roda como **Multi-Zone (via Rewrites)** sob o domínio do sistema legado (`front-master-mobility`).
Ao acessar `master-mobility.com/ranking-condutores`, a Vercel faz o proxy reverso para este projeto.

---

## Entrega 1 — `assetPrefix`

**Arquivo:** `next.config.ts`

```ts
const nextConfig: NextConfig = {
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/fleeting-static" : undefined,
};
```

Em produção, os chunks deste projeto são requisitados em `/fleeting-static/_next/static/...`, evitando conflito com o `/_next/static/...` do legado. Em desenvolvimento o prefixo fica `undefined`, sem afetar o `next dev`.

> **Atenção:** o legado precisa de um rewrite de `/fleeting-static/:path*` apontando para este projeto, além do rewrite de `/ranking-condutores`.

---

## Entrega 2 — Rotas em `/ranking-condutores`

Todas as páginas estavam na raiz (`/`). Foram movidas para `src/app/ranking-condutores/`:

| Antes | Depois |
|---|---|
| `/` | `/ranking-condutores` |
| `/matriz-pontuacao` | `/ranking-condutores/matriz-pontuacao` |
| `/dashboard-parametros` (+ `[id]`) | `/ranking-condutores/dashboard-parametros` (+ `[id]`) |
| `/performance-condutores` (+ `[id]`) | `/ranking-condutores/performance-condutores` (+ `[id]`) |
| `/gestao-excecoes` | `/ranking-condutores/gestao-excecoes` |
| `/analises-preditivas` | `/ranking-condutores/analises-preditivas` |
| `/demo-graficos` | `/ranking-condutores/demo-graficos` |

- `src/app/layout.tsx` permanece na raiz de `src/app`.
- Foram atualizados todos os `href`, `router.push`, comentários `Rota:` e o `usePathname` da sidebar (`src/components/app-sidebar.tsx`) para o novo prefixo.
- O link "voltar" da página de detalhe do condutor aponta para `/ranking-condutores`.

---

## Entrega 3 — Autenticação compartilhada com o legado

Cookies e `localStorage` já são compartilhados no navegador (mesmo domínio).

### Dependências
- `js-cookie` e `@types/js-cookie` (instalados)
- `axios` (já existia)

### `src/utils/tokens.ts`
- `getTokens(cname)` — lê o cookie com `Cookies.get`.
- `setTokens(access_token, refresh_token)` — grava os cookies `NEXT_PUBLIC_TOKEN_NAME` e `NEXT_PUBLIC_REFRESH_TOKEN_NAME` com `{ expires: 30, path: '/' }`.
- `resetTokens()` — `localStorage.clear()` e remove os cookies `refresh-token-mm-dev`, `token-mm-dev`, `NEXT_PUBLIC_TOKEN_NAME` e `NEXT_PUBLIC_REFRESH_TOKEN_NAME` (`{ path: '/' }`).

### `src/utils/auth.ts`
- `redirectToLogin(path)` — usa `window.location.href` (hard navigation), pois `/login` é do legado:
  - `path === "/"` ou começa com `/login` → `/login`
  - caso contrário → `/login?callbackUrl=<path codificado>`
- `getCurrentUser<T>()` — lê e faz parse seguro de `localStorage.getItem('user')` (retorna `null` no servidor ou em JSON inválido).

### `src/services/api.ts`
- Instância Axios com `baseURL: NEXT_PUBLIC_API_GATEWAY`.
- **Request interceptor:** token via `getTokens(TOKEN_NAME) ?? localStorage.getItem(TOKEN_NAME)`; injeta `Authorization: Bearer <token>`.
- **Response interceptor (401):**
  - Ignora `/auth/refresh` e `/auth/login`.
  - `renewingPromise` (Promise Lock) evita múltiplos refreshes simultâneos.
  - Sucesso: `setTokens`, atualiza `localStorage('user')`, atualiza o header e reexecuta a requisição original.
  - Falha: `resetTokens()`, `redirectToLogin(pathname + search)` e rejeita a Promise.
- **Extras (não pedidos):**
  - Resposta de `/auth/refresh` validada com Zod (regra do projeto).
  - Flag `_retry` na requisição original para evitar loop infinito de 401.

### `.env.example`
```
NEXT_PUBLIC_API_GATEWAY=
NEXT_PUBLIC_TOKEN_NAME=
NEXT_PUBLIC_REFRESH_TOKEN_NAME=
```

---

## Documentação e validação

- `PROJECT.md` atualizado: tabela de rotas e decisões técnicas 9 e 10.
- `npx tsc --noEmit` executado sem erros (após limpar o cache `.next`).
- Não foram executados `next dev`/`next build` nem testes do refresh contra uma API real.
