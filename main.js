// a server code, made to deal with the front end part of our project in the web class
import express from 'express';
import cors from 'cors';
import { lookForAuthentication, saveProfile, sendingProfileData} from './core/profiles.js';
import { acceptTrade, addNewTrades, sendAllTradesToUser } from './core/trades.js';
import { getInventory } from './core/inventory.js';
import { distribute17 } from './database/database_communication.js';


const app = express(); 

const port = 3000;
 
app.use(cors());

app.use(express.json());

sendAllTradesToUser(app);

addNewTrades(app);

acceptTrade(app);

getInventory(app);

lookForAuthentication(app);

sendingProfileData(app);

saveProfile(app);

setTimeout(distribute17, 24 * 3600 * 1000);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
