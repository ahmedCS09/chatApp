import Chat from "../../models/chatModel";
import User from "../../models/userModel";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/tokenUtils";
import { getIO } from "@/lib/socket";
import { dbConnect } from "@/lib/mongodb";

export const sendMessage = async (req) => {
    try {
        await dbConnect();
        const { receiver, message, senderName: bodySenderName, receiverName: bodyReceiverName } = await req.json();
        const chatKeys = Object.keys(Chat.schema.paths);
        console.log("[CHAT-MODEL-CHECK] Current Chat Schema Fields:", chatKeys);

        // Get token from cookies
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        const sender = decoded.id;

        // Use names from body if provided, else from token, else from DB
        let senderName = bodySenderName || decoded.fullName;
        let receiverName = bodyReceiverName;

        // Fallback for missing sender name
        if (!senderName) {
            const senderDoc = await User.findById(sender);
            senderName = senderDoc?.fullName || "Chatty User";
        }

        // Fallback for missing receiver name
        if (!receiverName) {
            const receiverDoc = await User.findById(receiver);
            receiverName = receiverDoc?.fullName || "Chatty User";
        }


        console.log(`[DEBUG] Saving message: senderName=${senderName}, receiverName=${receiverName}`);

        const chat = await Chat.create({
            sender,
            receiver,
            senderName,
            receiverName,
            message
        });

        console.log(`[DEBUG] Message saved with ID: ${chat._id}. Names in DB: ${chat.senderName} / ${chat.receiverName}`);

        const io = getIO();

        if (io) {
            const roomName = String(receiver);
            console.log(`[SOCKET] Emitting newMessage to room: ${roomName} | From: ${senderName} | Content: ${message.substring(0, 20)}...`);
            io.to(roomName).emit("newMessage", {
                sender,
                senderName,
                receiver,
                message,
                chatId: chat._id,
                createdAt: chat.createdAt
            });
        }
        else {
            console.log("[sendMessage] io not available");
        }

        return NextResponse.json(chat);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

export const getMessages = async (req) => {
    try {
        const { receiver } = await req.json();

        // Get token from cookies
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        const sender = decoded.id;

        const messages = await Chat.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        })
            .populate("sender", "fullName image")
            .populate("receiver", "fullName image")
            .sort({ createdAt: 1 });

        return NextResponse.json(messages);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

export const deleteChat = async (req) => {
    try {
        await dbConnect();
        const { chatId } = await req.json();

        // Get token from cookies
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        const userId = decoded.id;

        // Optional: Verify that the user deleting the message is actually the sender
        const message = await Chat.findById(chatId);
        if (!message) {
            return NextResponse.json({ message: "Message not found" }, { status: 404 });
        }

        if (message.sender.toString() !== userId) {
            return NextResponse.json({ message: "You can only delete your own messages" }, { status: 403 });
        }

        await Chat.findByIdAndDelete(chatId);

        return NextResponse.json({ message: "Message deleted successfully" });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

