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
      `Hari '${ctx.args[0]}' tidak valid.\n` +
      `Pilihan hari: ${VALID_DAYS.join(', ')}\n` +
      `Contoh: ${ctx.prefix}piket senin`
    );
  }

  const piketData = queries.getPiketByHari(targetHari);
  const formattedDay = capitalizeDay(targetHari);

  if (!piketData || !piketData.nama_petugas) {
    return await ctx.reply(
      `*PETUGAS PIKET - ${formattedDay.toUpperCase()}*\n` +
      `----------------------------------------\n` +
      `Belum ada data piket untuk hari ${formattedDay}.`
    );
  }

  const listNama = piketData.nama_petugas
    .split(',')
    .map((nama) => nama.trim())
    .filter(Boolean);

  let text = `*PETUGAS PIKET - ${formattedDay.toUpperCase()}*\n`;
  text += `----------------------------------------\n`;
  for (let i = 0; i < listNama.length; i++) {
    text += `• ${listNama[i]}\n`;
  }

  await ctx.reply(text);
}

export default {
  handleGetPiket,
};
