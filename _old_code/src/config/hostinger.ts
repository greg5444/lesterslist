export const hostingerConfig = {
    host: process.env.HOSTINGER_DB_HOST || 'your_hostinger_db_host',
    user: process.env.HOSTINGER_DB_USER || 'your_hostinger_db_user',
    password: process.env.HOSTINGER_DB_PASSWORD || 'your_hostinger_db_password',
    database: process.env.HOSTINGER_DB_NAME || 'your_hostinger_db_name',
    port: process.env.HOSTINGER_DB_PORT || 3306,
};