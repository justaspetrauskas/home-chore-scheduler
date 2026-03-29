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
            householdId: { type: "string", format: "uuid" },
            name: { type: "string" },
            eventDate: { type: "string", format: "date-time" },
            notificationDate: { type: "string", format: "date-time" },
            distributionMode: { type: "string", enum: ["random", "balanced"] },
            recurrenceRule: { type: "string", enum: ["none", "weekly", "biweekly", "monthly"] },
            notifyParticipants: { type: "boolean" },
            status: {
              type: "string",
              enum: ["draft", "scheduled", "in_progress", "completed", "canceled"],
            },
            createdByUserId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            participants: {
              type: "array",
              items: { type: "string", format: "uuid" },
              description: "Array of household member IDs participating in this event"
            },
            taskAssignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  assignedToUserId: { type: "string", format: "uuid", nullable: true },
                  room: {
                    type: "object",
                    nullable: true,
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" }
                    }
                  },
                  date: { type: "string", format: "date-time" },
                  status: { type: "string", enum: ["scheduled", "completed", "post_due"] },
                  completedAt: { type: "string", format: "date-time", nullable: true }
                }
              }
            },
            insights: {
              type: "object",
              properties: {
                participantsCount: { type: "integer" },
                taskAssignmentsCount: { type: "integer" },
                completedTaskAssignments: { type: "integer" },
                scheduledTaskAssignments: { type: "integer" },
                postDueTaskAssignments: { type: "integer" },
                uniqueAssignedUsersCount: { type: "integer" },
                completionRate: { type: "number", format: "float" }
              }
            }
          },
        },
        TaskAssignment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            eventId: { type: "string", format: "uuid" },
            roomId: { type: "string", format: "uuid" },
            assignedToId: { type: "string", format: "uuid", nullable: true },
            date: { type: "string", format: "date-time" },
            status: { type: "string", enum: ["scheduled", "completed", "post_due"] },
            completedAt: { type: "string", format: "date-time", nullable: true }
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
          description: "Returns cleaning events for households where the authenticated user is a member, including per-event insights and aggregate statistics for dashboards. Controller: getCleaningEvents",
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
                          },
                          insights: {
                            type: "object",
                            properties: {
                              totals: {
                                type: "object",
                                properties: {
                                  events: { type: "integer" },
                                  participants: { type: "integer" },
                                  taskAssignments: { type: "integer" },
                                  completedTaskAssignments: { type: "integer" },
                                  scheduledTaskAssignments: { type: "integer" },
                                  postDueTaskAssignments: { type: "integer" },
                                  upcomingEvents: { type: "integer" },
                                  todayEvents: { type: "integer" },
                                  completionRate: { type: "number", format: "float" }
                                }
                              },
                              statusBreakdown: {
                                type: "object",
                                additionalProperties: { type: "integer" }
                              },
                              distributionModeBreakdown: {
                                type: "object",
                                additionalProperties: { type: "integer" }
                              },
                              recurrenceBreakdown: {
                                type: "object",
                                additionalProperties: { type: "integer" }
                              },
                              dateRange: {
                                type: "object",
                                properties: {
                                  firstEventDate: { type: "string", format: "date-time", nullable: true },
                                  lastEventDate: { type: "string", format: "date-time", nullable: true }
                                }
                              },
                              householdBreakdown: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    householdId: { type: "string", format: "uuid" },
                                    events: { type: "integer" },
                                    participants: { type: "integer" },
                                    taskAssignments: { type: "integer" },
                                    completedTaskAssignments: { type: "integer" },
                                    completionRate: { type: "number", format: "float" }
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
          }
        },
        post: {
          tags: ["CleaningEvents"],
          summary: "Create cleaning event",
          description: "Creates a new cleaning event. Controller: createCleaningEvent",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    householdId: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    eventDate: { type: "string", format: "date-time" },
                    notificationDate: { type: "string", format: "date-time" },
                    distributionMode: { type: "string", enum: ["random", "balanced"], default: "balanced" },
                    recurrenceRule: { type: "string", enum: ["none", "weekly", "biweekly", "monthly"] },
                    notifyParticipants: { type: "boolean" },
                    status: {
                      type: "string",
                      enum: ["draft", "scheduled", "in_progress", "completed", "canceled"],
                      default: "scheduled",
                    },
                    participantIds: {
                      type: "array",
                      items: { type: "string", format: "uuid" },
                      description: "List of household member IDs (or user IDs) participating in the event"
                    },
                    roomIds: {
                      type: "array",
                      items: {
                        type: "string",
                        format: "uuid"
                      }
                    }
                  },
                  required: [
                    "householdId",
                    "name",
                    "eventDate",
                    "notificationDate",
                    "recurrenceRule",
                    "notifyParticipants",
                    "participantIds",
                    "roomIds"
                  ]
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
                          event: { $ref: "#/components/schemas/CleaningEvent" }
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
      "/cleaning-events/{id}": {
        patch: {
          tags: ["CleaningEvents"],
          summary: "Update cleaning event",
          description: "Partially updates an existing cleaning event. Controller: updateCleaningEvent",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
              description: "Cleaning event ID",
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    eventDate: { type: "string", format: "date-time" },
                    notificationDate: { type: "string", format: "date-time" },
                    distributionMode: { type: "string", enum: ["random", "balanced"] },
                    recurrenceRule: { type: "string", enum: ["none", "weekly", "biweekly", "monthly"] },
                    notifyParticipants: { type: "boolean" },
                    status: {
                      type: "string",
                      enum: ["draft", "scheduled", "in_progress", "completed", "canceled"],
                    }
                  },
                  minProperties: 1
                }
              }
            }
          },
          responses: {
            200: {
              description: "Cleaning event updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          event: { $ref: "#/components/schemas/CleaningEvent" }
                        }
                      }
                    }
                  }
                }
              }
            },
            404: { description: "Cleaning event not found" },
            403: { description: "Not authorized for this household" }
          }
        },
        delete: {
          tags: ["CleaningEvents"],
          summary: "Delete cleaning event",
          description: "Deletes a cleaning event. Allowed for event creator or household admin only. Related task assignments and participants are removed, but users and rooms are not deleted.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
              description: "Cleaning event ID",
            }
          ],
          responses: {
            200: {
              description: "Cleaning event deleted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      message: { type: "string" }
                    }
                  }
                }
              }
            },
            404: { description: "Cleaning event not found" },
            403: { description: "Only creator or admin can delete" }
          }
        }
      },
      "/task-assignments/{id}/complete": {
        post: {
          tags: ["TaskAssignments"],
          summary: "Complete task assignment",
          description: "Marks a task assignment as completed and stores the completion timestamp. Allowed for the assigned user or household admin.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
              description: "Task assignment ID",
            }
          ],
          responses: {
            200: {
              description: "Task assignment completed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          taskAssignment: {
                            type: "object",
                            properties: {
                              id: { type: "string", format: "uuid" },
                              assignedToUserId: { type: "string", format: "uuid", nullable: true },
                              room: { $ref: "#/components/schemas/Room" },
                              date: { type: "string", format: "date-time" },
                              status: { type: "string", enum: ["scheduled", "completed", "post_due"] },
                              completedAt: { type: "string", format: "date-time", nullable: true }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            403: { description: "Only assigned user or admin can complete" },
            404: { description: "Task assignment not found" }
          }
        }
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);