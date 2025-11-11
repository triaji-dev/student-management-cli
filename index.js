/**
 * Main Application - CLI Interface
 * File ini adalah entry point aplikasi
 * 
 * Implementasi CLI interface yang interaktif dengan menu:
 * 1. Tambah Siswa Baru
 * 2. Lihat Semua Siswa
 * 3. Cari Siswa (by ID)
 * 4. Update Data Siswa
 * 5. Hapus Siswa
 * 6. Tambah Nilai Siswa
 * 7. Lihat Top 3 Siswa
 * 8. Statistik Kelas (BONUS)
 * 9. Keluar
 */

// Import modules
import readlineSync from 'readline-sync';
import colors from 'colors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from './src/Student.js';
import StudentManager from './src/StudentManager.js';

// Get current directory path and define constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'students.json');
const MAX_WIDTH = 60;
const manager = new StudentManager();

/**
 * Display title dengan border
 */
function displayTitle(title) {
  console.log('\n' + '━'.repeat(MAX_WIDTH).cyan);
  console.log(title.padStart((MAX_WIDTH + title.length) / 2).bold.cyan);
  console.log('━'.repeat(MAX_WIDTH).cyan);
}

/**
 * Memuat data dari file JSON
 */
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const studentsData = JSON.parse(data);
      manager.fromJSON(studentsData);
      console.log(` ✓  Data berhasil dimuat (${studentsData.length} siswa)`.cyan);
    } else {
      console.log(' ⚠  File data tidak ditemukan, membuat file baru...'.red);
      saveData();
    }
  } catch (error) {
    console.error('✗ Error memuat data:'.red, error.message);
  }
}

/**
 * Menyimpan data ke file JSON
 */
function saveData() {
  try {
    const data = JSON.stringify(manager.toJSON(), null, 2);
    fs.writeFileSync(DATA_FILE, data, 'utf8');
  } catch (error) {
    console.error('✗ Error menyimpan data:'.red, error.message);
  }
}

/**
 * Validasi format ID siswa (S001, S012, S100, etc.)
 */
function isValidStudentId(id) {
  return /^S\d{3}$/.test(id);
}

/**
 * Menampilkan menu utama
 */
function displayMenu() {
  console.log(`
┌──────────────────────────────────────────────────────────┐
│               SISTEM MANAJEMEN NILAI SISWA               │
├──────────────────────────────────────────────────────────┤
│  1. Tambah Siswa Baru                                    │
│  2. Lihat Semua Siswa                                    │
│  3. Cari Siswa                                           │
│  4. Update Data Siswa                                    │
│  5. Hapus Siswa                                          │
│  6. Tambah Nilai Siswa                                   │
│  7. Lihat Top 3 Siswa                                    │
│  8. Statistik Kelas                                      │
├──────────────────────────────────────────────────────────┤
│  0. Keluar                                               │
└──────────────────────────────────────────────────────────┘`.cyan);
}

/**
 * Handler untuk menambah siswa baru
 */
function addNewStudent() {
  displayTitle('TAMBAH SISWA BARU');
  
  let id;
  let isValidId = false;
  
  // Validasi format ID dengan loop hingga valid
  while (!isValidId) {
    id = readlineSync.question('Masukkan ID Siswa (format: S001, S002, ...): '.cyan);
    
    if (!isValidStudentId(id)) {
      console.log('✗ Format ID tidak valid! Harus menggunakan format S diikuti 3 digit angka (contoh: S001, S012)'.red);
      continue;
    }
    
    // Cek apakah ID sudah ada
    if (manager.findStudent(id)) {
      console.log(`✗ ID ${id} sudah digunakan! Silakan gunakan ID lain.`.red);
      continue;
    }
    
    isValidId = true;
  }
  
  const name = readlineSync.question('Masukkan Nama Siswa: '.cyan);
  
  if (!name || name.trim() === '') {
    console.log('✗ Nama tidak boleh kosong!'.red);
    return;
  }
  
  const studentClass = readlineSync.question('Masukkan Kelas: '.cyan);
  
  // Buat student baru
  const student = new Student(id, name, studentClass);
  
  // Tambahkan ke manager
  if (manager.addStudent(student)) {
    console.log(`\n✓ Siswa ${name} (${id}) berhasil ditambahkan!`.green.bold);
    saveData(); // Simpan data setelah operasi
  } else {
    console.log('\n✗ Gagal menambahkan siswa!'.red);
  }
}

/**
 * Handler untuk melihat semua siswa
 */
function viewAllStudents() {
  manager.displayAllStudents();
}

/**
 * Handler untuk mencari siswa berdasarkan ID
 */
function searchStudent() {
  displayTitle('CARI SISWA');
  
  const id = readlineSync.question('\nMasukkan ID Siswa: '.cyan);
  const student = manager.findStudent(id);
  
  if (student) {
    student.displayInfo();
  } else {
    console.log(`\n✗ Siswa dengan ID ${id} tidak ditemukan!`.red);
  }
}

