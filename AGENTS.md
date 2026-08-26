# Cursor agents — platform-frontend

Unified platform UI: login, dashboard, marketplace, invitations.

## Agents (`.cursor/agents/`)

| Agent | When to use |
|-------|-------------|
| **frontend-developer** | **Primary** — all UI implementation, components, pages, BFF routes |
| **architect** | Cross-product boundaries, new platform features |
| **planner** | Break work into tasks before coding |
| **testing-agent** | After implementation; run tests |
| **code-review** | Review diff for quality and boundaries |
| **refactor** | Simplify without behavior change |
| **documentation** | Update `docs/` when routes or integration change |

## Feature flow

```
planner → implement → testing-agent → code-review → documentation (if API/integration changed)
```

## Docs in this repo

| Doc | Purpose |
|-----|---------|
| [README.md](README.md) | Run locally, env vars |
| [docs/architecture.md](docs/architecture.md) | Shell layout, auth flow |
| [docs/api.md](docs/api.md) | BFF routes → platform-backend |
| [docs/design-system.md](docs/design-system.md) | UI tokens and components |

## Rules

See `.cursor/rules/` — especially `frontend-nextjs`, `ui-design`, `platform-core`.

## Related repos

- [platform-backend](https://github.com/my-dataorg/platform-backend) — API on port 8002
- [education-frontend](https://github.com/my-dataorg/education-frontend) — product app

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
