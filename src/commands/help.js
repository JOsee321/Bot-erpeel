import { checkIsAdmin } from '../middleware/isAdmin.js';
import config from '../config.js';

/**
 * Handler command !help / !menu
 * @param {object} ctx
 */
export async function handleHelp(ctx) {
  const isAdminUser = checkIsAdmin(ctx.senderNumber);
  const p = ctx.prefix;

  let text = `🤖 *BOT ASISTEN KELAS (FASE 1)*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Halo! Berikut adalah daftar perintah yang dapat kamu gunakan:\n\n`;

  text += `📌 *COMMAND UMUM (SEMUA SISWA)*\n`;
  text += `• *${p}jadwal* — Lihat jadwal pelajaran hari ini\n`;
  text += `• *${p}jadwal <hari>* — Lihat jadwal hari tertentu\n`;
  text += `  _Contoh: ${p}jadwal senin_\n`;
  text += `• *${p}piket* — Lihat petugas piket hari ini\n`;
  text += `• *${p}piket <hari>* — Lihat petugas piket hari tertentu\n`;
  text += `  _Contoh: ${p}piket rabu_\n`;
  text += `• *${p}help* / *${p}menu* — Tampilkan panduan ini\n\n`;

  if (isAdminUser) {
    text += `👑 *COMMAND PENGURUS KELAS / ADMIN*\n`;
    text += `• *${p}setjadwal <hari> <jam_ke> <mapel>*\n`;
    text += `  _Contoh: ${p}setjadwal senin 1 Matematika_\n`;
    text += `• *${p}hapusjadwal <hari> <jam_ke>*\n`;
    text += `  _Contoh: ${p}hapusjadwal senin 1_\n`;
    text += `• *${p}setpiket <hari> <nama1, nama2, ...>*\n`;
    text += `  _Contoh: ${p}setpiket senin Budi, Ani, Siti_\n`;
    text += `• *${p}hapuspiket <hari>*\n`;
    text += `  _Contoh: ${p}hapuspiket senin_\n\n`;
  }

  text += `⏰ *PENGINGAT OTOMATIS (WITA)*\n`;
  text += `• Pagi (06:00 WITA): Jadwal & piket hari berjalan\n`;
  text += `• Malam (20:00 WITA): Reminder piket esok hari (H-1)\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Status Role: ${isAdminUser ? '👑 Admin / Pengurus' : '👤 Anggota Kelas'}_`;

  await ctx.reply(text);
}

export default {
  handleHelp,
};
