import { NextResponse } from "next/server";
import { getStudents, saveStudents } from "./data";

const STARTING_STUDENT_ID = "69319010024";

//================================================================================
// 1. GET: ดึงข้อมูลนักศึกษาทั้งหมด
// Endpoint: GET /api/users
//================================================================================
export async function GET() {
  try {
    const students = getStudents();

    return NextResponse.json(
      {
        success: true,
        message: "ดึงข้อมูลนักศึกษาทั้งหมดสำเร็จ",
        total: students.length,
        data: students,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", error: error.message },
      { status: 500 }
    );
  }
}

//================================================================================
// 2. POST: เพิ่มข้อมูลนักศึกษาใหม่
// - ผู้ใช้ส่งมาแค่: fullName (ชื่อ-สกุล) และ phone (เบอร์โทร)
// - ระบบรัน:
//    1) "no" (เลขที่) +1 ให้อัตโนมัติ (เช่น 1, 2, 3...)
//    2) "studentId" (รหัสนักศึกษา) +1 ให้อัตโนมัติ (เช่น 69319010024, 69319010025...)
// Endpoint: POST /api/users
// Body: { "fullName": "ชื่อ สกุล", "phone": "0812345678" }
//================================================================================
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const fullName = String(body.fullName || body.name || "").trim();
    const phone = String(body.phone || body.tel || "").trim();

    if (!fullName) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุชื่อ-นามสกุล (fullName)" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุเบอร์โทรศัพท์ (phone)" },
        { status: 400 }
      );
    }

    const students = getStudents();

    // 1. คำนวณเลขที่ (no) ใหม่ (+1 จากเลขที่สูงสุด)
    const maxNo = students.reduce((max, u) => Math.max(max, Number(u.no) || 0), 0);
    const nextNo = maxNo + 1;

    // 2. คำนวณรหัสนักศึกษาใหม่ (+1 จากรหัสสูงสุด)
    let nextStudentId;
    if (students.length === 0) {
      nextStudentId = STARTING_STUDENT_ID;
    } else {
      const maxId = students.reduce((max, u) => {
        try {
          const current = BigInt(u.studentId);
          return current > max ? current : max;
        } catch {
          return max;
        }
      }, 0n);

      nextStudentId = maxId > 0n ? (maxId + 1n).toString() : STARTING_STUDENT_ID;
    }

    // สร้างข้อมูลนักศึกษาใหม่
    const newStudent = {
      no: nextNo,
      studentId: nextStudentId,
      fullName: fullName,
      phone: phone,
    };

    // บันทึกลงไฟล์ students.json จริง
    students.push(newStudent);
    saveStudents(students);

    console.log(`เพิ่มนักศึกษาใหม่สำเร็จ เลขที่: ${nextNo}, รหัส: ${nextStudentId}`);

    return NextResponse.json(
      {
        success: true,
        message: `เพิ่มข้อมูลสำเร็จ (เลขที่ ${nextNo}, รหัส ${nextStudentId})`,
        data: newStudent,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", error: error.message },
      { status: 500 }
    );
  }
}
