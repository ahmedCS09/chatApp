import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Force clear the cached model to ensure schema updates like 'senderName' are applied
if (mongoose.models.Chat) {
    delete mongoose.models.Chat;
}

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;