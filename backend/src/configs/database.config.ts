import { connect, set } from 'mongoose';

export const dbConnect = () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('🔴 FATAL ERROR: MONGO_URI is not defined in environment variables.');
        console.error('Please make sure your .env file contains: MONGO_URI=your_mongodb_connection_string');
        process.exit(1);
    }

    // Prepares Mongoose for strict query mode (prevents Mongoose 7+ warnings)
    set('strictQuery', true);

    // Mongoose 6+ connects automatically with the best settings, 
    // so we don't need the deprecated options object anymore.
    connect(mongoUri)
        .then(() => console.log("✅ Database connected successfully"))
        .catch((error) => {
            console.error("🔴 Database connection failed");
            console.error(error);
        });
}