# Challenge 4: Sistem Manajemen Nilai Siswa

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mN9h8nSd)

---

Sistem manajemen data Command Line Interface (CLI) yang efisien untuk mengelola data akademik siswa, termasuk pencatatan nilai, pembaruan data, dan analisis statistik kelulusan.

## Fitur Utama

Sistem ini menyediakan fungsionalitas komprehensif untuk pengelola data sekolah:

- **Pemuatan & Penyimpanan Data Persisten**: Menggunakan `students.json` sebagai sumber data tunggal. Setiap perubahan pada data (CRUD) akan disimpan secara real-time ke file ini.

- **Manajemen Siswa (CRUD)**: Tambah, cari, perbarui, dan hapus data siswa (ID, Nama, Kelas).

- **Manajemen Nilai**: Memasukkan dan memperbarui nilai mata pelajaran (0-100) untuk setiap siswa.

- **Analisis Statistik**:

  - Statistik Komprehensif Sekolah (Rata-rata global, tingkat kelulusan)
  - Statistik Per Kelas (Rata-rata kelas, nilai tertinggi/terendah di kelas)
  - Peringkat Siswa Terbaik (Top N siswa berdasarkan rata-rata dan status kelulusan)

- **Manajemen Metadata**: Mengelola daftar nama Kelas dan Mata Pelajaran secara terpusat.

- **Validasi Data**: Memastikan integritas data (format ID, rentang nilai 0-100) sebelum disimpan.

## Persyaratan Teknis

Aplikasi ini berjalan di lingkungan Node.js.

| Persyaratan | Detail                                     |
| ----------- | ------------------------------------------ |
| Node.js     | Versi 18.x atau lebih tinggi               |
| Lingkungan  | Terminal/Command Prompt (CLI)              |
| Dependensi  | `readline-sync`, `colors`, `fs` (built-in) |

## Arsitektur Proyek

Proyek ini mengikuti prinsip modularitas dengan memisahkan logika ke dalam beberapa file:

```
.
├── index.js               # File utama aplikasi (Main Function, DataService, UIHandler)
├── students.json          # File data (termasuk data awal)
└── src/
    ├── Student.js         # Class untuk merepresentasikan satu siswa
    └── StudentManager.js  # Class untuk mengelola koleksi siswa
```

## Panduan Instalasi & Eksekusi

### 1. Kloning Proyek (Jika diperlukan)

Lewati langkah ini jika Anda sudah memiliki semua file di direktori lokal Anda.

### 2. Instalasi Dependensi Node.js

Navigasikan ke direktori utama proyek Anda di terminal, lalu instal paket-paket yang diperlukan:

```bash
# Pastikan Anda berada di direktori yang sama dengan package.json (atau buat dengan npm init -y)
npm install readline-sync colors
```

### 3. Eksekusi Aplikasi

Jalankan aplikasi menggunakan Node.js:

```bash
node index.js
```

### 4. Interaksi

Setelah menjalankan aplikasi:

1. **Pemuatan**: Tunggu animasi loading selesai. Status pemuatan data dari `students.json` akan ditampilkan.
2. **Menu**: Pilih angka `1` hingga `10` untuk menjalankan fungsionalitas yang tersedia.
3. **Input**: Aplikasi akan meminta input (seperti ID, Nama, atau Nilai) menggunakan prompt interaktif.
4. **Keluar**: Masukkan `0` (Keluar) untuk menghentikan aplikasi dan kembali ke terminal.

---

![Main Menu](./public/screenshot1.png)
![Statistik Sekolah](./public/screenshot2.png)
![Statistik Kelas](./public/screenshot3.png)
![Top 3 Siswa Terbaik](./public/screenshot4.png)
![Daftar Seluruh Siswa](./public/screenshot5.png)
![Detil Info Siswa](./public/screenshot6.png)
