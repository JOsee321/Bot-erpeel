import { getDB } from './init.js';

// ==========================================
// QUERIES: JADWAL PELAJARAN
// ==========================================

/**
 * Mendapatkan seluruh jadwal pelajaran pada hari tertentu diurutkan berdasarkan jam ke
 * @param {string} hari - Nama hari dalam format lowercase (senin..jumat/sabtu)
 * @returns {Array<{id: number, hari: string, jam_ke: number, mapel: string}>}
 */
export function getJadwalByHari(hari) {
  const db = getDB();
  const stmt = db.prepare('SELECT id, hari, jam_ke, mapel FROM jadwal WHERE LOWER(hari) = LOWER(?) ORDER BY jam_ke ASC');
  return stmt.all(hari);
}

/**
 * Mendapatkan seluruh data jadwal pelajaran
 * @returns {Array<{id: number, hari: string, jam_ke: number, mapel: string}>}
 */
export function getAllJadwal() {
  const db = getDB();
  const stmt = db.prepare('SELECT id, hari, jam_ke, mapel FROM jadwal ORDER BY hari, jam_ke ASC');
  return stmt.all();
}

/**
 * Menambah atau memperbarui slot jadwal pelajaran (UPSERT)
 * @param {string} hari - Nama hari (contoh: senin)
 * @param {number} jamKe - Nomor jam pelajaran (angka positif)
 * @param {string} mapel - Nama mata pelajaran
 * @returns {Database.RunResult}
 */
export function setJadwal(hari, jamKe, mapel) {
  const db = getDB();
  const normalizedHari = hari.toLowerCase().trim();
  const normalizedMapel = mapel.trim();
  const stmt = db.prepare(`
    INSERT INTO jadwal (hari, jam_ke, mapel)
    VALUES (?, ?, ?)
    ON CONFLICT(hari, jam_ke) DO UPDATE SET mapel = excluded.mapel
  `);
  return stmt.run(normalizedHari, Number(jamKe), normalizedMapel);
}

/**
 * Menghapus satu slot jadwal pelajaran
 * @param {string} hari - Nama hari
 * @param {number} jamKe - Nomor jam pelajaran
 * @returns {Database.RunResult}
 */
export function deleteJadwal(hari, jamKe) {
  const db = getDB();
  const normalizedHari = hari.toLowerCase().trim();
  const stmt = db.prepare('DELETE FROM jadwal WHERE LOWER(hari) = ? AND jam_ke = ?');
  return stmt.run(normalizedHari, Number(jamKe));
}

// ==========================================
// QUERIES: PIKET KELAS
// ==========================================

/**
 * Mendapatkan daftar petugas piket pada hari tertentu
 * @param {string} hari - Nama hari (contoh: senin)
 * @returns {{id: number, hari: string, nama_petugas: string} | undefined}
 */
export function getPiketByHari(hari) {
  const db = getDB();
  const stmt = db.prepare('SELECT id, hari, nama_petugas FROM piket WHERE LOWER(hari) = LOWER(?)');
  return stmt.get(hari);
}

/**
 * Mendapatkan semua susunan piket
 * @returns {Array<{id: number, hari: string, nama_petugas: string}>}
 */
export function getAllPiket() {
  const db = getDB();
  const stmt = db.prepare('SELECT id, hari, nama_petugas FROM piket ORDER BY hari ASC');
  return stmt.all();
}

/**
 * Menambah atau memperbarui susunan piket (UPSERT)
 * @param {string} hari - Nama hari
 * @param {string} namaPetugas - Nama-nama petugas piket (comma-separated string)
 * @returns {Database.RunResult}
 */
export function setPiket(hari, namaPetugas) {
  const db = getDB();
  const normalizedHari = hari.toLowerCase().trim();
  const normalizedNama = namaPetugas.trim();
  const stmt = db.prepare(`
    INSERT INTO piket (hari, nama_petugas)
    VALUES (?, ?)
    ON CONFLICT(hari) DO UPDATE SET nama_petugas = excluded.nama_petugas
  `);
  return stmt.run(normalizedHari, normalizedNama);
}

/**
 * Menghapus susunan piket pada hari tertentu
 * @param {string} hari - Nama hari
 * @returns {Database.RunResult}
 */
export function deletePiket(hari) {
  const db = getDB();
  const normalizedHari = hari.toLowerCase().trim();
  const stmt = db.prepare('DELETE FROM piket WHERE LOWER(hari) = ?');
  return stmt.run(normalizedHari);
}

// ==========================================
// QUERIES: ADMIN & PERMISSION
// ==========================================

/**
 * Memeriksa apakah suatu nomor terdaftar sebagai admin
 * @param {string} nomor - Nomor telepon pengirim (angka)
 * @returns {boolean}
 */
export function isAdmin(nomor) {
  if (!nomor) return false;
  const db = getDB();
  const cleanNomor = String(nomor).replace(/[^0-9]/g, '');
  const stmt = db.prepare('SELECT nomor FROM admin WHERE nomor = ?');
  const result = stmt.get(cleanNomor);
  return Boolean(result);
}

/**
 * Menambahkan nomor admin baru
 * @param {string} nomor - Nomor telepon
 * @returns {Database.RunResult}
 */
export function addAdmin(nomor) {
  const db = getDB();
  const cleanNomor = String(nomor).replace(/[^0-9]/g, '');
  const stmt = db.prepare('INSERT OR IGNORE INTO admin (nomor) VALUES (?)');
  return stmt.run(cleanNomor);
}

/**
 * Menghapus nomor admin
 * @param {string} nomor - Nomor telepon
 * @returns {Database.RunResult}
 */
export function deleteAdmin(nomor) {
  const db = getDB();
  const cleanNomor = String(nomor).replace(/[^0-9]/g, '');
  const stmt = db.prepare('DELETE FROM admin WHERE nomor = ?');
  return stmt.run(cleanNomor);
}

/**
 * Mendapatkan seluruh daftar nomor admin
 * @returns {Array<{nomor: string}>}
 */
export function getAllAdmins() {
  const db = getDB();
  const stmt = db.prepare('SELECT nomor FROM admin');
  return stmt.all();
}

export default {
  getJadwalByHari,
  getAllJadwal,
  setJadwal,
  deleteJadwal,
  getPiketByHari,
  getAllPiket,
  setPiket,
  deletePiket,
  isAdmin,
  addAdmin,
  deleteAdmin,
  getAllAdmins,
};
