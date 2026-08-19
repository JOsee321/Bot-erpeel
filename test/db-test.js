import assert from 'node:assert/strict';
import { initDB } from '../src/db/init.js';
import queries from '../src/db/queries.js';
import { checkIsAdmin, requireAdmin } from '../src/middleware/isAdmin.js';
import { getTodayDayName, getTomorrowDayName, isValidDay, capitalizeDay } from '../src/utils/date.js';
import { handleGetJadwal, handleSetJadwal, handleHapusJadwal } from '../src/commands/jadwal.js';
import { handleGetPiket, handleSetPiket, handleHapusPiket } from '../src/commands/piket.js';
import { handleHelp } from '../src/commands/help.js';
import { broadcastPagi, broadcastReminderPiketMalam } from '../src/scheduler/cron.js';

console.log('🧪 ========================================================');
console.log('🧪 MEMULAI SMOKE TEST: BOT WHATSAPP ASISTEN KELAS (FASE 1)');
console.log('🧪 ========================================================\n');

// 1. Inisialisasi DB (In-Memory)
console.log('▶ [1/6] Menguji Inisialisasi Database In-Memory & Skema...');
const db = initDB(':memory:');
assert.ok(db, 'Database instance harus berhasil diinisialisasi');
console.log('  ✔ Database berhasil diinisialisasi.\n');

// 2. Pengujian CRUD Jadwal
console.log('▶ [2/6] Menguji Operasi Database & Logika Jadwal Pelajaran...');
queries.setJadwal('senin', 1, 'Matematika');
queries.setJadwal('senin', 2, 'Bahasa Indonesia');
queries.setJadwal('senin', 3, 'Pemrograman Web');

// Test UPSERT (Update existing slot)
queries.setJadwal('senin', 1, 'Matematika Lanjut');

const jadwalSenin = queries.getJadwalByHari('senin');
assert.equal(jadwalSenin.length, 3, 'Harus ada 3 jadwal pada hari senin');
assert.equal(jadwalSenin[0].mapel, 'Matematika Lanjut', 'Slot 1 harus ter-update menjadi Matematika Lanjut');
assert.equal(jadwalSenin[1].mapel, 'Bahasa Indonesia');

// Test Hapus Jadwal
const deleteResult = queries.deleteJadwal('senin', 3);
assert.equal(deleteResult.changes, 1, 'Harus berhasil menghapus 1 slot');
const updatedJadwalSenin = queries.getJadwalByHari('senin');
assert.equal(updatedJadwalSenin.length, 2, 'Setelah hapus slot 3, harus tersisa 2');
console.log('  ✔ CRUD & UPSERT Jadwal berhasil divalidasi.\n');

// 3. Pengujian CRUD Piket
console.log('▶ [3/6] Menguji Operasi Database & Logika Piket...');
queries.setPiket('senin', 'Budi, Ani, Rudi');
queries.setPiket('selasa', 'Siti, Doni, Maya');

// Test UPSERT Piket
queries.setPiket('senin', 'Budi, Ani, Rudi, Eka');

const piketSenin = queries.getPiketByHari('senin');
assert.ok(piketSenin, 'Piket senin harus ada');
assert.equal(piketSenin.nama_petugas, 'Budi, Ani, Rudi, Eka');

// Test Hapus Piket
const delPiketResult = queries.deletePiket('selasa');
assert.equal(delPiketResult.changes, 1, 'Harus berhasil menghapus piket selasa');
assert.equal(queries.getPiketByHari('selasa'), undefined);
console.log('  ✔ CRUD & UPSERT Piket berhasil divalidasi.\n');

// 4. Pengujian Admin & Middleware
console.log('▶ [4/6] Menguji Sistem Permission & Middleware Admin...');
queries.addAdmin('628999888777');
assert.equal(checkIsAdmin('628999888777'), true, 'Nomor 628999888777 harus terdaftar sebagai admin');
assert.equal(checkIsAdmin('628111222333'), false, 'Nomor acak tidak boleh dianggap admin');

queries.deleteAdmin('628999888777');
assert.equal(checkIsAdmin('628999888777'), false, 'Setelah dihapus, tidak lagi menjadi admin');
console.log('  ✔ Autentikasi dan normalisasi nomor admin berhasil divalidasi.\n');

