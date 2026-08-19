import queries from '../db/queries.js';
import { getTodayDayName, isValidDay, capitalizeDay, VALID_DAYS } from '../utils/date.js';

/**
 * Handler command !jadwal [hari]
 * @param {object} ctx
 */
export async function handleGetJadwal(ctx) {
  let targetHari = ctx.args[0] ? ctx.args[0].toLowerCase().trim() : getTodayDayName();

  if (!isValidDay(targetHari)) {
    return await ctx.reply(
      `Hari '${ctx.args[0]}' tidak valid.\n` +
      `Pilihan hari: ${VALID_DAYS.join(', ')}\n` +
      `Contoh: ${ctx.prefix}jadwal senin`
    );
  }

  const listJadwal = queries.getJadwalByHari(targetHari);
  const formattedDay = capitalizeDay(targetHari);

  if (!listJadwal || listJadwal.length === 0) {
    return await ctx.reply(
      `*JADWAL PELAJARAN - ${formattedDay.toUpperCase()}*\n` +
      `----------------------------------------\n` +
      `Belum ada data jadwal untuk hari ${formattedDay}.`
    );
  }

  let text = `*JADWAL PELAJARAN - ${formattedDay.toUpperCase()}*\n`;
  text += `----------------------------------------\n`;
  for (const item of listJadwal) {
    text += `${item.jam_ke}. ${item.mapel}\n`;
  }
  text += `\nTotal: ${listJadwal.length} mata pelajaran`;

  await ctx.reply(text);
}

export default {
  handleGetJadwal,
};
