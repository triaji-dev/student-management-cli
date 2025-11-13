/**
┌────────────────────────────────────┐
│         1. Import & Const          │
└────────────────────────────────────┘
*/

// Import modules
import readlineSync from 'readline-sync';
import fs from 'fs';
import path from 'path';
import colors from 'colors';
import { fileURLToPath } from 'url';

// Import local classes and utilities
import Student from './src/Student.js';
import StudentManager from './src/StudentManager.js';

export const CONFIG = {
  // Grade & Pass/Fail Criteria
  MIN_GRADE: 0,
  MAX_GRADE: 100,
  PASSING_GRADE: 75,
  MIN_FAIL_GRADE: 30, // Jika ada nilai < 30, otomatis Tidak Lulus
  // File Configuration
  DATA_FILE_NAME: 'students.json',
  // UI/Display Configuration
  MAX_WIDTH: 60,
  LOADING_DURATION: 500, // ms
};

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- File Configuration ---
const DATA_FILE = path.join(__dirname, CONFIG.DATA_FILE_NAME);

// capitalize function
export function capitalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
┌────────────────────────────────────┐
│         2. Validator Class         │
└────────────────────────────────────┘
*/

export class Validator {
  // Memastikan format ID siswa sesuai (S diikuti 3 digit angka)
  static isValidStudentId(id) {
    return /^S\d{3}$/.test(id);
  }

  // Memastikan nama tidak kosong
  static isValidName(name) {
    return !!name && name.trim() !== '';
  }

  // Memastikan nilai berada dalam range yang valid
  static isValidGrade(score) {
    return (
      typeof score === 'number' &&
      score >= CONFIG.MIN_GRADE &&
      score <= CONFIG.MAX_GRADE
    );
  }
}

/**
┌────────────────────────────────────┐
│        3. DataService Class        │
└────────────────────────────────────┘
*/

class DataService {
  // Menginisialisasi dengan StudentManager dan path file data
  constructor(manager, dataFilePath) {
    this.manager = manager;
    this.DATA_FILE = dataFilePath;
  }

  loadData() {
    try {
      if (fs.existsSync(this.DATA_FILE)) {
        const data = fs.readFileSync(this.DATA_FILE, 'utf8');
        const fileContent = JSON.parse(data);

        // Memuat daftar siswa, kelas, dan mapel
        this.manager.fromJSON(fileContent.students || []);
        this.manager.setAllClassNames(fileContent.classNames || []);
        this.manager.setAllSubjectNames(fileContent.subjectNames || []);

        const studentCount = fileContent.students
          ? fileContent.students.length
          : 0;

        return { success: true, count: studentCount };
      } else {
        this.saveData(); // Create empty file
        return {
          success: true,
          count: 0,
          message: 'File data tidak ditemukan, membuat file baru...',
        };
      }
    } catch (error) {
      return { success: false, error: 'Error memuat data: ' + error.message };
    }
  }

  saveData() {
    try {
      const dataToSave = {
        students: this.manager.toJSON(),
        classNames: this.manager.getAllClassNames(),
        subjectNames: this.manager.getAllSubjectNames(),
      };
      const data = JSON.stringify(dataToSave, null, 2);
      fs.writeFileSync(this.DATA_FILE, data, 'utf8');
      return { success: true, message: 'Data berhasil disimpan.' };
    } catch (error) {
      return {
        success: false,
        error: 'Error menyimpan data: ' + error.message,
      };
    }
  }
}

/**
┌────────────────────────────────────┐
│          4. UI Handler Class       │
└────────────────────────────────────┘
*/

// Class untuk menangani tampilan UI di console
class UIHandler {
  static displayTitle(title) {
    const padding = (CONFIG.MAX_WIDTH + title.length) / 2;
    console.log('\n' + '━'.repeat(CONFIG.MAX_WIDTH).cyan);
    console.log(
      title.padStart(padding).bold.bgCyan.white +
        ' '.repeat(CONFIG.MAX_WIDTH - padding).bgCyan
    );
    console.log('━'.repeat(CONFIG.MAX_WIDTH).cyan);
  }

  // Menampilkan animasi loading di console
  static showLoadingAnimation(text) {
    return new Promise(resolve => {
      const BAR_LENGTH = 50;
      let elapsed = 0;
      const intervalTime = 10;
      const duration = CONFIG.LOADING_DURATION;

      process.stdout.write(``);

      const interval = setInterval(() => {
        elapsed += intervalTime;
        let progress = Math.min(1, elapsed / duration);
        const percent = Math.floor(progress * 100);

        const filledLength = Math.floor(progress * BAR_LENGTH);
        const emptyLength = BAR_LENGTH - filledLength;

        const filledBar = '█'.repeat(filledLength).bgGreen.cyan;
        const emptyBar = ' '.repeat(emptyLength).bgBlack.black;

        const statusText = `${filledBar}${emptyBar} ${String(percent).padStart(
          3
        )}% ${text}`;

        process.stdout.cursorTo(0);
        process.stdout.write(statusText);

        if (elapsed >= duration) {
          clearInterval(interval);
          process.stdout.cursorTo(0);
          process.stdout.write(' '.repeat(statusText.length + 5));
          process.stdout.cursorTo(0);
          resolve();
        }
      }, intervalTime);
    });
  }

