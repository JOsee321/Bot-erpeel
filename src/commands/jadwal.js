import queries from '../db/queries.js';
import { requireAdmin } from '../middleware/isAdmin.js';
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
      `📅 *JADWAL PELAJARAN — ${formattedDay.toUpperCase()}*\n\n` +
      `_Belum ada jadwal yang diatur untuk hari ${formattedDay}._`
    );
  }

  let text = `📅 *JADWAL PELAJARAN — ${formattedDay.toUpperCase()}*\n\n`;
  for (const item of listJadwal) {
    text += `*${item.jam_ke}.* ${item.mapel}\n`;
  }
  text += `\n_Total: ${listJadwal.length} mata pelajaran_`;

  await ctx.reply(text);
}

/**
 * Handler command !setjadwal <hari> <jam_ke> <mapel> (Admin Only)
 * @param {object} ctx
 */
export async function handleSetJadwal(ctx) {
  if (!(await requireAdmin(ctx))) return;

  const [hariInput, jamInput, ...mapelArr] = ctx.args;
  const mapel = mapelArr.join(' ').trim();

  if (!hariInput || !jamInput || !mapel) {
    return await ctx.reply(
      `❌ *Format salah!*\n\n` +
      `Penggunaan: *${ctx.prefix}setjadwal <hari> <jam_ke> <mapel>*\n` +
      `Contoh: *${ctx.prefix}setjadwal senin 1 Matematika*`
    );
  }

  const hari = hariInput.toLowerCase().trim();
  if (!isValidDay(hari)) {
    return await ctx.reply(
      `❌ Hari *${hariInput}* tidak valid.\n` +
      `Pilihan hari: ${VALID_DAYS.join(', ')}`
    );
  }

  const jamKe = parseInt(jamInput, 10);
  if (isNaN(jamKe) || jamKe <= 0 || jamKe > 20) {
    return await ctx.reply(`❌ Jam ke- harus berupa angka positif (1 - 20). Contoh: 1`);
  }

  try {
    queries.setJadwal(hari, jamKe, mapel);
    await ctx.reply(
      `✅ *Jadwal Berhasil Disimpan!*\n\n` +
      `• Hari: *${capitalizeDay(hari)}*\n` +
      `• Jam ke-: *${jamKe}*\n` +
      `• Mapel: *${mapel}*`
    );
  } catch (error) {
    await ctx.reply(`❌ Gagal menyimpan jadwal: ${error.message}`);
  }
}

/**
 * Handler command !hapusjadwal <hari> <jam_ke> (Admin Only)
 * @param {object} ctx
 */
export async function handleHapusJadwal(ctx) {
  if (!(await requireAdmin(ctx))) return;

  const [hariInput, jamInput] = ctx.args;

  if (!hariInput || !jamInput) {
    return await ctx.reply(
      `❌ *Format salah!*\n\n` +
      `Penggunaan: *${ctx.prefix}hapusjadwal <hari> <jam_ke>*\n` +
      `Contoh: *${ctx.prefix}hapusjadwal senin 1*`
    );
  }

  const hari = hariInput.toLowerCase().trim();
  if (!isValidDay(hari)) {
    return await ctx.reply(
      `❌ Hari *${hariInput}* tidak valid.\n` +
      `Pilihan hari: ${VALID_DAYS.join(', ')}`
    );
  }

  const jamKe = parseInt(jamInput, 10);
  if (isNaN(jamKe) || jamKe <= 0) {
    return await ctx.reply(`❌ Jam ke- harus berupa angka positif. Contoh: 1`);
  }

  try {
    const result = queries.deleteJadwal(hari, jamKe);
    if (result.changes > 0) {
      await ctx.reply(`🗑️ Berhasil menghapus jadwal *${capitalizeDay(hari)}* jam ke-*${jamKe}*.`);
    } else {
      await ctx.reply(`ℹ️ Tidak ditemukan jadwal pada hari *${capitalizeDay(hari)}* jam ke-*${jamKe}*.`);
    }
  } catch (error) {
    await ctx.reply(`❌ Gagal menghapus jadwal: ${error.message}`);
  }
}

export default {
  handleGetJadwal,
  handleSetJadwal,
  handleHapusJadwal,
};
