# Home Chore Scheduler API

## Overview

Express + Prisma + PostgreSQL backend for managing households, rooms, chores, cleaning events, and assignments.

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

## Households

- `POST /households`
- `GET /households`
- `GET /households/:id`
- `DELETE /households/:id`
- `POST /households/:householdId/set-default`

## Invitations

### Create Invitation

- `POST /household/:id/invite`
- Body:

```json
{
  "email": "person@example.com"
}
```

Behavior:

- Validates requester is household member
- Generates secure token with `crypto.randomBytes(32).toString("hex")`
- Stores invitation in DB with expiry date

### Validate Invitation

- `GET /invite/:token`

Validation:

- Invitation exists
- Invitation is not used
- Invitation is not expired

## Rooms

- `POST /rooms`
- `GET /rooms/household/:householdId`
- `GET /rooms/:id`
- `PUT /rooms/:id`
- `DELETE /rooms/:id`
- `POST /households/:householdId/rooms/bulk`

## Chores

- `GET /chores`
- `GET /chores/:id`
- `POST /chores`
- `PUT /chores/:id`
- `DELETE /chores/:id`

## Cleaning Events

- `GET /cleaning-events`
- `POST /cleaning-events`
- `PATCH /cleaning-events/:id`
