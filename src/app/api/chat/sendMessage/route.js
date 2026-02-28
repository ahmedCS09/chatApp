import { sendMessage } from "@/lib/controllers/chat.js";

export async function POST(req) {
    return sendMessage(req);
}
