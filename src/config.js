import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const config = {
  prefix: process.env.PREFIX || '.',
  timezone: process.env.TIMEZONE || 'Asia/Makassar',
  groupJid: process.env.GROUP_JID || '',
  cronJadwalPagi: process.env.CRON_JADWAL_PAGI || '0 6 * * 1-5',
  cronPiketMalam: process.env.CRON_PIKET_MALAM || '0 20 * * 0-4',
  dbPath: process.env.DB_PATH || path.join(rootDir, 'data', 'bot.sqlite'),
  authInfoPath: path.join(rootDir, 'auth_info'),
};

export default config;
