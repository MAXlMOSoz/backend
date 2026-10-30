import { NextResponse } from "next/server";
import { usersList } from "./data";

//================================================================================
// GET Function: ดึงรายการผู้ใช้ทั้งหมด (/api/users)
//================================================================================
export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        message: "ดึงข้อมูลผู้ใช้ทั้งหมดสำเร็จ",
        total: usersList.length,
        data: usersList,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

//================================================================================
// POST Function: สร้างหรือเพิ่มผู้ใช้ใหม่ (/api/users)
//================================================================================
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    // ตรวจสอบว่ามีข้อมูลส่งมาหรือไม่
    if (!body || (!body.name && !body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาส่งข้อมูล name หรือ email อย่างน้อยหนึ่งอย่าง",
        },
        { status: 400 }
      );
    }

    // กำหนด ID: ถ้าผู้ใช้ระบุ id มาเองให้ใช้ค่านั้น ถ้าไม่ระบุให้รันเลขต่อให้อัตโนมัติ
    let assignedId;
    if (body.id) {
      assignedId = String(body.id);
      // ตรวจสอบว่า ID ซ้ำหรือไม่
      const isDuplicate = usersList.some((u) => u.id === assignedId);
      if (isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            message: `ID ${assignedId} นี้มีอยู่ในระบบแล้ว กรุณาใช้ ID อื่น`,
          },
          { status: 400 }
        );
      }
    } else {
      // Auto-increment ID: รันเลข 1, 2, 3 ถัดไป
      const maxId = usersList.reduce((max, u) => {
        const num = Number(u.id);
        return !isNaN(num) && num > max ? num : max;
      }, 0);
      assignedId = String(maxId + 1);
    }

    // สร้างข้อมูลผู้ใช้ใหม่
    const newUser = {
      id: assignedId,
      name: body.name || "ไม่ระบุชื่อ",
      email: body.email || "ไม่ระบุอีเมล",
    };

    // บันทึกผู้ใช้ใหม่ลงในฐานข้อมูลจำลอง
    usersList.push(newUser);

    console.log("เพิ่มผู้ใช้สำเร็จ:", newUser);

    // ตอบกลับพร้อมข้อมูลและ ID ที่สร้างขึ้นมา
    return NextResponse.json(
      {
        success: true,
        message: `เพิ่มข้อมูลผู้ใช้ ID ${assignedId} สำเร็จ`,
        data: newUser, // ส่งข้อมูลทั้งหมดกลับไป ให้ Client รู้ ID ของตัวเอง
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
