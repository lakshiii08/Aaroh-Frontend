"use client";

import { useEffect, useState } from "react";
import { StudentSideNav } from "@/components/layout/student-side-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { SubjectItem, WorksheetItem, SubmissionItem } from "@/lib/db";
import {
  FileText,
  Clock,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentWorksheetsPage() {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [worksheets, setWorksheets] = useState<WorksheetItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & view states
  const [activeWorksheet, setActiveWorksheet] = useState<WorksheetItem | null>(null);
  const [submittingWorksheet, setSubmittingWorksheet] = useState<WorksheetItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showOlChiki, setShowOlChiki] = useState(true);

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [subjRes, wsRes, profRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/worksheets"),
        fetch("/api/user/preference"),
      ]);
      const subjData = await subjRes.json();
      const wsData = await wsRes.json();
      const profData = await profRes.json();

      let activeStudentId = "s1";
      if (profData.profile) {
        setCurrentUser({ id: profData.profile.id, name: profData.profile.name });
        activeStudentId = profData.profile.id;
      }

      const submRes = await fetch(`/api/submissions?studentId=${activeStudentId}`);
      const submData = await submRes.json();

      if (subjData.subjects) setSubjects(subjData.subjects);
      if (wsData.worksheets) setWorksheets(wsData.worksheets);
      if (submData.submissions) setSubmissions(submData.submissions);
    } catch (e) {
      console.error("Failed to load worksheets data:", e);
    } finally {
      setLoading(false);
    }
  };

  const getWorksheetStatus = (ws: WorksheetItem) => {
    const isSubmitted = submissions.some((s) => s.worksheetId === ws.id);
    if (isSubmitted) return { label: t("status_submitted"), tone: "emerald" as const, icon: CheckCircle2 };

    const now = new Date();
    const deadlineDate = new Date(ws.deadline);
    const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (now > deadlineDate) return { label: t("status_overdue"), tone: "amber" as const, icon: AlertCircle };
    if (diffHours <= 48) return { label: t("status_due_soon"), tone: "amber" as const, icon: Clock };
    return { label: t("status_pending"), tone: "slate" as const, icon: Clock };
  };

  const filteredWorksheets = worksheets.filter((w) => {
    if (selectedSubjectId === "all") return true;
    return w.subjectId === selectedSubjectId;
  });

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingWorksheet || !uploadFile) return;

    setUploading(true);
    try {
      const res = await fetch(`/api/worksheets/${submittingWorksheet.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadFile.name,
          studentId: currentUser?.id || "s1",
          studentName: currentUser?.name || "Sona Murmu",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setSubmissions((prev) => [data.submission, ...prev]);
        setTimeout(() => {
          setSubmittingWorksheet(null);
          setUploadFile(null);
          setSubmitSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPDF = (ws: WorksheetItem) => {
    const content = `AAROH WORKSHEET: ${ws.title}\nSubject: ${ws.subjectName}\nDeadline: ${new Date(ws.deadline).toLocaleDateString()}\n\n` +
      ws.items.map((item, idx) => `Q${idx + 1}: ${item.original}\nSantali (Ol Chiki): ${item.translatedOlChiki}\nSantali (Roman): ${item.translated}\n\n`).join("");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ws.fileName || `${ws.title.replace(/\s+/g, "_")}_Santali.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen md:flex bg-cream">
      <StudentSideNav />

      <main className="flex-1 min-w-0 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-24 md:pb-12 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {t("worksheets_title")}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("worksheets_subtitle")}
          </p>
        </div>

        {/* Clean Subject Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200/80">
          <button
            type="button"
            onClick={() => setSelectedSubjectId("all")}
            className={cn(
              "px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors shrink-0 border-b-2 -mb-[1px]",
              selectedSubjectId === "all"
                ? "border-emerald text-emerald bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            All Subjects ({worksheets.length})
          </button>

          {subjects.map((sub) => {
            const count = worksheets.filter((w) => w.subjectId === sub.id).length;
            const isSelected = selectedSubjectId === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectId(sub.id)}
                className={cn(
                  "px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors shrink-0 border-b-2 -mb-[1px]",
                  isSelected
                    ? "border-emerald text-emerald bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                )}
              >
                {sub.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Worksheets List Table */}
        <section className="bg-white border border-gray-200/80 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400 font-medium">{t("loading")}</div>
          ) : filteredWorksheets.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <FileText className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-700">{t("worksheets_no_worksheets")}</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">{t("worksheets_teacher_empty")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredWorksheets.map((ws) => {
                const status = getWorksheetStatus(ws);
                const StatusIcon = status.icon;
                const formattedDeadline = new Date(ws.deadline).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={ws.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tone="slate">{ws.subjectName}</Badge>
                        <Badge tone={status.tone} className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          <span>{status.label}</span>
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-base text-ink truncate">{ws.title}</h3>

                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t("worksheets_due")}: <strong>{formattedDeadline}</strong></span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-400">{ws.items.length} Questions translated to Santali</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                      <Button
                        type="button"
                        onClick={() => setActiveWorksheet(ws)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t("worksheets_action_view")}</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleDownloadPDF(ws)}
                        variant="outline"
                        size="sm"
                        className="text-xs text-gray-600"
                        title="Download offline assignment"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setSubmittingWorksheet(ws)}
                        variant="primary"
                        size="sm"
                        className="text-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t("worksheets_action_submit")}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* VIEW WORKSHEET MODAL */}
      {activeWorksheet && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-modal border border-gray-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="emerald">{activeWorksheet.subjectName}</Badge>
                  <span className="text-xs text-gray-400">Santali Translation</span>
                </div>
                <h3 className="font-display text-lg font-bold text-ink mt-0.5">{activeWorksheet.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOlChiki(!showOlChiki)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Languages className="w-3.5 h-3.5 text-emerald" />
                  <span>{showOlChiki ? "Ol Chiki Script" : "Roman Letters"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorksheet(null)}
                  className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Questions Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {activeWorksheet.items.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-lg bg-gray-50/70 border border-gray-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-400 tracking-wider">QUESTION {idx + 1}</span>
                    <Badge tone="amber">{item.concept}</Badge>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase">Original ({activeWorksheet.originalLanguage})</span>
                    <p className="text-sm font-medium text-gray-800">{item.original}</p>
                  </div>

                  <div className="p-3 rounded-md bg-emerald-50/80 border border-emerald-100 space-y-0.5">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase block">Santali Version</span>
                    <p className={cn("text-base text-emerald-950 font-semibold", showOlChiki && "olchiki text-lg")}>
                      {showOlChiki ? item.translatedOlChiki : item.translated}
                    </p>
                  </div>

                  {item.localExample && (
                    <p className="text-xs text-gray-500 italic bg-white p-2 rounded border border-gray-200/50">
                      💡 {item.localExample}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <Button onClick={() => handleDownloadPDF(activeWorksheet)} variant="outline" size="sm">
                <Download className="w-3.5 h-3.5 mr-1" /> Download Assignment
              </Button>
              <Button onClick={() => setActiveWorksheet(null)} variant="primary" size="sm">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT ASSIGNMENT MODAL */}
      {submittingWorksheet && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-modal border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div>
                <span className="text-xs text-gray-400 font-medium uppercase">{submittingWorksheet.subjectName}</span>
                <h3 className="font-display text-base font-bold text-ink">{t("worksheets_upload_title")}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSubmittingWorksheet(null)}
                className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-lg text-center space-y-2 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald mx-auto" />
                <p className="font-semibold text-emerald-900 text-sm">{t("worksheets_submit_success")}</p>
              </div>
            ) : (
              <form onSubmit={handleFileSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Worksheet</label>
                  <p className="text-xs text-gray-800 font-medium bg-gray-50 p-2.5 rounded border border-gray-200/80">
                    {submittingWorksheet.title}
                  </p>
                </div>

                <label className="flex flex-col items-center justify-center p-5 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-center">
                  <Upload className="w-6 h-6 text-gray-400 mb-1.5" />
                  <span className="text-xs font-medium text-gray-700">
                    {uploadFile ? uploadFile.name : t("worksheets_select_file")}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Supports PDF, JPG, PNG, DOC</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setUploadFile(e.target.files[0]);
                    }}
                  />
                </label>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmittingWorksheet(null)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!uploadFile || uploading}
                  >
                    {uploading ? t("worksheets_submitting") : t("worksheets_action_submit")}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
