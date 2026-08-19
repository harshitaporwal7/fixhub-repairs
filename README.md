# FixHub Repairs

A full-stack device repair business website — book a screen, battery, or hardware
repair online, track it by reference ID, and manage everything from an admin
dashboard. Built with React/Vite/Tailwind on the frontend and Node/Express/MongoDB
on the backend.

This is an original project inspired by the general shape of professional device-repair
booking sites (device → problem → price → appointment). No code, text, images, or brand
assets were copied from any reference site.

## Tech stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, lucide-react
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT auth, bcrypt

## Project structure

```
fixhub-repairs/
├── backend/          Express API (MVC-ish: models / routes / middleware)
│   ├── config/        MongoDB connection
│   ├── models/        Mongoose schemas
│   ├── routes/        REST endpoints (also contain the controller logic)
│   ├── middleware/     auth (JWT) + centralized error handling
│   ├── seed/           demo data seed script
│   └── server.js
└── frontend/         React app
    └── src/
        ├── api/         axios client
        ├── context/     auth context
        ├── components/  header, footer, shared UI
        └── pages/       public pages + pages/admin (admin dashboard)
```

## 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. Configure MongoDB

You need a MongoDB instance — either local or a free [MongoDB Atlas](https://www.mongodb.com/atlas)
cluster. Copy the connection string.

## 3. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/fixhub_repairs   # or your Atlas URI
JWT_SECRET=some-long-random-string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@fixhubrepairs.com
ADMIN_PASSWORD=Admin@12345
ADMIN_NAME=FixHub Admin
```

```bash
cd ../frontend
cp .env.example .env
```

`frontend/.env` already points at `http://localhost:5000/api` by default — only
change `VITE_API_URL` if your backend runs elsewhere.

## 4. Seed the database

This creates devices, brands, models, ~190 realistic repair services with INR
pricing, 5 store locations, 10 demo customers, 24 demo bookings, 15+ approved
reviews, a couple of contact requests, and the admin account.

```bash
cd backend
npm run seed
```

## 5. Start the backend

```bash
cd backend
npm run dev        # nodemon, auto-restarts on changes
# or: npm start
```

The API runs at `http://localhost:5000/api` — check `http://localhost:5000/api/health`.

## 6. Start the frontend

```bash
cd frontend
npm run dev
```

The site runs at `http://localhost:5173`.

## 7. Log in as admin

Go to `http://localhost:5173/login` and use the admin credentials from your `.env`
(defaults: `admin@fixhubrepairs.com` / `Admin@12345`). You'll be redirected to
`/admin` — the dashboard, bookings, customers, and CRUD screens for devices,
brands, models, repair services, locations, reviews, and contact requests.

A seeded customer login: `aarav-sharma@example.com` / `Customer@123` (same
password for all ten seeded customers, with emails generated from the names
in `backend/seed/seed.js`).

## 8. Test the booking flow

1. Visit `/book` (or click **Book a Repair**).
2. Pick a device → brand → model → problem → store → date/time → your details.
3. Submit — you'll land on a confirmation page with a booking reference (e.g.
   `FX-AB12CD34`).
4. Use `/track` with that reference + the email you booked with to check status
   without logging in.
5. If you're logged in as a customer, the same booking shows up under
   `/dashboard`, where you can cancel it (while Pending/Confirmed) or leave a
   review once its status is set to Completed (via the admin dashboard).

## Notes on production readiness

- Every list/detail view has loading, empty, and error states.
- JWT auth, bcrypt password hashing, rate limiting on `/auth` and `/contact`,
  and role-gated admin routes are all wired in the backend.
- All admin CRUD (devices, brands, models, repair services, locations) writes
  through the same generic `AdminCrud` component/config, backed by real REST
  endpoints — nothing is hardcoded in the frontend.
- Before deploying: set a strong `JWT_SECRET`, restrict `CLIENT_ORIGIN` to your
  real frontend domain, and run `npm run build` in `frontend/` to produce the
  static bundle (`frontend/dist`) to serve behind your CDN/host of choice.
