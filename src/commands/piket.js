import queries from '../db/queries.js';
import { getTodayDayName, isValidDay, capitalizeDay, VALID_DAYS } from '../utils/date.js';

/**
 * Handler command !piket [hari]
 * @param {object} ctx
 */
export async function handleGetPiket(ctx) {
  let targetHari = ctx.args[0] ? ctx.args[0].toLowerCase().trim() : getTodayDayName();

  if (!isValidDay(targetHari)) {
    return await ctx.reply(
      `❌ Hari *${ctx.args[0]}* tidak valid.\n\n` +
      `Pilihan hari: ${VALID_DAYS.join(', ')}\n` +
      `Contoh: *${ctx.prefix}piket senin* atau cukup *${ctx.prefix}piket* untuk hari ini.`
    );
  }

  const piketData = queries.getPiketByHari(targetHari);
  const formattedDay = capitalizeDay(targetHari);

  if (!piketData || !piketData.nama_petugas) {
    return await ctx.reply(
      `🧹 *PETUGAS PIKET RPL 2 — ${formattedDay.toUpperCase()}*\n\n` +
      `_Belum ada petugas piket yang diatur untuk hari ${formattedDay}._`
    );
  }

  const listNama = piketData.nama_petugas
    .split(',')
    .map((nama) => nama.trim())
    .filter(Boolean);

  let text = `🧹 *PETUGAS PIKET RPL 2 — ${formattedDay.toUpperCase()}*\n\n`;
  for (let i = 0; i < listNama.length; i++) {
    text += `• ${listNama[i]}\n`;
  }
  text += `\n_Semangat menjaga kebersihan kelas! ✨_`;

  await ctx.reply(text);
}

export default {
  handleGetPiket,
};
