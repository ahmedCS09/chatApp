import { removeFriend } from "@/lib/controllers/friendRequest.js";

export async function POST(req) {
    return removeFriend(req);
}
