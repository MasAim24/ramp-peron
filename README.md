# AGROSCALE ERP — Sistem Jembatan Timbang & Ramp Peron Kelapa Sawit Enterprise

Aplikasi Enterprise modern untuk operasional **Ramp / Peron Pengumpulan Kelapa Sawit** dan **Jembatan Timbang Komersial (Weighbridge)** yang mengelola seluruh rantai pasok penerimaan Tandan Buah Segar (TBS) dari petani swadaya/plasma hingga pengiriman ke Pabrik Kelapa Sawit (PKS).

Dibangun dengan arsitektur modern berstandar enterprise:
- **Frontend Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (Desain korporat minimalis, tema kontras tinggi WCAG AA, palet Slate/Zinc dengan aksen Forest Emerald)
- **Bundler:** Vite 8
- **Desktop Runtime & Packaging:** Electron 34 (Siap dikemas menjadi file `.exe` Windows atau `.AppImage` / `.deb` Linux)
- **Hardware Integration:** Koneksi Serial RS-232 Indikator Timbangan Digital & Simulator Uji Beban

---

## 🌾 Fitur Utama & Modul Bisnis

### 1. ⚖️ Jembatan Timbang (Inbound & Outbound)
- **Penimbangan 1 (Bruto):** Pencatatan nomor polisi truk, supir, petani mitra, varietas, dan bobot kotor muatan masuk.
- **Antrean Lantai Ramp (Live Queue):** Monitoring truk yang sedang bongkar di peron ramp sebelum timbang Tara.
- **Penimbangan 2 (Tara & Sortasi):** 
  - Penimbangan truk kosong setelah bongkar.
  - Perhitungan Netto Kotor = `Bruto - Tara`.
  - **Matriks Sortasi Mutu:** Potongan Air/Hujan (%), Gagang Panjang > 2.5cm (%), Buah Mentah/Fraksi 0 (%), Buah Busuk/Lewat Matang (%), dan Potongan Sampah/Batu (Kg).
  - Perhitungan **Netto Bersih yang Diterima**.
  - Opsi pemotongan cicilan Kasbon Petani secara otomatis.
- **Pengiriman Keluar (Outbound ke PKS):**
  - Timbang Tara awal dan Bruto truk ramp.
  - Penerbitan otomatis **Surat Pengantar Buah (SPB)** dan nomor tiket timbang keluar.

### 2. 📟 Indikator Digital Timbangan & Simulator Realistis
- Tampilan LCD Digital kontras tinggi dengan font monospaced dan status LED (`STABLE`, `MOTION`, `ZERO`, `OVERLOAD`).
- Dukungan protokol standar industri: **Yaohua XK3190-A9/A12**, **Mettler Toledo Panther/8142**, **CAS CI-5010A**, dan **Avery Berkel**.
- Tombol **Nolkan (Zero)** dan **Ambil Berat (Lock)** dengan audio buzzer konfirmasi industri.
- **Virtual Scale Simulator Bawaan:** Memungkinkan pengujian beban platform langsung tanpa alat fisik terhubung (tersedia preset Truk Colt Diesel Kosong 3.420 kg, Muat 11.500 kg, Dump Truck 17.800 kg, hingga Tronton 28.500 kg dengan getaran suspensi realistis).

### 3. 🚛 Rekonsiliasi Pengiriman & Analisa Susut PKS (Shrinkage Tracking)
- Pencatatan hasil timbangan resmi saat supir kembali dari PKS (Bruto PKS, Tara PKS, Netto PKS, dan Sortasi PKS).
- **Deteksi Susut Perjalanan (Shrinkage Analysis):**
  $$\text{Susut (Kg)} = \text{Netto Ramp} - \text{Netto PKS}$$
  $$\text{Persentase Susut (\%)} = \left(\frac{\text{Susut}}{\text{Netto Ramp}}\right) \times 100\%$$
- Indikator peringatan dini jika susut melebihi batas toleransi kontrak PKS (umumnya $\le 0.6\%$).
- Perhitungan Laba Bersih Peron per truk: Nilai Penjualan ke PKS dikurangi (Estimasi Modal Beli TBS + Beban Solar/Ongkos Angkut).

