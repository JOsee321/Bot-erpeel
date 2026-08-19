import config from '../config.js';

export const VALID_DAYS = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
export const SCHOOL_DAYS = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];

const DAY_MAP_ID = {
  0: 'minggu',
  1: 'senin',
  2: 'selasa',
  3: 'rabu',
  4: 'kamis',
  5: 'jumat',
  6: 'sabtu',
};

/**
 * Mendapatkan representasi Date di zona waktu yang ditentukan (default: Asia/Makassar)
 * @param {string} [timeZone]
 * @returns {Date}
 */
export function getNowInTimezone(timeZone = config.timezone) {
  const now = new Date();
  const dateString = now.toLocaleString('en-US', { timeZone });
  return new Date(dateString);
}

/**
 * Mendapatkan nama hari saat ini (lowercase) berdasarkan zona waktu WITA
 * @param {string} [timeZone]
 * @returns {string} Contoh: 'senin', 'selasa', dll.
 */
export function getTodayDayName(timeZone = config.timezone) {
  const localDate = getNowInTimezone(timeZone);
  const dayIndex = localDate.getDay();
  return DAY_MAP_ID[dayIndex];
}

/**
 * Mendapatkan nama hari esok (H+1) berdasarkan zona waktu WITA
 * @param {string} [timeZone]
 * @returns {string} Contoh: 'selasa' (jika hari ini senin)
 */
export function getTomorrowDayName(timeZone = config.timezone) {
  const localDate = getNowInTimezone(timeZone);
  const tomorrow = new Date(localDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return DAY_MAP_ID[tomorrow.getDay()];
}

/**
 * Memvalidasi apakah string merupakan nama hari valid
 * @param {string} dayName
 * @returns {boolean}
 */
export function isValidDay(dayName) {
  if (!dayName) return false;
  return VALID_DAYS.includes(dayName.toLowerCase().trim());
}

/**
 * Format nama hari dengan huruf kapital di awal (contoh: 'Senin')
 * @param {string} dayName
 * @returns {string}
 */
export function capitalizeDay(dayName) {
  if (!dayName) return '';
  const clean = dayName.toLowerCase().trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export default {
  VALID_DAYS,
  SCHOOL_DAYS,
  getNowInTimezone,
  getTodayDayName,
  getTomorrowDayName,
  isValidDay,
  capitalizeDay,
};
