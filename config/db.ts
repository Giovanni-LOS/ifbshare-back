import mysql from 'mysql2/promise';
import { ENV } from './env';

export const connectDB = async () => {
    try {
        const connection = await mysql.createConnection({
            host: ENV.MYSQL_HOST,
            user: ENV.MYSQL_USER,
            password: ENV.MYSQL_PASSWORD,
            database: ENV.MYSQL_DATABASE
        });
        console.log(`MySQL Connected: ${connection.threadId}`);
        return connection;
    } catch (error) {
        console.error("Error connecting to MySQL:", error);
        process.exit(1);
    }
};