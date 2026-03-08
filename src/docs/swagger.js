import swaggerJSDoc from 'swagger-jsdoc';

const PORT = 5050

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Home Chore Scheduler API',
            version: '1.0.0',
            description: 'API documentation for the chore management backend.',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Local development server',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication and authorization' },
            { name: 'Chores', description: 'Chore management endpoints' },
            { name: 'Areas', description: 'Area/category endpoints' },
            { name: 'Users', description: 'User profile endpoints' },
            { name: 'Assignments', description: 'Chore assignment endpoints' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Chore: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        points: { type: 'integer' },
                        roomId: { type: 'string', format: 'uuid', nullable: true }
                    }
                },
                Room: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        householdId: { type: 'string', format: 'uuid' }
                    }
                },
                TaskAssignment: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        eventId: { type: 'string', format: 'uuid' },
                        roomId: { type: 'string', format: 'uuid' },
                        choreId: { type: 'string', format: 'uuid' },
                        assignedToId: { type: 'string', format: 'uuid', nullable: true }
                    }
                }
            },
        },
    },
    apis: ['./src/routes/*.js', './src/docs/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);