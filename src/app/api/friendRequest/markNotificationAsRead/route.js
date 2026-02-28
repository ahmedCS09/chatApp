import { markNotificationAsRead } from "@/lib/controllers/friendRequest.js";

export async function POST(req) {
    return markNotificationAsRead(req);
}