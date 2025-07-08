// RUN THIS INDEPENDENTLY
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const connection = await mysql.createConnection({
    uri: process.env.DB_URI
})


await connection.query(`
    CREATE TABLE shared (
        user_id INT NOT NULL,
        blog_id int not null,
        sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        primary key(user_id,blog_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (blog_id) REFERENCES blogs(id)
    )
`)

await connection.query(`
    ALTER TABLE collabblogs ADD content1 json;

UPDATE collabblogs SET content1 = content;

ALTER TABLE collabblogs DROP COLUMN content;

ALTER TABLE collabblogs RENAME COLUMN content1 TO content;
`)


await connection.end()