"use client";

import { useEffect, useState } from "react";
import { TeacherSideNav } from "@/components/layout/teacher-side-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { TeacherProfile } from "@/lib/db";
import { Check, CheckCircle2, ShieldCheck, Sparkles, Bell, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherSettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<TeacherProfile>({
    id: "t1",
    name: "Guruji Hemant Soren",
    email: "hemant.soren@aaroh-edu.in",
    role: "teacher",
    employeeId: "EDU-JH-2024-089",
    assignedGrade: "Grade 4 (Sections A & B)",
    schoolName: "Rajkiya Prathmik Vidyalaya, Dumka",
    subjectSpecialization: "Science & Santali Language",
    language: "en",
    autoAiTranslation: true,
    lateSubmissionsAllowed: true,
    notifyOnSubmission: true,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/teacher/preference")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/teacher/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, language }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save teacher settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen md:flex bg-cream">
      <TeacherSideNav />

      <main className="flex-1 min-w-0 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-24 md:pb-12 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Teacher Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure your portal language, classroom details, and worksheet grading preferences.
          </p>
        </div>

        {saved && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/70 rounded-lg flex items-center gap-2 text-emerald-900 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
            <span>Settings saved successfully. All changes are active across your classroom.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Language Selection */}
          <section className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-display font-bold text-base text-ink">
                Interface Language
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select your preferred working language for the teacher dashboard and navigation.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { code: "en", label: "English", desc: "Default Interface" },
                { code: "hi", label: "हिंदी", desc: "Hindi Interface" },
                { code: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ", desc: "Santali (Ol Chiki)" },
              ].map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code as any);
                      setProfile({ ...profile, language: item.code as any });
                    }}
                    className={cn(
                      "p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between",
                      isSelected
                        ? "border-emerald bg-emerald-50/60 ring-1 ring-emerald"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-ink">{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald" />}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-1">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Teacher Profile Information */}
          <section className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-base text-ink">
                  Educator Profile
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Information displayed on generated worksheets and student evaluations.
                </p>
              </div>
              <Badge tone="emerald" className="hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Teacher
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">Employee / Teacher ID</label>
                <input
                  type="text"
                  value={profile.employeeId}
                  onChange={(e) => setProfile({ ...profile, employeeId: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">Assigned Grade / Class</label>
                <input
                  type="text"
                  value={profile.assignedGrade}
                  onChange={(e) => setProfile({ ...profile, assignedGrade: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">Subject Specialization</label>
                <input
                  type="text"
                  value={profile.subjectSpecialization}
                  onChange={(e) => setProfile({ ...profile, subjectSpecialization: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block">School / Institution</label>
                <input
                  type="text"
                  value={profile.schoolName}
                  onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block">Teacher Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                  required
                />
              </div>
            </div>
          </section>

          {/* Workflow & AI Preferences */}
          <section className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-display font-bold text-base text-ink">
                Grading &amp; Translation Workflow
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Control automated features for bilingual conversion and assignment evaluation.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors bg-cream/30">
                <input
                  type="checkbox"
                  checked={profile.autoAiTranslation}
                  onChange={(e) => setProfile({ ...profile, autoAiTranslation: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald focus:ring-emerald accent-emerald cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">
                      Automated AI Bilingual Reverse-Translation
                    </span>
                    <Badge tone="emerald" className="text-[10px] py-0 px-1.5">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5 inline" /> AI Assist
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    When students submit answers in Santali (Ol Chiki or Roman), automatically generate instant side-by-side English and Hindi translations during teacher evaluation.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors bg-cream/30">
                <input
                  type="checkbox"
                  checked={profile.lateSubmissionsAllowed}
                  onChange={(e) => setProfile({ ...profile, lateSubmissionsAllowed: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald focus:ring-emerald accent-emerald cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">
                      Permit Late Submissions
                    </span>
                    <Badge tone="amber" className="text-[10px] py-0 px-1.5">
                      <Clock className="w-2.5 h-2.5 mr-0.5 inline" /> Policy
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Allow students with internet or power constraints to submit worksheets past the due date with a &quot;Late&quot; flag.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors bg-cream/30">
                <input
                  type="checkbox"
                  checked={profile.notifyOnSubmission}
                  onChange={(e) => setProfile({ ...profile, notifyOnSubmission: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald focus:ring-emerald accent-emerald cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">
                      New Submission Notifications
                    </span>
                    <Badge tone="slate" className="text-[10px] py-0 px-1.5">
                      <Bell className="w-2.5 h-2.5 mr-0.5 inline" /> Alert
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Show notification banners when a student finishes and uploads a completed assignment.
                  </p>
                </div>
              </label>
            </div>
          </section>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
