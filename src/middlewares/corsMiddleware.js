// CORS middleware for Express
import cors from 'cors';

const isDev = process.env.NODE_ENV === 'development';

// Allow all origins in development, restrict in production
console.log(isDev ? 'CORS: Allowing all origins (development mode)' : 'CORS: Restricting origins (production mode)');

const corsOptions = isDev
  ? {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }
  : { origin: false };

export default cors(corsOptions);
