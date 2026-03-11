const mongoose = require('mongoose');

// This function handles the connection to the MongoDB database
const connectDB = async () => {
    try {
        // Connect to MongoDB using the exact connection string provided in requirements
        // The `useNewUrlParser` and `useUnifiedTopology` options are generally handled by modern Mongoose by default but included for compatibility if needed.
        // Actually, modern mongoose (v7+) handles connection logic internally without these options, but v6 might need them. Since I specified v7 in package.json, they are deprecated but harmless or can be omitted. I will omit them for clean code unless v6 specified.
        // However, user specifically asked for "Explain clearly how to start MongoDB locally." I will do that in documentation.
        // The connection string is: mongodb://localhost:27017/campus_event_db
        const conn = await mongoose.connect('mongodb://localhost:27017/campus_event_db');

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
