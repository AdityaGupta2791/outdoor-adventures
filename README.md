# Outdoor Adventures

A full-stack web platform for discovering and booking pre-organized outdoor adventure trips (camping, trekking, hiking, and similar experiences) across India, powered by **LLM-based natural-language search** and **AI trip-preparation assistance**.

## Project Structure

```
.
├── frontend/    React SPA (Vite + React + Tailwind)
├── backend/     Node + Express REST API (Prisma + Postgres)
├── docs/        Architecture & build documentation
└── legacy/      Original 2nd-year static HTML/CSS project (archived)
```

## Documentation

- [Technical Documentation](./docs/tech-doc.md) — architecture, tech stack, data model, APIs
- [Module-Wise Build Breakdown](./docs/module-wise-breakdown.md) — build order, modules, milestones
- [Design Style Guide](./docs/design-style.md) — color palette, hero locked, page-level design references

## Tech Stack

**Frontend:** React, Vite, React Router, Tailwind CSS, TanStack Query, Zustand, React Hook Form + Zod, Axios
**Backend:** Node.js, Express, Prisma, JWT, Passport.js, bcrypt, Pino, Vitest
**Database:** PostgreSQL (Neon)
**LLM:** Google Gemini
**Payment:** Razorpay
**Storage:** Cloudinary
**Deployment:** Vercel (frontend), Render (backend)

## Running Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in values
npx prisma migrate dev
npm run dev
```
