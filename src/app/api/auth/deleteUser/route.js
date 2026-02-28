import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/userModel";
import Chat from "@/models/chatModel";
import FriendRequest from "@/models/friendRequestModel";
import { verifyToken } from "@/lib/utils/tokenUtils";
import { cookies } from "next/headers";

export async function DELETE(req) {
    try {
        await dbConnect();

        // 1. Get token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
        }

        // 2. Verify token
        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
        }

        // 3. Find requester to check role
        const requester = await User.findById(decoded.id);

        if (!requester || requester.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        // 4. Get target userId from query or body
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        // 5. Delete the user
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // 🚨 CRITICAL: Prevent admin from deleting themselves accidentally if that's a rule
        if (String(requester._id) === String(userId)) {
            return NextResponse.json({ message: "Admins cannot delete their own accounts from this menu" }, { status: 400 });
        }

        // Delete associated records
        await Chat.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
        await FriendRequest.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
        await User.findByIdAndDelete(userId);

        return NextResponse.json({ message: "User and all associated data deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("[DELETE-USER-ERROR]", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
