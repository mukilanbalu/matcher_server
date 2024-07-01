const mongoose = require("mongoose");
const uri = "mongodb+srv://app_api:JAifEMtnqg4qvfU6@matchercluster.33jre6c.mongodb.net/matcher_DB?retryWrites=true&w=majority&appName=matcherCluster";

const connectDB = async () => {
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