import jwt from "jsonwebtoken";
import { getCurrentSecretKey } from "./secret_key.js";
import { check } from "./security.js";
import { alphabet, numbers } from "../util/__vars.js";

// Function to generate a token for a user
export function generateToken(email) {
    const payload = {
        email
    };

    // Sign the token
    const token = jwt.sign(payload, getCurrentSecretKey(), {
        expiresIn: '1h' // Token expiration time
    });

    return token;
}


export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, getCurrentSecretKey());
        return decoded; // Decoded payload
    } catch (err) {
        console.error('Invalid Token:', err.message);
        return null; // Token is invalid
    }
}


export function getEmailFromToken(token){
    const decoded = verifyToken(token);
    if (!decoded) return null;
    const email = decoded.email.email;
    if (!check(email, alphabet + numbers + '.@')){
        return null;
    }
    return email;

}