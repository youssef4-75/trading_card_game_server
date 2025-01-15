import crypto from 'crypto';

let currentSecretKey = generateSecretKey();

function generateSecretKey() {
    return crypto.randomBytes(32).toString('hex');
}

setInterval(() => {
    currentSecretKey = generateSecretKey();
}, 2 * 60 * 60 * 1000);

export function getCurrentSecretKey() {
    return currentSecretKey;
}