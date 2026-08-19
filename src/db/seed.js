import { initDB } from './init.js';
import queries from './queries.js';

/**
 * Data Riil Jadwal Pelajaran & Petugas Piket Kelas XI RPL 2
 */
const SEED_JADWAL = [
  // SENIN
  { hari: 'senin', jam_ke: 1, mapel: '07:30 - 08:10 : Upacara / Pembiasaan (-)' },
  { hari: 'senin', jam_ke: 2, mapel: '08:10 - 11:05 : Konsentrasi Keahlian / KK (Pak Farid)' },
  { hari: 'senin', jam_ke: 3, mapel: '11:05 - 14:30 : Bahasa Inggris (Bu Suci)' },
  { hari: 'senin', jam_ke: 4, mapel: '14:30 - 15:50 : Pendidikan Pancasila (Bu Fitri)' },

  // SELASA
  { hari: 'selasa', jam_ke: 1, mapel: '07:30 - 09:30 : Pend. Agama Islam (Pak Zainal Ilmi)' },
  { hari: 'selasa', jam_ke: 2, mapel: '09:45 - 11:05 : Penjaskes (Bu Ilna)' },
  { hari: 'selasa', jam_ke: 3, mapel: '11:05 - 12:25 : Mulok Daerah Banjar (Bu Masrah)' },
  { hari: 'selasa', jam_ke: 4, mapel: '13:10 - 15:50 : Konsentrasi Keahlian / KK (Bu Tika)' },

  // RABU
  { hari: 'rabu', jam_ke: 1, mapel: '07:30 - 09:30 : Bahasa Indonesia (Bu Anissa)' },
  { hari: 'rabu', jam_ke: 2, mapel: '09:45 - 14:30 : Konsentrasi Keahlian / KK (Bu Anis)' },
  { hari: 'rabu', jam_ke: 3, mapel: '14:30 - 15:50 : KIK (Bu Zainab)' },

  // KAMIS
  { hari: 'kamis', jam_ke: 1, mapel: '07:30 - 10:25 : Mata Pelajaran Pilihan / MPP (Pak Dhani)' },
  { hari: 'kamis', jam_ke: 2, mapel: '10:25 - 14:30 : Konsentrasi Keahlian / KK (Pak Khusairi)' },
  { hari: 'kamis', jam_ke: 3, mapel: '14:30 - 15:50 : KIK (Bu Zainab)' },

  // JUMAT
  { hari: 'jumat', jam_ke: 1, mapel: '07:30 - 08:10 : Jumat Taqwa / Senam Pagi (-)' },
  { hari: 'jumat', jam_ke: 2, mapel: '08:10 - 09:30 : Sejarah (Bu Irva)' },
  { hari: 'jumat', jam_ke: 3, mapel: '09:45 - 11:45 : Matematika (Bu Fenty)' },
];

const SEED_PIKET = [
  { hari: 'senin', petugas: 'Hafidz, Reza, Aliya, Brigas, Damaiyah, Dhia' },
  { hari: 'selasa', petugas: 'Adry, Hanna, Isa, Kamila, Alief, Ziyad' },
  { hari: 'rabu', petugas: 'Meilani, Fahry, Wildan, Akmal, Basyir, Joydi' },
  { hari: 'kamis', petugas: 'Nuril, Rizki, Wildad, Natasha, Laili, Rafi' },
  { hari: 'jumat', petugas: 'Rendra, Safina, Said, June, Surya, Thalita' },
];

export function seedDatabase() {
  console.log('[SEED] Memulai seeding data kelas XI RPL 2...');

  initDB();

  console.log('[SEED] Memasukkan Jadwal Pelajaran...');
  for (const item of SEED_JADWAL) {
    queries.setJadwal(item.hari, item.jam_ke, item.mapel);
    console.log(`  - [${item.hari.toUpperCase()}] Slot ${item.jam_ke}: ${item.mapel}`);
  }

  console.log('\n[SEED] Memasukkan Daftar Petugas Piket...');
  for (const item of SEED_PIKET) {
    queries.setPiket(item.hari, item.petugas);
    console.log(`  - [${item.hari.toUpperCase()}]: ${item.petugas}`);
  }

  console.log('\n[SEED] Selesai: Seluruh data jadwal & piket telah aktif.');
}

// Jalankan jika dieksekusi langsung
seedDatabase();
