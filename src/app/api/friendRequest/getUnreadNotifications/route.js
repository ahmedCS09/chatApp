import { getUnreadNotifications } from "@/lib/controllers/friendRequest.js";

export async function GET(req) {
    return getUnreadNotifications(req);
}