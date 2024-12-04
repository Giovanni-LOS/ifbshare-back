import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(ENV.MONGO_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};