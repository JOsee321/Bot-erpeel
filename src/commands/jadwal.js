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
      `❌ Hari *${ctx.args[0]}* tidak valid.\n\n` +
      `Pilihan hari: ${VALID_DAYS.join(', ')}\n` +
      `Contoh: *${ctx.prefix}jadwal senin* atau cukup *${ctx.prefix}jadwal* untuk hari ini.`
    );
  }

  const listJadwal = queries.getJadwalByHari(targetHari);
  const formattedDay = capitalizeDay(targetHari);

  if (!listJadwal || listJadwal.length === 0) {
    return await ctx.reply(
      `📅 *JADWAL PELAJARAN RPL 2 — ${formattedDay.toUpperCase()}*\n\n` +
      `_Belum ada jadwal yang diatur untuk hari ${formattedDay}._`
    );
  }

  let text = `📅 *JADWAL PELAJARAN RPL 2 — ${formattedDay.toUpperCase()}*\n\n`;
  for (const item of listJadwal) {
    text += `*${item.jam_ke}.* ${item.mapel}\n`;
  }
  text += `\n_Total: ${listJadwal.length} mata pelajaran_`;

  await ctx.reply(text);
}

export default {
  handleGetJadwal,
};
