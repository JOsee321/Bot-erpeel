/**
 * Handler command .help / .menu / .panduan
 * @param {object} ctx
 */
export async function handleHelp(ctx) {
  const p = ctx.prefix;

  let text = `*BOT RPL 2*\n\n`;
  text += `*Daftar Perintah:*\n`;
  text += `• *${p}jadwal* : Jadwal pelajaran hari ini\n`;
  text += `• *${p}jadwal <hari>* : Jadwal pelajaran hari tertentu\n`;
  text += `• *${p}piket* : Petugas piket hari ini\n`;
  text += `• *${p}piket <hari>* : Petugas piket hari tertentu\n`;
  text += `• *${p}tanggalmerah* : Cek hari libur nasional bulan ini\n`;
  text += `• *${p}help* : Menampilkan menu ini\n\n`;

  text += `*Pengingat Otomatis (WITA):*\n`;
  text += `• 06:00 WITA : Jadwal pelajaran & piket harian\n`;
  text += `• 20:00 WITA : Reminder piket esok hari (H-1)\n\n`;
  text += `Bot XI RPL 2`;

  await ctx.reply(text.trim());
}

export default {
  handleHelp,
};
