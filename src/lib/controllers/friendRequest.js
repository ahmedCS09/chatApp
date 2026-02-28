import { NextResponse } from "next/server";
import User from "../../models/userModel";
import FriendRequest from "../../models/friendRequestModel";
import { dbConnect } from "@/lib/mongodb";
import { verifyToken } from "@/lib/utils/tokenUtils";
import { getIO } from "@/lib/socket";
import Notification from "../../models/NotificationModel";

export const sendFriendRequest = async (req) => {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    const senderId = decoded.id;
    let senderName = decoded.fullName;

    if (!senderName) {
      const sender = await User.findById(senderId);
      senderName = sender?.fullName;
    }

    const { receiver } = await req.json();

    const receiverUser = await User.findById(receiver);

    if (!receiverUser)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const request = await FriendRequest.create({
      sender: senderId,
      receiver,
      senderName,
      receiverName: receiverUser.fullName,
      status: "pending",
    });

    const io = getIO();

    if (io) {
      const roomName = String(receiver);
      console.log("[EMIT] Sending to room:", roomName, "from:", senderId, senderName);
      io.to(roomName).emit("friendRequest", {
        senderId,
        senderName,
        requestId: request._id,
      });
      console.log("[EMIT] Sent successfully");
    } else {
      console.log("[EMIT] IO not initialized!");
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

export const acceptFriendRequest = async (req) => {
  try {
    await dbConnect();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    const { requestId } = await req.json();

    const request = await FriendRequest.findOne({
      _id: requestId,
      receiver: decoded.id,
      status: "pending",
    });

    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    request.status = "accepted";
    await request.save();

    const notification = await Notification.create({
      sender: decoded?.id,
      senderName: decoded?.fullName,
      receiver: request?.sender,
      receiverName: request?.senderName,
      isRead: false,
      type: "friendRequest",
      status: "accepted",
      requestId: request?._id,
    });

    const io = getIO();
    if (io) {
      io.to(String(request?.sender)).emit("reqAcceptedNotification", {
        notificationId: notification._id,
        senderName: decoded.fullName,
      });
    }

    return NextResponse.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting request:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};

export const removeFriend = async (req) => {

  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { requestId, friendId } = await req.json();

    if (!requestId && !friendId) {
      return NextResponse.json({ message: "Request ID or Friend ID required" }, { status: 400 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id;

    let query = {};
    if (requestId) {
      query = {
        _id: requestId,
        $or: [{ sender: userId }, { receiver: userId }]
      };
    } else {
      query = {
        $or: [
          { sender: userId, receiver: friendId },
          { sender: friendId, receiver: userId }
        ]
      };
    }

    const deleted = await FriendRequest.findOneAndDelete(query);

    const io = getIO();
    if (io) {
      io.to(String(deleted?.sender)).emit("friendRemoved", {
        notificationId: deleted._id,
        senderName: decoded.fullName,
      });
    }

    if (!deleted) {
      return NextResponse.json({ message: "Friendship not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Friend removed successfully" });

  } catch (error) {
    console.error("Remove friend error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }

}

export const markNotificationAsRead = async (req) => {
  try {
    await dbConnect();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    const { notificationId } = await req.json();

    const notification = await Notification.findOne({
      _id: notificationId,
      receiver: decoded.id,   // ✅ Ensure it belongs to user
      isRead: false,
    });

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    notification.isRead = true;
    await notification.save();

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};

export const getUnreadNotifications = async (req) => {
  try {
    await dbConnect();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);

    const notifications = await Notification.find({
      receiver: decoded.id,   // ✅ VERY IMPORTANT
      isRead: false,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};