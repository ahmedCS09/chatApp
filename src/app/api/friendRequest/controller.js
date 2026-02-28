import { NextResponse } from "next/server";
import User from "../../models/userModel";
import FriendRequest from "../../models/friendRequestModel";
import { dbConnect } from "@/lib/mongodb";
import { verifyToken } from "@/lib/utils/tokenUtils";
import { getIO } from "@/lib/socket";

export const sendFriendRequest = async (req) => {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    const senderId = decoded.id;

    const { receiver } = await req.json();

    const senderUser = await User.findById(senderId);
    const receiverUser = await User.findById(receiver);

    if (!receiverUser)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const request = await FriendRequest.create({
      sender: senderId,
      receiver,
      status: "pending",
    });

    const io = getIO();

    if (io) {
      io.to(receiver.toString()).emit("friendRequest", {
        senderId,
        senderName: senderUser.fullName,
        requestId: request._id,
      });
    }

    return NextResponse.json(request);

  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};

export const getPendingRequests = async (req) => {
  await dbConnect();

  const token = req.cookies.get("token")?.value;
  const decoded = await verifyToken(token);

  const requests = await FriendRequest.find({
    status: "pending",
    $or: [{ sender: decoded.id }, { receiver: decoded.id }],
  });

  return NextResponse.json(requests);
};