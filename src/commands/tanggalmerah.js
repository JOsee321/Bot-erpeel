import { getNowInTimezone } from '../utils/date.js';
import config from '../config.js';
import logger from '../utils/logger.js';

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format tanggal YYYY-MM-DD menjadi format Indonesia (contoh: '17 Agustus 2026')
 * @param {string} dateStr - Format 'YYYY-MM-DD'
 * @returns {string}
 */
export function formatHolidayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = MONTH_NAMES_ID[monthIndex] || month;
  return `${parseInt(day, 10)} ${monthName} ${year}`;
}

/**
 * Handler command .tanggalmerah / .libur
 * @param {object} ctx
 */
export async function handleGetTanggalMerah(ctx) {
  try {
    const now = getNowInTimezone(config.timezone);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const monthName = MONTH_NAMES_ID[currentMonth];

    const url = `https://api-hari-libur.vercel.app/api?year=${currentYear}`;

    // Fetch dengan timeout 8 detik
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const resJson = await response.json();
    const allHolidays = Array.isArray(resJson) ? resJson : (Array.isArray(resJson.data) ? resJson.data : []);

    // Filter libur untuk bulan berjalan (format date: 'YYYY-MM-DD')
    const targetMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const monthlyHolidays = allHolidays.filter((item) => {
      const isDateMatch = item.date && item.date.startsWith(targetMonthPrefix);
      const isNational = item.is_national_holiday !== false;
      return isDateMatch && isNational;
    });

    let text = `*TANGGAL MERAH - ${monthName.toUpperCase()} ${currentYear}*\n\n`;

    if (monthlyHolidays.length === 0) {
      text += `Tidak ada tanggal merah di bulan ini.`;
    } else {
      for (const h of monthlyHolidays) {
        const formattedDate = formatHolidayDate(h.date);
        text += `• ${formattedDate} : ${h.description || h.name || 'Libur Nasional'}\n`;
      }
    }

    await ctx.reply(text.trim());
  } catch (error) {
    logger.error('Gagal mengambil data tanggal merah', error);
    await ctx.reply('Gagal mengambil data tanggal merah. Silakan coba lagi nanti.');
  }
}

export default {
  handleGetTanggalMerah,
  formatHolidayDate,
  MONTH_NAMES_ID,
};
