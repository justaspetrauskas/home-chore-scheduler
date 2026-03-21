# Home Chore Scheduler API: Controllers, Middleware, and Routes Explained

## Controllers

### authController.js
Handles user authentication:
- **register**: Registers a new user, hashes password, checks for duplicate emails.
- **login**: Authenticates user, verifies password, issues JWT token.
- **logout**: Ends user session (token removal/invalid).
- **Security**: Uses generic error messages, never exposes sensitive info.

### userController.js
Manages user profile and settings:
- **getMe**: Returns authenticated user's profile, memberships (with household names), and cleaning events for their default household. If no default, uses the newest household.
- **setDefaultHousehold**: Allows user to set their default household.
- **CRUD**: Update/delete user (self only), strict access control.
- **Cleans**: Removes sensitive fields from responses.

### householdController.js
Manages household lifecycle:
- **createHousehold**: Creates a household, sets creator as ADMIN.
- **getUserHouseholds**: Lists all households for user, including members, rooms, and events.
- **getHouseholdById**: Gets a household by ID, with members, rooms, and events.
- **inviteMember**: Adds a user to a household.
- **removeMember**: Removes a user from a household.
- **deleteHousehold**: Only owner can delete; deletes memberships first to avoid FK errors.
- **setDefaultHouseholdForUser**: Lets user set a household as their default.

### roomController.js
Manages rooms within households:
- **CRUD**: Create, read, update, delete rooms.
- **Access**: Only household members can manage rooms.
- **List**: List rooms by household.

### choresController.js
Manages chores:
- **CRUD**: Create, update, delete, list, get by ID.
- **Validation**: Uses Zod schemas for input validation.
- **Permissions**: Only creator or admin can modify/delete.

### cleaningEventController.js
Manages cleaning events:
- **createCleaningEvent**: Schedules event, assigns chores to users randomly, returns assignments.
- **getCleaningEvents**: Lists events where user is a participant.

---

## Middleware

### authMiddleware.js
- Verifies JWT tokens from headers/cookies.
- Attaches authenticated user to request.
- Blocks access if authentication fails.

### corsMiddleware.js
- (If used) Configures CORS for cross-origin requests.

### validateRequestMiddleware.js
- Validates request bodies using Zod schemas.
- Returns 400 errors for invalid input.

---

## API Routes

### /auth
- `POST /register` — Register a new user.
- `POST /login` — Authenticate and receive a JWT.
- `POST /logout` — End session.

### /users
- `GET /users` — List all users (auth required).
- `GET /users/me` — Get current user profile, memberships, and cleaning events.
- `PUT /users/:id` — Update user (self only).
- `DELETE /users/:id` — Delete user (self only).
- `POST /users/set-default-household` — Set default household.

### /households
- `POST /households` — Create a new household.
- `GET /households` — List user’s households (with rooms/events).
- `GET /households/:id` — Get household details (with rooms/events).
- `POST /households/:householdId/invite` — Invite a user.
- `DELETE /households/:householdId/members/:userId` — Remove a member.
- `DELETE /households/:id` — Delete a household (owner only).
- `POST /households/:householdId/set-default` — Set as user’s default household.

### /rooms
- `POST /rooms` — Create a room.
- `GET /rooms/household/:householdId` — List rooms for a household.
- `GET /rooms/:id` — Get room details.
- `PUT /rooms/:id` — Update a room.
- `DELETE /rooms/:id` — Delete a room.

### /chores
- `GET /chores` — List chores.
- `GET /chores/:id` — Get chore details.
- `POST /chores` — Create a chore.
- `PUT /chores/:id` — Update a chore.
- `DELETE /chores/:id` — Delete a chore.

### /cleaning-events
- `GET /cleaning-events` — List cleaning events for the user.
- `POST /cleaning-events` — Create a new cleaning event and generate assignments.

---

## Interview-Ready Summary
- Architecture separates business logic (controllers), validation (middlewares), and routing (routes).
- Security is enforced at middleware and controller level.
- Data returned is always cleaned of sensitive fields.
- All endpoints are protected by authentication, and permissions are checked for sensitive actions.
- The API is RESTful, modular, and follows best practices for error handling and data validation.
