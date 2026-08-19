import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import config from '../config.js';

let dbInstance = null;

/**
 * Inisialisasi koneksi SQLite dan skema tabel
 * @param {string} [customPath] - Path opsional untuk keperluan testing/custom
 * @returns {DatabaseSync} Instance database SQLite
 */
export function initDB(customPath = null) {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbFilePath = customPath || config.dbPath;
  const dbDir = path.dirname(dbFilePath);

  if (dbFilePath !== ':memory:' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new DatabaseSync(dbFilePath);

  // Optimasi performa SQLite
  try {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
  } catch (err) {
    console.warn('[DB] Warning setting PRAGMA:', err.message);
  }

  // Skema Tabel Sesuai Spesifikasi PRD
  db.exec(`
    CREATE TABLE IF NOT EXISTS jadwal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hari TEXT NOT NULL,
      jam_ke INTEGER NOT NULL,
      mapel TEXT NOT NULL,
      UNIQUE(hari, jam_ke)
    );

    CREATE TABLE IF NOT EXISTS piket (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hari TEXT NOT NULL UNIQUE,
      nama_petugas TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin (
      nomor TEXT PRIMARY KEY
    );
  `);

  // Auto-insert SUPER_ADMIN jika dikonfigurasi
  if (config.superAdmin) {
    const insertAdmin = db.prepare('INSERT OR IGNORE INTO admin (nomor) VALUES (?)');
    insertAdmin.run(config.superAdmin);
  }

  dbInstance = db;

  return db;
}

/**
 * Mengambil instance database yang sedang aktif
 * @returns {DatabaseSync}
 */
export function getDB() {
  if (!dbInstance) {
    return initDB();
  }
  return dbInstance;
}

export default { initDB, getDB };
