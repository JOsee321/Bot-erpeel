# PRD — Bot WhatsApp Asisten Kelas

**Versi:** 1.0
**Tanggal:** 19 Agustus 2026
**Status:** Draft
**Scope Rilis:** Fase 1 — Jadwal Pelajaran & Piket

---

## 1. Latar Belakang & Masalah

Grup WhatsApp kelas biasanya jadi satu-satunya kanal komunikasi kelas, tapi informasi penting seperti jadwal pelajaran dan giliran piket sering:
- Tenggelam di antara chat non-penting
- Harus ditanya ulang berkali-kali ke pengurus kelas
- Tidak ada pengingat otomatis, sehingga siswa lupa piket atau salah kira jadwal

Dibutuhkan bot otomatis yang berjalan di grup WhatsApp kelas sebagai sumber informasi tunggal (single source of truth) untuk jadwal dan piket, sekaligus mengirim pengingat proaktif tanpa perlu pengurus kelas mengetik manual tiap hari.

## 2. Tujuan Produk

1. Menyediakan akses cepat ke jadwal pelajaran dan jadwal piket lewat command WhatsApp.
2. Mengurangi beban pengurus kelas dalam mengingatkan piket/jadwal secara manual.
3. Memberi pengingat otomatis terjadwal (jadwal pagi hari, piket H-1).
4. Menjaga integritas data — hanya admin/pengurus kelas yang bisa mengubah jadwal & piket.

## 3. Target Pengguna

| Role | Deskripsi | Akses |
|---|---|---|
| Siswa (anggota grup) | Semua anggota grup kelas | Read-only: lihat jadwal & piket |
| Admin (pengurus kelas) | Ketua kelas/sekretaris/wali yang ditunjuk | Read + Write: set/update jadwal & piket |

## 4. Lingkup (Scope)

### 4.1 In-scope (Fase 1)
- Command lihat jadwal pelajaran (per hari / hari ini)
- Command set/update jadwal pelajaran (admin only)
- Command lihat piket (hari ini / per hari)
- Command set/update piket (admin only)
- Auto-post jadwal pelajaran tiap pagi
- Auto-reminder piket H-1 malam
- Sistem permission admin berbasis nomor WA

### 4.2 Out-of-scope (Fase 1, dijadwalkan fase berikutnya)
- Fitur absensi (`!absen`, rekap kehadiran)
- Dashboard/web admin
- Integrasi Google Sheets/Calendar
- Polling, game, quote random, dan fitur interaksi ringan lain
- Multi-grup / multi-kelas dalam satu instance bot

## 5. User Stories

| ID | Sebagai | Saya ingin | Agar |
|---|---|---|---|
| US-1 | Siswa | Melihat jadwal pelajaran hari ini via chat | Tidak perlu tanya teman/pengurus |
| US-2 | Siswa | Melihat jadwal pelajaran hari tertentu | Bisa siapkan buku/tugas dari malam sebelumnya |
| US-3 | Siswa | Mendapat notifikasi jadwal otomatis tiap pagi | Tidak ketinggalan info tanpa harus buka command |
| US-4 | Siswa | Melihat siapa piket hari ini | Tahu kewajiban piket tanpa nanya |
| US-5 | Siswa (petugas piket) | Mendapat reminder H-1 malam | Tidak lupa piket keesokan hari |
| US-6 | Admin | Mengatur/mengubah jadwal pelajaran per hari per jam | Data selalu akurat mengikuti perubahan sekolah |
| US-7 | Admin | Mengatur/mengubah susunan piket per hari | Bisa rotasi piket sesuai kebutuhan |
| US-8 | Admin | Command sensitif tidak bisa dipakai siswa biasa | Data tidak diubah sembarangan/iseng |

## 6. Functional Requirements

### 6.1 Command: Jadwal Pelajaran

| Command | Akses | Deskripsi | Contoh Output |
|---|---|---|---|
| `!jadwal` | Semua | Tampilkan jadwal hari ini | "📅 Jadwal Senin:\n1. Matematika\n2. B. Indonesia\n..." |
| `!jadwal <hari>` | Semua | Tampilkan jadwal hari tertentu | `!jadwal rabu` |
| `!setjadwal <hari> <jam> <mapel>` | Admin | Set/update satu slot jadwal | `!setjadwal senin 1 matematika` |
| `!hapusjadwal <hari> <jam>` | Admin | Hapus satu slot jadwal | `!hapusjadwal senin 1` |

**Validasi:**
- Hari harus salah satu dari: senin–jumat (bisa ditambah sabtu jika sekolah masuk)
- Jam ke- harus angka positif, batas maks jam pelajaran per hari (misal 10)
- Jika hari/format salah → bot balas pesan error yang jelas + contoh format benar

### 6.2 Command: Piket

| Command | Akses | Deskripsi | Contoh Output |
|---|---|---|---|
| `!piket` | Semua | Tampilkan petugas piket hari ini | "🧹 Piket hari ini: Budi, Ani, Rudi" |
| `!piket <hari>` | Semua | Tampilkan piket hari tertentu | `!piket jumat` |
| `!setpiket <hari> <nama1,nama2,...>` | Admin | Set/update susunan piket hari tsb | `!setpiket senin budi,ani,rudi` |

**Validasi:**
- Minimal 1 nama per hari
- Nama dipisah koma, auto-trim spasi
- Jika hari tidak valid → error message

### 6.3 Auto-Reminder (Scheduler)

| Trigger | Waktu | Aksi |
|---|---|---|
| Jadwal pagi | Setiap hari sekolah, 06:00 WIB | Bot kirim jadwal hari itu otomatis ke grup |
| Reminder piket | Setiap hari sekolah, 20:00 WIB (H-1) | Bot kirim siapa piket besok |

