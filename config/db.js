const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to MongoDB...");
    } catch (error) {
        console.log("could not establish a connection", error);
        process.exit(1); 
    }
}

module.exports = connectDB