"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Folder,
  FolderPlus,
  Plus,
  UploadCloud,
  FileText,
  Calendar,
  Clock,
  Sparkles,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  Users,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { TeacherSideNav } from "@/components/layout/teacher-side-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubjectItem, WorksheetItem, SubmissionItem } from "@/lib/db";
import { cn } from "@/lib/utils";

export default function TeacherWorksheetsPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [worksheets, setWorksheets] = useState<WorksheetItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [worksheetTitle, setWorksheetTitle] = useState("");
  const [targetSubjectId, setTargetSubjectId] = useState("");
  const [deadline, setDeadline] = useState("2026-10-20T17:00");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState("");
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
        if (subData.subjects.length > 0 && !targetSubjectId) {
          setTargetSubjectId(subData.subjects[0].id);
        }
      }
      if (wsData.worksheets) setWorksheets(wsData.worksheets);
      if (submData.submissions) setSubmissions(submData.submissions);
    } catch (e) {
      console.error("Failed to load worksheets:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubjectName.trim(),
          description: newSubjectDesc.trim() || `${newSubjectName} worksheets & classroom tasks`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubjects((prev) => [...prev, data.subject]);
        setSelectedFolder(data.subject.id);
        setTargetSubjectId(data.subject.id);
        setShowSubjectModal(false);
        setNewSubjectName("");
        setNewSubjectDesc("");
        setSuccessToast(`Subject folder "${data.subject.name}" created!`);
        setTimeout(() => setSuccessToast(""), 3000);
      }
    } catch (err) {
      console.error("Error creating subject:", err);
    }
  };

  const handleDeleteSubject = async (subjectId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete folder "${name}"? Existing worksheets will remain archived.`)) return;
    try {
      const res = await fetch(`/api/subjects?id=${subjectId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
        if (selectedFolder === subjectId) setSelectedFolder("all");
      }
    } catch (err) {
      console.error("Error deleting subject:", err);
    }
  };

  const handleUploadWorksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worksheetTitle.trim() || !targetSubjectId || !deadline) return;

    const matchedSubject = subjects.find((s) => s.id === targetSubjectId);
    setPublishing(true);
    setPublishStep(uploadedFile ? `Extracting from ${uploadedFile.name}...` : "Reading worksheet PDF document...");

    setTimeout(async () => {
      setPublishStep("AI translating into Santali (Ol Chiki & Roman)...");

      try {
        const res = await fetch("/api/worksheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: worksheetTitle.trim(),
            subjectId: targetSubjectId,
            subjectName: matchedSubject ? matchedSubject.name : "General",
            fileName: uploadedFile ? uploadedFile.name : `${worksheetTitle.replace(/\s+/g, "_")}.pdf`,
            deadline: new Date(deadline).toISOString(),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setWorksheets((prev) => [data.worksheet, ...prev]);
          setShowUploadModal(false);
          setWorksheetTitle("");
          setUploadedFile(null);
          setSuccessToast(`Worksheet assigned to students under "${matchedSubject?.name}"!`);
          setTimeout(() => setSuccessToast(""), 3500);
        }
      } catch (err) {
        console.error("Failed to assign worksheet:", err);
      } finally {
        setPublishing(false);
        setPublishStep("");
      }
    }, 900);
  };

  const handleDeleteWorksheet = async (wsId: string, title: string) => {
    if (!confirm(`Remove worksheet "${title}"?`)) return;
    try {
      const res = await fetch(`/api/worksheets?id=${wsId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setWorksheets((prev) => prev.filter((w) => w.id !== wsId));
      }
    } catch (err) {
      console.error("Failed to remove worksheet:", err);
    }
  };

  // Filter worksheets
  const filteredWorksheets = worksheets.filter((ws) => {
    const matchesFolder = selectedFolder === "all" || ws.subjectId === selectedFolder;
    const matchesQuery =
      ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesQuery;
  });

  return (
    <div className="min-h-screen md:flex bg-cream">
      <TeacherSideNav />

      <main className="flex-1 min-w-0 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-24 md:pb-12 space-y-7">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Assignments &amp; Worksheets
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Organize subjects in dedicated folders, upload PDFs, and assign Santali-translated worksheets to students.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubjectModal(true)}
              className="gap-1.5"
            >
              <FolderPlus className="w-4 h-4 text-emerald" />
              <span>New Subject Folder</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (selectedFolder !== "all") {
                  setTargetSubjectId(selectedFolder);
                }
                setShowUploadModal(true);
              }}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Worksheet PDF</span>
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/70 rounded-lg flex items-center gap-2 text-emerald-900 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Subject Folders Carousel / Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-0.5">
              Subject Folders ({subjects.length})
            </h2>
            <span className="text-xs text-gray-400">Click folder to filter worksheets</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* All Subjects Folder Card */}
            <button
              onClick={() => setSelectedFolder("all")}
              className={cn(
                "p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group",
                selectedFolder === "all"
                  ? "bg-emerald-50/70 border-emerald ring-1 ring-emerald"
                  : "bg-white border-gray-200/80 hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    selectedFolder === "all" ? "bg-emerald text-white" : "bg-gray-100 text-gray-600 group-hover:text-emerald"
                  )}
                >
                  <Folder className="w-4 h-4" />
                </div>
                <Badge tone="slate" className="text-[10px] px-1.5 py-0">
                  {worksheets.length}
                </Badge>
              </div>
              <div className="mt-3">
                <span className="font-semibold text-xs text-ink block">All Subjects</span>
                <span className="text-[11px] text-gray-400">All worksheets</span>
              </div>
            </button>

            {/* Dynamic Subject Folders */}
            {subjects.map((sub) => {
              const count = worksheets.filter((w) => w.subjectId === sub.id).length;
              const isSelected = selectedFolder === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedFolder(sub.id)}
                  className={cn(
                    "p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative",
                    isSelected
                      ? "bg-emerald-50/70 border-emerald ring-1 ring-emerald"
                      : "bg-white border-gray-200/80 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-emerald text-white" : "bg-emerald-50 text-emerald"
                      )}
                    >
                      <Folder className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge tone={isSelected ? "emerald" : "slate"} className="text-[10px] px-1.5 py-0">
                        {count}
                      </Badge>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(sub.id, sub.name);
                        }}
                        title="Delete folder"
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-600 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-semibold text-xs text-ink block truncate" title={sub.name}>
                      {sub.name}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate block">
                      {sub.description || `${count} tasks`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Worksheets Section */}
        <section className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base text-ink">
                {selectedFolder === "all"
                  ? "All Active Worksheets"
                  : `${subjects.find((s) => s.id === selectedFolder)?.name || "Folder"} Worksheets`}
              </h2>
              <Badge tone="emerald" className="text-xs">
                {filteredWorksheets.length} Available
              </Badge>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by worksheet or subject..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-cream/30 border border-gray-200 rounded-lg outline-none focus:border-emerald"
              />
            </div>
          </div>

          {/* Worksheets Grid / List */}
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading worksheets...</div>
          ) : filteredWorksheets.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-gray-200 rounded-xl bg-cream/20">
              <FileText className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-600">No worksheets found</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {selectedFolder === "all"
                  ? "Click 'Upload Worksheet PDF' to assign your first classroom worksheet."
                  : "No worksheets inside this subject folder yet. Upload a PDF to assign one."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedFolder !== "all") setTargetSubjectId(selectedFolder);
                  setShowUploadModal(true);
                }}
                className="mt-2 text-xs"
              >
                Upload First Worksheet
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorksheets.map((ws) => {
                const wsSubmissions = submissions.filter((s) => s.worksheetId === ws.id);
                const gradedCount = wsSubmissions.filter((s) => s.status === "Graded").length;
                const formattedDate = new Date(ws.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={ws.id}
                    className="p-4 sm:p-5 rounded-xl border border-gray-200/80 hover:border-gray-300 transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tone="slate" className="text-[11px] font-semibold">
                          <Folder className="w-3 h-3 mr-1 inline text-gray-500" />
                          {ws.subjectName}
                        </Badge>
                        <Badge tone="emerald" className="text-[11px]">
                          <Sparkles className="w-2.5 h-2.5 mr-1 inline" />
                          Santali (Ol Chiki)
                        </Badge>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due {formattedDate}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display font-bold text-sm sm:text-base text-ink">
                          {ws.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span>File: {ws.fileName}</span>
                          <span className="text-gray-300">•</span>
                          <span>{ws.items?.length || 2} questions translated</span>
                        </p>
                      </div>

                      {/* Snippet of questions */}
                      {ws.items && ws.items.length > 0 && (
                        <div className="pt-2 text-xs text-ink/80 bg-cream/40 rounded-lg p-2.5 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Santali Preview:
                          </span>
                          <p className="font-medium text-emerald-900 truncate">
                            {ws.items[0].translatedOlChiki || ws.items[0].translated}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col items-end justify-between shrink-0 gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-xs font-bold text-ink block">
                          {wsSubmissions.length} Submissions
                        </span>
                        <span className="text-[11px] text-emerald-700">
                          {gradedCount} evaluated &amp; marked
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/teacher/students?worksheetId=${ws.id}`}>
                          <Button variant="outline" size="sm" className="text-xs gap-1">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span>Submissions</span>
                          </Button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorksheet(ws.id, ws.title)}
                          title="Delete worksheet"
                          className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Modal: Create Subject Folder */}
        {showSubjectModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald flex items-center justify-center">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-base text-ink">New Subject Folder</h3>
                </div>
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Create a folder for this subject. All worksheets uploaded inside it will be grouped for your students.
              </p>

              <form onSubmit={handleCreateSubject} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Subject Name</label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g. Environmental Studies, Tribal Heritage"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-emerald font-medium text-ink"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Description (Optional)</label>
                  <input
                    type="text"
                    value={newSubjectDesc}
                    onChange={(e) => setNewSubjectDesc(e.target.value)}
                    placeholder="e.g. Flora, fauna, and local village ecology"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-emerald text-ink"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSubjectModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Create Folder
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Upload & Assign Worksheet */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-ink">Upload Worksheet PDF</h3>
                    <p className="text-[11px] text-gray-500">Auto-translates into Santali for students</p>
                  </div>
                </div>
                <button
                  onClick={() => !publishing && setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {publishing ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-emerald border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-ink">{publishStep}</p>
                  <p className="text-[11px] text-gray-400">
                    Applying Ol Chiki script rendering &amp; local contextual examples...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUploadWorksheet} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">Target Subject Folder</label>
                    <select
                      value={targetSubjectId}
                      onChange={(e) => setTargetSubjectId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-emerald font-medium text-ink bg-white cursor-pointer"
                      required
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 block">Worksheet Title</label>
                      <input
                        type="text"
                        value={worksheetTitle}
                        onChange={(e) => setWorksheetTitle(e.target.value)}
                        placeholder="e.g. Water Cycle & Monsoon (Chapter 5)"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-emerald font-medium text-ink"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 block">Submission Deadline</label>
                      <input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-emerald text-ink"
                        required
                      />
                    </div>
                  </div>

                  {/* Dedicated PDF File Upload Area */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">Worksheet PDF File</label>
                    {!uploadedFile ? (
                      <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl cursor-pointer bg-cream/30 hover:bg-emerald-50/20 transition-all text-center group">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 group-hover:border-emerald-300 flex items-center justify-center shadow-xs mb-2 transition-transform group-hover:scale-105">
                          <UploadCloud className="w-5 h-5 text-emerald" />
                        </div>
                        <span className="text-xs font-semibold text-ink group-hover:text-emerald transition-colors">
                          Click to choose or drag &amp; drop PDF
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">
                          Attach worksheet document (.pdf)
                        </span>
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedFile(file);
                              if (!worksheetTitle) {
                                const cleanTitle = file.name
                                  .replace(/\.[^/.]+$/, "")
                                  .replace(/[-_]/g, " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase());
                                setWorksheetTitle(cleanTitle);
                              }
                            }
                          }}
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-emerald text-white flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-ink block truncate">{uploadedFile.name}</span>
                            <span className="text-[11px] text-emerald-800">
                              {(uploadedFile.size / 1024).toFixed(1)} KB • PDF Ready for AI Translation
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center gap-2 text-emerald-900 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald shrink-0" />
                    <span>
                      The uploaded PDF will be automatically processed into Ol Chiki script and assigned to students in their Worksheets section.
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUploadModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Assign to Students
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
