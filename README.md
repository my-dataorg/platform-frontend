# platform-frontend

Unified MyData platform UI — dashboard, marketplace, and invitations.

**Org:** [my-dataorg](https://github.com/my-dataorg) · **Stack:** Next.js 15 · TypeScript · Tailwind · Keycloak SSO

## Routes

| Route | Purpose |
|-------|---------|
| `/login` | Keycloak SSO |
| `/dashboard` | Subscribed product cards |
| `/marketplace` | Product catalog + subscribe |
| `/invitations` | Pending institute invitations |

## Run locally

```bash
./scripts/run.sh
```

Or manually:

```bash
cp .env.example .env.local
# AUTH_SECRET: openssl rand -base64 32

npm install
npm run dev   # http://localhost:3000
```

**Requires:** Keycloak + [platform-backend](https://github.com/my-dataorg/platform-backend) on port **8002**.

See [platform-backend/infra/local](https://github.com/my-dataorg/platform-backend/tree/main/infra/local) for Docker Compose.

## Environment

| Variable | Default |
|----------|---------|
| `AUTH_URL` | `http://localhost:3000` |
| `SUBSCRIPTIONS_API_URL` | `http://localhost:8002` |
| `KEYCLOAK_ISSUER` | `http://localhost:8080/realms/mydata` |

## Documentation

| Doc | Description |
|-----|-------------|
| [AGENTS.md](AGENTS.md) | Cursor agents and workflow |
| [docs/architecture.md](docs/architecture.md) | Shell layout and auth |
| [docs/api.md](docs/api.md) | BFF routes |
| [docs/design-system.md](docs/design-system.md) | UI tokens |

## Related repos

| Repo | Port |
|------|------|
| [platform-backend](https://github.com/my-dataorg/platform-backend) | 8002 |
| [education-frontend](https://github.com/my-dataorg/education-frontend) | 3010 |
