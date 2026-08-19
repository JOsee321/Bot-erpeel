import config from '../config.js';
import queries from '../db/queries.js';

/**
 * Normalisasi nomor WhatsApp menjadi format numerik murni (misal '6281234567890')
 * @param {string} jidOrNumber
 * @returns {string}
 */
export function normalizeAdminNumber(jidOrNumber) {
  if (!jidOrNumber) return '';
  return String(jidOrNumber).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
}

/**
 * Memeriksa apakah nomor pengirim adalah admin / super admin
 * @param {string} senderNumber
 * @returns {boolean}
 */
export function checkIsAdmin(senderNumber) {
  const cleanNumber = normalizeAdminNumber(senderNumber);
  if (!cleanNumber) return false;

  // Cek apakah sama dengan SUPER_ADMIN di config
  if (config.superAdmin && cleanNumber === config.superAdmin) {
    return true;
  }

  // Cek ke tabel admin SQLite
  return queries.isAdmin(cleanNumber);
}

/**
 * Middleware penjaga hak akses: jika bukan admin, otomatis membalas pesan penolakan
 * @param {object} ctx - Objek context dari router
 * @returns {Promise<boolean>} True jika admin, False jika bukan admin
 */
export async function requireAdmin(ctx) {
  const isAdminUser = checkIsAdmin(ctx.senderNumber);
  if (!isAdminUser) {
    await ctx.reply('❌ Command ini khusus admin/pengurus kelas.');
    return false;
  }
  return true;
}

export default {
  normalizeAdminNumber,
  checkIsAdmin,
  requireAdmin,
};
