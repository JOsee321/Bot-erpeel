# Bot RPL 2 (WhatsApp Kelas XI RPL 2)

Bot WhatsApp asisten kelas berbasis **Node.js (ES Module)** yang berfungsi sebagai sumber informasi tunggal (*single source of truth*) untuk jadwal mata pelajaran dan giliran piket kelas **XI RPL 2**, dilengkapi sistem pengingat otomatis terjadwal (pagi & malam H-1) dengan zona waktu **Asia/Makassar (WITA / UTC+8)**.

---

## Fitur Utama

- **Jadwal Pelajaran (Read-Only)**
  - `.jadwal` — Menampilkan jadwal mata pelajaran hari ini.
  - `.jadwal <hari>` — Menampilkan jadwal mata pelajaran pada hari tertentu (contoh: `.jadwal senin`, `.jadwal rabu`).
- **Piket Kelas (Read-Only)**
  - `.piket` — Menampilkan daftar petugas piket hari ini.
  - `.piket <hari>` — Menampilkan daftar petugas piket pada hari tertentu (contoh: `.piket selasa`, `.piket kamis`).
- **Hari Libur Nasional**
  - `.tanggalmerah` / `.libur` — Menampilkan daftar hari libur nasional bulan berjalan dari API publik resmi.
- **Menu Bantuan**
  - `.help` / `.menu` / `.panduan` — Menampilkan panduan seluruh perintah yang aktif.
- **Utilitas Pengelola (Hidden Owner Utility)**
  - `.id` / `.groupid` — Menampilkan ID / JID obrolan saat ini untuk mempermudah konfigurasi variabel `GROUP_JID` di file `.env`.
- **Pengingat Otomatis Terjadwal (WITA)**
  - **Pagi (06:00 WITA, Senin–Jumat)**: Auto-broadcast ringkasan jadwal mapel & daftar piket hari ini ke grup kelas.
  - **Malam (20:00 WITA, Minggu–Kamis)**: Auto-reminder H-1 daftar petugas piket untuk esok hari ke grup kelas.
- **Tampilan Pesan Bersih & Simpel**
  - Seluruh respons bot disajikan dalam format teks minimalis, rapi, dan mudah dibaca tanpa emoji maupun garis pembatas berulang.

---

## Contoh Output Perintah

### Menu Bantuan (`.help`)
```
*BOT RPL 2*

*Daftar Perintah:*
• *.jadwal* : Jadwal pelajaran hari ini
• *.jadwal <hari>* : Jadwal pelajaran hari tertentu
• *.piket* : Petugas piket hari ini
• *.piket <hari>* : Petugas piket hari tertentu
• *.tanggalmerah* : Cek hari libur nasional bulan ini
• *.help* : Menampilkan menu ini

*Pengingat Otomatis (WITA):*
• 06:00 WITA : Jadwal pelajaran & piket harian
• 20:00 WITA : Reminder piket esok hari (H-1)

Bot XI RPL 2
```

### Jadwal Pelajaran (`.jadwal senin`)
```
*JADWAL PELAJARAN - SENIN*

1. 07:30 - 08:10 : Upacara / Pembiasaan (-)
2. 08:10 - 11:05 : Konsentrasi Keahlian / KK (Pak Farid)
3. 11:05 - 14:30 : Bahasa Inggris (Bu Suci)
4. 14:30 - 15:50 : Pendidikan Pancasila (Bu Fitri)

Total: 4 mata pelajaran
```

### Petugas Piket (`.piket senin`)
```
*PETUGAS PIKET - SENIN*

• Hafidz
• Reza
• Aliya
• Brigas
• Damaiyah
• Dhia
```

### Hari Libur Nasional (`.tanggalmerah`)
```
*TANGGAL MERAH - AGUSTUS 2026*

• 17 Agustus 2026 : Hari Kemerdekaan Republik Indonesia
• 25 Agustus 2026 : Maulid Nabi Muhammad SAW
```

---

## Struktur Proyek

