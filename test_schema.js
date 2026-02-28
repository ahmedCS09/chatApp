
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testSchema() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const chatSchema = new mongoose.Schema({
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            senderName: { type: String, required: true },
            receiverName: { type: String, required: true },
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        });

        // Use a unique model name to avoid conflicts during the test
        const TestChat = mongoose.model("TestChat", chatSchema);

        const mockData = {
            sender: new mongoose.Types.ObjectId(),
            receiver: new mongoose.Types.ObjectId(),
            senderName: "Test Sender",
            receiverName: "Test Receiver",
            message: "Hello world"
        };

        const doc = await TestChat.create(mockData);
        console.log("Document saved successfully:", JSON.stringify(doc, null, 2));

        const retrieved = await TestChat.findById(doc._id);
        console.log("Retrieved document:", JSON.stringify(retrieved, null, 2));

        // Clean up
        await TestChat.deleteOne({ _id: doc._id });
        console.log("Cleanup done.");

        process.exit(0);
    } catch (err) {
        console.error("FAILED:", err.message);
        process.exit(1);
    }
}

testSchema();
