export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { verifyToken } from "@/lib/utils/tokenUtils";
import { getIO } from "@/lib/socket";
import User from "@/models/userModel";
import Chat from "@/models/chatModel";

export async function POST(req) {
  try {
    await dbConnect();

    // 🔐 Verify User
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { message } = await req.json();
    const chatKeys = Object.keys(Chat.schema.paths);
    console.log("[AI-MODEL-CHECK] Current Chat Schema Fields:", chatKeys);

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 🤖 Ensure AI User exists
    let aiUser = await User.findOne({ email: "ai@chatty.com" });
    if (!aiUser) {
      aiUser = await User.create({
        fullName: "Chatty AI assistant",
        email: "ai@chatty.com",
        password: "ai-placeholder-password",
        role: "admin",
        image: "https://api.dicebear.com/7.x/bottts/svg?seed=Chatty"
      });
    }

    console.log(`[AI-DEBUG] Saving User Prompt: senderName=${decoded.fullName || "User"}, receiverName=${aiUser.fullName}`);

    // 💾 Save User Message First
    const userChat = await Chat.create({
      sender: decoded.id,
      receiver: aiUser._id,
      senderName: decoded.fullName || "Chatty User",
      receiverName: aiUser.fullName,
      message: message,
    });

    // 📡 Emit user message to current user's room
    const io = getIO();
    if (io) {
      io.to(String(decoded.id)).emit("newMessage", {
        sender: decoded.id,
        receiver: aiUser._id,
        message: message,
        chatId: userChat._id,
        createdAt: userChat.createdAt
      });
    }

    // 🧠 Fetch Last 10 Messages for Memory
    const previousMessages = await Chat.find({
      $or: [
        { sender: decoded.id, receiver: aiUser._id },
        { sender: aiUser._id, receiver: decoded.id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedHistory = previousMessages
      .reverse()
      .map((msg) => ({
        role:
          msg.sender.toString() === decoded.id
            ? "user"
            : "assistant",
        content: msg.message,
      }));

    // 🔥 Call OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL_NAME,
          messages: [
            {
              role: "system",
              content:
                "You are Chatty AI. Be friendly, helpful and concise.",
            },
            ...formattedHistory,
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "AI API error" },
        { status: 500 }
      );
    }

    const aiReply = data.choices?.[0]?.message?.content;

    console.log(`[AI-DEBUG] Saving AI Response: senderName=${aiUser.fullName}, receiverName=${decoded.fullName || "User"}`);

    // 💾 Save AI Reply
    const savedAIMessage = await Chat.create({
      sender: aiUser._id,
      receiver: decoded.id,
      senderName: aiUser.fullName,
      receiverName: decoded.fullName || "Chatty User",
      message: aiReply,
    });

    // 📡 Emit AI reply to current user's room
    if (io) {
      io.to(String(decoded.id)).emit("newMessage", {
        sender: aiUser._id,
        receiver: decoded.id,
        message: aiReply,
        chatId: savedAIMessage._id,
        createdAt: savedAIMessage.createdAt
      });
    }

    return NextResponse.json(savedAIMessage);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}