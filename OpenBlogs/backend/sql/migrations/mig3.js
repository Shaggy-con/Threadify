// RUN THIS INDEPENDENTLY
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

await connection.query(`
    ALTER TABLE users
    ADD CONSTRAINT unique_username UNIQUE (username);
`)

await connection.query(`
    create table requests( 
        fromuser int not null, 
        touser int not null, 
        foreign key (fromuser) references users(id),
        foreign key (touser) references users(id),
        primary key (fromuser,touser));
`)

await connection.query(`
    create table friends( 
        user1 int not null, 
        user2 int not null, 
        foreign key (user1) references users(id),
        foreign key (user2) references users(id),
        primary key (user1,user2));
`)

await connection.end()