### 4. 💵 Kasir & Manajemen Keuangan Peron
- Antrean tiket penimbangan yang menunggu pencairan pembayaran.
- Pilihan metode pelunasan: **Tunai Kasir (Cash)**, **Transfer Bank**, atau **Bon / Faktur Tempo**.
- **Manajemen Kasbon / Piutang Petani:** Pemotongan otomatis hutang pupuk/modal langsung dari slip timbangan.
- **Buku Mutasi Kas Ramp:** Pencatatan modal awal kasir, biaya operasional harian (BBM solar genset & loader), dan arus kas keluar-masuk.

### 5. 📈 Papan Harga Harian TBS (Pricing Board)
- Penetapan harga beli harian peron berdasarkan mutu umur tanaman:
  - **Grade Super:** Usia tanam > 10 tahun (rendemen CPO tinggi).
  - **Grade A:** Usia tanam 5 - 10 tahun (standar utama peron).
  - **Grade B:** Usia tanam 3 - 5 tahun (buah pasir / tanaman muda).
- Kalkulator target **Spread Margin** (selisih harga jual ke PKS vs harga beli petani).
- **Generator Broadcast WhatsApp:** Menghasilkan draf pesan broadcast harga harian yang rapi dan siap disalin ke grup WhatsApp petani mitra.

### 6. 🗄️ Master Data Peron
- Master Petani / Supplier (NIK, No HP, Lokasi Lahan, Varietas Bibit, Rekening Bank, Saldo Kasbon).
- Master Pabrik Kelapa Sawit (PKS) Tujuan (Jarak km, PIC, Harga Kontrak, Toleransi Susut, Syarat Pembayaran).
- Master Armada Truk & Supir (Nopol, Tara Rata-rata, Kapasitas Muat, Status Kepemilikan).

### 7. 🖨️ Cetak Tiket Timbang Thermal Resmi (80mm)
- Format cetak slip timbangan standar POS-80 (Thermal 80mm) dan continuous paper / dot matrix:
  - Header Legalitas & Tera Metrologi
  - Rincian Bruto, Tara, Netto Kotor, Rincian Sortasi %, dan Netto Bersih
  - Rincian Perhitungan Pembayaran & Potongan Kasbon
  - Kolom Tanda Tangan: Petani/Supir dan Operator Timbang (Weighmaster).
- Mendukung direct printing desktop via Electron IPC.

### 8. 📊 Laporan & Ekspor Data
- Rekapitulasi transaksi harian, mingguan, dan bulanan.
- Ekspor seluruh database penimbangan ke format file **Excel / CSV** dengan satu klik.

---

## 💻 Panduan Menjalankan Aplikasi

### Kebutuhan Sistem
- **Node.js:** Versi 20.x atau 22.x LTS
- **NPM:** Versi 10.x ke atas

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Menjalankan di Mode Web / Development Browser
```bash
npm run dev
```
Aplikasi akan aktif di:
- **Local:** `http://localhost:5180` (atau `http://127.0.0.1:5180`)
- **Network / LAN IP:** `http://192.168.101.4:5180` (dapat diakses dari tablet/HP/perangkat lain di jaringan yang sama)

### 3. Menjalankan di Mode Desktop (Electron Native)
```bash
npm run electron:dev
```
Perintah ini akan menyalakan server Vite dan membuka window desktop Electron secara terintegrasi.

### 4. Build Proyek (Frontend Production)
```bash
npm run build
```
Hasil build teroptimasi akan dihasilkan di direktori `dist/`.

### 5. Pengemasan Aplikasi Desktop (Installer Windows / Linux)
```bash
npm run electron:build
```
Hasil installer desktop akan dihasilkan di folder `dist-electron/`:
- **Windows:** File installer setup `.exe` (NSIS)
- **Linux:** File `.AppImage` yang dapat langsung dijalankan di semua distro Linux.

---

## ⌨️ Shortcut Keyboard Cepat (Ergonomi Ruang Timbang)

| Tombol | Fungsi |
|---|---|
| **F1** | Buka Modul Jembatan Timbang |
| **F2** | Buka Pengiriman & Rekonsiliasi PKS |
| **F3** | Buka Modul Kasir & Pembayaran |
| **F4** | Buka Papan Harga TBS |
| **F6** | Buka Laporan & Audit Transaksi |

---

## 📄 Lisensi
Hak Cipta (c) 2026. Aplikasi Enterprise Ramp / Peron Kelapa Sawit.
Dikembangkan untuk CV. Sawit Makmur Abadi & Jaringan Peron Kelapa Sawit Indonesia.