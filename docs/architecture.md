# Architecture — platform-frontend

## Role

Post-login **platform shell**: authenticate via Keycloak, show subscribed products, browse marketplace, accept cross-product invitations.

Does **not** contain Education or Social business logic — those are separate frontends launched via product cards.

## Auth flow

```
User → /login → Keycloak OIDC → NextAuth session (JWT access token)
     → /dashboard → BFF → platform-backend /v1/users/me/subscriptions
     → Launch product → education-frontend (3010), social-frontend (3020), …
```

## Structure

```
src/
  app/
    dashboard/          # Subscribed products
    marketplace/        # Catalog
    invitations/        # Accept/decline institute invites
    api/                # BFF proxies to platform-backend
  components/
  lib/
    api.ts              # Client helpers
    api-server.ts       # Server-side fetch to backend
```

## BFF pattern

Browser never calls `platform-backend` directly with tokens from client-side fetch for catalog — use `/api/products` and `/api/subscriptions` route handlers that attach the session access token server-side.

## Subscriptions

Dashboard only shows products the user subscribed to via marketplace. Product APIs (e.g. education-backend) independently verify `education` entitlement.
