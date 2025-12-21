## Backend (API)

### Requirements

- Node.js + npm
- MongoDB
- Redis

### Environment

- Create `backend/.env` using [backend/.env.example](.env.example)

Required keys:
- `MONGO_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

Optional keys:
- `PORT` (default `5000`)
- `CLIENT_URL` (default `http://localhost:3000`)
- `NODE_ENV`

### Install + run

- Install: `npm install`
- Dev: `npm run dev`
- Prod-style: `npm start`

### Other scripts

- Seed data: `npm run seed`
- Generate swagger json: `npm run swagger`
- Swagger UI (when server is running): `http://localhost:5000/api-docs`
