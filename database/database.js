import mysql from 'mysql';
import readline from 'readline';

// // Access environment variables
// const database_url = process.env.DURL;
 
const connection = mysql.createConnection({
    host: 'localhost',      
    user: 'root',          
    password: '',      
    database: 'TCGame'  
});

 
function connect(){
    connection.connect(error => {
        if (error) {
            console.error('Error connecting to the database:', error.message);
            return;
        }
        console.log('Connected to the MySQL database!');
    });
}

connect();

 

async function execute(query) {
    try {
        const results = await new Promise((resolve, reject) => {
            connection.query(query, (error, results, fields) => {
                if (error) {
                    console.error('Query error:', error.message);
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
        return results;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
}



function end(){
    console.log('nded connection to Mysql database')
    connection.end();
}

//  end();




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
