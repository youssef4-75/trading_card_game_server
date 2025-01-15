import jwt from 'jsonwebtoken';
import { getCurrentSecretKey } from './secret_key.js';
import { check } from './security.js';
import { alphabet, numbers } from '../util/__vars.js';

export function generateToken(email) {
    const payload = { email };
    return jwt.sign(payload, getCurrentSecretKey(), { expiresIn: '1h' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, getCurrentSecretKey());
    } catch (err) {
        console.error('Invalid Token:', err.message);
        return null;
    }
}

export function getEmailFromToken(token) {
    const decoded = verifyToken(token);
    if (!decoded) return null;
    const email = decoded.email.email;
    if (!check(email, alphabet + numbers + '.@')) {
        return null;
    }
    return email;
}