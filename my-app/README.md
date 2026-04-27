# GameOrbit

GameOrbit is a Next.js 16 App Router project with:

- storefront product listing + product details
- admin login with protected dashboard routes
- admin product management (create, update, delete)
- admin hero image management (create, update, delete)

## Getting Started

Install dependencies and run development:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Admin Login

Configure admin credentials in `.env.local`:

```env
ADMIN_EMAIL=admin@gameorbit.com
ADMIN_PASSWORD=admin123
AUTH_SESSION_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_API_PREFIX=/api/v1
```
