import { createNewUser, getPassword, loadUserData, updateUserData } from "../database/database_communication.js";
import { checkPasswordEquality } from "../security/security.js";
import { generateToken, getEmailFromToken } from "../security/tokenization.js";



export function lookForAuthentication(app) {
    app.post("/authenticate", async (req, res) => {
        try {
            console.log("got a connection request ------------------------------------------------------------------------------");
            const { email, password, newUser } = req.body;
            console.log(`logging the user with the email: ${email}`);
            console.log(`is he a new user?: ${newUser}`);
            console.log(`what is his password: ${password}`);

            if (!newUser) {
                const storedPassword = await getPassword(email);

                if (!checkPasswordEquality(password, storedPassword)) {
                return res.status(401).json({ message: 'Invalid email or password' });
                }

            } else {
                const username = req.body.username;
                const good = await createNewUser(email, password, username);
                if (!good) {
                    return res.status(409).json({ message: 'Account is already in use' });
                }
            }

            const token = generateToken({ email });
            console.log("ended the connection process ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

            res.json({ token });
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(400).json({ message: 'the data sent is not valid' });
        }
    });
}


export function sendingProfileData(app) {
    app.post("/loading", async (req, res) => {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        try {
            const email = getEmailFromToken(token);
            if (!email) return res.status(401).json({ message: 'Token is not valid' });
            console.log(`loading user data associate with the email: ${email}`);


            const userData = await loadUserData(email);

            res.json({
                success: true,
                data: userData
            });
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    });
}


export function saveProfile(app) {
    app.put("/profiles", async (req, res) => {
        const { token, username, display_name, profile_url, description } = req.body;

        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        try {
            const email = getEmailFromToken(token);

            if (!email) {
                return res.status(401).json({ message: 'Token is not valid' });
            }

            console.log(`user with email ${email} updated 
his data to username: ${username}, display name: ${display_name},
profile url: ${profile_url}, description: ${description}`)

            let flag = await updateUserData(email, username, display_name, profile_url, description);

            if (!flag) {
                return res.status(404).json({ message: 'suspicious url detected' })
            }

            res.json({
                success: true,
                message: "updated successfully"
            });
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(400).json({ message: 'user not found, check data' });
        }
    });
}

