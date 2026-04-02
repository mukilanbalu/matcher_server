const mongoose = require("mongoose");
const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI is not defined in environment variables");
        process.exit(1);
    }
    try {
        const conn = await mongoose.connect(uri)
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return true;
    }

    catch(error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
}


module.exports = connectDB;