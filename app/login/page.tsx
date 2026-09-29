"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

type Role = "student" | "teacher";

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [role, setRole] = useState<Role>("student");
  const [rollNo, setRollNo] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const payload =
        role === "student"
          ? { role: "student", rollNo: rollNo.trim(), pin: pin.trim() }
          : { role: "teacher", email: email.trim(), password };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid credentials. Please verify with your school.");
        setLoading(false);
        return;
      }

      router.push(role === "student" ? "/student/dashboard" : "/teacher/dashboard");
    } catch (err) {
      setErrorMessage("Could not connect to authentication service. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5]">
      {/* Left panel: Simple School Portal Identity */}
      <div className="w-full md:w-80 lg:w-96 bg-emerald text-white p-6 sm:p-8 md:p-10 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo & Portal Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/15 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight">AAROH</span>
              <span className="text-[11px] text-emerald-100 font-medium block">
                Primary School Portal
              </span>
            </div>
          </div>

          <div className="pt-2 pb-1 border-t border-white/15">
            <h2 className="text-sm font-semibold text-white">
              Multilingual Learning System
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
              Supporting Santali (Ol Chiki), Hindi, and English in rural primary classrooms.
            </p>
          </div>

          {/* Practical Guidelines */}
          <div className="space-y-3 pt-2 text-xs text-emerald-100">
            <div className="p-3 bg-white/10 rounded space-y-1">
              <span className="font-semibold text-white block">Student Login Credentials</span>
              <p className="text-[11px] leading-relaxed">
                Use your official <strong className="text-white">Roll Number</strong> as your Login ID and the <strong className="text-white">4-Digit PIN</strong> provided by your teacher.
              </p>
            </div>

            <div className="p-3 bg-white/10 rounded space-y-1">
              <span className="font-semibold text-white block">Teacher Portal Access</span>
              <p className="text-[11px] leading-relaxed">
                Log in with your registered school email to create student accounts, assign worksheets, and evaluate submissions.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/15 text-[11px] text-emerald-200">
          Dumka District · Jharkhand Elementary Education
        </div>
      </div>

      {/* Right panel: Clean, Compact Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-6 sm:p-7 space-y-5 shadow-xs">
          {/* Form Header */}
          <div className="border-b border-gray-100 pb-3">
            <h1 className="text-lg font-bold text-ink">Sign In to Portal</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Select your role and language to access your dashboard
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Language Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
              Portal Language
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी" },
                { code: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ" },
              ].map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code as any)}
                    className={cn(
                      "py-1.5 px-2 rounded border text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer",
                      isSelected
                        ? "border-emerald bg-emerald-50 text-emerald font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Toggle Tabs */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
              Login Type
            </label>
            <div className="grid grid-cols-2 p-0.5 bg-gray-100 rounded border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setRole("student");
                  setErrorMessage("");
                }}
                className={cn(
                  "py-1.5 font-medium rounded transition-colors text-center cursor-pointer",
                  role === "student"
                    ? "bg-white text-ink font-semibold shadow-xs"
                    : "text-gray-600 hover:text-ink"
                )}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("teacher");
                  setErrorMessage("");
                }}
                className={cn(
                  "py-1.5 font-medium rounded transition-colors text-center cursor-pointer",
                  role === "teacher"
                    ? "bg-white text-ink font-semibold shadow-xs"
                    : "text-gray-600 hover:text-ink"
                )}
              >
                Teacher
              </button>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {role === "student" ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Roll Number <span className="font-normal text-gray-400">(Login ID)</span>
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded outline-none focus:border-emerald font-medium text-ink bg-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    4-Digit Secret PIN <span className="font-normal text-gray-400">(Password)</span>
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded outline-none focus:border-emerald font-medium text-ink bg-white font-mono"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    School Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hemant.soren@aaroh-edu.in"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded outline-none focus:border-emerald font-medium text-ink bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded outline-none focus:border-emerald font-medium text-ink bg-white"
                    required
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" className="w-full text-xs" disabled={loading}>
                {loading
                  ? "Verifying..."
                  : role === "student"
                  ? "Sign In to Student Portal"
                  : "Enter Teacher Portal"}
              </Button>
            </div>
          </form>

          {/* Quick Guidance / Demo Note */}
          <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400 text-center space-y-0.5">
            {role === "student" ? (
              <p>Demo Student: Roll No. <strong className="text-gray-600 font-mono">24</strong> · PIN <strong className="text-gray-600 font-mono">1234</strong></p>
            ) : (
              <p>Demo Teacher: <strong className="text-gray-600">hemant.soren@aaroh-edu.in</strong></p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
