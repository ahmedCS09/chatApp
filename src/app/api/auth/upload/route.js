import { uploadImage } from '@/lib/controllers/auth';


export async function POST(request) {
    return await uploadImage(request);
}