  // Menampilkan menu utama
  static displayMenu() {
    console.log(
      `
┌──────────────────────────────────────────────────────────┐
│              `.cyan +
        `SISTEM MANAJEMEN NILAI SISWA`.bold.cyan +
        `                │
├──────────────────────────────────────────────────────────┤
│  `.cyan +
        ` Statistik : `.bold.bgCyan +
        `                                           │
│  1. Statistik Sekolah                                    │
│  2. Statistik Kelas                                      │
│  3. Daftar Siswa Terbaik (Top 3)                         │
├──────────────────────────────────────────────────────────┤
│  `.cyan +
        ` Kelola Siswa : `.bold.bgCyan +
        `                                        │
│  4. Daftar Seluruh Siswa                                 │
│  5. Cari Siswa                                           │
│  6. Tambah Siswa Baru                                    │
│  7. Perbarui/Hapus Data Siswa                            │
│  8. Perbarui Nilai Siswa                                 │
├──────────────────────────────────────────────────────────┤
│  `.cyan +
        ` Kelola Kelas & Mata Pelajaran : `.bold.bgCyan +
        `                       │
│  9. Kelola Kelas (Perbarui/Tambah)                       │
│  10. Kelola Mata Pelajaran (Perbarui/Tambah)             │
├──────────────────────────────────────────────────────────┤
│  0. Keluar                                               │
└──────────────────────────────────────────────────────────┘`.cyan
    );
  }

  // Menampilkan informasi detail siswa
  static displayStudentInfo(student) {
    const totalSubjects = student.getRegisteredSubjectCount();
    const average = student.getAverage();
    const status = student.getGradeStatus();
    const grades = student.getGrades();

    console.log('\n' + '='.repeat(50).cyan);
    console.log(`${'ID'.padEnd(20).bold}: ${student.id.yellow}`);
    console.log(`${'Nama'.padEnd(20).bold}: ${student.name.yellow}`);
    console.log(`${'Kelas'.padEnd(20).bold}: ${student.class.yellow}`);
    console.log('='.repeat(50).cyan);

    console.log('\n' + 'Daftar Nilai:'.bold.underline);

    if (totalSubjects === 0) {
      console.log(
        '  Belum ada mata pelajaran yang terdaftar di sistem.'.italic.gray
      );
    } else {
      const subjectNames = student.getAllRegisteredSubjectNames();
      subjectNames.forEach(subject => {
        const score = grades[subject] !== undefined ? grades[subject] : 0; // Nilai 0 jika belum diisi
        const isFilled = grades[subject] !== undefined;

        let scoreDisplay = score.toString();

        if (!isFilled) {
          scoreDisplay = '0'.gray + ' (Belum Diisi)'.italic.gray;
        } else if (score < CONFIG.MIN_FAIL_GRADE) {
          scoreDisplay = score.toString().red.bold;
        } else if (score >= CONFIG.PASSING_GRADE) {
          scoreDisplay = score.toString().green;
        } else {
          scoreDisplay = score.toString().yellow;
        }

        console.log(`  • ${subject.padEnd(20)}: ${scoreDisplay}`);
      });
    }

    console.log('\n' + '-'.repeat(50).cyan);
    console.log(`${'Rata-rata'.padEnd(20).bold}: ${average.toFixed(2).yellow}`);

    const statusColor =
      status === 'Lulus' ? status.green.bold : status.red.bold;
    console.log(`${'Status'.padEnd(20).bold}: ${statusColor}`);
    console.log('='.repeat(50).cyan + '\n');
  }

  // Menampilkan ringkasan semua siswa
  static displayAllStudentsSummary(students) {
    if (students.length === 0) {
      console.log('\n' + '⚠ Belum ada data siswa dalam sistem.'.yellow.bold);
      return false;
    }

    console.log('\n' + '═'.repeat(70).cyan.bold);
    console.log('                         DAFTAR SEMUA SISWA'.bold.cyan);
    console.log('═'.repeat(70).cyan.bold);

    const studentList = students.map(
      (s, i) =>
        `  ${(i + 1).toString().padStart(2)}. ${s.id.yellow} - ${s.name.padEnd(
          20
        )} - ${s.class.padEnd(10)} - Rata-rata: ${s.getAverage().toFixed(2)}`
    );
    console.log(studentList.join('\n'));
    console.log('═'.repeat(70).cyan.bold);
    return true;
  }

  // Menampilkan daftar siswa terbaik
  static displayTopStudents(topStudents) {
    if (topStudents.length === 0) {
      console.log(
        '\n⚠ Belum ada data siswa yang memenuhi kriteria lulus.'.yellow
      );
      return;
    }

    topStudents.forEach((student, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      console.log(`\n${medal} Peringkat ${index + 1}`.bold);
      UIHandler.displayStudentInfo(student);
    });
  }