```
Bot-erpeel/
├── src/
│   ├── index.js          # Entrypoint bot, Baileys socket & QR handler
│   ├── config.js         # Konfigurasi environment variables & path
│   ├── router.js         # Router pesan, parsing prefix, dan dispatcher
│   ├── commands/
│   │   ├── jadwal.js     # Handler .jadwal
│   │   ├── piket.js      # Handler .piket
│   │   ├── tanggalmerah.js # Handler .tanggalmerah & .libur (API Hari Libur)
│   │   ├── utility.js    # Handler .id & .groupid (Hidden command)
│   │   └── help.js       # Handler .help, .menu, .panduan
│   ├── db/
│   │   ├── init.js       # Inisialisasi koneksi SQLite & skema tabel
│   │   ├── queries.js    # Data access layer (CRUD queries jadwal & piket)
│   │   └── seed.js       # Seeder data riil kelas XI RPL 2
│   ├── scheduler/
│   │   └── cron.js       # Cron scheduler broadcast pagi (06:00) & malam (20:00)
│   └── utils/
│       ├── date.js       # Utilitas penanggalan & zona waktu Asia/Makassar (WITA)
│       └── logger.js     # Human-readable console logger
├── test/
│   └── db-test.js        # Smoke test & validation suite
├── auth_info/            # Folder sesi multi-device Baileys (Git ignored)
├── data/                 # Penyimpanan file database SQLite (Git ignored)
├── .env.example          # Template konfigurasi environment variable
├── package.json
└── README.md
```

---

## Persyaratan Sistem

- **Node.js**: Versi 20+ (Direkomendasikan Node.js v22 atau v24)
- **NPM**: Versi 10+
- **Koneksi Internet & Akun WhatsApp** untuk autentikasi QR Multi-device

---

## Panduan Instalasi & Penggunaan

### 1. Kloning Repositori & Instal Dependensi
```bash
git clone https://github.com/JOsee321/Bot-erpeel.git
cd Bot-erpeel
npm install
```

### 2. Konfigurasi Environment Variable
Salin berkas `.env.example` menjadi `.env`, lalu sesuaikan nilainya:
```bash
cp .env.example .env
```

Isi berkas `.env`:
```env
PREFIX=.
TIMEZONE=Asia/Makassar
GROUP_JID=120363421062818190@g.us
CRON_JADWAL_PAGI=0 6 * * 1-5
CRON_PIKET_MALAM=0 20 * * 0-4
DB_PATH=./data/bot.sqlite
```

> **Catatan:** Anda dapat mengirimkan perintah `.id` di dalam grup kelas untuk mendapatkan JID grup target (`GROUP_JID`).

### 3. Mengisi Data Riil Kelas (Database Seeder)
Jalankan script seeder untuk memasukkan jadwal pelajaran & daftar petugas piket kelas XI RPL 2 ke dalam database SQLite:
```bash
npm run seed
```

### 4. Menjalankan Smoke Test
Pastikan seluruh integrasi database, zona waktu, penanggalan, dan eksekusi command handler berjalan sempurna:
```bash
npm test
```

### 5. Menjalankan Bot
```bash
# Menjalankan bot (Mode Production)
npm start

# Menjalankan bot dengan auto-reload (Mode Development)
npm run dev
```

Saat pertama kali dijalankan, scan QR Code yang muncul di terminal menggunakan fitur **Perangkat Tertaut (Linked Devices)** di aplikasi WhatsApp pada ponsel Anda.

---

## Keamanan & Integritas Data

- Folder sesi WhatsApp (`auth_info/`), berkas `.env`, dan file database SQLite (`*.sqlite`) telah dilindungi di `.gitignore` agar tidak pernah terunggah ke repositori publik.
- Seluruh interaksi chat WhatsApp bersifat murni *read-only* guna mencegah pengubahan data tanpa izin oleh anggota grup. Perubahan data jadwal dan piket dikelola langsung melalui seeder oleh pemilik bot.

---

## Lisensi
ISC License
