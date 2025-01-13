import mysql from 'mysql';



// Create a connection to the database
const connection = mysql.createConnection({
    host: 'localhost',     // Replace with your database host (e.g., '127.0.0.1')
    user: 'root',          // Replace with your MySQL username
    password: '',          // Replace with your MySQL password
    database: 'TCGame' // Replace with your database name
});

// Connect to the database
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

// Close the connection when done
export function end(){
    console.log('ended connection to Mysql database')
    connection.end();
}

// execute a query
async function executee(query) {
        try {
            // Here, we'll check the validity of the query, if it will have bad effects on the website or not
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
            return results;  // The results are now returned after the query completes
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;  // Ensure the error is rethrown to be handled properly
        }
    }
    

export async function execute(query) {
    try {
        // Perform the query and return results
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
        return results;  // The results are now returned after the query completes
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;  // Propagate the error to be handled by the caller
    }
}

// execute(`SELECT password
// FROM Users
// WHERE email = 'something.gmail';`, results=>{
//     try{   
//     console.log(typeof results);
    
//     console.log(results[0].password);

//     }catch(error){
//         end();
//     }
// });


// end();