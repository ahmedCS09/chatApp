import { getLoggedInUser } from "@/lib/controllers/auth";

export async function GET(req) {
    return await getLoggedInUser(req);;
}