# PRD — Bot RPL 2 (WhatsApp Asisten Kelas XI RPL 2)

**Versi:** 1.1  
**Tanggal:** 19 Agustus 2026  
**Status:** Active / Final Fase 1  
**Scope Rilis:** Bot RPL 2 (Read-Only via WhatsApp Chat, Jadwal & Piket Terstruktur, Auto-Broadcast Timezone Asia/Makassar WITA, Integrasi API Hari Libur Nasional).

---

## 1. Latar Belakang & Masalah

Grup WhatsApp kelas merupakan kanal utama komunikasi siswa, namun informasi esensial harian seperti jadwal mata pelajaran dan giliran piket kebersihan sering kali:
- Tenggelam di antara percakapan harian.
- Ditanyakan berulang kali kepada pengurus kelas.
- Terlupakan tanpa adanya pengingat proaktif dan otomatis.

Bot RPL 2 hadir sebagai sumber informasi tunggal (*single source of truth*) yang menyajikan jadwal pelajaran, giliran piket kelas, informasi hari libur nasional, serta notifikasi otomatis terjadwal langsung di grup kelas tanpa perlu input manual harian.

---

## 2. Tujuan Produk

1. Memberikan akses instan terhadap jadwal pelajaran, susunan piket, dan tanggal merah nasional lewat perintah WhatsApp.
2. Mengirimkan pengingat proaktif otomatis setiap pagi (06:00 WITA) dan malam hari H-1 (20:00 WITA) ke grup kelas.
3. Menjaga stabilitas dan kebersihan data melalui arsitektur *Read-Only* via chat WhatsApp (perubahan data dikelola langsung pada database seeder).

---

## 3. Target Pengguna

| Role | Deskripsi | Akses |
|---|---|---|
| Siswa / Anggota Grup | Seluruh anggota grup kelas XI RPL 2 | Read-Only (Akses seluruh perintah informasi bot) |

---

## 4. Lingkup (Scope)

### 4.1 In-Scope (Fase 1 - Active)
- Perintah melihat jadwal pelajaran hari ini dan per hari (`!jadwal`, `!jadwal <hari>`).
- Perintah melihat daftar petugas piket hari ini dan per hari (`!piket`, `!piket <hari>`).
- Perintah pengecekan hari libur nasional bulan berjalan (`!tanggalmerah` / `!libur`).
- Perintah helper pendeteksi Group JID (`!id` / `!groupid`).
- Panduan menu bantuan ringkas (`!help` / `!menu`).
- Pengingat otomatis pagi (Jadwal & Piket hari ini) pukul 06:00 WITA (Senin–Jumat).
- Pengingat otomatis malam (Reminder H-1 Piket esok hari) pukul 20:00 WITA (Minggu–Kamis).
- Format tampilan teks polos tanpa emoji yang bersih dan terstruktur.

### 4.2 Out-of-Scope (Fase Berikutnya)
- Fitur absensi harian (`!absen`, rekap kehadiran).
- Fitur interaktif tambahan (polling, games, quote generator).
- Integrasi Google Sheets / Web Dashboard.

---

## 5. User Stories

| ID | Sebagai | Saya ingin | Agar |
|---|---|---|---|
| US-1 | Siswa | Melihat jadwal pelajaran hari ini via chat | Tahu mata pelajaran yang harus disiapkan |
| US-2 | Siswa | Melihat jadwal pelajaran hari tertentu | Dapat mempersiapkan buku dan tugas dari malam sebelumnya |
| US-3 | Siswa | Mendapatkan notifikasi jadwal otomatis tiap pagi di grup | Tidak terlambat atau salah membawa perlengkapan |
| US-4 | Siswa | Melihat siapa petugas piket hari ini | Tahu kewajiban piket harian |
| US-5 | Siswa | Mendapatkan reminder piket H-1 malam | Bisa hadir lebih awal keesokan hari untuk membersihkan kelas |
| US-6 | Siswa | Mengetahui tanggal merah / libur nasional bulan ini | Mengetahui agenda libur resmi sekolah |
| US-7 | Siswa | Mengambil Group JID dengan mudah | Konfigurasi target broadcast bot dapat diatur secara presisi |

---

## 6. Functional Requirements

### 6.1 Command: Jadwal Pelajaran

| Command | Akses | Deskripsi | Format Output |
|---|---|---|---|
| `!jadwal` | Semua | Menampilkan jadwal pelajaran hari ini | `*JADWAL PELAJARAN - [HARI]*\n----------------------------------------\n1. [Jam] : [Mapel]...` |
| `!jadwal <hari>` | Semua | Menampilkan jadwal hari tertentu | `!jadwal senin`, `!jadwal jumat`, dll. |

