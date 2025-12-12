const Pool = require('pg').Pool;
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Конфігурація для локальної розробки
const devConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
};

// Конфігурація для деплою (Render/Neon)
const proConfig = {
    connectionString: process.env.DATABASE_URL, // Цю змінну дасть хостинг
    ssl: {
        rejectUnauthorized: false // Потрібно для безпечного з'єднання в хмарі
    }
};

const pool = new Pool(
  isProduction ? proConfig : devConfig
);

module.exports = pool;