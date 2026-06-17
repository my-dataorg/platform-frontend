# Development — platform-frontend

## Prerequisites

- Node.js 20+
- Running [platform-backend](https://github.com/my-dataorg/platform-backend) and Keycloak (see platform-backend `infra/local/run.sh`)

## Start

```bash
./scripts/run.sh
```

Runs on **http://localhost:3000**. Creates `.env.local` from `.env.example` on first run.

Set `AUTH_SECRET` in `.env.local`:

```bash
openssl rand -base64 32
```

Use the **same** `AUTH_SECRET` in education-frontend.

## Demo login

- http://localhost:3000/login
- `demo@mydata.local` / `demo1234`
