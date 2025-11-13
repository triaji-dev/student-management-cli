import { Validator, CONFIG } from './../index.js';

/**
┌────────────────────────────────────┐
│            Student Class           │
└────────────────────────────────────┘
*/

export default class Student {
  #grades;
  #allSubjectNames = [];

  constructor(id, name, studentClass, grades = {}) {
    this.id = id;
    this.name = name;
    this.class = studentClass;
    this.#grades = grades;
  }

  // Digunakan oleh StudentManager untuk menyinkronkan daftar mapel global
  setAllSubjectNames(subjectNames) {
    this.#allSubjectNames = [...subjectNames];
  }

  getAllRegisteredSubjectNames() {
    return this.#allSubjectNames;
  }

  getRegisteredSubjectCount() {
    return this.#allSubjectNames.length;
  }

  addGrade(subject, score) {
    if (!Validator.isValidGrade(score)) {
      throw new Error('Nilai harus antara 0 dan 100.');
    }

    this.#grades[subject] = score;
    return true;
  }

  renameSubject(oldName, newName) {
    if (
      this.#grades[oldName] !== undefined &&
      this.#grades[newName] === undefined
    ) {
      this.#grades[newName] = this.#grades[oldName];
      delete this.#grades[oldName];
      return true;
    } else if (this.#grades[newName] !== undefined) {
      // Jika nilai subjek yang lama ada, tapi subjek baru sudah ada, jangan lakukan apa-apa
      return false;
    }
    return false;
  }

  getAverage() {
    const subjects = this.#allSubjectNames;
    if (subjects.length === 0) return 0;

    // Hitung rata-rata menggunakan semua mapel terdaftar, dengan nilai 0 untuk yang belum diisi
    const total = subjects.reduce(
      (sum, subject) => sum + (this.#grades[subject] || 0),
      0
    );
    return total / subjects.length;
  }

  getGradeStatus() {
    const subjects = this.#allSubjectNames;
    if (subjects.length === 0) {
      // Jika tidak ada mapel, statusnya Lulus (karena tidak ada syarat yang dilanggar)
      return 'Lulus';
    }

    const currentAverage = this.getAverage();

    // 1. Cek Nilai Minimal
    for (const subject of subjects) {
      // Jika nilai diisi dan di bawah batas minimum, langsung Tidak Lulus
      if (
        this.#grades[subject] !== undefined &&
        this.#grades[subject] < CONFIG.MIN_FAIL_GRADE
      ) {
        return 'Tidak Lulus';
      }
    }

    // 2. Cek Rata-rata
    if (currentAverage >= CONFIG.PASSING_GRADE) {
      return 'Lulus';
    }

    return 'Tidak Lulus';
  }

  getGrades() {
    return { ...this.#grades };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      class: this.class,
      grades: this.getGrades(),
    };
  }

  static fromJSON(data) {
    // Note: allSubjectNames disuntikkan oleh StudentManager setelah pemuatan data
    return new Student(data.id, data.name, data.class, data.grades || {});
  }
}
