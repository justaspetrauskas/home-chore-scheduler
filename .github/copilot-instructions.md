# Copilot Instructions - Prisma PG Course

## Project Overview
This is a Node.js Express backend application for a chore management system. The project integrates **Prisma ORM** with **PostgreSQL** for database operations. Currently in early development with route scaffolding in progress.

## Technology Stack
- **Framework**: Express.js (v5.2.1) - ESM modules
- **Database**: PostgreSQL with Prisma ORM
- **Dev Tools**: Nodemon for hot-reload development
- **Runtime**: Node.js with ES modules (`"type": "module"` in package.json)

## Project Structure

```
src/
├── server.js          # Main Express app entry point, route mounting
├── routes/
│   └── choreRoutes.js # Chore resource endpoints (scaffold)
├── models/           # [Expected] Prisma schema definitions
├── controllers/      # [Expected] Business logic for routes
└── middleware/       # [Expected] Auth, validation, error handling
```

## Key Architectural Patterns

### Module System
- **Use ES6 imports/exports** exclusively (`import`/`export`)
- Do NOT use CommonJS (`require`/`module.exports`)

### Planned Resources
The following commented resources in [src/server.js](src/server.js#L16-L20) indicate the domain model:
- **AUTH** - Authentication/Authorization
- **CHORE** - Chore management (primary resource)
- **AREA** - Location/area categories
- **USER** - User profiles
- **ASSIGNMENT** - Chore-to-user assignments

### Route Organization
- Create dedicated router modules in `src/routes/` for each resource
- Mount routers in [server.js](src/server.js) using `app.use()`
- Example: `app.use('/api/chores', choreRouter)`

## Development Workflow

**Start dev server with hot-reload:**
```bash
npm run dev
```

This runs Nodemon which watches `src/server.js` for changes.

## Code Style & Conventions

1. **Port Configuration**: Use constants (currently `PORT = 5050` in server.js)
2. **Response Format**: Use `.json()` for API responses
3. **Router Handlers**: Handlers receive `(req, res)` parameters

## Integration Points

- **Prisma Client**: Will be imported in controllers/models for database queries
- **Middleware Chain**: Add express middleware (body parser, auth) to `server.js` before route mounting
- **Error Handling**: Implement global error handler after route definitions

## When Adding Features
1. Create resource routes in `src/routes/{resource}Routes.js` as Express Router
2. Implement controller logic for business logic separation
3. Define Prisma schema for new database entities
4. Mount routes in `server.js` with appropriate API path prefix

## Known Gaps (Not Yet Implemented)
- Prisma schema and client setup
- Database models for CHORE, USER, AREA, ASSIGNMENT
- Authentication/authorization middleware
- Input validation
- Error handling middleware
