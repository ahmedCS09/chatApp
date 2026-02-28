import jwt from 'jsonwebtoken';

// user can be an object with id and fullName
export async function generateToken(user) {
    const payload = {
        id: user._id || user.id || user,
        fullName: user.fullName
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log(token);
    return token;
}

export async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        return decoded;
    } catch (error) {
        console.log('Token verification failed:', error);
        return null;
    }
}