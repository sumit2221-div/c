import mongoose from 'mongoose';

const ConnectDB = async () => {
  try {
    // Check if the DBMS_URL environment variable is defined
    if (!process.env.DBMS_URL) {
      console.log('MONGODB_URI environment variable is not defined');
      process.exit(1);
    }

    // Attempt to connect to the MongoDB instance
    const connectionInstance = await mongoose.connect(process.env.DBMS_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log successful connection
    console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    // Log connection failure and exit the process
    console.log('MONGODB connection FAILED', error);
    process.exit(1);
  }
};

export { ConnectDB };
