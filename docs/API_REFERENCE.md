# Home Chore Scheduler API

## Overview

Express + Prisma + PostgreSQL backend for managing households, rooms, chores, cleaning events, and assignments.

## Authentication

### POST /auth/register

Request body:

```json
{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "StrongPassword123"
}
```

### POST /auth/login

Request body:

```json
{
  "email": "alex@example.com",
  "password": "StrongPassword123"
}
```

### POST /auth/logout

No request body.

## Users

### GET /users

No request body.

### GET /users/me

No request body.

### GET /users/:id

Path params:

- id: user id

### PUT /users/:id

Path params:

- id: user id

Request body:

```json
{
  "name": "Updated Name"
}
```

### POST /users/default-household

Request body:

```json
{
  "householdId": "4d4f2a4f-688d-4c8b-9981-80eeaf6673d1"
}
```

Notes:

- householdId is optional only when the user belongs to exactly one household.

## Households

### POST /households

Request body:

```json
{
  "name": "My Home"
}
```

### GET /households

No request body.

### GET /households/:id

Path params:

- id: household id

### DELETE /households/:id

Path params:

- id: household id

### POST /households/:householdId/set-default

Path params:

- householdId: household id in URL

Request body:

```json
{
  "householdId": "4d4f2a4f-688d-4c8b-9981-80eeaf6673d1"
}
```

### POST /households/:householdId/invite

Direct membership invitation flow.

Path params:

- householdId: household id

Request body:

```json
{
  "email": "member@example.com",
  "role": "MEMBER"
}
```

### POST /household/:id/invite

Token invitation flow.

Path params:

- id: household id

Request body:

```json
{
  "email": "person@example.com"
}
```

Behavior:

- validates requester is a household member
- generates secure token with crypto.randomBytes(32).toString("hex")
- persists Invitation with expiresAt set to 7 days from creation

### DELETE /households/:householdId/members/:userId

Path params:

- householdId: household id
- userId: user id to remove

### POST /households/:householdId/rooms

Path params:

- householdId: household id

Request body:

```json
{
  "name": "Kitchen",
  "roomTypeId": "ckzroomtype123"
}
```

Notes:

- name can be omitted when roomTypeId is provided; controller auto-generates name.

### POST /households/:householdId/rooms/bulk

Path params:

- householdId: household id

Request body:

```json
{
  "rooms": [
    { "name": "Bedroom 1", "roomTypeId": "ckzroomtype1" },
    { "roomTypeId": "ckzroomtype2" },
    { "name": "Living Room" }
  ]
}
```

## Invite Validation (Public)

### GET /invite/:token

Path params:

- token: invitation token

Validation rules:

- invitation exists
- invitation is not used
- invitation is not expired

## Rooms

### GET /rooms/types

No request body.

### POST /rooms

Request body:

```json
{
  "name": "Kitchen",
  "householdId": "4d4f2a4f-688d-4c8b-9981-80eeaf6673d1"
}
```

### GET /rooms/household/:householdId

Path params:

- householdId: household id

### GET /rooms/:id

Path params:

- id: room id

### PUT /rooms/:id

Path params:

- id: room id

Request body:

```json
{
  "name": "Updated Room Name"
}
```

### DELETE /rooms/:id

Path params:

- id: room id

## Chores

### GET /chores

No request body.

### GET /chores/:id

Path params:

- id: chore id

### POST /chores

Request body:

```json
{
  "title": "Vacuum Living Room",
  "description": "Deep clean including corners",
  "roomId": "d8bb14f6-7c75-47de-bba3-c336561d8351",
  "points": 10
}
```

Validation highlights:

- title is required
- roomId must be UUID when provided
- points must be an integer from 1 to 100 when provided

### PUT /chores/:id

Path params:

- id: chore id

Request body:

```json
{
  "title": "Vacuum + Mop Living Room",
  "description": "Include under the couch",
  "points": 15
}
```

### DELETE /chores/:id

Path params:

- id: chore id

## Cleaning Events

### GET /cleaning-events

No request body.

### POST /cleaning-events

Request body:

```json
{
  "householdId": "4d4f2a4f-688d-4c8b-9981-80eeaf6673d1",
  "name": "Saturday Reset",
  "eventDate": "2026-04-12T10:00:00.000Z",
  "notificationDate": "2026-04-11T18:00:00.000Z",
  "distributionMode": "balanced",
  "recurrenceRule": "weekly",
  "notifyParticipants": true,
  "status": "scheduled",
  "participantIds": [
    "fbe6f787-85af-4f29-8f5a-29967f5ee17f"
  ],
  "roomIds": [
    "51ce50fa-85fd-443f-b9b3-47c349ac2e0a"
  ]
}
```

Validation highlights:

- participantIds must contain at least one UUID
- roomIds must contain at least one UUID
- notificationDate must be before or equal to eventDate

### PATCH /cleaning-events/:id

Path params:

- id: cleaning event id

Request body example:

```json
{
  "name": "Sunday Deep Clean",
  "eventDate": "2026-04-13T10:00:00.000Z",
  "notificationDate": "2026-04-12T18:00:00.000Z",
  "distributionMode": "random",
  "recurrenceRule": "none",
  "notifyParticipants": false,
  "status": "in_progress"
}
```

### DELETE /cleaning-events/:id

Path params:

- id: cleaning event id