/**
 * Handler untuk update data siswa
 */
function updateStudent() {
  displayTitle('UPDATE DATA SISWA');
  
  const id = readlineSync.question('\nMasukkan ID Siswa: '.cyan);
  const student = manager.findStudent(id);
  
  if (!student) {
    console.log(`\n✗ Siswa dengan ID ${id} tidak ditemukan!`.red);
    return;
  }
  
  console.log('\n Data saat ini:'.bold);
  student.displayInfo();
  
  console.log('\n' + '  Kosongkan jika tidak ingin mengubah'.gray.italic);
  
  const newName = readlineSync.question('Nama baru (Enter untuk skip): '.cyan);
  const newClass = readlineSync.question('Kelas baru (Enter untuk skip): '.cyan);
  
  const updateData = {};
  if (newName && newName.trim() !== '') {
    updateData.name = newName;
  }
  if (newClass && newClass.trim() !== '') {
    updateData.class = newClass;
  }
  
  if (Object.keys(updateData).length === 0) {
    console.log('\n⚠ Tidak ada perubahan yang dilakukan.'.yellow);
    return;
  }
  
  if (manager.updateStudent(id, updateData)) {
    console.log('\n✓ Data siswa berhasil diupdate!'.green.bold);
    saveData(); // Simpan data setelah operasi
    console.log('\n Data setelah update:'.bold);
    student.displayInfo();
  } else {
    console.log('\n✗ Gagal mengupdate data siswa!'.red);
  }
}

/**
 * Handler untuk menghapus siswa
 */
function deleteStudent() {
  displayTitle('HAPUS SISWA');
  
  const id = readlineSync.question('\nMasukkan ID Siswa: '.cyan);
  const student = manager.findStudent(id);
  
  if (!student) {
    console.log(`\n✗ Siswa dengan ID ${id} tidak ditemukan!`.red);
    return;
  }
  
  console.log('\n Data siswa yang akan dihapus:'.bold);
  student.displayInfo();
  
  const confirmation = readlineSync.question('\n⚠️  Apakah Anda yakin ingin menghapus siswa ini? (Y/N): '.red.bold);
  
  if (confirmation.toUpperCase() === 'Y') {
    if (manager.removeStudent(id)) {
      console.log(`\n✓ Siswa ${student.name} (${id}) berhasil dihapus!`.green.bold);
      saveData(); // Simpan data setelah operasi
    } else {
      console.log('\n✗ Gagal menghapus siswa!'.red);
    }
  } else {
    console.log('\n⚠ Penghapusan dibatalkan.'.yellow);
  }
}

/**
 * Handler untuk menambah nilai siswa
 */
function addGradeToStudent() {
  displayTitle('TAMBAH NILAI SISWA');
  
  const id = readlineSync.question('\nMasukkan ID Siswa: '.cyan);
  const student = manager.findStudent(id);
  
  if (!student) {
    console.log(`\n✗ Siswa dengan ID ${id} tidak ditemukan!`.red);
    return;
  }
  
  console.log('\n Data siswa:'.bold);
  console.log(`  Nama: ${student.name}`.yellow);
  console.log(`  Kelas: ${student.class}`.yellow);
  
  const subject = readlineSync.question('\nMasukkan Mata Pelajaran: '.cyan);
  
  let score;
  let isValidScore = false;
  
  // Loop hingga nilai valid (0-100)
  while (!isValidScore) {
    const scoreInput = readlineSync.question('Masukkan Nilai (0-100): '.cyan);
    score = parseFloat(scoreInput);
    
    if (isNaN(score) || score < 0 || score > 100) {
      console.log('✗ Nilai tidak valid! Nilai harus berupa angka antara 0-100.'.red);
    } else {
      isValidScore = true;
    }
  }
  
  // Tambahkan nilai
  if (student.addGrade(subject, score)) {
    console.log(`\n✓ Nilai ${subject} (${score}) berhasil ditambahkan untuk ${student.name}!`.green.bold);
    saveData(); // Simpan data setelah operasi
    
    console.log('\n Ringkasan Nilai:'.bold);
    console.log(`  Rata-rata: ${student.getAverage().toFixed(2)}`.yellow);
    console.log(`  Status: ${student.getGradeStatus() === "Lulus" ? student.getGradeStatus().green : student.getGradeStatus().red}`);
  } else {
    console.log('\n✗ Gagal menambahkan nilai!'.red);
  }
}

/**
 * Handler untuk melihat top students
 */
function viewTopStudents() {
  displayTitle('TOP 3 SISWA TERBAIK');
  
  const topStudents = manager.getTopStudents(3);
  
  if (topStudents.length === 0) {
    console.log('\n⚠ Belum ada data siswa.'.yellow);
    return;
  }
  
  topStudents.forEach((student, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
    console.log(`\n${medal} Peringkat ${index + 1}`.bold);
    student.displayInfo();
  });
}

