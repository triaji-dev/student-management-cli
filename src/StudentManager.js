import Student from './Student.js';
import { Validator } from './../index.js';

/**
┌────────────────────────────────────┐
│         StudentManager Class       │
└────────────────────────────────────┘
*/

export default class StudentManager {
  #students;
  #classNames;
  #subjectNames;

  constructor() {
    this.#students = [];
    this.#classNames = []; // Daftar kelas yang terdaftar
    this.#subjectNames = []; // Daftar mapel yang terdaftar
  }

  // --- SETTERS / LOADERS for DataService ---

  setAllClassNames(classNames) {
    this.#classNames = [...new Set(classNames)].sort();
  }

  setAllSubjectNames(subjectNames) {
    this.#subjectNames = [...new Set(subjectNames)].sort();
    // Sinkronkan daftar mapel ke setiap objek Student
    this.#students.forEach(student =>
      student.setAllSubjectNames(this.#subjectNames)
    );
  }

  // --- STUDENT CRUD ---

  addStudent(student) {
    if (!(student instanceof Student)) {
      throw new Error('Objek harus instance dari Student.');
    }
    if (this.findStudent(student.id)) {
      throw new Error(`ID ${student.id} sudah digunakan.`);
    }
    if (!Validator.isValidName(student.name)) {
      throw new Error('Nama siswa tidak boleh kosong.');
    }

    // Pastikan siswa baru disinkronkan dengan daftar mapel global
    student.setAllSubjectNames(this.#subjectNames);

    // Tambahkan kelas baru ke daftar kelas jika belum ada
    this.addClassName(student.class);

    this.#students.push(student);
    return {
      success: true,
      message: `Siswa ${student.name} berhasil ditambahkan.`,
    };
  }

  removeStudent(id) {
    const index = this.#students.findIndex(student => student.id === id);

    if (index === -1) {
      throw new Error(`Siswa dengan ID ${id} tidak ditemukan.`);
    }

    this.#students.splice(index, 1);
    // Note: Tidak menghapus kelas/mapel dari daftar global meskipun siswanya hilang
    return { success: true, message: `Siswa berhasil dihapus.` };
  }

  findStudent(id) {
    return this.#students.find(student => student.id === id) || null;
  }

  findStudentsByIdOrName(query) {
    if (!Validator.isValidName(query)) return [];

    const lowerQuery = query.toLowerCase();

    // Prioritas 1: ID persis
    const studentById = this.findStudent(query);
    if (studentById) return [studentById];

    // Prioritas 2: Pencocokan parsial nama atau ID yang mirip
    return this.#students.filter(
      student =>
        student.name.toLowerCase().includes(lowerQuery) ||
        student.id.toLowerCase().includes(lowerQuery)
    );
  }

  updateStudent(id, data) {
    const student = this.findStudent(id);

    if (!student) {
      throw new Error(`Siswa dengan ID ${id} tidak ditemukan.`);
    }

    if (data.name !== undefined) {
      if (!Validator.isValidName(data.name)) {
        throw new Error('Nama tidak boleh kosong.');
      }
      student.name = data.name;
    }

    if (data.class !== undefined) {
      if (!Validator.isValidName(data.class)) {
        throw new Error('Kelas tidak boleh kosong.');
      }
      student.class = data.class;
      // Tambahkan kelas baru ke daftar kelas jika belum ada
      this.addClassName(data.class);
    }

    return { success: true, message: 'Data siswa berhasil diupdate.' };
  }

  // --- CLASS MANAGEMENT ---

  addClassName(className) {
    const lowerCaseName = className.toLowerCase();
    if (!this.#classNames.map(n => n.toLowerCase()).includes(lowerCaseName)) {
      this.#classNames.push(className);
      this.#classNames.sort();
      return {
        success: true,
        message: `Kelas '${className}' berhasil ditambahkan.`,
      };
    }
    return { success: false, message: `Kelas '${className}' sudah ada.` };
  }

  updateClassName(oldName, newName) {
    if (!Validator.isValidName(newName)) {
      throw new Error('Nama kelas baru tidak boleh kosong.');
    }

    const index = this.#classNames.findIndex(
      n => n.toLowerCase() === oldName.toLowerCase()
    );
    if (index === -1) {
      throw new Error(
        `Kelas '${oldName}' tidak ditemukan dalam daftar kelas terdaftar.`
      );
    }

    // Update di daftar kelas global
    this.#classNames[index] = newName;
    this.#classNames.sort();

