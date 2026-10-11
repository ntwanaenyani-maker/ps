# Phethagatsa Solutions

Modern African skincare & wellness e-commerce storefront (React + Vite) with an
Express + MongoDB (Mongoose) API.

```
.
├── src/          # React storefront (Vite + TypeScript + Tailwind)
├── public/images # Product imagery
└── server/       # Express API (Mongoose models, seed data, in-memory fallback)
```

## Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, lucide-react, motion
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB (Atlas or self-hosted). Falls back to an in-memory store
  when `MONGODB_URI` is unset so the API always boots.
- **Hosting**: Render (one web service for the API, one static site for the UI)

## Local development

```bash
# API
cd server
cp .env.example .env          # set MONGODB_URI (optional)
npm install
npm run dev                   # http://localhost:3001

# Storefront (separate terminal)
npm install
npm run dev                   # http://localhost:3000  (/api proxied to :3001)
```

## Environment variables

**Backend** (`server/.env`):

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. Unset → in-memory store. |
| `ADMIN_API_KEY` | Required (`X-API-Key`) for product write endpoints. |
| `CORS_ORIGIN` | Comma-separated allowed origins, or `*` (default). |
| `PAYSTACK_SECRET_KEY` | Enables hosted card checkout. |
| `WHATSAPP_NUMBER` | Concierge number for WhatsApp order links. |

**Frontend** (`.env.local`): `VITE_API_URL` — base URL of the API
(blank for local proxy / same origin).

> Never commit real credentials. If you ever did, rotate them immediately.

## API

Public:

- `GET /api/health`
- `GET /api/products` (`?category=`, `?search=`) · `GET /api/products/:id`
- `GET /api/settings`
- `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me`
- `POST /api/orders` · `GET /api/orders/mine` · `GET /api/orders/:ref`
- `POST /api/pay/initialize`
- `POST /api/whatsapp/order-link`

Admin (`X-API-Key: <ADMIN_API_KEY>`):

- `POST /api/products` · `PUT /api/products/:id` · `DELETE /api/products/:id`
- `PUT /api/settings`
- `GET /api/customers` · `GET /api/analytics` · `GET /api/admin/secure-access`

Auth uses scrypt-hashed passwords and opaque session tokens (server-side
`Session` documents) sent as a Bearer token and an HttpOnly `ps_session` cookie.

## Seeding

`server/data/*.json` holds the seed catalog, settings and analytics. With
`MONGODB_URI` set, run:

```bash
cd server && npm run seed
```

The in-memory fallback seeds itself at boot.

## Deploy on Render

`render.yaml` defines both services. On Render:

1. New → Blueprint → pick this repo.
2. Set `MONGODB_URI` (and optionally `PAYSTACK_SECRET_KEY`) on `phethagatsa-api`.
3. `VITE_API_URL` is wired to the API host automatically.

## License

Proprietary — Phethagatsa Solutions.
