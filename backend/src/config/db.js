const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: 'Amazon RDS',
    authPlugins: {
        mysql_native_password: () => () => 'mysql_native_password'
    },
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
});

const promisePool = pool.promise();

module.exports = promisePool;