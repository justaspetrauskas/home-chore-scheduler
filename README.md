# Home Chore Scheduler 

## Overview
This project is a Node.js Express backend for a home chore management system. It uses PostgreSQL as the database, Prisma ORM for data modeling, and supports background job processing with Graphile Worker.

---

## Project Structure

```
root/
├── prisma/                  # Prisma schema, migrations, and seed scripts
│   ├── schema.prisma        # Main Prisma schema definition
│   ├── seed.js              # Database seeding script
│   └── migrations/          # Prisma migration files
├── generated/               # Generated Prisma client code (do not edit)
├── src/
│   ├── server.js            # Main Express app entry point
│   ├── config/
│   │   └── db.js            # Database connection and Prisma client setup
│   ├── controllers/         # Route handler logic
│   │   ├── choresController.js
│   │   ├── cleaningEventController.js
│   │   ├── householdController.js
│   │   ├── roomController.js
│   │   ├── userController.js
│   │   └── services/
│   │       └── assignmentService.js # Chore assignment logic (shared by API and worker)
│   ├── middlewares/         # Express middleware (auth, validation, etc.)
│   ├── routes/              # Express route definitions
│   ├── utils/               # Utility functions (e.g., token generation)
│   ├── validators/          # Input validation logic
│   └── worker.js            # Background worker process (Graphile Worker)
├── package.json             # Project metadata and scripts
├── .env                     # Environment variables (not committed)
└── README.md                # Project documentation (this file)
```

---

## Key Technologies
- **Node.js** (ES modules)
- **Express.js** (API framework)
- **Socket.IO** (real-time server events)
- **PostgreSQL** (database)
- **Prisma ORM** (database modeling and queries)

---

## Main Concepts
- **Chores**: Tasks to be completed, can be assigned to users and rooms.
- **Users**: People in the household, with roles (ADMIN, MEMBER, EVENT_MANAGER).
- **Households**: Groups of users, each with rooms and events.
- **Rooms**: Areas within a household where chores can be assigned.
- **Cleaning Events**: Scheduled events for chore assignments.
- **Assignments**: Links chores to users for specific events.

---

## How It Works
- **API**: Exposes REST endpoints for managing users, chores, rooms, events, and assignments.
- **Realtime**: Socket.IO runs on the same HTTP server and allows broadcasting live updates to connected clients.
- **Controllers**: Handle business logic, call Prisma for DB operations.
- **Services**: Shared logic (e.g., random assignment) used by both API and worker.
- **Worker**: Listens for background jobs (e.g., randomizeAssignments) and processes them using the same logic as the API.
---

## Development Workflow
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and set your database URL and secrets.
3. **Run database migrations:**
   ```bash
   npm run migrate
   ```
4. **Seed the database (optional):**
   ```bash
   npm run seed:chores
   ```
5. **Start the API server:**
   ```bash
   npm run dev
   ```
6. **Start the worker process:**
   ```bash
   npm run worker
   ```

---

## Adding Features
- Add new routes in `src/routes/`
- Implement business logic in `src/controllers/` and `src/controllers/services/`
- Update the Prisma schema in `prisma/schema.prisma` and run migrations
- Use the shared service logic for any background jobs

---

## Conventions
- **ES Modules**: Use `import`/`export` everywhere
- **Controllers**: Only handle HTTP logic, delegate to services for business logic
- **Services**: Reusable logic, no direct HTTP or Express code
- **Prisma**: All DB access through Prisma client
- **Environment Variables**: All secrets/config in `.env`

---

## Onboarding Checklist
- [ ] Clone the repo
- [ ] Install dependencies
- [ ] Set up your `.env`
- [ ] Run migrations and seed data
- [ ] Start the dev server and worker
- [ ] Review the code structure above
