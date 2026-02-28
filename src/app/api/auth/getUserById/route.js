import { getUserById } from "@/lib/controllers/auth";

export async function GET(req) {
    return getUserById(req);
}
