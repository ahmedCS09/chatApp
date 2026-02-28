import { getMessages } from "@/lib/controllers/chat";

export async function POST(req) {
    return getMessages(req);
}