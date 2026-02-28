require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const url = process.env.MONGODB_URL;
console.log("Testing connection to:", url);

if (!url) {
    console.error("No MONGODB_URL found in .env.local");
    process.exit(1);
}

async function testConnection() {
    try {
        console.log("Attempting to connect...");
        const start = Date.now();
        await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
        const duration = Date.now() - start;
        console.log(`✅ Connected successfully in ${duration}ms`);
        await mongoose.connection.close();
        console.log("Connection closed.");
    } catch (error) {
        console.error("❌ Connection failed!");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        if (error.name === 'MongooseServerSelectionError') {
            console.log("\n⚠️  POSSIBLE CAUSE: Your IP address is not whitelisted in MongoDB Atlas.");
            console.log("   Please go to MongoDB Atlas -> Network Access -> Add IP Address -> Add Current IP Address.");
        }
    }
}

testConnection();
