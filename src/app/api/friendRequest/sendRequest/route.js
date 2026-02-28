import { sendFriendRequest } from "@/lib/controllers/friendRequest.js";

export async function POST(req) {
    return sendFriendRequest(req);
}   