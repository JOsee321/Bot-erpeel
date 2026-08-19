import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

import config from './config.js';
import { initDB } from './db/init.js';
import { handleIncomingMessage } from './router.js';
import { handleGetJadwal, handleSetJadwal, handleHapusJadwal } from './commands/jadwal.js';
import { handleGetPiket, handleSetPiket, handleHapusPiket } from './commands/piket.js';
import { handleHelp } from './commands/help.js';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

// Map penyimpanan command handler terdaftar
export const commandRegistry = new Map();

/**
 * Mendaftarkan command handler ke registry
 * @param {string|string[]} names - Nama command atau alias
 * @param {Function} handler - Fungsi handler command
 */
export function registerCommand(names, handler) {
  const nameList = Array.isArray(names) ? names : [names];
  for (const name of nameList) {
    commandRegistry.set(name.toLowerCase().trim(), handler);
  }
}

// Registrasi seluruh command bawaan bot
registerCommand(['jadwal'], handleGetJadwal);
registerCommand(['setjadwal'], handleSetJadwal);
registerCommand(['hapusjadwal'], handleHapusJadwal);
registerCommand(['piket'], handleGetPiket);
registerCommand(['setpiket'], handleSetPiket);
registerCommand(['hapuspiket'], handleHapusPiket);
registerCommand(['help', 'menu', 'panduan'], handleHelp);

/**
 * Inisialisasi dan koneksi Baileys WhatsApp Engine
 */
export async function startWhatsAppBot() {
  logger.info('[BOT] Menginisialisasi Database SQLite...');
  initDB();

  logger.info(`[BOT] Memuat Auth State dari ${config.authInfoPath}...`);
  if (!fs.existsSync(config.authInfoPath)) {
    fs.mkdirSync(config.authInfoPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(config.authInfoPath);
  const { version, isLatest } = await fetchLatestBaileysVersion().catch(() => ({
    version: [2, 3000, 1015901307],
    isLatest: false,
  }));

  logger.info(`[BOT] Menggunakan WA Web Version: ${version.join('.')} (isLatest: ${isLatest})`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }), // Sembunyikan internal Baileys verbose log
    printQRInTerminal: false,
    auth: state,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    defaultQueryTimeoutMs: 60000,
  });

  // Handler update status koneksi
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n' + '='.repeat(50));
      console.log('📱 SCAN QR CODE DI BAWAH INI UNTUK LOGIN WHATSAPP:');
      console.log('='.repeat(50));
      qrcode.generate(qr, { small: true });
      console.log('='.repeat(50) + '\n');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode
        : lastDisconnect?.error?.output?.statusCode;

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn(
        `[BOT] Koneksi terputus. Status Code: ${statusCode}, Reason: ${lastDisconnect?.error?.message || 'Unknown'}. Reconnecting: ${shouldReconnect}`
      );

      if (shouldReconnect) {
        logger.info('[BOT] Mencoba menghubungkan kembali dalam 5 detik...');
        setTimeout(() => {
          startWhatsAppBot().catch((err) => logger.error(err, '[BOT] Reconnect failed'));
        }, 5000);
      } else {
        logger.error('[BOT] Device telah logout. Silakan hapus folder auth_info dan scan QR ulang.');
      }
    } else if (connection === 'open') {
      logger.info('====================================================');
      logger.info('🚀 BOT WHATSAPP ASISTEN KELAS BERHASIL TERHUBUNG!');
      logger.info(`⏰ Zona Waktu: ${config.timezone}`);
      logger.info(`👑 Super Admin: ${config.superAdmin || 'Belum diatur'}`);
      logger.info(`👥 Group JID: ${config.groupJid || 'Belum diatur'}`);
      logger.info('====================================================');

      // Hook inisialisasi scheduler (akan diaktifkan pada Tahap 4)
      try {
        const { initScheduler } = await import('./scheduler/cron.js').catch(() => ({ initScheduler: null }));
        if (initScheduler) {
          initScheduler(sock);
        }
      } catch (err) {
        logger.debug('[BOT] Scheduler belum siap atau dalam inisialisasi bertahap');
      }
    }
  });

  // Handler penyimpanan kredensial sesi
  sock.ev.on('creds.update', saveCreds);

  // Handler pesan masuk
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const m of messages) {
      await handleIncomingMessage(sock, m, commandRegistry);
    }
  });

  return sock;
}

// Global process error handlers untuk stabilitas bot
process.on('uncaughtException', (err) => {
  logger.error(err, '[FATAL] Uncaught Exception');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, '[FATAL] Unhandled Rejection');
});

// Jalankan bot jika file ini dieksekusi langsung
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1'))) {
  startWhatsAppBot().catch((err) => {
    logger.error(err, '[BOT] Fatal error saat start');
  });
}

export default startWhatsAppBot;
