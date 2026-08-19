# 🤖 Bot WhatsApp Asisten Kelas (Fase 1: Jadwal & Piket)

Bot WhatsApp otomatis berbasis **Node.js (ES Module)** yang berfungsi sebagai sumber informasi tunggal (*single source of truth*) untuk jadwal mata pelajaran dan pembagian petugas piket kelas, dilengkapi sistem pengingat otomatis terjadwal (pagi & malam H-1) dengan zona waktu **Asia/Makassar (WITA / UTC+8)**.

---

## 🌟 Fitur Utama

- 📅 **Jadwal Pelajaran**:
  - `!jadwal` — Menampilkan jadwal pelajaran hari ini.
  - `!jadwal <hari>` — Menampilkan jadwal pelajaran pada hari tertentu (contoh: `!jadwal senin`).
  - `!setjadwal <hari> <jam_ke> <mapel>` — Menambah/mengubah slot jadwal *(Khusus Admin)*.
  - `!hapusjadwal <hari> <jam_ke>` — Menghapus slot jadwal *(Khusus Admin)*.
- 🧹 **Piket Kelas**:
  - `!piket` — Menampilkan daftar petugas piket hari ini.
  - `!piket <hari>` — Menampilkan daftar petugas piket pada hari tertentu (contoh: `!piket rabu`).
  - `!setpiket <hari> <nama1, nama2, ...>` — Menambah/mengubah susunan petugas piket *(Khusus Admin)*.
  - `!hapuspiket <hari>` — Menghapus susunan petugas piket *(Khusus Admin)*.
- 🆔 **Utility JID / Group Helper**:
  - `!id` / `!groupid` — Menampilkan JID / ID obrolan saat ini untuk mempermudah pengisian variabel `GROUP_JID` di `.env`.
- 👑 **Sistem Hak Akses & Permission**:
  - Validasi otomatis nomor WhatsApp admin & super admin sebelum eksekusi command penulisan data.
- ⏰ **Automated Scheduler (WITA)**:
  - **Pagi (06:00 WITA, Senin–Jumat)**: Auto-broadcast jadwal mapel & daftar piket hari berjalan ke grup kelas.
  - **Malam (20:00 WITA, Minggu–Kamis)**: Auto-reminder H-1 daftar petugas piket untuk esok hari.
- 📖 **Menu Bantuan Dinamis**:
  - `!help` / `!menu` — Menampilkan panduan command secara otomatis menyesuaikan role pengirim (Siswa vs Pengurus Kelas).

---

## 🏗️ Struktur Proyek

```
Bot-erpeel/
├── src/
│   ├── index.js          # Entrypoint bot, Baileys socket & QR handler
│   ├── config.js         # Konfigurasi environment variables & path
│   ├── router.js         # Routing pesan & error boundary dispatcher
│   ├── commands/
│   │   ├── jadwal.js     # Handler !jadwal, !setjadwal, !hapusjadwal
│   │   ├── piket.js      # Handler !piket, !setpiket, !hapuspiket
│   │   ├── utility.js    # Handler !id & !groupid
│   │   └── help.js       # Handler !help / !menu
│   ├── db/
│   │   ├── init.js       # Inisialisasi SQLite schema (WAL mode)
│   │   ├── queries.js    # Data access layer & helper queries
│   │   └── seed.js       # Seeder data riil kelas XI RPL 2
│   ├── middleware/
│   │   └── isAdmin.js    # Verifikasi hak akses admin & normalisasi nomor
│   ├── scheduler/
│   │   └── cron.js       # Cron job broadcast pagi & reminder piket H-1
│   └── utils/
│       └── date.js       # Utilitas penanggalan & zona waktu Asia/Makassar
├── test/
│   └── db-test.js        # Smoke test & database seeder validation
├── auth_info/            # Multi-device session Baileys (Git ignored)
├── .env.example          # Template environment variable
├── package.json
└── README.md
```

---

## ⚙️ Persyaratan Sistem

- **Node.js**: Versi 20+ (Direkomendasikan Node.js v22 atau v24)
- **NPM**: Versi 10+
- **Koneksi Internet & Akun WhatsApp** untuk scan QR Multi-device

---

## 🚀 Panduan Instalasi & Penggunaan

### 1. Kloning Repositori & Instal Dependensi
```bash
git clone https://github.com/JOsee321/Bot-erpeel.git
cd Bot-erpeel
npm install
```

### 2. Konfigurasi Environment Variable
Salin `.env.example` menjadi `.env`, lalu sesuaikan nilainya:
```bash
cp .env.example .env
```

Contoh isi `.env`:
```env
PREFIX=!
TIMEZONE=Asia/Makassar
GROUP_JID=120363000000000000@g.us
SUPER_ADMIN=6281234567890
CRON_JADWAL_PAGI=0 6 * * 1-5
CRON_PIKET_MALAM=0 20 * * 0-4
DB_PATH=./data/bot.sqlite
```

### 3. Mengisi Data Riil Kelas (Seeding)
Jalankan script seeder untuk memasukkan jadwal pelajaran & daftar piket kelas XI RPL 2 ke dalam database SQLite:
```bash
npm run seed
```

### 4. Menjalankan Smoke Test
Pastikan seluruh logika database, timezone, dan command handler bekerja dengan baik:
```bash
npm test
```

### 5. Menjalankan Bot
```bash
# Menjalankan bot (Production)
npm start

# Menjalankan bot dengan auto-reload (Development)
npm run dev
```

Saat pertama kali dijalankan, scan QR Code yang muncul di terminal menggunakan fitur **Perangkat Tertaut (Linked Devices)** di aplikasi WhatsApp pada ponsel Anda.

---

## 🛡️ Keamanan & Kredensial

- Folder `auth_info/`, file `.env`, serta file database SQLite `*.sqlite` telah dikonfigurasi di `.gitignore` agar tidak pernah ter-commit ke repositori publik.
- Setiap operasi perubahan data (`!setjadwal`, `!hapusjadwal`, `!setpiket`, `!hapuspiket`) diproteksi middleware `isAdmin`.

---

## 📄 Lisensi
ISC License
