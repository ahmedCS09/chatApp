import { acceptFriendRequest } from "@/lib/controllers/friendRequest.js";

export async function POST(req) {
    return acceptFriendRequest(req);
}
