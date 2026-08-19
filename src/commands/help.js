/**
 * Handler command !help / !menu
 * @param {object} ctx
 */
export async function handleHelp(ctx) {
  const p = ctx.prefix;

  let text = `🤖 *BOT RPL 2*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Halo! Berikut adalah daftar perintah yang dapat kamu gunakan:\n\n`;

  text += `📌 *DAFTAR COMMAND*\n`;
  text += `• *${p}jadwal* — Lihat jadwal pelajaran hari ini\n`;
  text += `• *${p}jadwal <hari>* — Lihat jadwal hari tertentu\n`;
  text += `  _Contoh: ${p}jadwal senin_\n`;
  text += `• *${p}piket* — Lihat petugas piket hari ini\n`;
  text += `• *${p}piket <hari>* — Lihat petugas piket hari tertentu\n`;
  text += `  _Contoh: ${p}piket rabu_\n`;
  text += `• *${p}id* / *${p}groupid* — Cek Chat JID / Group ID saat ini\n`;
  text += `• *${p}help* / *${p}menu* — Tampilkan panduan ini\n\n`;

  text += `⏰ *PENGINGAT OTOMATIS (WITA)*\n`;
  text += `• Pagi (06:00 WITA): Jadwal & piket hari berjalan\n`;
  text += `• Malam (20:00 WITA): Reminder piket esok hari (H-1)\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Bot Asisten Kelas XI RPL 2_`;

  await ctx.reply(text);
}

export default {
  handleHelp,
};
