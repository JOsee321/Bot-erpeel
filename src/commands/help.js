/**
 * Handler command !help / !menu
 * @param {object} ctx
 */
export async function handleHelp(ctx) {
  const p = ctx.prefix;

  let text = `*BOT RPL 2*\n`;
  text += `----------------------------------------\n`;
  text += `*Daftar Perintah:*\n`;
  text += `• *${p}jadwal* : Jadwal pelajaran hari ini\n`;
  text += `• *${p}jadwal <hari>* : Jadwal pelajaran hari tertentu\n`;
  text += `• *${p}piket* : Petugas piket hari ini\n`;
  text += `• *${p}piket <hari>* : Petugas piket hari tertentu\n`;
  text += `• *${p}id* : Cek ID / JID obrolan saat ini\n`;
  text += `• *${p}help* : Menampilkan menu ini\n\n`;

  text += `*Pengingat Otomatis (WITA):*\n`;
  text += `• 06:00 WITA : Jadwal pelajaran & piket harian\n`;
  text += `• 20:00 WITA : Reminder piket esok hari (H-1)\n`;
  text += `----------------------------------------\n`;
  text += `Bot Asisten Kelas XI RPL 2`;

  await ctx.reply(text);
}

export default {
  handleHelp,
};
