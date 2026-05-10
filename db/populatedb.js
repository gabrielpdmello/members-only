#! /usr/bin/env node

const { Client } = require("pg");
const { argv } = require('node:process');
// use arguments for connection string and ssl (optional)

const SQL = `
DROP TABLE IF EXISTS Message;

DROP TABLE IF EXISTS Profile;

CREATE TABLE Profile (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  vip BOOLEAN DEFAULT FALSE,
  admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE Message (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  message VARCHAR(3000),
  userid INT REFERENCES Profile (id),
  added TIMESTAMPTZ
);
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: `${argv[2]}`,
    ssl: argv[3] == 'ssl' ? true : false
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();