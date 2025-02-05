import postgreSql from 'pg';
const { Pool } = postgreSql;
import readline from 'readline';

// PostgreSQL connection pool configuration
const pool = new Pool({
    host: 'dpg-cu9t3vtsvqrc73dkcn30-a',
    user: 'ucf',
    password: process.env.password,
    database: 'trading_card_game_db',
    port: 5432,
});

// Function to connect and test the connection
async function connect() {
    try {
        const client = await pool.connect();
        console.log('Connected to the PostgreSQL database!');
        client.release(); // Release the client back to the pool
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
    }
}

connect();

// Function to execute a query
export async function execute(query, args=[]) {
    try {
        const results = await pool.query(query, args);
        return results.rows; // Return only the rows from the result
    } catch (error) {
        console.error('Error executing query:', error.message);
        throw error;
    }
}

// Function to close the pool connection
export async function end() {
    console.log('Ended connection to PostgreSQL database');
    await pool.end();
}

// Setup readline for quitting the application
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Press 'e' to quit or any other key to trigger an action.");

process.stdin.on('keypress', (str, key) => {
    if (key && key.name === 'e') {
        end();
        rl.close();
        process.exit(0); // Exit the program
    }
});
