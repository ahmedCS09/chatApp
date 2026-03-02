import { deleteChat } from "@/lib/controllers/chat";

export async function DELETE(req) {
    return deleteChat(req);
}
