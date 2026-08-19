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
import { handleGetJadwal } from './commands/jadwal.js';
import { handleGetPiket } from './commands/piket.js';
import { handleHelp } from './commands/help.js';
import { handleGetId } from './commands/utility.js';
import { handleGetTanggalMerah } from './commands/tanggalmerah.js';
import logger from './utils/logger.js';

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

// Registrasi seluruh command publik bot
registerCommand(['jadwal'], handleGetJadwal);
registerCommand(['piket'], handleGetPiket);
registerCommand(['tanggalmerah', 'libur'], handleGetTanggalMerah);
registerCommand(['id', 'groupid'], handleGetId);
registerCommand(['help', 'menu', 'panduan'], handleHelp);

/**
 * Inisialisasi dan koneksi Baileys WhatsApp Engine
 */
export async function startWhatsAppBot() {
  logger.info('Menginisialisasi Database SQLite...');
  initDB();

  logger.info('Memuat Auth State dari folder auth_info...');
  if (!fs.existsSync(config.authInfoPath)) {
    fs.mkdirSync(config.authInfoPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(config.authInfoPath);
  const { version, isLatest } = await fetchLatestBaileysVersion().catch(() => ({
    version: [2, 3000, 1015901307],
    isLatest: false,
  }));

  logger.info(`Menggunakan WA Web Version: ${version.join('.')} (isLatest: ${isLatest})`);
  logger.info('Menghubungkan ke WhatsApp...');

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }), // Sembunyikan internal Baileys verbose logs
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
      console.log('SCAN QR CODE DI BAWAH INI UNTUK LOGIN WHATSAPP:');
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
        `Koneksi terputus (Status Code: ${statusCode || 'Unknown'}). Reconnecting: ${shouldReconnect}`
      );

      if (shouldReconnect) {
        logger.info('Mencoba menghubungkan kembali dalam 5 detik...');
        setTimeout(() => {
          startWhatsAppBot().catch((err) => logger.error('Gagal reconnect', err));
        }, 5000);
      } else {
        logger.error('Device telah logout. Silakan hapus folder auth_info dan scan QR ulang.');
      }
    } else if (connection === 'open') {
      console.log('\n====================================================');
      console.log('BOT RPL 2 BERHASIL TERHUBUNG');
      console.log('----------------------------------------------------');
      console.log(`Zona Waktu : ${config.timezone}`);
      console.log(`Group JID  : ${config.groupJid || '(Belum diatur)'}`);
      console.log(`Cron Pagi  : 06:00 WITA (Senin - Jumat)`);
      console.log(`Cron Malam : 20:00 WITA (Minggu - Kamis)`);
      console.log('====================================================\n');

      // Hook inisialisasi scheduler
      try {
        const { initScheduler } = await import('./scheduler/cron.js').catch(() => ({ initScheduler: null }));
        if (initScheduler) {
          initScheduler(sock);
        }
      } catch (err) {
        logger.error('Gagal menginisialisasi scheduler', err);
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
  logger.error('Uncaught Exception', err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason);
});

// Jalankan bot jika file ini dieksekusi langsung
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1'))) {
  startWhatsAppBot().catch((err) => {
    logger.error('Fatal error saat start', err);
  });
}

export default startWhatsAppBot;
