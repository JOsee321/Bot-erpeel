import assert from 'node:assert/strict';
import { initDB } from '../src/db/init.js';
import queries from '../src/db/queries.js';
import { getTodayDayName, getTomorrowDayName, isValidDay, capitalizeDay } from '../src/utils/date.js';
import { handleGetJadwal } from '../src/commands/jadwal.js';
import { handleGetPiket } from '../src/commands/piket.js';
import { handleHelp } from '../src/commands/help.js';
import { handleGetId } from '../src/commands/utility.js';
import { broadcastPagi, broadcastReminderPiketMalam } from '../src/scheduler/cron.js';

console.log('🧪 ========================================================');
console.log('🧪 MEMULAI SMOKE TEST: BOT WHATSAPP RPL 2');
console.log('🧪 ========================================================\n');

// 1. Inisialisasi DB (In-Memory)
console.log('▶ [1/5] Menguji Inisialisasi Database In-Memory & Skema...');
const db = initDB(':memory:');
assert.ok(db, 'Database instance harus berhasil diinisialisasi');
console.log('  ✔ Database berhasil diinisialisasi.\n');

// 2. Pengujian Database Jadwal
console.log('▶ [2/5] Menguji Operasi Database & Logika Jadwal Pelajaran...');
queries.setJadwal('senin', 1, '07:30 - 08:10 : Upacara / Pembiasaan (-)');
queries.setJadwal('senin', 2, '08:10 - 11:05 : Konsentrasi Keahlian / KK (Pak Farid)');
queries.setJadwal('senin', 3, '11:05 - 14:30 : Bahasa Inggris (Bu Suci)');

// Test UPSERT (Update existing slot)
queries.setJadwal('senin', 1, '07:30 - 08:10 : Pembiasaan Karakter');

const jadwalSenin = queries.getJadwalByHari('senin');
assert.equal(jadwalSenin.length, 3, 'Harus ada 3 jadwal pada hari senin');
assert.equal(jadwalSenin[0].mapel, '07:30 - 08:10 : Pembiasaan Karakter', 'Slot 1 harus ter-update');

// Test Hapus Jadwal
const deleteResult = queries.deleteJadwal('senin', 3);
assert.equal(deleteResult.changes, 1, 'Harus berhasil menghapus 1 slot');
const updatedJadwalSenin = queries.getJadwalByHari('senin');
assert.equal(updatedJadwalSenin.length, 2, 'Setelah hapus slot 3, harus tersisa 2');
console.log('  ✔ Database Jadwal berhasil divalidasi.\n');

// 3. Pengujian Database Piket
console.log('▶ [3/5] Menguji Operasi Database & Logika Piket...');
queries.setPiket('senin', 'Hafidz, Reza, Aliya, Brigas, Damaiyah, Dhia');
queries.setPiket('selasa', 'Adry, Hanna, Isa, Kamila, Alief, Ziyad');

// Test UPSERT Piket
queries.setPiket('senin', 'Hafidz, Reza, Aliya, Brigas, Damaiyah, Dhia, Bintang');

const piketSenin = queries.getPiketByHari('senin');
assert.ok(piketSenin, 'Piket senin harus ada');
assert.equal(piketSenin.nama_petugas, 'Hafidz, Reza, Aliya, Brigas, Damaiyah, Dhia, Bintang');

// Test Hapus Piket
const delPiketResult = queries.deletePiket('selasa');
assert.equal(delPiketResult.changes, 1, 'Harus berhasil menghapus piket selasa');
assert.equal(queries.getPiketByHari('selasa'), undefined);
console.log('  ✔ Database Piket berhasil divalidasi.\n');

