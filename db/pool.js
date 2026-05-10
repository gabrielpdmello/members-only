const { Pool } = require("pg");
require('dotenv').config();

module.exports = new Pool({
  host: process.env.HOST,
  user: process.env.ROLE_NAME,
  database: process.env.DB,
  password: process.env.ROLE_PSW,
  port: process.env.DB_PORT,
  ssl: process.env.SSL == "true" ? true : false
});