  // Menampilkan statistik
  static displayStats(title, stats) {
    if (!stats || stats.totalStudents === 0) {
      console.log(`\n✗ Tidak ada data yang tersedia untuk ${title}.`.red);
      return;
    }

    console.log('\n' + '═'.repeat(50).cyan);
    console.log(`  STATISTIK ${title.toUpperCase()}`.bold.white);
    console.log('═'.repeat(50).cyan);
    console.log(
      `  Total Siswa         : ${stats.totalStudents.toString().yellow}`
    );
    if (stats.totalClasses !== undefined) {
      console.log(
        `  Total Kelas         : ${stats.totalClasses.toString().yellow}`
      );
    }
    console.log(
      `  Rata-rata           : ${stats.classAverage.toFixed(2).yellow}`
    );
    console.log(
      `  Siswa Lulus         : ${stats.passedStudents.toString().green}`
    );
    console.log(
      `  Siswa Tidak Lulus   : ${stats.failedStudents.toString().red}`
    );
    console.log(`  Tingkat Kelulusan   : ${stats.passRate.toFixed(2)}%`.yellow);
    if (stats.highestAverage !== undefined) {
      console.log(
        `  Nilai Tertinggi     : ${stats.highestAverage.toFixed(2).green}`
      );
      console.log(
        `  Nilai Terendah      : ${stats.lowestAverage.toFixed(2).red}`
      );
    }
    console.log('═'.repeat(50).cyan);
  }

  // Menampilkan daftar siswa hasil pencarian yang lebih detail
  static displayFoundStudents(students, title) {
    if (students.length === 0) {
      console.log(`\n✗ Tidak ada siswa ditemukan dalam kategori ${title}.`.red);
      return;
    }

    console.log(`\n═`.repeat(70).cyan.bold);
    console.log(`       DAFTAR SISWA HASIL PENCARIAN (${title})`.bold.cyan);
    console.log(`═`.repeat(70).cyan.bold);

    students.forEach((s, i) => {
      const status =
        s.getGradeStatus() === 'Lulus'
          ? 'Lulus'.green.bold
          : 'Tidak Lulus'.red.bold;
      console.log(
        `  ${(i + 1).toString().padStart(2)}. ${s.id.yellow} - ${s.name.padEnd(
          20
        )} - Kelas: ${s.class.padEnd(10)} - Rata-rata: ${s
          .getAverage()
          .toFixed(2)} - Status: ${status}`
      );
    });
    console.log('═'.repeat(70).cyan.bold);
  }
}

/**
┌────────────────────────────────────┐
│      5. Menu Handlers & Manager    │
└────────────────────────────────────┘
*/

const manager = new StudentManager();
const dataService = new DataService(manager, DATA_FILE);

// --- Helper Functions ---
// Mencari siswa berdasarkan ID atau Nama secara interaktif
function findStudentByIdOrNameInteractive() {
  while (true) {
    const query = readlineSync.question(
      'Masukkan ID Siswa atau Nama (0/Kosong untuk batal): '.cyan
    );

    if (query.trim() === '' || query.trim() === '0') {
      console.log('\n⚠ Pencarian dibatalkan.'.yellow);
      return null;
    }

    const students = manager.findStudentsByIdOrName(query);

    if (students.length === 0) {
      console.log(`\n✗ Siswa dengan ID/Nama "${query}" tidak ditemukan!`.red);
      continue; // Ulangi loop
    } else if (students.length === 1) {
      console.log(`\n✓ 1 siswa ditemukan: ${students[0].name.yellow}`.green);
      return students[0];
    } else {
      console.log(`\n✓ Ditemukan ${students.length} siswa:`.green);
      const studentNames = students.map(
        (s, i) => `${s.name} (${s.id}) - ${s.class}`
      );

      const studentChoice = readlineSync.keyInSelect(
        studentNames,
        'Pilih satu siswa (0 untuk batal):'
      );

      if (studentChoice === -1) {
        console.log('\n⚠ Pencarian dibatalkan.'.yellow);
        return null;
      }
      return students[studentChoice];
    }
  }
}

// Memilih siswa secara interaktif dengan judul tertentu
function selectStudentInteractive(title) {
  UIHandler.displayTitle(title);
  return findStudentByIdOrNameInteractive();
}

// --- Menu 1-3: Statistik Handlers ---

// Menampilkan statistik sekolah
function viewSchoolStatistics() {
  UIHandler.displayTitle('STATISTIK SEKOLAH');
  const stats = manager.getSchoolStatistics();

  UIHandler.displayStats('SEKOLAH', {
    classAverage: stats.schoolAverage,
    totalStudents: stats.totalStudents,
    totalClasses: stats.totalClasses,
    passedStudents: stats.passedStudents,
    failedStudents: stats.failedStudents,
    passRate: stats.passRate,
  });
}

