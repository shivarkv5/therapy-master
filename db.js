var mysql = require('mysql');

let connection_parameters = {
    host: 'localhost',
    port:'3306',
    user:'root',
    password: '1234',
    database: 'chatbot'
}

function createConnection() {
    // @ts-ignore
    // console.log("==> Creating connection with : ", connection_parameters)
    return mysql.createConnection(connection_parameters);
}


//
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
// flush privileges;

exports.getState = function getState(uuid) {

    return new Promise((resolve, reject) => {
        let connection = createConnection();
        connection.connect();

        connection.query("SELECT * from state where uuid='" + uuid + "'", function (error, results, fields) {
            if (error) throw error;
            console.log('The raw db result: ', results[0]);
            resolve(results[0])
        });

        connection.end();
    });
}

exports.setState = async function setState(uuid, state) {
    let values = [
        [uuid, state]
    ]
    let query = "insert into state(uuid,state) values ? on duplicate key update state='" + state + "'"
    let result = await writeToDB(query, values);
    console.log(result)
    return result
}

function writeToDB(query, values) {
    return new Promise((resolve, reject) => {
        let connection = createConnection();
        connection.connect();

        console.log("=>", query)
        connection.query(query, [values], function (error, results, fields) {
            if (error) throw error;
            resolve(results)
        });

        connection.end();
    });
}

exports.writeToHistory = function writeToHistory(uuid, direction, intent, content) {

    let values = [
        [uuid, direction, intent, content,new Date().toISOString()]
    ]
    let query = "insert into history(user_uuid,direction,intent,content,created_at) VALUES ?"
    return writeToDB(query, values);

}


exports.getHistory =  () => {
    console.log("==> Getting history")

    return new Promise((resolve, reject) => {
        let con = createConnection()
        con.connect()
        con.query("SELECT * FROM history order by created_at", (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result);
            }
        })
    })
}



exports.getUserChat = (id) => {
    return new Promise((resolve, reject) => {
        let con = createConnection()
        con.connect()
        con.query(`select * from history where user_uuid='${id}'`, (err, result) => {
            if (err) {
                throw new Error()
            } else {
                resolve(result)
            }
        })
    })
}


// exports.writeToHistory(1,'<',"welcome", "hola").then(data=>{
//     console.log(data);
// })

// exports.getState("1234").then(data=>{
//     console.log(" Here is the state", data.state)
// }).catch(function(error) {
//     console.error(error);
// });

// exports.setState("1234","hola").then(data=>{
//     console.log(" Here is the state", data)
// })