### 6.2 Command: Petugas Piket

| Command | Akses | Deskripsi | Format Output |
|---|---|---|---|
| `!piket` | Semua | Menampilkan petugas piket hari ini | `*PETUGAS PIKET - [HARI]*\n----------------------------------------\n• [Nama 1]\n• [Nama 2]...` |
| `!piket <hari>` | Semua | Menampilkan piket hari tertentu | `!piket rabu`, `!piket kamis`, dll. |

### 6.3 Command: Tanggal Merah (Hari Libur Nasional)

| Command | Akses | Deskripsi | Sumber Data & Format Output |
|---|---|---|---|
| `!tanggalmerah` / `!libur` | Semua | Menampilkan daftar libur nasional bulan berjalan | Integrasi API publik `api-hari-libur.vercel.app`\n`*TANGGAL MERAH - [BULAN] [TAHUN]*\n----------------------------------------\n• [DD MMMM YYYY] : [Keterangan Libur]` |

### 6.4 Command: Utility Group ID & Help

| Command | Akses | Deskripsi | Format Output |
|---|---|---|---|
| `!id` / `!groupid` | Semua | Menampilkan JID obrolan saat ini | Menampilkan string JID grup/private untuk disalin ke `.env` |
| `!help` / `!menu` | Semua | Menampilkan daftar seluruh perintah aktif | Panduan menu bot yang ringkas dan bersih |

### 6.5 Automated Broadcast Scheduler

| Trigger | Waktu & Jadwal | Aksi |
|---|---|---|
| Broadcast Pagi | 06:00 WITA (Senin–Jumat) | Mengirimkan ringkasan jadwal mapel & daftar piket hari berjalan ke `GROUP_JID` |
| Reminder Malam | 20:00 WITA (Minggu–Kamis) | Mengirimkan reminder H-1 daftar petugas piket untuk esok hari ke `GROUP_JID` |

---

## 7. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Platform & Runtime | Node.js v20+ (ES Module / `"type": "module"`), `@whiskeysockets/baileys` Multi-device |
| Database | SQLite lokal via `node:sqlite` DatabaseSync |
| Timezone | **Asia/Makassar (WITA / UTC+8)** wajib terikat pada seluruh logika cron dan penanggalan harian |
| Format Output | Teks polos terstruktur tanpa emoji (*clean plain text with dividers*) |
| Waktu Respons | Perintah dijawab dalam waktu < 3 detik dalam kondisi normal |
| Persistensi Sesi | Auth credentials tersimpan lokal pada folder `auth_info/` |
| Keamanan | Folder `auth_info/`, database `*.sqlite`, dan file `.env` diisolasi di `.gitignore` |
| Ketahanan Error | Global error boundaries dan handler timeout API untuk mencegah crash proses |

---

## 8. Struktur Data SQLite

```sql
-- Jadwal Pelajaran
CREATE TABLE IF NOT EXISTS jadwal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hari TEXT NOT NULL,
  jam_ke INTEGER NOT NULL,
  mapel TEXT NOT NULL,
  UNIQUE(hari, jam_ke)
);

-- Susunan Petugas Piket
CREATE TABLE IF NOT EXISTS piket (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hari TEXT NOT NULL UNIQUE,
  nama_petugas TEXT NOT NULL
);
```

---

## 9. Struktur Direktori Proyek

```
Bot-erpeel/
├── src/
│   ├── index.js          # Entrypoint bot & event listeners Baileys
│   ├── config.js         # Konfigurasi environment variables & path
│   ├── router.js         # Message router & command dispatcher
│   ├── commands/
│   │   ├── jadwal.js     # Handler !jadwal
│   │   ├── piket.js      # Handler !piket
│   │   ├── tanggalmerah.js # Handler !tanggalmerah / !libur (API Hari Libur)
│   │   ├── utility.js    # Handler !id & !groupid
│   │   └── help.js       # Handler !help & !menu
│   ├── db/
│   │   ├── init.js       # Inisialisasi SQLite database schema
│   │   ├── queries.js    # Data access layer & helper queries
│   │   └── seed.js       # Seeder data riil kelas XI RPL 2
│   ├── scheduler/
│   │   └── cron.js       # Auto-broadcast pagi (06:00) & malam (20:00)
│   └── utils/
│       ├── date.js       # Utilitas zona waktu Asia/Makassar (WITA)
│       └── logger.js     # Human-readable console logger
├── test/
│   └── db-test.js        # Automated smoke test suite
├── auth_info/            # WhatsApp session store (Git ignored)
├── .env.example
├── package.json
└── README.md
```