/**
 * BONUS: Handler untuk statistik kelas
 */
function viewClassStatistics() {
  displayTitle('STATISTIK KELAS SISWA');
  
  const className = readlineSync.question('\nMasukkan Nama Kelas: '.cyan);
  const stats = manager.getClassStatistics(className);
  
  if (!stats) {
    console.log(`\n✗ Tidak ada siswa di kelas ${className}.`.red);
    return;
  }
  
  console.log('\n' + '═'.repeat(50).cyan);
  console.log(`  STATISTIK KELAS ${stats.className}`.bold.white);
  console.log('═'.repeat(50).cyan);
  console.log(`  Total Siswa         : ${stats.totalStudents.toString().yellow}`);
  console.log(`  Rata-rata Kelas     : ${stats.classAverage.toFixed(2).yellow}`);
  console.log(`  Siswa Lulus         : ${stats.passedStudents.toString().green}`);
  console.log(`  Siswa Tidak Lulus   : ${stats.failedStudents.toString().red}`);
  console.log(`  Tingkat Kelulusan   : ${stats.passRate.toFixed(2)}%`.yellow);
  console.log(`  Nilai Tertinggi     : ${stats.highestAverage.toFixed(2).green}`);
  console.log(`  Nilai Terendah      : ${stats.lowestAverage.toFixed(2).red}`);
  console.log('═'.repeat(50).cyan);
  
  // Tampilkan daftar siswa di kelas ini
  const students = manager.getStudentsByClass(className);
  console.log(`\n Daftar Siswa di Kelas ${className}:`.bold);
  students.forEach((student, index) => {
    const status = student.getGradeStatus() === "Lulus" ? "✓".green : "✗".red;
    console.log(`  ${index + 1}. ${student.name.padEnd(20)} (${student.id}) - Rata-rata: ${student.getAverage().toFixed(2)} ${status}`);
  });
}

/**
 * Menampilkan animasi loading dengan Progress Bar
 */
function showLoadingAnimation(text, duration) {
    return new Promise(resolve => {
        const BAR_LENGTH = 30;
        let elapsed = 0;
        const intervalTime = 10;

        // Initial output: memastikan kursor berada di awal baris baru
        process.stdout.write(``);
        
        const interval = setInterval(() => {
            elapsed += intervalTime;
            
            // Hitung progress
            let progress = Math.min(1, elapsed / duration); 
            const percent = Math.floor(progress * 100);
            
            // Hitung bar yang terisi
            const filledLength = Math.floor(progress * BAR_LENGTH);
            const emptyLength = BAR_LENGTH - filledLength;
            
            // Buat string bar
            const filledBar = '█'.repeat(filledLength).bgGreen.cyan;
            const emptyBar = ' '.repeat(emptyLength).bgBlack.black;
            
            // Teks status
            const statusText = `${filledBar}${emptyBar} ${String(percent).padStart(3)}% ${text}`;
            
            // Pindahkan kursor ke awal baris dan cetak ulang
            process.stdout.cursorTo(0);
            process.stdout.write(statusText);

            if (elapsed >= duration) {
                clearInterval(interval);
                
                // Final Success Display
                process.stdout.cursorTo(0);
                process.stdout.write(' '.repeat(statusText.length + 5)); // Bersihkan baris
                process.stdout.cursorTo(0);
                
                resolve();
            }
        }, intervalTime);
    });
}

/**
 * Main program loop
 */

async function main() {
    console.clear();

    displayTitle('SELAMAT DATANG DI SISTEM MANAJEMEN NILAI SISWA');

    await showLoadingAnimation('Memuat data siswa...', 1000);

    loadData(); 
    
    let running = true;
    
    while (running) {
        // console.clear();
        
        displayMenu();
        
        const choice = readlineSync.question('\nPilih menu (0-8): '.bold.cyan);
        
        switch (choice) {
            case '1':
                addNewStudent();
                break;
            case '2':
                viewAllStudents();
                break;
            case '3':
                searchStudent();
                break;
            case '4':
                updateStudent();
                break;
            case '5':
                deleteStudent();
                break;
            case '6':
                addGradeToStudent();
                break;
            case '7':
                viewTopStudents();
                break;
            case '8':
                viewClassStatistics();
                break;
            case '0':
                console.clear();
                console.log('Terima kasih telah menggunakan aplikasi ini!'.cyan);
                console.log('✓ Keluar dari aplikasi...'.cyan);
                running = false;
                break;
            default:
                console.log('\n✗ Pilihan tidak valid! Silakan pilih 0-8.'.red);
        }
        
        // Pause sebelum kembali ke menu (kecuali exit)
        if (running && choice !== '0') {
            readlineSync.question('\nTekan Enter untuk kembali ke menu...'.gray);
        }
    }
}

// Jalankan aplikasi
main();
