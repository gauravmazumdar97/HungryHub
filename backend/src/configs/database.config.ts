import {connect, ConnectOptions} from 'mongoose';

export const dbConnect = () => {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
        console.error('MONGO_URI is not defined in environment variables.');
        console.error('Please make sure your .env file contains: MONGO_URI=your_mongodb_connection_string');
        process.exit(1);
    }
    
    connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as ConnectOptions).then(
        () => console.log("connect successfully"),
        (error) => console.log(error)
    )
}