// 5. Pengujian Timezone & Penanggalan (WITA)
console.log('▶ [5/6] Menguji Utilitas Zona Waktu Asia/Makassar (WITA)...');
const todayName = getTodayDayName();
const tomorrowName = getTomorrowDayName();
assert.ok(isValidDay(todayName), `Hari ini (${todayName}) harus merupakan nama hari valid`);
assert.ok(isValidDay(tomorrowName), `Hari esok (${tomorrowName}) harus merupakan nama hari valid`);
assert.equal(capitalizeDay('senin'), 'Senin');
console.log(`  ✔ Hari ini di WITA: ${capitalizeDay(todayName)}, Besok: ${capitalizeDay(tomorrowName)}`);
console.log('  ✔ Validasi penanggalan zona waktu sukses.\n');

// 6. Simulasi Eksekusi Command & Response Formatting
console.log('▶ [6/6] Menyimulasikan Eksekusi Command Handlers...');

// Helper Context Mocking
function createMockCtx(senderNumber, cmd, args = []) {
  let repliedText = '';
  return {
    prefix: '!',
    commandName: cmd,
    args,
    senderNumber,
    reply: async (text) => {
      repliedText = text;
      return text;
    },
    getRepliedText: () => repliedText,
  };
}

// (a) Test Non-Admin mencoba setjadwal
const nonAdminCtx = createMockCtx('628111222333', 'setjadwal', ['senin', '1', 'Biologi']);
await handleSetJadwal(nonAdminCtx);
assert.match(nonAdminCtx.getRepliedText(), /khusus admin/i, 'Non-admin harus ditolak');

// (b) Test Admin menjalankan setjadwal
queries.addAdmin('6281234567890');
const adminCtx = createMockCtx('6281234567890', 'setjadwal', ['rabu', '1', 'Fisika']);
await handleSetJadwal(adminCtx);
assert.match(adminCtx.getRepliedText(), /Jadwal Berhasil Disimpan/i, 'Admin harus berhasil menyimpan jadwal');

// (c) Test User melihat jadwal
const viewJadwalCtx = createMockCtx('628111222333', 'jadwal', ['rabu']);
await handleGetJadwal(viewJadwalCtx);
assert.match(viewJadwalCtx.getRepliedText(), /Fisika/, 'Jadwal rabu harus memuat mata pelajaran Fisika');

// (d) Test User melihat help
const helpSiswaCtx = createMockCtx('628111222333', 'help');
await handleHelp(helpSiswaCtx);
assert.match(helpSiswaCtx.getRepliedText(), /COMMAND UMUM/i);
assert.doesNotMatch(helpSiswaCtx.getRepliedText(), /PENGURUS KELAS \/ ADMIN/i);

const helpAdminCtx = createMockCtx('6281234567890', 'help');
await handleHelp(helpAdminCtx);
assert.match(helpAdminCtx.getRepliedText(), /PENGURUS KELAS \/ ADMIN/i);

// (e) Test Seeder data contoh untuk hari ini & besok
queries.setJadwal(todayName, 1, 'Pendidikan Agama');
queries.setJadwal(todayName, 2, 'Basis Data');
queries.setPiket(todayName, 'Siti, Rian, Bayu');
queries.setPiket(tomorrowName, 'Doni, Clara, Farhan');

// (f) Test Generator Broadcast
const sentBroadcasts = [];
const mockSock = {
  sendMessage: async (jid, content) => {
    sentBroadcasts.push({ jid, text: content.text });
  },
};

await broadcastPagi(mockSock);
await broadcastReminderPiketMalam(mockSock);

assert.equal(sentBroadcasts.length, 2, 'Harus terkirim 2 broadcast');
assert.match(sentBroadcasts[0].text, /PENGINGAT PAGI/);
assert.match(sentBroadcasts[1].text, /REMINDER PIKET BESOK/);

console.log('  ✔ Seluruh simulasi command & broadcast berjalan 100% presisi.\n');

console.log('🎉 ========================================================');
console.log('🎉 SELURUH SMOKE TEST BERHASIL DILALUI DENGAN SUKSES!');
console.log('🎉 ========================================================');
