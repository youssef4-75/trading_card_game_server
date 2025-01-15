import { execute } from "../database/database.js";
import { getUserInventoryQuery } from "../database/query_base.js";
import { getEmailFromToken } from "../security/tokenization.js";

export function getInventory(app){
    app.post("/inventory", async (req, res) => {
        const { token } = req.body;
        
        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }
        
        try {
            const email = getEmailFromToken(token);
            if(!email)return res.status(401).json({ message: 'Token is not valid' });    
            console.log("getting user inventory for user: ", email);
    
            const query = getUserInventoryQuery(email);
            const result = await execute(query);

            console.log(`the result of the query to get the user inventory: `, result);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    });
    
}