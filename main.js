// a server code, made to deal with the front end part of our project in the web class
import express from 'express';
import cors from 'cors';
import { lookForAuthentication, saveProfile, sendingProfileData} from './core/profiles.js';
import { acceptTrade, addNewTrades, sendAllTradesToUser } from './core/trades.js';
import { getInventory } from './core/inventory.js';
import { distribute17 } from './database/database_communication.js';
import { execute } from './database/databasePG.js';


async function checkAndPopulateDatabase() {
    try {
        
        const result = await execute(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        if (result.rows.length === 0) {
            console.log('Database is empty. Populating now...');

            // Execute multiple queries to populate the database
            const queries = [
                `
    CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(10),
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    profile_icon VARCHAR(255), -- URL or path to the icon
    description TEXT,
    inventory_limit INT DEFAULT 3 -- Maximum cards allowed on display
);`,
                `
    CREATE TABLE Cards (
    card_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rarity VARCHAR(50), -- Common, Rare, Legendary, etc.
    image_url VARCHAR(255) -- URL or path to the card image
);`,
                `
    CREATE TABLE UserInventory (
    inventory_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    card_id INT REFERENCES Cards(card_id) ON DELETE CASCADE,
    is_on_display BOOLEAN DEFAULT FALSE -- Indicates whether the card is displayed
);`,
                `
    CREATE TABLE Trades (
    trade_id SERIAL PRIMARY KEY,
    initiator_user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
                `
    CREATE TABLE TradeCards (
    trade_card_id SERIAL PRIMARY KEY,
    trade_id INT REFERENCES Trades(trade_id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE, -- User offering the card
    card_id INT REFERENCES Cards(card_id) ON DELETE CASCADE,
    offered BOOLEAN -- TRUE if offered by the user, FALSE if requested
);`
            ];

            for (const query of queries) {
                await execute(query);
            }

            console.log('Database populated successfully.');
        } else {
            console.log('Database is not empty. No action needed.');
        }
    } catch (error) {
        console.error('Error while checking or populating the database:', error.message);
    } finally {
        // Close the database connection
        await end();
    }
}

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

await checkAndPopulateDatabase()

app.listen(port, () => {
    console.log(`Server is running on https://trading-card-game-server.onrender.com:${port}`);
});
