
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkCollections() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        const Chat = mongoose.models.Chat || mongoose.model('Chat', new mongoose.Schema({
            sender: mongoose.Schema.Types.ObjectId,
            receiver: mongoose.Schema.Types.ObjectId,
            message: String,
            createdAt: Date
        }));

        const count = await Chat.countDocuments();
        console.log("Total documents in 'chats' (or whatever it mapped to):", count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCollections();
