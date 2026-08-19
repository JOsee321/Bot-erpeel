/**
 * Handler command !id / !groupid
 * Menampilkan JID chat saat ini agar mudah disalin ke konfigurasi .env
 * @param {object} ctx
 */
export async function handleGetId(ctx) {
  const isGroup = ctx.isGroup;
  let text = `*INFORMASI ID CHAT*\n`;
  text += `----------------------------------------\n`;
  text += `• Tipe Chat: ${isGroup ? 'Grup WhatsApp' : 'Private Chat'}\n`;
  text += `• Chat ID (JID):\n\`\`\`${ctx.remoteJid}\`\`\`\n\n`;

  if (isGroup) {
    text += `Petunjuk:\nSalin ID di atas dan masukkan ke file .env pada variabel GROUP_JID untuk mengaktifkan broadcast otomatis.\n\n`;
    text += `Contoh di .env:\n\`\`\`GROUP_JID=${ctx.remoteJid}\`\`\``;
  } else {
    text += `• Nomor Pengirim:\n\`\`\`${ctx.senderNumber}\`\`\``;
  }

  await ctx.reply(text);
}

export default {
  handleGetId,
};
