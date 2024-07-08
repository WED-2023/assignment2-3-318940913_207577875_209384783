var mysql = require('mysql2');
require("dotenv").config();


const config = {
  connectionLimit: 4,
  host: process.env.DB_HOST || "127.0.0.1",  // Use environment variable or fallback to local
  user: process.env.DB_USER || "root",  // Use environment variable or fallback to root
  password: process.env.DB_PASSWORD || "1998iGuYBi1998",  // Use environment variable or fallback to default password
  database: process.env.DB_NAME || "rachel_recipes"  // Use environment variable or fallback to default database name
};

const pool = new mysql.createPool(config);

const connection =  () => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err.code, err.message);
      return reject(err);
    }
    console.log("MySQL pool connected: threadId " + connection.threadId);
    const query = (sql, binding) => {
      return new Promise((resolve, reject) => {
         connection.query(sql, binding, (err, result) => {
           if (err) reject(err);
           resolve(result);
           });
         });
       };
       const release = () => {
         return new Promise((resolve, reject) => {
           if (err) reject(err);
           console.log("MySQL pool released: threadId " + connection.threadId);
           resolve(connection.release());
         });
       };
       resolve({ query, release });
     });
   });
 };
const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};
module.exports = { pool, connection, query };







