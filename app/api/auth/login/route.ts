import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, rollNo, roll, pin, password, grade, email } = body;

    if (role === "student") {
      const studentRoll = (rollNo || roll || "").toString().trim();
      const studentPin = (pin || password || "").toString().trim();

      if (!studentRoll || !studentPin) {
        return NextResponse.json(
          { error: "Roll Number and 4-digit PIN are required." },
          { status: 400 }
        );
      }

      if (studentPin.length !== 4 || !/^\d{4}$/.test(studentPin)) {
        return NextResponse.json(
          { error: "PIN must be exactly 4 digits." },
          { status: 400 }
        );
      }

      let student = db.authenticateStudent(studentRoll, studentPin, grade);

      // Dedicated fallback for demo student (Roll 24, PIN/password 1234)
      if (!student && (studentRoll === "24" || studentRoll === "024") && studentPin === "1234") {
        const students = db.getStudents();
        const existing = students.find((s) => s.rollNo === "24");
        if (existing) {
          student = db.setActiveStudent(existing.id);
        } else {
          const demoStudent = {
            id: "s1",
            name: "Sona Murmu",
            rollNo: "24",
            grade: "Grade 4",
            school: "Rajkiya Prathmik Vidyalaya, Dumka",
            pin: "1234",
            language: "en" as const,
            accuracy: 82,
            badges: 6,
            weakConcepts: ["Photosynthesis", "Addition carry-over"],
            cardsReviewed: 142,
            masteryPercentage: 78,
            createdAt: new Date().toISOString(),
          };
          student = demoStudent;
          db.setActiveStudent(demoStudent.id);
        }
      }

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
