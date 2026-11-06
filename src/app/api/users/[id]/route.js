import { NextResponse } from "next/server";
import { getStudents, saveStudents } from "../data";

// ฟังก์ชันช่วยค้นหานักศึกษา: รองรับทั้งค้นหาด้วย "เลขที่ (no)" หรือ "รหัสนักศึกษา (studentId)"
function findStudent(students, id) {
  return students.find(
    (u) => String(u.no) === id || u.studentId === id
  );
}

function findStudentIndex(students, id) {
  return students.findIndex(
    (u) => String(u.no) === id || u.studentId === id
  );
}

//================================================================================
// 1. GET By ID: ดึงดูข้อมูล (ใช้เลขที่ เช่น /api/users/1 หรือ รหัส /api/users/69319010024)
//================================================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const students = getStudents();

    const student = findStudent(students, id);

    if (!student) {
      return NextResponse.json(
        { success: false, message: `ไม่พบข้อมูลนักศึกษา (ค้นหาด้วย: ${id})` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `ดึงข้อมูลนักศึกษาสำเร็จ (เลขที่ ${student.no}, รหัส ${student.studentId})`,
        data: student,
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
// 2. POST By ID: ทำรายการเจาะจงกับนักศึกษาคนนี้ (ใช้เลขที่ หรือ รหัส)
//================================================================================
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const students = getStudents();

    const student = findStudent(students, id);

    if (!student) {
      return NextResponse.json(
        { success: false, message: `ไม่พบนักศึกษา (ค้นหาด้วย: ${id})` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `ประมวลผลคำขอสำหรับนักศึกษาสำเร็จ`,
        student: student,
        receivedData: body,
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
// 3. PUT By ID: แก้ไขชื่อและเบอร์โทร (กำกับด้วยเลขที่ "no" ใน Body เสมอ)
// Body: { "no": 1, "fullName": "ชื่อใหม่", "phone": "0899999999" }
//================================================================================
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const students = getStudents();

    const studentIndex = findStudentIndex(students, id);

    if (studentIndex === -1) {
      return NextResponse.json(
        { success: false, message: `ไม่พบนักศึกษาที่ต้องการแก้ไข (ค้นหาด้วย: ${id})` },
        { status: 404 }
      );
    }

    // ตรวจสอบความถูกต้อง: ถ้ามีการส่ง no มา ต้องตรงกับเลขที่ของคนนี้เพื่อป้องกันแก้ไขผิดคน
    if (body.no !== undefined && String(body.no) !== String(students[studentIndex].no)) {
      return NextResponse.json(
        {
          success: false,
          message: `เลขที่ใน Body (${body.no}) ไม่ตรงกับเลขที่ใน URL (${students[studentIndex].no})`,
        },
        { status: 400 }
      );
    }

    // แก้ไขเฉพาะ fullName และ phone (เลขที่ no และ studentId จะคงเดิมเสมอ)
    if (body.fullName !== undefined || body.name !== undefined) {
      students[studentIndex].fullName = String(body.fullName || body.name).trim();
    }

    if (body.phone !== undefined || body.tel !== undefined) {
      students[studentIndex].phone = String(body.phone || body.tel).trim();
    }

    // บันทึกลงไฟล์ students.json จริง
    saveStudents(students);

    return NextResponse.json(
      {
        success: true,
        message: `แก้ไขข้อมูลนักศึกษาสำเร็จ (เลขที่ ${students[studentIndex].no})`,
        data: students[studentIndex],
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
// 4. DELETE By ID: ลบข้อมูล (ใช้เลขที่ เช่น /api/users/1 ก็ลบได้ทันที!)
//================================================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const students = getStudents();

    const studentIndex = findStudentIndex(students, id);

    if (studentIndex === -1) {
      return NextResponse.json(
        { success: false, message: `ไม่พบนักศึกษาที่ต้องการลบ (ค้นหาด้วย: ${id})` },
        { status: 404 }
      );
    }

    const deletedStudent = students.splice(studentIndex, 1)[0];

    // บันทึกการลบลงไฟล์ students.json จริง
    saveStudents(students);

    return NextResponse.json(
      {
        success: true,
        message: `ลบข้อมูลนักศึกษาเลขที่ ${deletedStudent.no} (รหัส ${deletedStudent.studentId}) เรียบร้อยแล้ว`,
        data: deletedStudent,
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
