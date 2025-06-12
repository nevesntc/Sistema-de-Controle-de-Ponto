import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) ?? 3001,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) ?? 5432,
    name: process.env.DB_NAME ?? 'controle_ponto',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'Lourenco2002',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'],
  },
};

export default config;
