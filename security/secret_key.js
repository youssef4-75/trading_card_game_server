import crypto from 'crypto'

let currentSecretKey = generateSecretKey();

// Function to generate a new random secret key
function generateSecretKey() {
    return crypto.randomBytes(32).toString('hex'); // 32 bytes = 256-bit key
}

// Function to update the secret key every 2 hours
function startKeyRotation() {
    // Update the key every 2 hours (2 hours = 7200000 milliseconds)
    setInterval(() => {
        currentSecretKey = generateSecretKey();
    }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
}

// Start the secret key rotation process
startKeyRotation();

// Function to get the current secret key
export function getCurrentSecretKey() {
    return currentSecretKey;
}