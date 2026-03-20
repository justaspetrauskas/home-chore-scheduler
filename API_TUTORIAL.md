# Home Chore Scheduler API Tutorial

Welcome to the Home Chore Scheduler API! This backend service helps manage chores, users, households, rooms, and cleaning events for shared living spaces. Below you'll find an overview of how the API is structured and how to use it.

## Overview
- **Authentication:** JWT-based, required for most endpoints.
- **Resources:** Users, Households, Rooms, Chores, Cleaning Events, Task Assignments.
- **API Docs:** Interactive Swagger UI at `/api-docs` when running in development mode.

## Authentication
- Register: `POST /auth/register` — Create a new user account.
- Login: `POST /auth/login` — Obtain a JWT token.
- Logout: `POST /auth/logout` — Invalidate the session (client-side token removal).

## Users
- List users: `GET /users` (auth required)
- Get current user: `GET /users/me` (auth required)
- Get user by ID: `GET /users/{id}` (auth required, only self)
- Update user: `PUT /users/{id}` (auth required, only self)
- Delete user: `DELETE /users/{id}` (auth required, only self)

## Households
- Create: `POST /households` (auth required)
- List: `GET /households` (auth required)
- Get by ID: `GET /households/{id}` (auth required)
- Invite member: `POST /households/{householdId}/invite` (auth required)
- Remove member: `DELETE /households/{householdId}/members/{userId}` (auth required)

## Rooms
- Create: `POST /rooms` (auth required)
- List by household: `GET /rooms/household/{householdId}` (auth required)
- Get by ID: `GET /rooms/{id}` (auth required)
- Update: `PUT /rooms/{id}` (auth required)
- Delete: `DELETE /rooms/{id}` (auth required)

## Chores
- List: `GET /chores`
- Get by ID: `GET /chores/{id}`
- Create: `POST /chores` (auth required)
- Update: `PUT /chores/{id}` (auth required)
- Delete: `DELETE /chores/{id}` (auth required)

## Cleaning Events
- List: `GET /cleaning-events` (auth required)
	- Returns cleaning events where the user is a participant.
	- Response: `{ status: "success", data: { events: [...] } }`
- Create: `POST /cleaning-events` (auth required)
	- Request body: `{ participantIds: [userId], choreIds: [choreId], scheduledAt: <date-time> }`
	- Response: `{ status: "success", data: { event: {...}, assignments: [...] } }`

## General Usage
1. **Register and Login** to get your JWT token.
2. **Authenticate** all requests (except register/login) with `Authorization: Bearer <token>`.
3. **Explore** the API using Swagger UI at `/api-docs`.
4. **Manage** users, households, rooms, chores, and events via the documented endpoints.

## Example Workflow
1. Register and log in to get a token.
2. Create a household and invite members.
3. Add rooms to the household.
4. Create chores and assign them to rooms.
5. Schedule cleaning events and assign tasks.
6. Track completion and manage assignments.

---

For detailed request/response formats, see the Swagger UI or the OpenAPI schemas in the codebase.
