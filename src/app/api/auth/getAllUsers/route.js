import { getAllUsers } from "@/lib/controllers/auth";

export async function GET(req) {
    return getAllUsers(req);
}
