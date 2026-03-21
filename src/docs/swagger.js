import swaggerJsdoc from "swagger-jsdoc";


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chore Scheduler API",
      version: "1.0.0",
      description: "API documentation for the Chore Scheduler application",
    },
    servers: [
      {
        url: "http://localhost:5050/api-docs",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            memberships: { type: "array", items: { type: "string" }, description: "Array of HouseholdMember IDs" },
            taskAssignments: { type: "array", items: { type: "string" }, description: "Array of TaskAssignment IDs" },
            choresCreated: { type: "array", items: { type: "string" }, description: "Array of Chore IDs" }
          },
        },
        Household: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            ownerId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            members: { type: "array", items: { type: "string" }, description: "Array of HouseholdMember IDs" },
            rooms: { type: "array", items: { type: "string" }, description: "Array of Room IDs" },
            events: { type: "array", items: { type: "string" }, description: "Array of CleaningEvent IDs" }
          },
        },
        HouseholdMember: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            householdId: { type: "string", format: "uuid" },
            role: { type: "string", enum: ["ADMIN", "MEMBER", "EVENT_MANAGER"] }
          },
        },
        Room: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            householdId: { type: "string", format: "uuid" },
            createdById: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            tasks: { type: "array", items: { type: "string" }, description: "Array of TaskAssignment IDs" },
            chores: { type: "array", items: { type: "string" }, description: "Array of Chore IDs" }
          },
        },
        Chore: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            points: { type: "integer" },
            roomId: { type: "string", format: "uuid", nullable: true },
            createdById: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            assignments: { type: "array", items: { type: "string" }, description: "Array of TaskAssignment IDs" }
          },
        },
        CleaningEvent: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            date: { type: "string", format: "date-time" },
            householdId: { type: "string", format: "uuid" },
            createdById: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            tasks: { type: "array", items: { type: "string" }, description: "Array of TaskAssignment IDs" }
          },
        },
        TaskAssignment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            eventId: { type: "string", format: "uuid" },
            roomId: { type: "string", format: "uuid" },
            choreId: { type: "string", format: "uuid" },
            assignedToId: { type: "string", format: "uuid", nullable: true }
          },
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      // Auth
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          description: "Controller: register",
          responses: { 200: { description: "User registered" } },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          description: "Controller: login",
          responses: { 200: { description: "User logged in" } },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout user",
          description: "Controller: logout",
          responses: { 200: { description: "User logged out" } },
        },
      },
      // Users
      "/users": {
        get: {
          tags: ["Users"],
          summary: "List all users",
          description: "Controller: getAllUsers",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "List of users" } },
        },
      },
      "/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user profile",
          description: "Controller: getMe",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Current user profile" } },
          "/users/set-default-household": {
            post: {
              tags: ["Users"],
              summary: "Set default household for user",
              description: "Sets the user's default household. If householdId is not provided and user has only one membership, it will auto-select. Controller: setDefaultHousehold",
              requestBody: {
                required: false,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        householdId: { type: "string", format: "uuid" }
                      }
                    }
                  }
                }
              },
              responses: {
                200: {
                  description: "Default household set",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          status: { type: "string" },
                          defaultHouseholdId: { type: "string", format: "uuid" }
                        }
                      }
                    }
                  }
                }
              },
            },
          },
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", properties: { name: { type: "string" } } },
              },
            },
          },
          responses: { 200: { description: "User updated" } },
        },
        delete: {
          tags: ["Users"],
          summary: "Delete user by ID",
          description: "Controller: deleteUser",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, description: "The user's unique ID" },
          ],
          responses: { 200: { description: "User deleted" } },
        },
      },
      // Chores
      "/chores": {
        get: {
          tags: ["Chores"],
          summary: "List all chores",
          description: "Controller: getAllChores",
          responses: { 200: { description: "List of chores" } },
        },
        post: {
          tags: ["Chores"],
          summary: "Create a new chore",
          description: "Controller: createChore",
          responses: { 200: { description: "Chore created" } },
        },
      },
      "/chores/{id}": {
        get: {
          tags: ["Chores"],
          summary: "Get chore by ID",
          description: "Controller: getChoreById",
          parameters: [ { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Chore ID" } ],
          responses: { 200: { description: "Chore found" } },
        },
        put: {
          tags: ["Chores"],
          summary: "Update chore by ID",
          description: "Controller: updateChore",
          parameters: [ { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Chore ID" } ],
          responses: { 200: { description: "Chore updated" } },
        },
        delete: {
          tags: ["Chores"],
          summary: "Delete chore by ID",
          description: "Controller: deleteChore",
          parameters: [ { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Chore ID" } ],
          responses: { 200: { description: "Chore deleted" } },
        },
      },
      // Rooms
      "/rooms": {
        post: {
          tags: ["Rooms"],
          summary: "Create a new room",
          description: "Controller: createRoom",
          responses: { 200: { description: "Room created" } },
        },
      },
      "/rooms/types": {
        get: {
          tags: ["Rooms"],
          summary: "Get all room types",
          description: "Controller: getRoomTypes",
          responses: {
            200: {
              description: "List of room types",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          roomTypes: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string" },
                                key: { type: "string" },
                                label: { type: "string" },
                                isDefault: { type: "boolean" },
                                createdAt: { type: "string", format: "date-time" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/rooms/household/{householdId}": {
        get: {
          tags: ["Rooms"],
          summary: "Get rooms by household",
          description: "Controller: getRoomsByHousehold",
          parameters: [ { name: "householdId", in: "path", required: true, schema: { type: "string" }, description: "Household ID" } ],
          responses: { 200: { description: "Rooms found" } },
        },
      },
      "/rooms/{id}": {
        get: {
          tags: ["Rooms"],
          summary: "Get room by ID",
          description: "Controller: getRoomById",
          parameters: [ { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Room ID" } ],
          responses: { 200: { description: "Room found" } },
        },
        put: {
          tags: ["Rooms"],
          summary: "Update room by ID",
          description: "Controller: updateRoom",
          parameters: [ { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Room ID" } ],
          responses: { 200: { description: "Room updated" } },
        },
        delete: {
          tags: ["Rooms"],
          summary: "Delete room by ID",
          description: "Controller: deleteRoom",
          parameters: [ { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Room ID" } ],
          responses: { 200: { description: "Room deleted" } },
        },
      },
      // Households
      "/households": {
        post: {
          tags: ["Households"],
          summary: "Create a new household",
          description: "Controller: createHousehold",
          responses: { 200: { description: "Household created" } },
        },
        get: {
          tags: ["Households"],
          summary: "Get user households",
          description: "Controller: getUserHouseholds",
          responses: { 200: { description: "User households" } },
        },
      },
      "/households/{id}": {
        get: {
          tags: ["Households"],
          summary: "Get household by ID",
          description: "Controller: getHouseholdById",
          parameters: [ { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Household ID" } ],
          responses: { 200: { description: "Household found" } },
        },
      },
      "/households/{householdId}/invite": {
        post: {
          tags: ["Households"],
          summary: "Invite member to household",
          description: "Controller: inviteMember",
          parameters: [ { name: "householdId", in: "path", required: true, schema: { type: "string" }, description: "Household ID" } ],
          responses: { 200: { description: "Member invited" } },
        },
      },
      "/households/{householdId}/members/{userId}": {
        delete: {
          tags: ["Households"],
          summary: "Remove member from household",
          description: "Controller: removeMember",
          parameters: [
            { name: "householdId", in: "path", required: true, schema: { type: "string" }, description: "Household ID" },
            { name: "userId", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
          ],
          responses: { 200: { description: "Member removed" } },
        },
      },
      // Cleaning Events
      "/cleaning-events": {
        get: {
          tags: ["CleaningEvents"],
          summary: "Get cleaning events for user",
          description: "Returns cleaning events where the user is a participant. Controller: getCleaningEvents",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Cleaning events",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          events: {
                            type: "array",
                            items: { $ref: "#/components/schemas/CleaningEvent" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["CleaningEvents"],
          summary: "Create cleaning event",
          description: "Creates a new cleaning event and generates random assignments. Controller: createCleaningEvent",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    participantIds: { type: "array", items: { type: "string", format: "uuid" } },
                    choreIds: { type: "array", items: { type: "string", format: "uuid" } },
                    scheduledAt: { type: "string", format: "date-time" }
                  },
                  required: ["participantIds", "choreIds", "scheduledAt"]
                }
              }
            }
          },
          responses: {
            201: {
              description: "Cleaning event created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          event: { $ref: "#/components/schemas/CleaningEvent" },
                          assignments: {
                            type: "array",
                            items: { $ref: "#/components/schemas/TaskAssignment" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);