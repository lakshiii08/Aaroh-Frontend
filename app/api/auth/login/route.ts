import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, rollNo, pin, grade, email, password } = body;

    if (role === "student") {
      if (!rollNo || !pin) {
        return NextResponse.json(
          { error: "Roll Number and 4-digit PIN are required." },
          { status: 400 }
        );
      }

      if (pin.trim().length !== 4 || !/^\d{4}$/.test(pin.trim())) {
        return NextResponse.json(
          { error: "PIN must be exactly 4 digits." },
          { status: 400 }
        );
      }

      const student = db.authenticateStudent(rollNo, pin, grade);
      if (!student) {
        return NextResponse.json(
          { error: "Invalid Roll Number or 4-digit PIN. Please check your credentials or ask your class teacher." },
          { status: 401 }
        );
      }

      const response = NextResponse.json({
        success: true,
        user: {
          id: student.id,
          name: student.name,
          rollNo: student.rollNo,
          grade: student.grade,
          school: student.school,
          language: student.language,
          role: "student",
        },
      });

      // Set session cookie for persistent identification
      response.cookies.set("aaroh_user_id", student.id, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      response.cookies.set("aaroh_user_role", "student", {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    if (role === "teacher") {
      const teacher = db.getTeacherProfile();
      // Simple verification against teacher profile email
      if (email && email.trim().toLowerCase() === teacher.email.toLowerCase()) {
        const response = NextResponse.json({
          success: true,
          user: {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            role: "teacher",
          },
        });

        response.cookies.set("aaroh_user_id", teacher.id, {
          path: "/",
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7,
        });
        response.cookies.set("aaroh_user_role", "teacher", {
          path: "/",
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      }

      // Allow general fallback teacher login for demo if credentials provided
      if (email && password) {
        const response = NextResponse.json({
          success: true,
          user: {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            role: "teacher",
          },
        });
        return response;
      }

      return NextResponse.json(
        { error: "Invalid teacher email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Authentication failed. Server error." }, { status: 500 });
  }
}
