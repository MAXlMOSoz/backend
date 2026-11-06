import fs from "fs";
import path from "path";

// ชี้ตำแหน่งไปยังไฟล์ students.json ที่เก็บข้อมูลจริงในเครื่อง
const filePath = path.join(process.cwd(), "src/app/api/users/students.json");

/**
 * ฟังก์ชันอ่านข้อมูลนักศึกษาทั้งหมดจากไฟล์ students.json
 */
export function getStudents() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent || "[]");
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอ่านไฟล์:", error);
    return [];
  }
}

/**
 * ฟังก์ชันบันทึกข้อมูลนักศึกษาทั้งหมดลงไฟล์ students.json บนฮาร์ดดิสก์จริง
 */
export function saveStudents(students) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(students, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเขียนไฟล์:", error);
    return false;
  }
}