// Menampilkan statistik kelas tertentu
function viewClassStatistics() {
  UIHandler.displayTitle('STATISTIK KELAS');
  const classNames = manager.getAllClassNames();

  if (classNames.length === 0) {
    console.log('\n⚠ Belum ada kelas yang terdaftar.'.yellow);
    return;
  }

  const choices = classNames.map(c => c.toUpperCase().yellow); // menampilkan pilihan
  const choiceIndex = readlineSync.keyInSelect(
    // input pilihan
    choices,
    'Pilih kelas (0 untuk batal):'
  );

  if (choiceIndex === -1) {
    console.log('\n⚠ Tindakan dibatalkan.'.yellow);
    return;
  }

  const className = classNames[choiceIndex];
  const students = manager.getStudentsByClass(className);

  if (students.length === 0) {
    console.log(`\n✗ Tidak ada siswa di kelas ${className}.`.red);
    return;
  }

  const averages = students.map(s => s.getAverage());
  const totalAverage =
    averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
  const passedStudents = students.filter(
    s => s.getGradeStatus() === 'Lulus'
  ).length;
  const failedStudents = students.length - passedStudents;

  UIHandler.displayStats(className, {
    classAverage: totalAverage,
    totalStudents: students.length,
    passedStudents: passedStudents,
    failedStudents: failedStudents,
    passRate: (passedStudents / students.length) * 100,
    highestAverage: Math.max(...averages),
    lowestAverage: Math.min(...averages),
  });

  console.log(`\n Daftar Siswa di Kelas ${className}:`.bold);
  students.forEach((student, index) => {
    const status = student.getGradeStatus() === 'Lulus' ? '✓'.green : '✗'.red;
    console.log(
      `  ${index + 1}. ${student.name.padEnd(20)} (${
        student.id
      }) - Rata-rata: ${student.getAverage().toFixed(2)} ${status}`
    );
  });
}

// Menampilkan daftar 3 siswa terbaik
function viewTopStudents() {
  UIHandler.displayTitle('TOP 3 SISWA TERBAIK');
  const topStudents = manager.getTopStudents(3);
  // UIHandler sudah diperbaiki untuk menampilkan detail yang benar
  UIHandler.displayTopStudents(topStudents);
}

// --- Menu 4-8: Student CRUD Handlers ---
// Menampilkan daftar seluruh siswa
function viewAllStudents() {
  UIHandler.displayTitle('DAFTAR SELURUH SISWA');
  const students = manager.getAllStudents();
  const hasStudents = UIHandler.displayAllStudentsSummary(students);

  if (!hasStudents) return;

  while (true) {
    const query = readlineSync.question(
      '\nMasukkan ID Siswa atau Nama untuk melihat detail (0/Kosong untuk kembali): '
        .cyan
    );
    if (query.trim() === '' || query.trim() === '0') return;

    const matchedStudents = manager.findStudentsByIdOrName(query);

    if (matchedStudents.length === 0) {
      console.log(`\n✗ Siswa dengan ID/Nama "${query}" tidak ditemukan!`.red);
      continue;
    } else if (matchedStudents.length === 1) {
      UIHandler.displayStudentInfo(matchedStudents[0]);
    } else {
      console.log(`\n✓ Ditemukan ${matchedStudents.length} siswa:`.green);
      const studentNames = matchedStudents.map(
        (s, i) => `${s.name} (${s.id}) - ${s.class}`
      );

      const studentChoice = readlineSync.keyInSelect(
        studentNames,
        'Pilih satu siswa (0 untuk batal):'
      );

      if (studentChoice === -1) {
        return; // Kembali ke menu sebelumnya
      }
      UIHandler.displayStudentInfo(matchedStudents[studentChoice]);
    }
  }
}

// --- FUNGSI PENCARIAN searchStudent()) ---

// 1. Mencari berdasarkan kelas
function searchStudentByClass() {
  UIHandler.displayTitle('CARI BERDASARKAN KELAS');
  const classNames = manager.getAllClassNames();

  if (classNames.length === 0) {
    console.log('\n⚠ Belum ada kelas yang terdaftar.'.yellow);
    return;
  }

  const choices = classNames.map(c => c.toUpperCase().yellow);
  const choiceIndex = readlineSync.keyInSelect(
    choices,
    'Pilih kelas yang akan dicari (0 untuk batal):'
  );

  if (choiceIndex === -1) {
    console.log('\n⚠ Pencarian dibatalkan.'.yellow);
    return;
  }

  const className = classNames[choiceIndex];
  const students = manager.getStudentsByClass(className);

  UIHandler.displayFoundStudents(students, `Kelas ${className}`);
}

