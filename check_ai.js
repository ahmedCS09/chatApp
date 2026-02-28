
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkAIUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: String,
            fullName: String
        }));

        const aiUser = await User.findOne({ email: "ai@chatty.com" });
        if (aiUser) {
            console.log("AI User found:", JSON.stringify(aiUser, null, 2));

            const Chat = mongoose.models.Chat || mongoose.model('Chat', new mongoose.Schema({
                sender: mongoose.Schema.Types.ObjectId,
                receiver: mongoose.Schema.Types.ObjectId,
                message: String,
                createdAt: Date
            }));

            const userChats = await Chat.find({
                $or: [
                    { sender: aiUser._id },
                    { receiver: aiUser._id }
                ]
            }).sort({ createdAt: -1 }).limit(5);

            console.log("Recent AI chats:", JSON.stringify(userChats, null, 2));
        } else {
            console.log("AI User NOT found");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAIUser();
