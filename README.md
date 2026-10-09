# Sistem Inventaris VTS Merak

Aplikasi web inventaris barang untuk kebutuhan operasional kantor VTS Merak (alat kebersihan, alat tulis, perlengkapan papan tulis, dan sejenisnya). Mencatat barang habis pakai maupun tidak habis pakai, stok masuk dari pembelian (lengkap dengan nota), stok keluar, serta laporan periodik yang bisa diunduh dalam format CSV.

Proyek ini dibuat sebagai bagian dari kegiatan magang.

## Fitur

- **Autentikasi** berbasis session, dengan dua role: `admin` dan `staff`
- **Data master**: Barang, Kategori, Lokasi, Supplier (CRUD, pencarian, filter, pagination)
- **Jenis barang**: habis pakai dan tidak habis pakai, dengan penanda stok menipis (`stok_saat_ini <= stok_minimum`)
- **Nota pembelian**: satu nota berisi banyak barang, harga satuan, subtotal otomatis, dan upload foto/scan nota (jpg, png, pdf, maks. 5 MB). Stok bertambah otomatis
- **Barang keluar**: dicatat per lokasi dan keperluan, stok berkurang otomatis dengan validasi kecukupan stok
- **Dashboard**: ringkasan stok, barang stok menipis, dan transaksi terbaru
- **Laporan** (rentang tanggal wajib diisi):
  - Laporan pergerakan stok barang (stok awal, masuk, keluar, stok akhir)
  - Laporan pembelian (total pengeluaran, rekap per supplier, daftar nota)
  - Unduh CSV (kompatibel dengan Excel)
- Tampilan responsif untuk desktop dan mobile

## Teknologi

| Bagian | Teknologi |
|---|---|
| Backend | Node.js, Express, Sequelize (ORM), MariaDB/MySQL |
| Autentikasi | express-session, bcryptjs |
| Upload file | multer |
| Frontend | Vue 3, Vite, Vue Router, Pinia, Axios |
| UI | Element Plus |
| Deploy | Docker Compose, Nginx, Cloudflare Tunnel |

## Struktur Proyek

```
inventaris-vts/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── config/         # koneksi database
│   ├── controllers/    # request & response
│   ├── middlewares/    # auth, upload, error handler
│   ├── models/         # model Sequelize + relasi
│   ├── router/         # definisi route API
│   ├── services/       # logika bisnis
│   ├── utils/          # helper (pagination, csv, dll)
│   ├── scripts/        # seedAdmin.js
│   └── app.js
└── frontend/
    ├── src/
    │   ├── router/     # routing + guard login
    │   ├── services/   # pemanggilan API (axios)
    │   ├── stores/     # Pinia (auth)
    │   └── views/      # halaman per fitur
    └── nginx.conf
```

## Skema Database

Tabel utama: `kategori`, `barang`, `lokasi`, `supplier`, `pengguna`, `nota_pembelian`, `transaksi_masuk` (rincian barang per nota), dan `transaksi_keluar`.

Relasi utama:

- Satu kategori memiliki banyak barang
- Satu nota pembelian memiliki banyak rincian `transaksi_masuk`, dan terhubung ke satu supplier serta satu pengguna pencatat
- Satu barang memiliki banyak transaksi masuk dan keluar
- Satu lokasi memiliki banyak transaksi keluar

## Menjalankan di Lokal (Development)

### Prasyarat

- Node.js 20.19 atau lebih baru
- MariaDB/MySQL (misalnya lewat XAMPP) dengan database kosong bernama `sistem_inventoris_vts`

### Backend

```bash
cd backend
npm install
cp .env.example .env     # lalu sesuaikan isinya
node app.js
```

Contoh isi `backend/.env`:

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sistem_inventoris_vts
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=isi_dengan_string_acak
PORT=3000
DB_SYNC_ALTER=true
```

Tabel dibuat otomatis oleh Sequelize saat server pertama kali berjalan.

Buat akun admin pertama:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=ganti_password ADMIN_NAMA="Admin" node scripts/seedAdmin.js
```

(Di PowerShell Windows, set dulu variabelnya: `$env:ADMIN_EMAIL="admin@example.com"; $env:ADMIN_PASSWORD="ganti_password"; node scripts/seedAdmin.js`)

### Frontend

```bash
cd frontend
npm install
```

Buat `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
```

Jalankan:

```bash
npm run dev
```

Buka `http://localhost:5173`.

## Deploy dengan Docker dan Cloudflare Tunnel

Seluruh layanan (database, backend, frontend, tunnel) dijalankan lewat satu `docker-compose.yml`. Tidak ada port yang dipublikasikan ke host. Akses publik hanya melalui Cloudflare Tunnel, sehingga tidak bentrok dengan layanan lain di server.

```
Browser -> Cloudflare -> cloudflared -> frontend (nginx) -> /api & /uploads -> backend -> db
```

1. Buat file `.env` di root proyek (lihat `.env.example`):

   ```dotenv
   DB_ROOT_PASSWORD=
   DB_NAME=sistem_inventoris_vts
   DB_USER=inventaris
   DB_PASSWORD=
   SESSION_SECRET=
   APP_URL=https://inventaris.domainanda.com
   CLOUDFLARE_TUNNEL_TOKEN=
   ```

2. Buat tunnel di Cloudflare Zero Trust, arahkan public hostname ke service `http://frontend:80`.
3. Jalankan:

   ```bash
   docker compose up -d --build
   ```

4. Buat admin pertama:

   ```bash
   docker compose exec \
     -e ADMIN_EMAIL=admin@example.com \
     -e ADMIN_PASSWORD='ganti_password' \
     backend node scripts/seedAdmin.js
   ```

Perintah penting lainnya:

```bash
docker compose logs -f backend      # lihat log
docker compose up -d --build        # update setelah ada perubahan kode
docker compose down                 # hentikan (data tetap aman di volume)
```

> Jangan gunakan `docker compose down -v` karena akan menghapus volume database dan foto nota.

## Ringkasan Endpoint API

Semua endpoint berada di bawah prefix `/api` dan membutuhkan login (kecuali `login`).

| Resource | Endpoint |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/register` (admin) |
| Kategori / Lokasi / Supplier | `GET/POST /kategori`, `GET/PUT/DELETE /kategori/:id` (pola sama untuk lokasi dan supplier) |
| Barang | `GET/POST /barang`, `GET/PUT/DELETE /barang/:id`, `GET /barang/laporan`, `GET /barang/laporan/export` |
| Nota pembelian | `GET/POST /nota-pembelian`, `GET/DELETE /nota-pembelian/:id`, `GET /nota-pembelian/rekap-bulanan`, `GET /nota-pembelian/export` |
| Barang keluar | `GET/POST /transaksi-keluar`, `GET /transaksi-keluar/export` |

Parameter umum untuk endpoint list: `page`, `limit`, `search`, serta filter spesifik seperti `id_kategori`, `jenis_barang`, `stok_menipis`, `tanggal_awal`, `tanggal_akhir`.

## Catatan

- Operasi tulis pada master data (tambah, ubah, hapus) dibatasi untuk role `admin`.
- Pembuatan nota pembelian dan penghapusannya memakai database transaction, sehingga stok selalu konsisten dengan riwayat transaksi.
- Menghapus nota akan mengurangi kembali stok barang terkait.

## Lisensi

Proyek ini dibuat untuk keperluan pembelajaran dan portofolio. Silakan sesuaikan lisensi sesuai kebutuhan.