// 2. Mencari berdasarkan status kelulusan
function searchStudentByGradeStatus() {
  UIHandler.displayTitle('CARI BERDASARKAN STATUS KELULUSAN');
  const choices = ['Lulus', 'Tidak Lulus'];
  const choiceIndex = readlineSync.keyInSelect(
    choices,
    'Pilih Status Kelulusan (0 untuk batal):'
  );

  if (choiceIndex === -1) {
    console.log('\n⚠ Pencarian dibatalkan.'.yellow);
    return;
  }

  const targetStatus = choices[choiceIndex];
  const allStudents = manager.getAllStudents();

  const foundStudents = allStudents.filter(
    s => s.getGradeStatus() === targetStatus
  );

  UIHandler.displayFoundStudents(foundStudents, `Status ${targetStatus}`);
}

// 3. Mencari berdasarkan nilai mata pelajaran
function searchStudentBySubjectScore() {
  UIHandler.displayTitle('CARI BERDASARKAN NILAI MATA PELAJARAN');
  const subjectNames = manager.getAllSubjectNames();

  if (subjectNames.length === 0) {
    console.log(
      '\n⚠ Belum ada mata pelajaran yang terdaftar. Harap daftarkan mapel di Menu 10.'
        .yellow
    );
    return;
  }

  const choices = subjectNames.map(c => c.yellow);
  const subjectChoiceIndex = readlineSync.keyInSelect(
    choices,
    '\nPilih Mata Pelajaran (0 untuk batal):'
  );

  if (subjectChoiceIndex === -1) {
    console.log('\n⚠ Pencarian dibatalkan.'.yellow);
    return;
  }

  const selectedSubject = subjectNames[subjectChoiceIndex];

  console.log('\n--- Kriteria Nilai ---'.bold);
  const operators = ['Lebih dari (>)...', 'Kurang dari (<)...'];
  const operatorChoice = readlineSync.keyInSelect(
    operators,
    'Pilih Operator Perbandingan (0 untuk batal):'
  );

  if (operatorChoice === -1) {
    console.log('\n⚠ Pencarian dibatalkan.'.yellow);
    return;
  }

  let targetScore;
  let isValidScore = false;

  while (!isValidScore) {
    const scoreInput = readlineSync.question(
      `Masukkan Nilai batas (0-100): `.cyan
    );
    targetScore = parseFloat(scoreInput);

    if (isNaN(targetScore) || !Validator.isValidGrade(targetScore)) {
      console.log(
        '✗ Nilai tidak valid! Nilai harus berupa angka antara 0-100.'.red
      );
    } else {
      isValidScore = true;
    }
  }

  const allStudents = manager.getAllStudents();
  let foundStudents = [];
  const operatorText = operators[operatorChoice];

  // Logic Pencarian
  if (operatorChoice === 0) {
    // Lebih dari (>)
    foundStudents = allStudents.filter(s => {
      const grade = s.getGrades()[selectedSubject];
      return grade !== undefined && grade > targetScore;
    });
  } else if (operatorChoice === 1) {
    // Kurang dari (<)
    foundStudents = allStudents.filter(s => {
      const grade = s.getGrades()[selectedSubject];
      return grade !== undefined && grade < targetScore;
    });
  }

  UIHandler.displayFoundStudents(
    foundStudents,
    `${selectedSubject} ${operatorText.replace('...', targetScore)}`
  );
}

// --- FUNGSI UTAMA MENU 5 ---
// Mencari dan menampilkan informasi siswa
function searchStudent() {
  UIHandler.displayTitle('CARI SISWA');
  console.log('\nPilih Kategori Pencarian:'.bold);

  // 1. Definisikan pilihan teks
  const choices = [
    'Cari berdasarkan ID atau Nama',
    'Cari berdasarkan Kelas',
    'Cari berdasarkan Status Kelulusan',
    'Cari berdasarkan Nilai Mata Pelajaran',
  ];

  // 2. Definisikan fungsi yang sesuai dengan indeks pilihan
  const handlers = [
    () => {
      const student = findStudentByIdOrNameInteractive();
      if (student) {
        UIHandler.displayStudentInfo(student);
      }
    },
    searchStudentByClass,
    searchStudentByGradeStatus,
    searchStudentBySubjectScore,
  ];

  const choiceIndex = readlineSync.keyInSelect(
    choices,
    'Pilih Cara (0 untuk batal):'
  );

  // Panggil fungsi berdasarkan indeks pilihan
  if (choiceIndex >= 0 && choiceIndex < handlers.length) {
    handlers[choiceIndex]();
  } else {
    console.log('\n⚠ Pencarian dibatalkan.'.yellow);
    return;
  }
}

