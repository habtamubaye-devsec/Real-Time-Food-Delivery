# Real-time-food-delivery-

## What you need (local dev)

- Node.js + npm (recommended: Node 18+ / 20+)
- MongoDB (local or Atlas)
- Redis (local or cloud)

## Setup + start (Windows)

### Recommended (run everything from the project root)

1. Install all dependencies:
	- `npm run install:all`
2. Start backend + frontend together:
	- `npm run dev`
	- Frontend: `http://localhost:3000`
	- Backend: `http://localhost:5000`
	- Swagger UI: `http://localhost:5000/api-docs`

### 1) Start MongoDB and Redis

- Ensure MongoDB is running and you have a connection string.
- Redis is optional. If you don't run Redis locally, the backend will still start.

### 2) Backend

1. Go to the backend folder:
	- `cd backend`
2. Create your env file:
	- Use [backend/.env](backend/.env) (already included in this workspace) and adjust values if needed.
3. Install deps:
	- `npm install`
4. Start the API:
	- `npm run dev`
	- API defaults to `http://localhost:5000`
	- Swagger UI: `http://localhost:5000/api-docs`

Optional:
- Seed sample restaurants/users:
  - `npm run seed`
- Generate swagger file:
  - `npm run swagger`

### 3) Frontend

1. Go to the frontend folder:
	- `cd frontend`
2. (Optional) Create your env file:
	- Use [frontend/.env](frontend/.env) (already included in this workspace).
3. Install deps:
	- `npm install`
4. Start the app:
	- `npm run dev`
	- Frontend runs at `http://localhost:3000`

## Notes

- Frontend API base URL is controlled by `VITE_API_URL`.
- Cookies are used for auth (`withCredentials: true`), so ensure `CLIENT_URL` matches where your frontend runs.