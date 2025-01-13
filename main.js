// a server code, made to deal with the front end part of our project in the web class
import express from 'express';
import cors from 'cors';

import { createNewUser, getPassword } from './database/database_communication.js';
import { checkPasswordEquality, isValidUrl } from './security/security.js';
import {generateToken as createToken, getEmailFromToken} from './security/tokenization.js'
import { addCardsToTrade, createTradeQuery, distribute17Query, getAllTradesQuery, getSwitchOwnershipQuery, getUpdateQuery, getUserCardOwnershipQuery, getUserDataQuery, getUserInventoryQuery, giveMeMyLastTradeId, turnNamesToNumbers } from './database/query_base.js';
import { execute } from './database/database.js';


const app = express();  // can be used only in three files, the profiles.js, the inventory.js, and the trades.js files


const port = 3000;

// Enable CORS for all origins
app.use(cors());

// To parse JSON data from the request
app.use(express.json());

app.post("/authenticate", async (req, res) => {
    try {
        console.log("got a connection request");
        const { email, password, newUser } = req.body;
        console.log("logging the user with the email: ", email);
        console.log("is he a new user?: ", newUser);

        // Fetch the stored password from the database
        if(!newUser){
            const storedPassword = await getPassword(email);

            // Check if the passwords match
            if (!checkPasswordEquality(password, storedPassword)) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Create a token if passwords match
            
        }else{
            const username = req.body.username;
            const good = await createNewUser(email, password, username);
            if(!good){
                return res.status(409).json({ message: 'Account is already in use' });
            }
        }

        
        const token = createToken({ email });

        // Send the token to the user
        res.json({ token });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post("/loading", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    try {
        // Verify the token
        const email = getEmailFromToken(token);

        if(!email){
            return res.status(401).json({ message: 'Token is not valid' });
        }

        console.log("loading user data associate with the email: ", email);

        // Query the database to fetch user data
        const query = getUserDataQuery(email);
        const result = await execute(query);

        console.log("the query that will be executed is: ", query);
        

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send back user data
        const userData = result[0]; // Assuming `execute` returns an array of rows
        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

app.post("/inventory", async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }
    
    try {
        // Verify the token
        const email = getEmailFromToken(token);

        if(!email){
            return res.status(401).json({ message: 'Token is not valid' });
        }

        console.log("getting user inventory for user: ", email);

        // Query the database to fetch user data
        const query = getUserInventoryQuery(email);
        const result = await execute(query);

        console.log("the query to be executed to fetch userdata",query);
        console.log("the result of the previous query: ",result);

        // Send back user data
        const userInventory = result; // Assuming `execute` returns an array of rows
        res.json({
            success: true,
            data: userInventory
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

app.put("/profiles", async (req, res) => {
    const { token, username, display_name, profile_url, description } = req.body;
    
    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }
    
    try {
        // Verify the token
        const email = getEmailFromToken(token);
        
        if(!email){
            return res.status(401).json({ message: 'Token is not valid' });
        }

        console.log("getting user inventory for user: ", email);

        // Query the database to fetch user data
        if(!isValidUrl(profile_url)){
            res.status(404).json({ message: 'suspicious url detected' })
        }
        const query = getUpdateQuery(email, username, display_name, profile_url, description);
        await execute(query);

        console.log("the query to be executed to fetch userdata", query);

        // Send back confirmation
        res.json({
            success: true,
            message: "updated successfully"
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

app.get("/trades", async (req, res) => {
    try {
        // Query the database to fetch user data
        const query = getAllTradesQuery();
        console.log("the query that will be executed to get all trades is: ", query);

        const result = await execute(query);
        // Send back all trades
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

app.post("/trades", async (req, res) => {
    const { token, of, re } = req.body;

    // of is a list for offered cards, while re for requested cards

    // steps to do that are: 
    
    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }
    
    try {
        // Verify the token
        const email = getEmailFromToken(token);

        if(!email){
            return res.status(401).json({ message: 'Token is not valid' });
        }

        console.log("adding a trade from: ", email);

        // Query to do the following : 
        // create a trade with its name [exist]  createTradeQuery(email)
        // store the trade_id to use it later  [exist]  giveMeMyLastTradeId(email)
        // turn the of and re to a list of cards id  [exist]  turnNamesToNumbers(loc)
        // add of&re cards to the trade with the id trade_id  [exist]  addCardsToTrade(trade_id, cards, offered)

        const query_create_trade = createTradeQuery(email);
        await execute(query_create_trade);

        const query_get_trade_id = giveMeMyLastTradeId(email);
        const result_get_trade_id = await execute(query_get_trade_id);
        const trade_id = result_get_trade_id[0].trade_id;
        
        const query_give_me_ids_re = turnNamesToNumbers(re);
        const result_give_me_ids_re = await execute(query_give_me_ids_re);
        let list_re_id = result_give_me_ids_re.map(element => {
            return element.card_id;
        });
        
        const query_give_me_ids_of = turnNamesToNumbers(of);
        const result_give_me_ids_of = await execute(query_give_me_ids_of);
        let list_of_id = result_give_me_ids_of.map(element => {
            return element.card_id;
        });
        
        const query_exchange_re = addCardsToTrade(trade_id, list_re_id, false);
        await execute(query_exchange_re);
        
        const query_exchange_of = addCardsToTrade(trade_id, list_of_id, true);
        await execute(query_exchange_of);

        res.json({
            success: true,
            message: true
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

app.put("/trades", async (req, res) => {
    const { token, of, re, requestedBy, id } = req.body;

    // of is a list for offered cards, while re for requested cards

    // steps to do that are: 
    
    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }
    
    try {
        // Verify the token
        const email = getEmailFromToken(token);

        if(!email){
            return res.status(401).json({ message: 'Token is not valid' });
        }

        console.log(email, " accepted a trade");

        const query_validating = getUserCardOwnershipQuery(email, re);
        const result = await execute(query_validating);

        if(result.length == 0){
            res.status(400).json({message: 'You Dont Have Necessary cards to do this trade'})
        }

        console.log("here are the data to accomplish this trade: (email, display_name, offered, requested)", email, requestedBy, of, re);
        for(const single_query of getSwitchOwnershipQuery(email, requestedBy, of, re, id)){
            await execute(single_query);
        }

        res.json({
            success: true,
            message: true
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

async function distribute17(){
    await execute(distribute17Query());
    setTimeout(distribute17, 24 * 3600 * 1000);
}

setTimeout(distribute17, 24 * 3600 * 1000);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
