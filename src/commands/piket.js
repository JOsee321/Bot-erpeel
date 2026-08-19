import queries from '../db/queries.js';
import { requireAdmin } from '../middleware/isAdmin.js';
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
      `🧹 *PETUGAS PIKET — ${formattedDay.toUpperCase()}*\n\n` +
      `_Belum ada petugas piket yang diatur untuk hari ${formattedDay}._`
    );
  }

  const listNama = piketData.nama_petugas
    .split(',')
    .map((nama) => nama.trim())
    .filter(Boolean);

  let text = `🧹 *PETUGAS PIKET — ${formattedDay.toUpperCase()}*\n\n`;
  for (let i = 0; i < listNama.length; i++) {
    text += `• ${listNama[i]}\n`;
  }
  text += `\n_Semangat menjaga kebersihan kelas! ✨_`;

  await ctx.reply(text);
}

/**
 * Handler command !setpiket <hari> <nama1, nama2, ...> (Admin Only)
 * @param {object} ctx
 */
export async function handleSetPiket(ctx) {
  if (!(await requireAdmin(ctx))) return;

  const hariInput = ctx.args[0];
  const namaInput = ctx.args.slice(1).join(' ').trim();

  if (!hariInput || !namaInput) {
    return await ctx.reply(
      `❌ *Format salah!*\n\n` +
      `Penggunaan: *${ctx.prefix}setpiket <hari> <nama1, nama2, ...>*\n` +
      `Contoh: *${ctx.prefix}setpiket senin Budi, Ani, Siti, Rudi*`
    );
  }

  const hari = hariInput.toLowerCase().trim();
  if (!isValidDay(hari)) {
    return await ctx.reply(
      `❌ Hari *${hariInput}* tidak valid.\n` +
      `Pilihan hari: ${VALID_DAYS.join(', ')}`
    );
  }

  const namaList = namaInput
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  if (namaList.length === 0) {
    return await ctx.reply(`❌ Harap masukkan minimal 1 nama petugas piket dipisahkan dengan koma.`);
  }

  const cleanNamaString = namaList.join(', ');

  try {
    queries.setPiket(hari, cleanNamaString);
    await ctx.reply(
      `✅ *Petugas Piket Berhasil Disimpan!*\n\n` +
      `• Hari: *${capitalizeDay(hari)}*\n` +
      `• Petugas (${namaList.length} orang):\n` +
      namaList.map((n) => `  - ${n}`).join('\n')
    );
  } catch (error) {
    await ctx.reply(`❌ Gagal menyimpan data piket: ${error.message}`);
  }
}

/**
 * Handler command !hapuspiket <hari> (Admin Only)
 * @param {object} ctx
 */
export async function handleHapusPiket(ctx) {
  if (!(await requireAdmin(ctx))) return;

  const hariInput = ctx.args[0];
  if (!hariInput) {
    return await ctx.reply(
      `❌ *Format salah!*\n\n` +
      `Penggunaan: *${ctx.prefix}hapuspiket <hari>*\n` +
      `Contoh: *${ctx.prefix}hapuspiket senin*`
    );
  }

  const hari = hariInput.toLowerCase().trim();
  if (!isValidDay(hari)) {
    return await ctx.reply(
      `❌ Hari *${hariInput}* tidak valid.\n` +
      `Pilihan hari: ${VALID_DAYS.join(', ')}`
    );
  }

  try {
    const result = queries.deletePiket(hari);
    if (result.changes > 0) {
      await ctx.reply(`🗑️ Berhasil menghapus susunan piket hari *${capitalizeDay(hari)}*.`);
    } else {
      await ctx.reply(`ℹ️ Tidak ditemukan susunan piket pada hari *${capitalizeDay(hari)}*.`);
    }
  } catch (error) {
    await ctx.reply(`❌ Gagal menghapus data piket: ${error.message}`);
  }
}

export default {
  handleGetPiket,
  handleSetPiket,
  handleHapusPiket,
};
