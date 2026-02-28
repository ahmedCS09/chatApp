import { logoutUser } from "@/lib/controllers/auth";

export async function POST(req) {
    return await logoutUser(req);
}