    // Update di semua siswa
    let count = 0;
    this.#students.forEach(student => {
      if (student.class.toLowerCase() === oldName.toLowerCase()) {
        student.class = newName;
        count++;
      }
    });
    return { success: true, count, message: 'Nama kelas berhasil diupdate.' };
  }

  getAllClassNames() {
    return [...this.#classNames];
  }

  getStudentsByClass(className) {
    return this.#students.filter(
      student => student.class.toLowerCase() === className.toLowerCase()
    );
  }

  // --- SUBJECT MANAGEMENT ---

  addSubjectName(subjectName) {
    const lowerCaseName = subjectName.toLowerCase();
    if (!this.#subjectNames.map(n => n.toLowerCase()).includes(lowerCaseName)) {
      this.#subjectNames.push(subjectName);
      this.#subjectNames.sort();
      // Sinkronkan ke semua siswa
      this.setAllSubjectNames(this.#subjectNames);
      return {
        success: true,
        message: `Mata pelajaran '${subjectName}' berhasil ditambahkan.`,
      };
    }
    return {
      success: false,
      message: `Mata pelajaran '${subjectName}' sudah ada.`,
    };
  }

  updateSubjectName(oldName, newName) {
    if (!Validator.isValidName(newName)) {
      throw new Error('Nama mapel baru tidak boleh kosong.');
    }

    const index = this.#subjectNames.findIndex(
      n => n.toLowerCase() === oldName.toLowerCase()
    );
    if (index === -1) {
      throw new Error(
        `Mata pelajaran '${oldName}' tidak ditemukan dalam daftar mapel terdaftar.`
      );
    }

    const newNameLower = newName.toLowerCase();
    const isNewNameExists = this.#subjectNames.some(
      (name, i) => i !== index && name.toLowerCase() === newNameLower
    );
    if (isNewNameExists) {
      throw new Error(`Nama mapel '${newName}' sudah ada pada daftar global.`);
    }

    // Update di daftar mapel global
    this.#subjectNames[index] = newName;
    this.#subjectNames.sort();

    // Sinkronkan ke semua siswa
    this.setAllSubjectNames(this.#subjectNames);

    // Update di data nilai masing-masing siswa
    let count = 0;
    this.#students.forEach(student => {
      try {
        if (student.renameSubject(oldName, newName)) {
          count++;
        }
      } catch (e) {
        // Abaikan error renameSubject level siswa
      }
    });

    return {
      success: true,
      count,
      message: 'Nama mata pelajaran berhasil diupdate.',
    };
  }

  getAllSubjectNames() {
    return [...this.#subjectNames];
  }

  getAllStudents() {
    return [...this.#students];
  }

  // --- STATISTICS ---

  getTopStudents(n = 3) {
    // 1. Filter hanya siswa yang Lulus
    const passedStudents = this.#students.filter(
      student => student.getGradeStatus() === 'Lulus'
    );

    // 2. Urutkan berdasarkan rata-rata
    const sortedStudents = [...passedStudents].sort((a, b) => {
      return b.getAverage() - a.getAverage();
    });

    // 3. Ambil N teratas
    return sortedStudents.slice(0, n);
  }

  getSchoolStatistics() {
    const totalStudents = this.getStudentCount();
    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        totalClasses: 0,
        schoolAverage: 0,
        passedStudents: 0,
        failedStudents: 0,
        passRate: 0,
      };
    }

    // Rata-rata setiap siswa sudah dihitung berdasarkan semua mapel terdaftar
    const averages = this.#students.map(s => s.getAverage());
    const totalAverage =
      averages.reduce((sum, avg) => sum + avg, 0) / totalStudents;
    const passedStudents = this.#students.filter(
      s => s.getGradeStatus() === 'Lulus'
    ).length;
    const totalClasses = this.getAllClassNames().length;

    return {
      totalStudents: totalStudents,
      totalClasses: totalClasses,
      schoolAverage: totalAverage,
      passedStudents: passedStudents,
      failedStudents: totalStudents - passedStudents,
      passRate: (passedStudents / totalStudents) * 100,
    };
  }

  // --- UTILS ---

  generateNextStudentId() {
    let maxId = 0;
    this.#students.forEach(s => {
      if (Validator.isValidStudentId(s.id)) {
        const idNum = parseInt(s.id.substring(1));
        if (idNum > maxId) maxId = idNum;
      }
    });
    return `S${(maxId + 1).toString().padStart(3, '0')}`;
  }

  getStudentCount() {
    return this.#students.length;
  }

  toJSON() {
    return this.#students.map(student => student.toJSON());
  }

  fromJSON(data) {
    this.#students = [];
    if (Array.isArray(data)) {
      data.forEach(studentData => {
        const student = Student.fromJSON(studentData);
        // Student's allSubjectNames will be set later by setAllSubjectNames
        this.#students.push(student);
      });
    }
  }
}
