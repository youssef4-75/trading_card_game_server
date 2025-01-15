import { addTrade, exchangeCard, getAllTrades } from "../database/database_communication.js";
import { getEmailFromToken } from "../security/tokenization.js";

export function sendAllTradesToUser(app){
    app.get("/trades", async (req, res) => {
        try {
            const result = await getAllTrades();

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

export function addNewTrades(app){    
    app.post("/trades", async (req, res) => {
        const { token, of, re } = req.body;

        console.log(of, re);
        
        // of: refers to offered cards in that trade
        // re: refers to requested cards in that trade
                
        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }
        
        try {
            const email = getEmailFromToken(token);
            if(!email) return res.status(401).json({ message: 'Token is not valid' });
            console.log("adding a trade from: ", email);

            await addTrade(email, re, of);

            res.json({
                success: true,
                message: true
            });
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(401).json({ message: 'Invalid operation' });
        }
    });
}

export function acceptTrade(app){
    app.put("/trades", async (req, res) => {
        const { token, id } = req.body;
        
        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }
        
        try {
            const email = getEmailFromToken(token);
            if(!email)return res.status(401).json({ message: 'Token is not valid' });
            console.log(email, " accepted a trade");

            const message = await exchangeCard(email, id);
            if(message) return res.status(400).json({message: message})

            res.json({
                success: true,
                message: true
            });
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    });
}