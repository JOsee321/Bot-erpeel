import config from './config.js';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

/**
 * Ekstraksi teks isi pesan dari berbagai jenis payload Baileys
 * @param {import('@whiskeysockets/baileys').proto.IMessage} message
 * @returns {string}
 */
export function extractMessageText(message) {
  if (!message) return '';
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message.templateButtonReplyMessage?.selectedId ||
    ''
  );
}

/**
 * Normalisasi nomor WhatsApp pengirim
 * @param {string} jid
 * @returns {string} Nomor bersih (contoh: '6281234567890')
 */
export function normalizePhoneNumber(jid) {
  if (!jid) return '';
  return jid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
}

/**
 * Router utama untuk memproses event messages.upsert
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} m
 * @param {Map<string, Function>} commandRegistry - Map command handler yang terdaftar
 */
export async function handleIncomingMessage(sock, m, commandRegistry = new Map()) {
  try {
    // Abaikan pesan jika tidak ada isi atau berasal dari bot sendiri
    if (!m.message || m.key.fromMe) return;

    const remoteJid = m.key.remoteJid;
    // Abaikan pesan broadcast status
    if (remoteJid === 'status@broadcast') return;

    const isGroup = remoteJid.endsWith('@g.us');
    const senderJid = isGroup ? (m.key.participant || remoteJid) : remoteJid;
    const senderNumber = normalizePhoneNumber(senderJid);

    const text = extractMessageText(m.message).trim();
    if (!text || !text.startsWith(config.prefix)) return;

    // Parsing prefix, command, dan argument
    const bodyWithoutPrefix = text.slice(config.prefix.length).trim();
    const parts = bodyWithoutPrefix.split(/\s+/);
    const commandName = parts[0]?.toLowerCase();
    const args = parts.slice(1);
    const fullArgs = bodyWithoutPrefix.slice(commandName.length).trim();

    // Helper kirim balasan
    const reply = async (replyText, options = {}) => {
      try {
        return await sock.sendMessage(remoteJid, { text: replyText, ...options }, { quoted: m });
      } catch (err) {
        logger.error(err, `[ROUTER] Gagal mengirim balasan ke ${remoteJid}`);
      }
    };

    const ctx = {
      sock,
      m,
      remoteJid,
      senderJid,
      senderNumber,
      isGroup,
      commandName,
      args,
      fullArgs,
      reply,
      prefix: config.prefix,
    };

    logger.info({
      from: senderNumber,
      chat: remoteJid,
      cmd: commandName,
      args,
    }, `[ROUTER] Command received: ${config.prefix}${commandName}`);

    // Eksekusi command handler jika terdaftar
    const handler = commandRegistry.get(commandName);
    if (handler) {
      try {
        await handler(ctx);
      } catch (cmdError) {
        logger.error(cmdError, `[ROUTER-CMD-ERROR] Error executing command '${commandName}'`);
        await reply(`⚠️ Terjadi kesalahan internal saat memproses perintah *${config.prefix}${commandName}*. Silakan coba beberapa saat lagi.`);
      }
    } else {
      logger.debug(`[ROUTER] Command not found: ${commandName}`);
    }
  } catch (error) {
    logger.error(error, '[ROUTER] Error processing message payload');
  }
}

export default {
  extractMessageText,
  normalizePhoneNumber,
  handleIncomingMessage,
};
