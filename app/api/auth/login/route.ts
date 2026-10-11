import { NextResponse } from "next/server";

const API_PREFIX = "/api/v1";
const DEMO_SCHOOL_CODE = process.env.NEXT_PUBLIC_DEMO_SCHOOL_CODE || "DEMO01";
const DEMO_STUDENT_ROLL_NUMBER = process.env.NEXT_PUBLIC_DEMO_STUDENT_ROLL_NUMBER || "24";
const DEMO_STUDENT_PASSWORD = process.env.NEXT_PUBLIC_DEMO_STUDENT_PASSWORD || "1234";
const DEMO_TEACHER_LOGIN = process.env.NEXT_PUBLIC_DEMO_TEACHER_LOGIN || "teacher@123";
const DEMO_TEACHER_PASSWORD = process.env.NEXT_PUBLIC_DEMO_TEACHER_PASSWORD || "teacher@123";

function normalizeCredential(value?: string): string {
  return (value || "").trim().toLowerCase();
}

function resolveBackendBaseUrl(): string | null {
  const configured = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";
  const clean = configured.trim().replace(/\/+$/, "");
  if (!clean) return null;
  return clean.endsWith(API_PREFIX) ? clean : `${clean}${API_PREFIX}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body.role;
    const isStudent = role === "student";

    if (isStudent) {
      const rollNumber = (body.rollNo || body.roll || body.roll_number || "").toString();
      const password = (body.pin || body.password || "").toString();
      const schoolCode = (body.schoolCode || body.school_code || "").toString();

      if (
        normalizeCredential(rollNumber) === normalizeCredential(DEMO_STUDENT_ROLL_NUMBER) &&
        password === DEMO_STUDENT_PASSWORD &&
        normalizeCredential(schoolCode) === normalizeCredential(DEMO_SCHOOL_CODE)
      ) {
        const response = NextResponse.json({
          success: true,
          data: {
            access_token: "demo-student-token",
            refresh_token: "demo-student-refresh-token",
            user_id: "s1",
            role: "STUDENT",
            name: "Sona Murmu",
            school_id: DEMO_SCHOOL_CODE,
            roll_number: DEMO_STUDENT_ROLL_NUMBER,
          },
        });
        response.cookies.set("aaroh_user_id", "s1", {
          path: "/",
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7,
        });
        response.cookies.set("aaroh_user_role", "student", {
          path: "/",
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }
    } else {
      const loginId = (body.email || body.login_id || "").toString();
      const password = (body.password || "").toString();

      if (
        normalizeCredential(loginId) === normalizeCredential(DEMO_TEACHER_LOGIN) &&
        password === DEMO_TEACHER_PASSWORD
      ) {
        const response = NextResponse.json({
          success: true,
          data: {
            access_token: "demo-teacher-token",
            refresh_token: "demo-teacher-refresh-token",
            user_id: "t1",
            role: "TEACHER",
            name: "Guruji Hemant Soren",
            school_id: body.schoolCode || body.school_code || DEMO_SCHOOL_CODE,
          },
        });
        response.cookies.set("aaroh_user_id", "t1", {
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
    }

    const backendBaseUrl = resolveBackendBaseUrl();

    if (!backendBaseUrl) {
      return NextResponse.json(
        { error: "Backend auth URL is not configured." },
        { status: 503 }
      );
    }

    const endpoint = isStudent ? "/auth/student-login" : "/auth/login";
    const payload = isStudent
      ? {
          roll_number: (body.rollNo || body.roll || "").toString().trim(),
          password: (body.pin || body.password || "").toString().trim(),
          school_code: body.schoolCode || body.school_code,
        }
      : {
          login_id: (body.email || body.login_id || "").toString().trim(),
          password: (body.password || "").toString(),
          school_code: body.schoolCode || body.school_code,
        };

    const backendResponse = await fetch(`${backendBaseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await backendResponse.json().catch(() => null);
    const response = NextResponse.json(data ?? {}, { status: backendResponse.status });
    const user = data?.data;

    if (backendResponse.ok && user?.user_id && user?.role) {
      response.cookies.set("aaroh_user_id", user.user_id, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set("aaroh_user_role", String(user.role).toLowerCase(), {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Authentication failed. Server error." }, { status: 500 });
  }
}
