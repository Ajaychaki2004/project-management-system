# Product Management Full Stack App

A full-stack product management application with:
- Backend: Node.js, Express, Prisma, PostgreSQL
- Frontend: React + Vite
- Auth: JWT-based authentication

## Project Structure

- `backend/` -> Express API, Prisma schema, auth/product routes
- `frontend/` -> React UI (login/signup + protected product management)
- `package.json` (root) -> workspace scripts to run everything from root

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL database (Supabase/Neon/local)


## Initial Setup

Clone the repository and move into the project folder:

```bash
git clone https://github.com/Ajaychaki2004/project-management-system.git
cd project-management-system
```

## Environment Setup

Create/update `.env` in the project root:

```env
DATABASE_URL="postgresql://<username>:<password>@<host>:5432/<database>?uselibpqcompat=true&sslmode=require"
JWT_SECRET="your_jwt_secret"
```

Then install dependencies from the project root:

```bash
npm install
```

<!-- This installs dependencies once at root and auto-generates Prisma Client via `postinstall`. -->

## Run the Project

Start both backend and frontend from root:

```bash
npm start
```

This runs:
- Backend (nodemon): `backend/index.js`
- Frontend (Vite dev server): `frontend`

## Useful Scripts

- `npm start` -> starts backend + frontend
- `npm run start:backend` -> backend only
- `npm run start:frontend` -> frontend only
- `npm run prisma:generate` -> regenerate Prisma client

## API Base URLs

- Backend: `http://localhost:5000`
- Frontend (Vite): usually `http://localhost:5173`

Frontend uses Vite proxy for `/api` requests to backend.

## Common Troubleshooting

1. `Cannot find module '.prisma/client/default'`
- Run:
```bash
npm run prisma:generate
```

2. Prisma `P1001` (database not reachable)
- Verify `DATABASE_URL` host/port.
- Check network/firewall and database allowlist.

3. Prisma `P1013` (invalid URL)
- Ensure special chars in DB password are URL-encoded.

4. Prisma `P1011` TLS errors
- Use `?uselibpqcompat=true&sslmode=require` with compatible hosted providers.

## Current Features

- Signup/Login (JWT)
- Protected routes in frontend
- Product CRUD (create, list, update, delete)
- Toast notifications for API feedback

## License

ISC