- Waktu default di atas, tapi harus dikonfigurasi lewat file config (`config.js` / `.env`), bukan hardcode
- Jika hari libur (weekend) → tidak kirim, kecuali dikonfigurasi masuk

### 6.4 Admin & Permission

- Daftar nomor admin disimpan di storage (tabel `admin` atau config)
- Command `!setjadwal`, `!hapusjadwal`, `!setpiket` → dicek dulu nomor pengirim ada di daftar admin
- Jika bukan admin mencoba command tersebut → bot balas: "❌ Command ini khusus admin/pengurus kelas."
- Command tambahan admin-only (opsional Fase 1): `!addadmin <nomor>`, `!deladmin <nomor>` — hanya bisa dijalankan oleh admin yang sudah terdaftar

### 6.5 Help Command

- `!help` atau `!menu` → daftar semua command yang tersedia sesuai role pengirim (siswa lihat command umum, admin lihat command umum + admin)

## 7. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Platform | Node.js + Baileys (`@whiskeysockets/baileys`), koneksi WA multi-device |
| Storage | SQLite (`better-sqlite3`) — lokal, tanpa server DB terpisah |
| Scheduler | `node-cron`, timezone Asia/Jakarta |
| Uptime | Bot harus always-on (VPS kecil / Raspberry Pi / PC yang tidak mati); reconnect otomatis jika koneksi Baileys putus |
| Response time | Command dibalas < 3 detik dalam kondisi normal |
| Session persistence | Auth session Baileys disimpan lokal (`auth_info/`) agar tidak perlu scan QR ulang tiap restart |
| Keamanan | Session folder & file config nomor admin tidak boleh ter-commit ke repo publik (masuk `.gitignore`) |
| Data integrity | Semua write jadwal/piket melalui validasi input sebelum masuk DB |
| Bahasa | Semua pesan bot berbahasa Indonesia |

## 8. Struktur Data (Draft Schema)

```sql
-- jadwal pelajaran
CREATE TABLE jadwal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hari TEXT NOT NULL,       -- senin..jumat
  jam_ke INTEGER NOT NULL,
  mapel TEXT NOT NULL,
  UNIQUE(hari, jam_ke)
);

-- piket
CREATE TABLE piket (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hari TEXT NOT NULL UNIQUE,   -- senin..jumat
  nama_petugas TEXT NOT NULL   -- disimpan comma-separated atau tabel relasi terpisah
);

-- admin
CREATE TABLE admin (
  nomor TEXT PRIMARY KEY
);
```

## 9. Struktur Project

```
bot-kelas/
├── src/
│   ├── index.js          # entrypoint, koneksi Baileys
│   ├── commands/
│   │   ├── jadwal.js
│   │   ├── piket.js
│   │   └── help.js
│   ├── db/
│   │   ├── init.js       # schema SQLite
│   │   └── queries.js
│   ├── scheduler/
│   │   └── cron.js       # auto-post jadwal & reminder piket
│   ├── middleware/
│   │   └── isAdmin.js
│   └── config.js         # nomor admin, group ID, jam cron
├── auth_info/             # session Baileys (gitignored)
├── package.json
└── .env
```

## 10. Alur Utama (Flow)

**Flow: Siswa cek jadwal**
1. Siswa kirim `!jadwal` di grup
2. Bot cek hari ini (server time, timezone Jakarta)
3. Bot query DB `jadwal` WHERE hari = hari_ini
4. Bot format & balas ke grup

**Flow: Admin update piket**
1. Admin kirim `!setpiket senin budi,ani,rudi`
2. Bot cek nomor pengirim via middleware `isAdmin`
3. Jika bukan admin → balas pesan error, stop
4. Jika admin → parse hari & nama, validasi
5. Bot UPSERT ke tabel `piket`
6. Bot balas konfirmasi: "✅ Piket Senin diperbarui: Budi, Ani, Rudi"

**Flow: Auto-reminder pagi**
1. Cron trigger jam 06:00 WIB hari sekolah
2. Bot query jadwal hari ini
3. Bot kirim pesan otomatis ke grup (tanpa perlu ada yang chat duluan)

## 11. Metrik Keberhasilan (Fase 1)

- Command `!jadwal` dan `!piket` dipakai aktif oleh anggota grup (indikator: frekuensi command per minggu)
- Berkurangnya pertanyaan manual soal jadwal/piket di grup setelah bot aktif
- Auto-reminder terkirim tepat waktu tanpa gagal (uptime scheduler)
- Tidak ada laporan data jadwal/piket salah akibat write oleh non-admin

## 12. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Baileys unofficial API — rawan diblokir/berubah oleh WhatsApp | Bot berhenti berfungsi | Pantau update library, siapkan fallback reconnect, dokumentasikan cara re-scan QR |
| Bot down (server/koneksi mati) | Reminder & command tidak jalan | Gunakan process manager (PM2) dengan auto-restart |
| Admin lupa nomor terdaftar salah | Tidak bisa update data | Sediakan command darurat/manual override lewat akses server langsung |
| Format command salah ketik oleh user | Bot dianggap "rusak" | Pesan error yang jelas + `!help` selalu tersedia |

## 13. Roadmap Fase Berikutnya (Referensi, di luar scope PRD ini)

- Fase 2: Fitur absensi (`!absen`, rekap kehadiran)
- Fase 3: Interaksi ringan (polling, game, quote random)
- Fase 4: Integrasi Google Sheets sebagai sumber data alternatif, dashboard admin

---

**Catatan:** Dokumen ini fokus pada Fase 1 (Jadwal & Piket). Requirement absensi sengaja tidak dibahas detail dan akan dibuatkan PRD terpisah saat masuk fase pengembangan berikutnya.