import { NextResponse } from "next/server";
import { usersList } from "../data";

//================================================================================
// 1. GET By ID Function (/api/users/[id])
// หน้าที่: ดึงข้อมูลผู้ใช้รายบุคคลตาม ID ที่ส่งมาใน URL
//================================================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // ค้นหาผู้ใช้จาก ID ในฐานข้อมูลจำลอง
    const user = usersList.find((u) => u.id === id);

    // หากไม่พบ ID ในระบบ
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่พบข้อมูลผู้ใช้ ID ${id}`,
        },
        { status: 404 }
      );
    }

    // หากพบ ส่งข้อมูลผู้ใช้คนนั้นกลับไปครบถ้วน
    return NextResponse.json(
      {
        success: true,
        message: `ดึงข้อมูลผู้ใช้ ID ${id} สำเร็จ`,
        data: user,
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
// 2. POST to ID Function (/api/users/[id])
// หน้าที่: ส่งข้อมูลการทำงานเฉพาะเจาะจงกับผู้ใช้ ID นี้
//================================================================================
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // ตรวจสอบว่าผู้ใช้ ID นี้มีอยู่จริงหรือไม่
    const user = usersList.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถดำเนินการได้ ไม่พบผู้ใช้ ID ${id}`,
        },
        { status: 404 }
      );
    }

    console.log(`ประมวลผลคำขอ POST สำหรับผู้ใช้ ID ${id}:`, body);

    return NextResponse.json(
      {
        success: true,
        message: `ประมวลผลคำขอสำหรับผู้ใช้ ID ${id} สำเร็จ`,
        user: user,
        receivedData: body,
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
// 3. PUT Function (/api/users/[id])
// หน้าที่: แก้ไขหรืออัปเดตข้อมูลผู้ใช้ตาม ID
//================================================================================
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // ค้นหาตำแหน่ง index ของผู้ใช้ใน Array
    const userIndex = usersList.findIndex((u) => u.id === id);

    // หากไม่พบผู้ใช้
    if (userIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่พบผู้ใช้ ID ${id} ที่ต้องการแก้ไข`,
        },
        { status: 404 }
      );
    }

    // อัปเดตข้อมูลผู้ใช้ โดยคงค่า ID เดิมไว้
    usersList[userIndex] = {
      ...usersList[userIndex],
      name: body.name !== undefined ? body.name : usersList[userIndex].name,
      email: body.email !== undefined ? body.email : usersList[userIndex].email,
    };

    console.log(`อัปเดตข้อมูลผู้ใช้ ID ${id} สำเร็จ:`, usersList[userIndex]);

    return NextResponse.json(
      {
        success: true,
        message: `แก้ไขข้อมูลผู้ใช้ ID ${id} สำเร็จ`,
        data: usersList[userIndex],
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
// 4. DELETE Function (/api/users/[id])
// หน้าที่: ลบผู้ใช้ออกจากระบบตาม ID
//================================================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // ค้นหาตำแหน่ง index ของผู้ใช้ใน Array
    const userIndex = usersList.findIndex((u) => u.id === id);

    // หากไม่พบผู้ใช้
    if (userIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่พบผู้ใช้ ID ${id} ที่ต้องการลบ`,
        },
        { status: 404 }
      );
    }

    // ลบผู้ใช้คนนั้นออกจาก Array
    const deletedUser = usersList.splice(userIndex, 1)[0];

    console.log(`ลบผู้ใช้ ID ${id} สำเร็จ:`, deletedUser);

    return NextResponse.json(
      {
        success: true,
        message: `ลบข้อมูลผู้ใช้ ID ${id} เรียบร้อยแล้ว`,
        data: deletedUser,
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
