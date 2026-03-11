const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/qse.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return { id: result.lastInsertRowid, changes: result.changes };
}

function get(sql, params = []) {
  return db.prepare(sql).get(...params);
}

function all(sql, params = []) {
  return db.prepare(sql).all(...params);
}

module.exports = { db, run, get, all };
