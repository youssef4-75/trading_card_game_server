import { alphabet, numbers } from "../util/__vars.js";
import { execute } from "./database.js";
import { getCreatingQuery, getPasswordPQuery } from "./query_base.js";
import { check } from "../security/security.js";

// export async function getPassword(email, passwordHandler){
//     // if i didnt check the email, 
//     //      the user my send an email with sql injection 
//     //      code in it, then he may delete my database or
//     //      anything

//     if(!check(email, alphabet + numbers + '@.', true)){
//         return null;
//     }

//     // Return a Promise to handle asynchronous behavior
//     return new Promise((resolve, reject) => {
//         execute(getPasswordPQuery(email), (results) => {
//             try {
//                 // Handle the result and return the password
//                 const password = results[0].password;
//                 resolve(passwordHandler(password)); // Resolve the promise with the password handler result
//             } catch (error) {
//                 // Reject the promise if there is an error
//                 reject(error);
//             }
//         });
//     });
// }

export async function getPassword(email) {
    
    if(!check(email, alphabet + numbers + '@.', true)){
        return null;
    }
    const query = getPasswordPQuery(email);
    console.log("the query that will be executed is: ", query);
    try {
        const results = await execute(query);
        if (results.length === 0) {
            throw new Error('User not found');
        }
        return results[0].password;  // Assuming password is stored in a column named 'password'
    } catch (error) {
        console.error('Error fetching password:', error.message);
        throw error;
    }
}

export async function createNewUser(email, psswd, username) {
    if (!check(email, alphabet + numbers + '@.', true)) {
        console.log('Invalid email format.', email);
        return;
    }

    if (!check(psswd, alphabet+numbers)) {
        console.log('Password must be at least 6 characters long.');
        return;
    }

    if (!check(username, alphabet+numbers) && 
            (username.length < 3 || 
                username.length > 20)) {
        console.log('Username must be between 3 and 20 characters.');
        return;
    }

    // Prepare the SQL query for inserting the new user
    const checkQuery = getPasswordPQuery(email);
    const query = getCreatingQuery(email, psswd, username);

    console.log("the query that will be executed is: ", checkQuery);
    console.log("the query that will be executed is: ", query);
    

    try {

        // Look for the given email if exist, if so, the email given is already in use, u cant modify it
        const checkResult = await execute(checkQuery);

        if (checkResult.length !== 0) {
            throw new Error('User already exists');
        }

        // Execute the query
        const result = await execute(query);

        return {
            success: true,
            message: 'User created successfully!'
        };
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('User with this email or username already exists.');
        }
        throw new Error('Error creating user.');
    }
}
