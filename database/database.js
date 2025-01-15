import mysql from 'mysql';



 
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

 

export async function execute(query) {
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



export function end(){
    console.log('ended connection to Mysql database')
    connection.end();
}

//  end();