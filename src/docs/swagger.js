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
                Chore: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        title: { type: 'string', example: 'Take out trash' },
                        description: { type: 'string', example: 'Take trash to curb by 8 PM' },
                        areaId: { type: 'integer', example: 2 },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.js', './src/docs/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);