// 4. Pengujian Timezone & Penanggalan (WITA)
console.log('▶ [4/5] Menguji Utilitas Zona Waktu Asia/Makassar (WITA)...');
const todayName = getTodayDayName();
const tomorrowName = getTomorrowDayName();
assert.ok(isValidDay(todayName), `Hari ini (${todayName}) harus merupakan nama hari valid`);
assert.ok(isValidDay(tomorrowName), `Hari esok (${tomorrowName}) harus merupakan nama hari valid`);
assert.equal(capitalizeDay('senin'), 'Senin');
console.log(`  ✔ Hari ini di WITA: ${capitalizeDay(todayName)}, Besok: ${capitalizeDay(tomorrowName)}`);
console.log('  ✔ Validasi penanggalan zona waktu sukses.\n');

// 5. Simulasi Eksekusi Command & Response Formatting
console.log('▶ [5/5] Menyimulasikan Eksekusi Command Handlers & Broadcast...');

// Helper Context Mocking
function createMockCtx(cmd, args = [], isGroup = true) {
  let repliedText = '';
  return {
    prefix: '!',
    commandName: cmd,
    args,
    senderNumber: '6281234567890',
    remoteJid: isGroup ? '120363421062818190@g.us' : '6281234567890@s.whatsapp.net',
    isGroup,
    reply: async (text) => {
      repliedText = text;
      return text;
    },
    getRepliedText: () => repliedText,
  };
}

// (a) Test Command !jadwal
queries.setJadwal('rabu', 1, '07:30 - 09:30 : Bahasa Indonesia (Bu Anissa)');
const viewJadwalCtx = createMockCtx('jadwal', ['rabu']);
await handleGetJadwal(viewJadwalCtx);
assert.match(viewJadwalCtx.getRepliedText(), /JADWAL PELAJARAN RPL 2/i);
assert.match(viewJadwalCtx.getRepliedText(), /Bahasa Indonesia/);

// (b) Test Command !piket
queries.setPiket('rabu', 'Meilani, Fahry, Wildan, Akmal, Basyir, Joydi');
const viewPiketCtx = createMockCtx('piket', ['rabu']);
await handleGetPiket(viewPiketCtx);
assert.match(viewPiketCtx.getRepliedText(), /PETUGAS PIKET RPL 2/i);
assert.match(viewPiketCtx.getRepliedText(), /Meilani/);

// (c) Test Command !help / !menu (Rebranded)
const helpCtx = createMockCtx('help');
await handleHelp(helpCtx);
assert.match(helpCtx.getRepliedText(), /BOT RPL 2/i);
assert.match(helpCtx.getRepliedText(), /DAFTAR COMMAND/i);
assert.match(helpCtx.getRepliedText(), /!id/);

// (d) Test Utility Command !id
const idCtx = createMockCtx('id', [], true);
await handleGetId(idCtx);
assert.match(idCtx.getRepliedText(), /120363421062818190@g\.us/);
assert.match(idCtx.getRepliedText(), /Grup WhatsApp/);

// (e) Test Seeder data untuk hari ini & besok
queries.setJadwal(todayName, 1, 'Konsentrasi Keahlian / KK');
queries.setPiket(todayName, 'Hafidz, Reza, Aliya');
queries.setPiket(tomorrowName, 'Adry, Hanna, Isa');

// (f) Test Generator Broadcast (Rebranded)
const sentBroadcasts = [];
const mockSock = {
  sendMessage: async (jid, content) => {
    sentBroadcasts.push({ jid, text: content.text });
  },
};

await broadcastPagi(mockSock);
await broadcastReminderPiketMalam(mockSock);

assert.equal(sentBroadcasts.length, 2, 'Harus terkirim 2 broadcast');
assert.match(sentBroadcasts[0].text, /SEMANGAT PAGI RPL 2!/);
assert.match(sentBroadcasts[1].text, /REMINDER PIKET BESOK RPL 2/);

console.log('  ✔ Seluruh simulasi command & broadcast berjalan 100% presisi.\n');

console.log('🎉 ========================================================');
console.log('🎉 SELURUH SMOKE TEST BOT RPL 2 BERHASIL DILALUI DENGAN SUKSES!');
console.log('🎉 ========================================================');
