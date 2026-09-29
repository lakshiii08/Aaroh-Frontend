"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  Award,
  ArrowRight,
  FileText,
  Clock,
  Layers,
  Mic,
  Calendar,
  CheckSquare,
} from "lucide-react";
import { StudentSideNav } from "@/components/layout/student-side-nav";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { UserProfile, WorksheetItem } from "@/lib/db";

export default function StudentDashboardPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile>({
    id: "s1",
    name: "Sona Murmu",
    role: "student",
    rollNo: "24",
    grade: "Grade 4",
    language: "en",
    badges: 6,
    accuracy: 82,
    weakConcepts: ["Photosynthesis", "Addition carry-over"],
    seenCardIds: [],
  });
  const [recentWorksheets, setRecentWorksheets] = useState<WorksheetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profRes, wsRes] = await Promise.all([
        fetch("/api/user/preference"),
        fetch("/api/worksheets"),
      ]);
      const profData = await profRes.json();
      const wsData = await wsRes.json();

      if (profData.profile) setProfile(profData.profile);
      if (wsData.worksheets) setRecentWorksheets(wsData.worksheets.slice(0, 4));
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:flex bg-cream">
      <StudentSideNav />

      <main className="flex-1 min-w-0 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-24 md:pb-12 space-y-8">
        {/* Clean Greeting Banner */}
        <section className="bg-white border border-gray-200/80 rounded-xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald uppercase tracking-wider">
              {t("greeting_johar")}, {profile.name.split(" ")[0]}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {t("dashboard_question")}
            </h1>
            <p className="text-sm text-gray-500 max-w-lg">
              Continue your lessons in Santali and practice vocabulary with your teacher&apos;s curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg px-3.5 py-2 text-center">
              <span className="text-xs font-semibold text-amber-800 uppercase block tracking-wider">
                {t("dashboard_badges")}
              </span>
              <span className="font-display font-bold text-xl text-amber-900 flex items-center justify-center gap-1 mt-0.5">
                <Award className="w-4 h-4 text-amber-600 inline" /> {profile.badges}
              </span>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-lg px-3.5 py-2 text-center">
              <span className="text-xs font-semibold text-emerald-800 uppercase block tracking-wider">
                {t("dashboard_accuracy")}
              </span>
              <span className="font-display font-bold text-xl text-emerald-900 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-4 h-4 text-emerald-600 inline" /> {profile.accuracy}%
              </span>
            </div>
          </div>
        </section>

        {/* Primary Learning Sections */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-0.5">
            Learning Activities
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/flashcards"
              className="group bg-white border border-gray-200/80 hover:border-emerald-300 rounded-xl p-5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald flex items-center justify-center border border-emerald-100">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-ink group-hover:text-emerald transition-colors">
                    {t("nav_flashcards")}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Learn words in Ol Chiki script. Tap to see Hindi &amp; English translations.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald">
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/student/worksheets"
              className="group bg-white border border-gray-200/80 hover:border-emerald-300 rounded-xl p-5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-ink group-hover:text-amber-800 transition-colors">
                    {t("nav_worksheets")}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    View, download, and submit assignments translated into Santali.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-amber-800">
                <span>View Worksheets</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/student/evaluations"
              className="group bg-white border border-gray-200/80 hover:border-emerald-300 rounded-xl p-5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-ink group-hover:text-emerald transition-colors">
                    Evaluations &amp; Marks
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    View checked worksheets, teacher feedback, and marks obtained.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald">
                <span>View Marks</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/student/translation"
              className="group bg-white border border-gray-200/80 hover:border-emerald-300 rounded-xl p-5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-ink group-hover:text-slate-900 transition-colors">
                    {t("nav_translate")}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Speak in Hindi or English, and listen to the voice playback in Santali.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Open Voice Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* Current Teacher Worksheets */}
        <section className="bg-white border border-gray-200/80 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-display font-bold text-base text-ink">{t("worksheets_title")}</h2>
              <p className="text-xs text-gray-500">Active assignments published by your teachers</p>
            </div>
            <Link
              href="/student/worksheets"
              className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1"
            >
              View all worksheets <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400">{t("loading")}</div>
          ) : recentWorksheets.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <p className="text-sm font-semibold text-gray-700">{t("worksheets_no_worksheets")}</p>
              <p className="text-xs text-gray-400">{t("worksheets_teacher_empty")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentWorksheets.map((ws) => (
                <div
                  key={ws.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="slate">{ws.subjectName}</Badge>
                      <h3 className="font-semibold text-sm text-ink">{ws.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {t("worksheets_due")}: {new Date(ws.deadline).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <Link
                    href="/student/worksheets"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald hover:text-emerald-dark px-3 py-1.5 rounded-lg border border-emerald-200/70 bg-emerald-50/50 hover:bg-emerald-50 transition-colors self-start sm:self-auto"
                  >
                    Open Worksheet <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Learning Progress Summary */}
        <section className="bg-white border border-gray-200/80 rounded-xl p-6 space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="font-display font-bold text-base text-ink">{t("dashboard_your_progress")}</h2>
            <p className="text-xs text-gray-500">Your practice statistics and focus areas</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-gray-500 uppercase">{t("dashboard_accuracy")}</span>
                <span className="font-display font-bold text-base text-emerald">{profile.accuracy}%</span>
              </div>
              <Progress value={profile.accuracy} tone="emerald" />
              <p className="text-[11px] text-gray-400">Based on recent quizzes and flashcards</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase block">{t("dashboard_badges")}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: profile.badges }).map((_, i) => (
                  <div
                    key={i}
                    title="Achievement Badge"
                    className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700"
                  >
                    <Award className="w-4 h-4" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">{profile.badges} milestones reached</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase block">{t("dashboard_needs_practice")}</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.weakConcepts.length === 0 ? (
                  <Badge tone="emerald">{t("dashboard_all_caught_up")}</Badge>
                ) : (
                  profile.weakConcepts.map((c) => (
                    <Badge key={c} tone="amber">
                      {c}
                    </Badge>
                  ))
                )}
              </div>
              <p className="text-[11px] text-gray-400">Topics flagged for review</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
