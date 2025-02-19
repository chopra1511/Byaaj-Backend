const mongoose = require("mongoose");

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected successfully!".blue.bold);
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }
}

module.exports = ConnectDB;