// Menambah siswa baru
function addNewStudent() {
  UIHandler.displayTitle('TAMBAH SISWA BARU');

  let id;
  let name;
  let studentClass;
  let finalStudent;

  try {
    const idInput = readlineSync.question(
      'Masukkan ID Siswa (format S001, biarkan kosong untuk auto-generate): '
        .cyan
    );

    if (idInput.trim() === '') {
      id = manager.generateNextStudentId();
      console.log(`  ID Siswa di-generate otomatis: ${id.yellow}`.gray);
    } else {
      if (!Validator.isValidStudentId(idInput)) {
        throw new Error(
          'Format ID tidak valid! Harus menggunakan format S diikuti 3 digit angka (contoh: S001, S012)'
        );
      }
      id = idInput;
    }

    // Perbaikan: Otomatis Capitalized
    name = readlineSync.question('Masukkan Nama Siswa: '.cyan);
    name = capitalize(name);

    if (!Validator.isValidName(name)) {
      throw new Error('Nama tidak boleh kosong!');
    }

    // Perbaikan: Pilihan Kelas
    const classNames = manager.getAllClassNames();
    let classChoiceIndex;

    if (classNames.length > 0) {
      const choices = classNames
        .map(c => c.yellow)
        .concat(['[Tambahkan Kelas Baru]'.cyan.bold]);
      classChoiceIndex = readlineSync.keyInSelect(
        choices,
        'Pilih Kelas (0 untuk batal):'
      );

      if (classChoiceIndex === -1) {
        console.log('\n⚠ Tindakan dibatalkan.'.yellow);
        return;
      } else if (classChoiceIndex < classNames.length) {
        studentClass = classNames[classChoiceIndex];
      } else {
        // Opsi Tambahkan Kelas Baru
        studentClass = readlineSync.question('Masukkan Nama Kelas Baru: '.cyan);
        studentClass = capitalize(studentClass);
        if (!Validator.isValidName(studentClass)) {
          throw new Error('Nama kelas baru tidak boleh kosong!');
        }
      }
    } else {
      studentClass = readlineSync.question('Masukkan Kelas: '.cyan);
      studentClass = capitalize(studentClass);
    }

    if (!Validator.isValidName(studentClass)) {
      throw new Error('Kelas tidak boleh kosong!');
    }

    finalStudent = new Student(id, name, studentClass);
    const result = manager.addStudent(finalStudent);

    console.log(`\n✓ ${result.message}`.green.bold);
    dataService.saveData();
  } catch (error) {
    console.log(`\n✗ Gagal menambahkan siswa: ${error.message}`.red);
  }
}

// Memperbarui atau menghapus data siswa
function manageStudentData() {
  const student = selectStudentInteractive('PERBARUI/HAPUS DATA SISWA');
  if (!student) return;

  console.log('\nSiswa yang dipilih:'.bold);
  UIHandler.displayStudentInfo(student);

  const choice = readlineSync.keyInSelect(
    ['Perbarui Data Siswa (Nama/Kelas)', 'Hapus Siswa'],
    'Pilih tindakan:'
  );

  if (choice === 0) {
    try {
      console.log('\n' + '  Kosongkan jika tidak ingin mengubah'.gray.italic);

      let newName = readlineSync.question(
        'Nama baru (Enter untuk skip): '.cyan
      );
      if (newName.trim() !== '') newName = capitalize(newName);

      let newClass = null;
      const classNames = manager.getAllClassNames();
      if (classNames.length > 0) {
        const choices = classNames
          .map(c => c.yellow)
          .concat([
            '[Tambahkan Kelas Baru]'.cyan.bold,
            '[Lewati Perubahan Kelas]'.gray.italic,
          ]);
        const classChoiceIndex = readlineSync.keyInSelect(
          choices,
          'Pilih Kelas Baru:'
        );

        if (classChoiceIndex === -1) {
          newClass = student.class; // Tidak mengubah jika batal
        } else if (classChoiceIndex < classNames.length) {
          newClass = classNames[classChoiceIndex];
        } else if (classChoiceIndex === classNames.length) {
          // Tambah Kelas Baru
          newClass = readlineSync.question('Masukkan Nama Kelas Baru: '.cyan);
          newClass = capitalize(newClass);
          if (!Validator.isValidName(newClass)) {
            throw new Error('Nama kelas baru tidak boleh kosong!');
          }
        }
      } else if (classNames.length === 0) {
        // Jika tidak ada kelas terdaftar, berikan opsi input manual
        newClass = readlineSync.question(
          'Kelas baru (Enter untuk skip): '.cyan
        );
        if (newClass.trim() !== '') newClass = capitalize(newClass);
      }

      const updateData = {};
      if (newName && newName.trim() !== '') updateData.name = newName;
      if (
        newClass &&
        newClass.trim() !== '' &&
        newClass.toLowerCase() !== student.class.toLowerCase()
      )
        updateData.class = newClass;

      if (Object.keys(updateData).length === 0) {
        console.log('\n⚠ Tidak ada perubahan yang dilakukan.'.yellow);
        return;
      }

      const result = manager.updateStudent(student.id, updateData);
      console.log(`\n✓ ${result.message}`.green.bold);
      dataService.saveData();
      console.log('\n Data setelah update:'.bold);
      UIHandler.displayStudentInfo(student);
    } catch (error) {
      console.log(`\n✗ Gagal mengupdate data siswa: ${error.message}`.red);
    }
  } else if (choice === 1) {
    const confirmation = readlineSync.question(
      `\n⚠️  Apakah Anda yakin ingin menghapus ${student.name.yellow.bold}? (Y/N): `
        .red.bold
    );

    if (confirmation.toUpperCase() === 'Y') {
      try {
        const result = manager.removeStudent(student.id);
        console.log(
          `\n✓ ${result.message} ${student.name} (${student.id})`.green.bold
        );
        dataService.saveData();
      } catch (error) {
        console.log(`\n✗ Gagal menghapus siswa: ${error.message}`.red);
      }
    } else {
      console.log('\n⚠ Penghapusan dibatalkan.'.yellow);
    }
  }
}

