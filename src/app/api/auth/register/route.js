import { registerUser } from "@/lib/controllers/auth.js";

export async function POST(req) {
    return await registerUser(req);
}