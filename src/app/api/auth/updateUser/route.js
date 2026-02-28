import { updateUser } from "@/lib/controllers/auth.js";

export async function PUT(req) {
    return await updateUser(req);
}   