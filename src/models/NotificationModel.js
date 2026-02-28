import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ["friendRequest"],
        default: "friendRequest",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FriendRequest"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;