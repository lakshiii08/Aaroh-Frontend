"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
  Clock,
  Sparkles,
  RefreshCw,
  FolderPlus,
  Download,
} from "lucide-react";
import { TeacherSideNav } from "@/components/layout/teacher-side-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { conceptGaps, classPerformance, students } from "@/lib/mock-data";
import { SubjectItem, WorksheetItem, SubmissionItem } from "@/lib/db";

export default function TeacherDashboardPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [worksheets, setWorksheets] = useState<WorksheetItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);

  // Form states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [worksheetTitle, setWorksheetTitle] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [deadline, setDeadline] = useState("2026-10-15T18:00");
  const [questionsText, setQuestionsText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [translationStatus, setTranslationStatus] = useState("");

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const [subRes, wsRes, submRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/worksheets"),
        fetch("/api/submissions"),
      ]);
      const subData = await subRes.json();
      const wsData = await wsRes.json();
      const submData = await submRes.json();

      if (subData.subjects) {
        setSubjects(subData.subjects);
        if (subData.subjects.length > 0) setSelectedSubjectId(subData.subjects[0].id);
      }
      if (wsData.worksheets) setWorksheets(wsData.worksheets);
      if (submData.submissions) setSubmissions(submData.submissions);
    } catch (e) {
      console.error("Error loading teacher dashboard data:", e);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName, description: newSubjectDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setSubjects((prev) => [...prev, data.subject]);
        setSelectedSubjectId(data.subject.id);
        setShowSubjectModal(false);
        setNewSubjectName("");
        setNewSubjectDesc("");
      }
    } catch (err) {
      console.error("Failed to create subject:", err);
    }
  };

  const handlePublishWorksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worksheetTitle || !selectedSubjectId || !deadline) return;

    setPublishing(true);
    setTranslationStatus("Extracting content from PDF...");

    setTimeout(() => {
      setTranslationStatus("Translating worksheet to Santali (Ol Chiki & Roman)...");
    }, 1000);

    setTimeout(async () => {
      try {
        const selectedSub = subjects.find((s) => s.id === selectedSubjectId);
        const res = await fetch("/api/worksheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: worksheetTitle,
            subjectId: selectedSubjectId,
            subjectName: selectedSub ? selectedSub.name : "General",
            fileName: pdfFile ? pdfFile.name : `${worksheetTitle.replace(/\s+/g, "_")}.pdf`,
            deadline: new Date(deadline).toISOString(),
            questionsText,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setWorksheets((prev) => [data.worksheet, ...prev]);
          setShowPublishModal(false);
          setWorksheetTitle("");
          setQuestionsText("");
          setPdfFile(null);
        }
      } catch (err) {
        console.error("Failed to publish worksheet:", err);
      } finally {
        setPublishing(false);
        setTranslationStatus("");
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen md:flex bg-cream">
      <TeacherSideNav />

      <main className="flex-1 min-w-0 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-24 md:pb-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">Class 4 — Overview</h1>
            <p className="text-sm text-gray-500 mt-0.5">32 students · Santhali medium bridge programme</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => setShowSubjectModal(true)} variant="outline" size="sm" className="text-xs">
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </Button>
            <Button onClick={() => setShowPublishModal(true)} variant="primary" size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Worksheet PDF</span>
            </Button>
          </div>
        </div>

        {/* Clean Metric Row */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Class Mastery</span>
            <p className="font-display text-2xl font-bold text-ink">{classPerformance.overallMastery}%</p>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Need Practice</span>
            <p className="font-display text-2xl font-bold text-amber-700">
              {students.filter((s) => s.weakConcepts.length > 0).length}
            </p>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Concepts Flagged</span>
            <p className="font-display text-2xl font-bold text-gray-800">
              {conceptGaps.filter((c) => c.recommendation !== "On Track").length}
            </p>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Worksheets</span>
            <p className="font-display text-2xl font-bold text-emerald">{worksheets.length}</p>
          </div>
        </section>

        {/* Worksheets Grid */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-base text-ink">Active Worksheets</h2>
          <div className="grid sm:grid-cols-3 gap-3.5">
            {worksheets.map((ws) => (
              <div key={ws.id} className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge tone="slate">{ws.subjectName}</Badge>
                  <span className="text-[10px] text-emerald font-semibold uppercase">Santali Translated</span>
                </div>
                <h3 className="font-semibold text-sm text-ink truncate">{ws.title}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due: {new Date(ws.deadline).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Student Submissions List */}
        <section className="bg-white border border-gray-200/80 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-ink">Student Assignment Submissions</h2>
            <span className="text-xs text-gray-400">{submissions.length} Submissions</span>
          </div>

          {submissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No assignment submissions received yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/50">
                    <th className="font-semibold py-2.5 px-4">Student</th>
                    <th className="font-semibold py-2.5 px-3">Subject</th>
                    <th className="font-semibold py-2.5 px-3">Worksheet</th>
                    <th className="font-semibold py-2.5 px-3">Submitted At</th>
                    <th className="font-semibold py-2.5 px-3">File</th>
                    <th className="font-semibold py-2.5 px-3">Status</th>
                    <th className="font-semibold py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-ink">{sub.studentName}</td>
                      <td className="py-2.5 px-3 text-gray-500">{sub.subjectName}</td>
                      <td className="py-2.5 px-3 text-gray-700 font-medium">{sub.worksheetTitle}</td>
                      <td className="py-2.5 px-3 text-gray-400">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-emerald font-medium">
                        <span className="inline-flex items-center gap-1 hover:underline cursor-pointer">
                          <Download className="w-3 h-3" />
                          {sub.fileName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={sub.status === "Graded" ? "emerald" : "amber"}>
                          {sub.status === "Graded" ? `Graded (${sub.marks})` : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Link
                          href={`/teacher/students?worksheetId=${sub.worksheetId}`}
                          className="text-xs font-semibold text-emerald hover:underline"
                        >
                          {sub.status === "Graded" ? "Review" : "Check & Grade"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Student Roster Table */}
        <section className="bg-white border border-gray-200/80 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h2 className="font-display font-bold text-base text-ink">Student Roster</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/50">
                  <th className="font-semibold py-2.5 px-4">Student</th>
                  <th className="font-semibold py-2.5 px-3">Badges</th>
                  <th className="font-semibold py-2.5 px-3">Accuracy</th>
                  <th className="font-semibold py-2.5 px-4">Focus Topics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-ink">{s.name}</td>
                    <td className="py-2.5 px-3 text-gray-500">{s.badges}</td>
                    <td className="py-2.5 px-3 text-gray-700 font-semibold">{s.accuracy}%</td>
                    <td className="py-2.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {s.weakConcepts.length === 0 ? (
                          <Badge tone="emerald">On track</Badge>
                        ) : (
                          s.weakConcepts.map((w) => (
                            <Badge key={w} tone="amber">
                              {w}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* CREATE SUBJECT MODAL */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-modal border border-gray-200">
            <h3 className="font-display text-base font-bold text-ink">Create New Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Environmental Science"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">Description (Optional)</label>
                <input
                  type="text"
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  placeholder="Brief curriculum description"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald text-ink"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowSubjectModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Subject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH WORKSHEET PDF MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-modal border border-gray-200">
            <h3 className="font-display text-base font-bold text-ink">Publish Worksheet PDF to Students</h3>

            {publishing ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <RefreshCw className="w-7 h-7 text-emerald animate-spin mx-auto" />
                <div>
                  <p className="font-semibold text-sm text-emerald-950">{translationStatus}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Extracting and converting to Santali Ol Chiki...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePublishWorksheet} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Select Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Worksheet Title</label>
                  <input
                    type="text"
                    required
                    value={worksheetTitle}
                    onChange={(e) => setWorksheetTitle(e.target.value)}
                    placeholder="e.g. Chapter 5: Plant Nutrition"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Submission Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald font-medium text-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Worksheet Document</label>
                  <label className="flex items-center gap-2 p-2.5 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <UploadCloud className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-600 truncate">
                      {pdfFile ? pdfFile.name : "Select PDF or document file"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowPublishModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" className="gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Translate &amp; Publish</span>
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
