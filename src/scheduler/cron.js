import cron from 'node-cron';
import pino from 'pino';

import config from '../config.js';
import queries from '../db/queries.js';
import { getTodayDayName, getTomorrowDayName, capitalizeDay } from '../utils/date.js';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

let morningCronJob = null;
let eveningCronJob = null;

/**
 * Format dan kirim broadcast pagi (Jadwal Pelajaran & Petugas Piket hari ini)
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 */
export async function broadcastPagi(sock) {
  if (!config.groupJid) {
    logger.warn('[CRON] GROUP_JID belum diatur di .env. Broadcast pagi dilewati.');
    return;
  }

  const today = getTodayDayName();
  const formattedToday = capitalizeDay(today);
  const listJadwal = queries.getJadwalByHari(today);
  const piketData = queries.getPiketByHari(today);

  let message = `*JADWAL KELAS RPL 2 - ${formattedToday.toUpperCase()}*\n`;
  message += `----------------------------------------\n`;

  // Bagian Jadwal
  message += `*Jadwal Pelajaran:*\n`;
  if (listJadwal && listJadwal.length > 0) {
    for (const item of listJadwal) {
      message += `${item.jam_ke}. ${item.mapel}\n`;
    }
  } else {
    message += `Belum ada data jadwal untuk hari ${formattedToday}.\n`;
  }
  message += `\n`;

  // Bagian Piket
  message += `*Petugas Piket Hari Ini:*\n`;
  if (piketData && piketData.nama_petugas) {
    const listPetugas = piketData.nama_petugas
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);
    for (const nama of listPetugas) {
      message += `• ${nama}\n`;
    }
  } else {
    message += `Belum ada data piket untuk hari ${formattedToday}.\n`;
  }

  try {
    logger.info(`[CRON] Mengirim broadcast pagi ke ${config.groupJid}...`);
    await sock.sendMessage(config.groupJid, { text: message });
    logger.info('[CRON] Broadcast pagi berhasil dikirim.');
  } catch (error) {
    logger.error(error, '[CRON] Gagal mengirim broadcast pagi');
  }
}

/**
 * Format dan kirim broadcast reminder piket malam H-1
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 */
export async function broadcastReminderPiketMalam(sock) {
  if (!config.groupJid) {
    logger.warn('[CRON] GROUP_JID belum diatur di .env. Reminder piket malam dilewati.');
    return;
  }

  const tomorrow = getTomorrowDayName();
  const formattedTomorrow = capitalizeDay(tomorrow);
  const piketData = queries.getPiketByHari(tomorrow);

  let message = `*REMINDER PIKET BESOK (${formattedTomorrow.toUpperCase()})*\n`;
  message += `----------------------------------------\n`;
  message += `*Petugas Piket:*\n`;

  if (piketData && piketData.nama_petugas) {
    const listPetugas = piketData.nama_petugas
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);
    for (const nama of listPetugas) {
      message += `• ${nama}\n`;
    }
    message += `\nHarap datang lebih awal untuk menyiapkan kelas.`;
  } else {
    message += `Belum ada data piket untuk hari ${formattedTomorrow}.\n`;
  }

  try {
    logger.info(`[CRON] Mengirim reminder piket malam H-1 ke ${config.groupJid}...`);
    await sock.sendMessage(config.groupJid, { text: message });
    logger.info('[CRON] Reminder piket malam berhasil dikirim.');
  } catch (error) {
    logger.error(error, '[CRON] Gagal mengirim reminder piket malam');
  }
}

/**
 * Inisialisasi jadwal cron otomatis
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 */
export function initScheduler(sock) {
  // Hentikan cron aktif jika ada (mencegah duplicate listener saat reconnect)
  if (morningCronJob) morningCronJob.stop();
  if (eveningCronJob) eveningCronJob.stop();

  logger.info(`[SCHEDULER] Mengonfigurasi Cron Jobs dengan timezone: ${config.timezone}`);

  // 1. Cron Pagi: Jadwal & Piket hari ini
  if (cron.validate(config.cronJadwalPagi)) {
    morningCronJob = cron.schedule(
      config.cronJadwalPagi,
      () => {
        logger.info('[CRON-TRIGGER] Menjalankan tugas auto-broadcast jadwal pagi...');
        broadcastPagi(sock).catch((err) => logger.error(err, '[CRON-ERROR] broadcastPagi failed'));
      },
      {
        timezone: config.timezone,
      }
    );
    logger.info(`[SCHEDULER] Cron Jadwal Pagi aktif: "${config.cronJadwalPagi}" (${config.timezone})`);
  } else {
    logger.error(`[SCHEDULER] Cron pattern tidak valid: ${config.cronJadwalPagi}`);
  }

  // 2. Cron Malam: Reminder H-1 Petugas Piket esok hari
  if (cron.validate(config.cronPiketMalam)) {
    eveningCronJob = cron.schedule(
      config.cronPiketMalam,
      () => {
        logger.info('[CRON-TRIGGER] Menjalankan tugas auto-reminder piket malam H-1...');
        broadcastReminderPiketMalam(sock).catch((err) => logger.error(err, '[CRON-ERROR] broadcastReminderPiketMalam failed'));
      },
      {
        timezone: config.timezone,
      }
    );
    logger.info(`[SCHEDULER] Cron Piket Malam aktif: "${config.cronPiketMalam}" (${config.timezone})`);
  } else {
    logger.error(`[SCHEDULER] Cron pattern tidak valid: ${config.cronPiketMalam}`);
  }

  return {
    morningCronJob,
    eveningCronJob,
    broadcastPagi,
    broadcastReminderPiketMalam,
  };
}

export default {
  initScheduler,
  broadcastPagi,
  broadcastReminderPiketMalam,
};
