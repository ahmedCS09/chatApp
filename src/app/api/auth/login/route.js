import { loginUser } from "@/lib/controllers/auth";

export async function POST(req) {
    console.log("Login route hit");
    try {
        const result = await loginUser(req);
        console.log("Login route finished");
        return result;
    } catch (e) {
        console.error("Login route error:", e);
        throw e;
    }
}