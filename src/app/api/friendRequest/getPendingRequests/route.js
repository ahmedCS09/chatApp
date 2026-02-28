import { getPendingRequests } from "@/lib/controllers/friendRequest.js";

export async function GET(req) {
    return getPendingRequests(req);
}