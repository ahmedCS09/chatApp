import { NextResponse } from "next/server";
import FriendRequest from "@/models/friendRequestModel";
import User from "@/models/userModel";
import { dbConnect } from "@/lib/mongodb";
import { verifyToken } from "@/lib/utils/tokenUtils";

export async function GET(req) {
    try {
        await dbConnect();
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        const userId = decoded.id;

        const friends = await FriendRequest.find({
            $or: [{ receiver: userId, status: "accepted" }, { sender: userId, status: "accepted" }],
        })
            .populate("sender", "fullName image")
            .populate("receiver", "fullName image");

        // Format the response to return a list of users (the friend, not me)
        const formattedFriends = friends.map((f) => {
            const isSender = f.sender._id.toString() === userId;
            return isSender ? f.receiver : f.sender;
        });

        // 🤖 Ensure Chatty AI exists and add it to the list
        let aiUser = await User.findOne({ email: "ai@chatty.com" });
        if (!aiUser) {
            aiUser = await User.create({
                fullName: "Chatty AI Assistant",
                email: "ai@chatty.com",
                password: "ai-placeholder",
                role: "admin",
                image: "https://api.dicebear.com/7.x/bottts/svg?seed=Chatty"
            });
        }

        // Add AI to the top of friends list
        formattedFriends.unshift(aiUser);

        return NextResponse.json({ users: formattedFriends });
    } catch (error) {
        console.error("Error getting friends:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
