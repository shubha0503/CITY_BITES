# CITY_BITES

CITY_BITES is a full-stack food delivery demo built as a monorepo with a Next.js frontend and a TypeScript backend. It showcases a polished local-commerce experience with role-based dashboards for customers, restaurant owners, delivery partners, and admins.

## Features
- Modern landing experience with a premium local-food aesthetic
- Restaurant discovery and detail flows
- Cart and checkout experience
- Role-based dashboards for restaurant, delivery, and admin personas
- Mock/demo-friendly API bridge with live API fallback support
- Prisma-backed backend structure for future production integration

## Project Structure
- frontend: Next.js app with App Router, Tailwind-style UI, and client stores
- backend: TypeScript server, Prisma schema, and API route structure
- .agents: repository-specific agent instructions for future development work

## Tech Stack
- Frontend: Next.js, React, TypeScript
- Backend: Node.js, TypeScript, Prisma
- Package management: npm workspaces

## Prerequisites
- Node.js 18 or newer
- npm 9 or newer

## Installation
1. Clone the repository
2. Install dependencies from the project root:
   ```bash
   npm install
   ```

## Run Locally
Start the frontend:
```bash
npm run dev
```

Start the backend API:
```bash
npm run dev:api
```

Build for production:
```bash
npm run build
```

## Environment Variables
Create a local environment file if you want to enable a live backend connection:
```bash
cp .env.example .env
```

Then update the values in `.env` as needed.

## Notes
- The frontend currently works in a demo/mock mode by default, so you can explore the experience without a live backend.
- If a live API URL is provided through environment variables, the app will attempt to use it automatically.