// Memperbarui atau menambah nilai siswa
function addGradeToStudent() {
  const student = selectStudentInteractive('PERBARUI NILAI SISWA');
  if (!student) return;

  try {
    console.log('\nSiswa yang dipilih:'.bold);
    console.log(`  Nama: ${student.name}`.yellow);
    console.log(`  Kelas: ${student.class}`.yellow);

    // Perbaikan: Pilih Mapel dari daftar global
    const subjectNames = manager.getAllSubjectNames();
    if (subjectNames.length === 0) {
      throw new Error(
        'Belum ada mata pelajaran yang terdaftar. Harap daftarkan mapel di Menu 10.'
      );
    }

    const choices = subjectNames.map(c => c.yellow);
    const subjectChoiceIndex = readlineSync.keyInSelect(
      choices,
      '\nPilih Mata Pelajaran (0 untuk batal):'
    );

    if (subjectChoiceIndex === -1) {
      console.log('\n⚠ Tindakan dibatalkan.'.yellow);
      return;
    }

    const subject = subjectNames[subjectChoiceIndex];
    let score;
    let isValidScore = false;

    while (!isValidScore) {
      const scoreInput = readlineSync.question(
        `Masukkan Nilai ${subject} (0-100): `.cyan
      );
      score = parseFloat(scoreInput);

      if (isNaN(score) || !Validator.isValidGrade(score)) {
        console.log(
          '✗ Nilai tidak valid! Nilai harus berupa angka antara 0-100.'.red
        );
      } else {
        isValidScore = true;
      }
    }

    if (student.addGrade(subject, score)) {
      console.log(
        `\n✓ Nilai ${subject} (${score}) berhasil ditambahkan/diperbarui untuk ${student.name}!`
          .green.bold
      );
      dataService.saveData();
      console.log('\n Ringkasan Nilai:'.bold);
      UIHandler.displayStudentInfo(student);
    }
  } catch (error) {
    console.log(`\n✗ Gagal memperbarui nilai: ${error.message}`.red);
  }
}

// --- Menu 9-10: Data Management Handlers ---
// Memperbarui atau menambah nama kelas
function manageClassNames() {
  UIHandler.displayTitle('KELOLA NAMA KELAS');
  const classNames = manager.getAllClassNames();

  const choices = classNames
    .map(c => c.yellow)
    .concat(['[Tambahkan Kelas Baru]'.cyan.bold]);

  const choice = readlineSync.keyInSelect(
    choices,
    'Pilih kelas yang akan diubah (0 untuk batal):'
  );

  if (choice === -1) {
    console.log('\n⚠ Tindakan dibatalkan.'.yellow);
    return;
  }

  if (choice < classNames.length) {
    // Perbarui Kelas yang sudah ada
    const oldClassName = classNames[choice];
    const newClassName = readlineSync.question(
      `Masukkan nama baru untuk kelas '${oldClassName}': `.cyan
    );

    try {
      if (newClassName.toLowerCase() === oldClassName.toLowerCase()) {
        console.log(
          '⚠ Nama kelas baru sama dengan nama lama. Tidak ada perubahan.'.yellow
        );
        return;
      }

      const newClassNameCapitalized = capitalize(newClassName);

      const result = manager.updateClassName(
        oldClassName,
        newClassNameCapitalized
      );

      if (result.count > 0) {
        console.log(
          `\n✓ Sukses! Nama kelas '${oldClassName}' telah diubah menjadi '${newClassNameCapitalized}' untuk ${result.count} siswa.`
            .green.bold
        );
        dataService.saveData();
      } else {
        // Update nama kelas di daftar global, meskipun tidak ada siswa yang terpengaruh
        console.log(
          `\n✓ Sukses! Nama kelas '${oldClassName}' telah diubah menjadi '${newClassNameCapitalized}' di daftar kelas terdaftar.`
            .green.bold
        );
        dataService.saveData();
      }
    } catch (error) {
      console.log(`\n✗ Gagal memperbarui nama kelas: ${error.message}`.red);
    }
  } else {
    // Tambah Kelas Baru
    const newClassName = readlineSync.question(
      'Masukkan Nama Kelas Baru: '.cyan
    );
    const newClassNameCapitalized = capitalize(newClassName);

    try {
      if (!Validator.isValidName(newClassNameCapitalized)) {
        throw new Error('Nama kelas tidak boleh kosong!');
      }
      const result = manager.addClassName(newClassNameCapitalized);
      if (result.success) {
        console.log(`\n✓ ${result.message}`.green.bold);
        dataService.saveData();
      } else {
        console.log(`\n⚠ ${result.message}`.yellow);
      }
    } catch (error) {
      console.log(`\n✗ Gagal menambahkan kelas baru: ${error.message}`.red);
    }
  }
}

