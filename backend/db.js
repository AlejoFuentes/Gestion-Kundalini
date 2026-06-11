import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

pg.types.setTypeParser(1082, function(stringValue) {
    return stringValue; 
});

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

pool.on('connect', () => {
    console.log('🔗 Conectado a la base de datos de PostgreSQL');
});

export default pool; 