# API — platform-frontend (BFF)

Server routes proxy to **platform-backend** (`SUBSCRIPTIONS_API_URL`, default `http://localhost:8002`).

## BFF routes

| BFF route | Backend | Method |
|-----------|---------|--------|
| `/api/products` | `/v1/products` | GET |
| `/api/subscriptions` | `/v1/users/me/subscriptions` | GET, POST |
| `/api/invitations/me` | Education API `/v1/users/me/invitations` | GET |
| `/api/invitations/[id]/accept` | Education API | POST |
| `/api/invitations/[id]/reject` | Education API | POST |

Invitation routes require `EDUCATION_API_URL` in env when showing Education institute invites from the platform shell.

## Auth

All BFF routes use NextAuth session `accessToken` as `Authorization: Bearer …` when calling backends.

## Standards

- JSON request/response bodies
- Errors forwarded with same HTTP status where possible
- See [platform-backend docs/api.md](https://github.com/my-dataorg/platform-backend/blob/main/docs/api.md) for canonical platform API
