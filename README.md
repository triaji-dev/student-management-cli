# Sistem Manajemen Nilai Siswa

Aplikasi CLI berbasis Node.js untuk mengelola data siswa dan nilai mereka.

## Fitur Utama

- Manajemen data siswa (tambah, lihat, cari, update, hapus)
- Manajemen nilai siswa per mata pelajaran
- Top 3 siswa terbaik berdasarkan rata-rata nilai
- Statistik kelas lengkap (bonus feature)
- Data tersimpan dalam file JSON
- Interface CLI dengan warna dan validasi input

## Prasyarat

Sebelum menjalankan aplikasi, pastikan sudah terinstal:

- Node.js (versi 14.x atau lebih baru)
- npm (Node Package Manager)

## Struktur Project

```
student-management-system/
├── index.js                         
├── src/
│   ├── Student.js                
│   └── StudentManager.js  
├── students.json                 
├── package.json                  
└── README.md                
```

## Cara Menggunakan

Jalankan aplikasi dengan perintah:
```bash
node index.js
```

### Menu Aplikasi

```

1. Tambah Siswa Baru
2. Lihat Semua Siswa
3. Cari Siswa
4. Update Data Siswa
5. Hapus Siswa
6. Tambah Nilai Siswa
7. Lihat Top 3 Siswa
8. Statistik Kelas
0. Keluar

```

### Panduan Singkat

**Tambah Siswa:** Format ID harus S001, S002, dst (S + 3 digit angka)

**Tambah Nilai:** Nilai harus antara 0-100, sistem otomatis menghitung rata-rata

**Statistik Kelas:** Menampilkan total siswa, rata-rata kelas, tingkat kelulusan, dan daftar siswa

## Contoh Penggunaan

```
Masukkan ID Siswa: S001
Masukkan Nama Siswa: Budi Santoso
Masukkan Kelas: 10A
```

```
Masukkan Mata Pelajaran: Matematika
Masukkan Nilai: 85
```

## Kriteria Penilaian

- Rata-rata >= 75: Lulus
- Rata-rata < 75: Tidak Lulus

## Format Data

Data disimpan dalam file `students.json` dengan format:

```json
[
  {
    "id": "S001",
    "name": "Budi Santoso",
    "class": "10A",
    "grades": {
      "Matematika": 85,
      "Bahasa Indonesia": 90,
      "Bahasa Inggris": 88
    }
  }
]
```

## Validasi

- Format ID siswa (S + 3 digit)
- Range nilai (0-100)
- Pencegahan duplikasi ID
- Validasi input kosong
- Konfirmasi sebelum penghapusan

---

