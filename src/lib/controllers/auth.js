import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Joi from "joi";
import User from "@/models/userModel.js";
import FriendRequest from "@/models/friendRequestModel";
import { generateToken, verifyToken } from "@/lib/utils/tokenUtils.js";
import { dbConnect } from "@/lib/mongodb.js";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, // Changed to match .env.local
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET, // Changed to match .env.local
});

const registerSchema = Joi.object({
    fullName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    adminSecret: Joi.string().allow('').optional()
});
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

//register user controller
export async function registerUser(req) {

    try {
        await dbConnect();
        const { fullName, email, password, adminSecret } = await req.json();
        const { error } = registerSchema.validate({ fullName, email, password });
        if (error) {
            return NextResponse.json({ message: error.details[0].message }, { status: 400 });
        }
        // Check if user already exists 
        let findUser = await User.findOne({ email });
        if (findUser) {
            return NextResponse.json({
                message: "User already exists",
                status: 400
            });
        }
        // Hash password
        const salt_rounds = Number(process.env.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt_rounds);

        //assigning role of admin or user
        let assignedRole = 'user';
        if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
            assignedRole = 'admin';
        }
        // Create new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role: assignedRole
        });
        // Save user with hashed password
        await newUser.save();
        let token = await generateToken(newUser);
        return NextResponse.json({
            message: "User registered successfully",
            user: {
                fullName: newUser.fullName,
                email: newUser.email,
                _id: newUser._id,
                token: token
            }
        }, {
            headers: { 'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}` },
            status: 200
        });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//login user controller
export async function loginUser(req) {
    try {
        console.log("loginUser: Starting dbConnect...");
        await dbConnect();
        console.log("loginUser: dbConnect finished.");
        const { email, password } = await req.json();
        const { error } = loginSchema.validate({ email, password });
        if (error) {
            return NextResponse.json({ message: error.details[0].message }, { status: 400 });
        }
        // Find user by email
        console.log("loginUser: Finding user by email:", email);
        let findUser = await User.findOne({ email });
        console.log("loginUser: Find result:", findUser ? "Found" : "Not Found");
        if (!findUser) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }
        // Compare password
        const isMatch = await bcrypt.compare(password, findUser.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }
        let token = await generateToken(findUser);
        return NextResponse.json({
            message: "User logged in successfully",
            user: {
                fullName: findUser.fullName,
                email: findUser.email,
                _id: findUser._id,
                token: token
            }
        }, {
            headers: { 'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}` },
            status: 200
        });
    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//get user by ID controller
export async function getUserById(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//get logged in user controller
export async function getLoggedInUser(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//get all users controller
export async function getAllUsers(req) {
    try {
        await dbConnect();

        const token = req.cookies.get("token")?.value;
        if (!token)
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

        const decoded = await verifyToken(token);
        const currentUserID = decoded.id;

        const search = req.nextUrl.searchParams.get("search") || "";

        // 🔥 Get accepted friends
        const acceptedFriends = await FriendRequest.find({
            status: "accepted",
            $or: [
                { sender: currentUserID },
                { receiver: currentUserID }
            ]
        });

        // Extract friend user IDs
        const friendIds = acceptedFriends.map(req =>
            req.sender.toString() === currentUserID
                ? req.receiver.toString()
                : req.sender.toString()
        );

        // 🔥 Fetch users EXCEPT yourself & accepted friends
        const users = await User.find({
            _id: {
                $nin: [currentUserID, ...friendIds]
            },
            fullName: { $regex: search, $options: "i" }
        }).select("-password");

        return NextResponse.json({ users });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//logout user controller
export async function logoutUser(req) {
    try {
        return NextResponse.json({ message: "User logged out successfully" }, {
            headers: { 'Set-Cookie': `token=; HttpOnly; Path=/; Max-Age=0` },
            status: 200
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//update user controller
export async function updateUser(req) {
    try {
        await dbConnect();

        // Get token from cookies
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        // Verify token to get user ID
        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch (e) {
            console.error("Token verification failed:", e);
            throw e;
        }
        if (!decoded || !decoded.id) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }
        const id = decoded.id; // User ID from token
        console.log("UpdateUser: ID derived:", id);

        const body = await req.json();
        console.log("UpdateUser: Body:", body);
        const { fullName, email, image } = body;
        // Find user by id
        let user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        console.log("UpdateUser: Received image:", image);
        console.log("UpdateUser: Current user image:", user.image);

        // Update user details
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        if (image) {
            user.image = image;
        }

        console.log("UpdateUser: Saving user with image:", user.image);
        const savedUser = await user.save();
        console.log("UpdateUser: Saved user result:", savedUser);

        return NextResponse.json({ message: "User updated successfully", user: savedUser }, { status: 200 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//upload image controller
export async function uploadImage(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ folder: "chatty_uploads" }, (error, result) => {
                if (error) reject(error);
                resolve(result);
            }).end(buffer);
        });
        console.log(result);
        return Response.json({ url: result.secure_url });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}