# BussaTest

Monorepo — Next.js frontend, NestJS API, PostgreSQL. Deployable en Lambda Hub sin pasos manuales post-deploy.

## Stack

- **Frontend**: Next.js 16 (standalone output)
- **Backend**: NestJS 11 + Prisma + Swagger
- **Database**: PostgreSQL 16
- **Package manager**: pnpm (workspaces)

## Desarrollo local

```bash
cp .env.example .env
docker compose up -d --build
```

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`
- Health: `http://localhost:3001/health`

## Producción (Lambda Hub)

El Hub clona la rama y corre:

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

No requiere ningún paso manual post-deploy: las migraciones de Prisma corren solas al levantar el contenedor `api` (ver `apps/api/docker-entrypoint.sh`).

Variables requeridas: ver `.env.example`. Puertos vía `PUERTO_FRONTEND`, `PUERTO_BACKEND`, `PUERTO_POSTGRES`.

## Project structure

```
├── docker-compose.prod.yml   # Producción (Lambda Hub lee este)
├── docker-compose.yml        # Desarrollo (hot reload)
├── .env.example
├── .dockerignore
├── package.json               # pnpm workspaces
├── apps/
│   ├── api/                   # NestJS
│   │   ├── Dockerfile.prod    # multi-stage build + runtime
│   │   ├── Dockerfile.dev
│   │   ├── docker-entrypoint.sh   # prisma migrate deploy && node dist/main
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   └── web/                   # Next.js
│       ├── Dockerfile.prod    # multi-stage build + runtime
│       ├── Dockerfile.dev
│       ├── next.config.ts     # output: "standalone"
│       └── app/
```

## Prisma

- `prisma generate` corre en el build del Dockerfile (`apps/api/Dockerfile.prod`), nunca en runtime.
- `prisma migrate deploy` corre en runtime vía `apps/api/docker-entrypoint.sh`, antes de arrancar la app.
- `prisma` está en `dependencies` (no solo `devDependencies`) porque el CLI se usa en runtime dentro del container de producción.

Para agregar una migración nueva en desarrollo:

```bash
docker compose exec api npx prisma migrate dev --name mi_migracion
```

## Auth (modo dev)

Sin Firebase configurado, el login es simulado (el email es el Bearer token).

| Email | Password | Role |
|---|---|---|
| `admin@admin.com` | `admin123` | `admin` |
| `user@user.com` | `user123` | `user` |

Para habilitar Firebase Auth real en producción: descomentar el volume y la env var `GOOGLE_APPLICATION_CREDENTIALS` en `docker-compose.prod.yml` (servicio `api`), montando el JSON de service account.

## Commands

```bash
# Development (hot reload)
docker compose up -d --build

# Production build
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Prisma
docker compose exec api npx prisma studio
docker compose exec api npx prisma migrate dev --name my_migration
```
