const pool = require("./pool");

async function createUser(username, password) {
  await pool.query(`INSERT INTO Profile (username, password) VALUES ($1, $2)`, [username, password]);
}

async function getUsername(username) {
  const result = await pool.query(`
    SELECT * FROM Profile
    WHERE username = $1`, [username.toLowerCase()]);
    const rows = result.rows;
  return rows
}

async function addVip(id) {
  await pool.query(`
    UPDATE Profile
    SET vip = TRUE
    WHERE id = $1`, [id]);
}

async function addAdmin(id) {
  await pool.query(`
    UPDATE Profile
    SET admin = TRUE
    WHERE id = $1`, [id]);
}

async function addMessage(message, userid) {
  await pool.query(`
    INSERT INTO Message (message, userid, added)
    VALUES ($1, $2, NOW())`, [message, userid]);
}

async function getAllMessages() {
  const result = await pool.query(`
    SELECT p.username, m.* FROM Message m
    JOIN Profile p ON (p.id = m.userid)`);
  return result.rows
}

async function deleteMessage(id) {
  await pool.query(`
    DELETE FROM Message
    WHERE id = $1`, [id]);
}


module.exports = {
  createUser,
  getUsername,
  addVip,
  addAdmin,
  addMessage,
  getAllMessages,
  deleteMessage
};
