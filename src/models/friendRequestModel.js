import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderName: {
        type: String,
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
        required: true
    },
}, {
    timestamps: true,
    collection: "friends"
});

const FriendRequest = mongoose.models.FriendRequest || mongoose.model("FriendRequest", friendRequestSchema);
export default FriendRequest;