// Memperbarui atau menambah nama mata pelajaran
function manageSubjectNames() {
  UIHandler.displayTitle('KELOLA NAMA MATA PELAJARAN');
  const subjectNames = manager.getAllSubjectNames();

  const choices = subjectNames
    .map(c => c.yellow)
    .concat(['[Tambahkan Mata Pelajaran Baru]'.cyan.bold]);

  const choice = readlineSync.keyInSelect(
    choices,
    'Pilih mata pelajaran yang akan diubah (0 untuk batal):'
  );

  if (choice === -1) {
    console.log('\n⚠ Tindakan dibatalkan.'.yellow);
    return;
  }

  if (choice < subjectNames.length) {
    // Perbarui Mapel yang sudah ada
    const oldSubjectName = subjectNames[choice];
    const newSubjectName = readlineSync.question(
      `Masukkan nama baru untuk mapel '${oldSubjectName}': `.cyan
    );

    try {
      if (newSubjectName.toLowerCase() === oldSubjectName.toLowerCase()) {
        console.log(
          '⚠ Nama mapel baru sama dengan nama lama. Tidak ada perubahan.'.yellow
        );
        return;
      }

      const newSubjectNameCapitalized = capitalize(newSubjectName);

      const result = manager.updateSubjectName(
        oldSubjectName,
        newSubjectNameCapitalized
      );

      if (result.count >= 0) {
        // Hitungan 0 juga sukses, karena update di daftar global pasti terjadi
        console.log(
          `\n✓ Sukses! Nama mapel '${oldSubjectName}' telah diubah menjadi '${newSubjectNameCapitalized}' di data ${result.count} siswa.`
            .green.bold
        );
        dataService.saveData();
      }
    } catch (error) {
      console.log(`\n✗ Gagal memperbarui nama mapel: ${error.message}`.red);
    }
  } else {
    // Tambah Mapel Baru
    const newSubjectName = readlineSync.question(
      'Masukkan Nama Mata Pelajaran Baru: '.cyan
    );
    const newSubjectNameCapitalized = capitalize(newSubjectName);

    try {
      if (!Validator.isValidName(newSubjectNameCapitalized)) {
        throw new Error('Nama mata pelajaran tidak boleh kosong!');
      }
      const result = manager.addSubjectName(newSubjectNameCapitalized);
      if (result.success) {
        console.log(`\n✓ ${result.message}`.green.bold);
        dataService.saveData();
      } else {
        console.log(`\n⚠ ${result.message}`.yellow);
      }
    } catch (error) {
      console.log(
        `\n✗ Gagal menambahkan mata pelajaran baru: ${error.message}`.red
      );
    }
  }
}
/**
┌────────────────────────────────────┐
│          6. Main Function          │
└────────────────────────────────────┘
*/

//  Main function untuk menjalankan aplikasi
async function main() {
  console.clear();
  UIHandler.displayTitle('SELAMAT DATANG DI SISTEM MANAJEMEN NILAI SISWA');

  await UIHandler.showLoadingAnimation('Memuat...');

  try {
    const loadResult = dataService.loadData();

    if (loadResult.count > 0) {
      console.log(` ✓  Data berhasil dimuat (${loadResult.count} siswa)`.cyan);
    } else if (loadResult.message) {
      console.log(` ⚠  ${loadResult.message}`.red);
    }
  } catch (error) {
    console.error(`\n✗ Gagal memuat data: ${error.message}`.red.bold);
    console.log('✗ Aplikasi dihentikan karena kegagalan memuat data.'.red);
    return;
  }

  let running = true;
  while (running) {
    UIHandler.displayMenu();

    const choice = readlineSync.question('\nPilih menu (0-10): '.bold.cyan);

    switch (choice) {
      case '1':
        viewSchoolStatistics();
        break;
      case '2':
        viewClassStatistics();
        break;
      case '3':
        viewTopStudents();
        break;
      case '4':
        viewAllStudents();
        break;
      case '5':
        searchStudent();
        break;
      case '6':
        addNewStudent();
        break;
      case '7':
        manageStudentData();
        break;
      case '8':
        addGradeToStudent();
        break;
      case '9':
        manageClassNames();
        break;
      case '10':
        manageSubjectNames();
        break;
      case '0':
        console.clear();
        console.log('Terima kasih telah menggunakan aplikasi ini!'.cyan);
        console.log('✓ Keluar dari aplikasi...'.cyan);
        running = false;
        break;
      default:
        console.log('\n✗ Pilihan tidak valid! Silakan pilih 0-10.'.red);
    }

    if (running && choice !== '0') {
      readlineSync.question('\nTekan Enter untuk kembali ke menu...'.gray);
    }
  }
}
// Jalankan aplikasi
main();
