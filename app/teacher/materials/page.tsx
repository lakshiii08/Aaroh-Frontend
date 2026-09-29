"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Folder,
  FolderPlus,
  Plus,
  UploadCloud,
  FileText,
  Calendar,
  Sparkles,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  Edit3,
  Send,
  RefreshCw,
  Clock,
  Check,
  ChevronRight,
  FileCheck,
  HelpCircle,
} from "lucide-react";
import { TeacherSideNav } from "@/components/layout/teacher-side-nav";
import { Button } from "@/components/ui/button";
import {
  SubjectItem,
  LearningMaterialItem,
  GeneratedAssessment,
  GeneratedQuestion,
} from "@/lib/db";
import { cn } from "@/lib/utils";

export default function TeacherMaterialsPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [materials, setMaterials] = useState<LearningMaterialItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [materialTitle, setMaterialTitle] = useState("");
  const [targetSubjectId, setTargetSubjectId] = useState("");
  const [targetGrade, setTargetGrade] = useState("Grade 4");
  const [chapterTopic, setChapterTopic] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [autoProcessOnUpload, setAutoProcessOnUpload] = useState(true);
  const [uploadQuestionCount, setUploadQuestionCount] = useState(5);
  const [uploadDifficulty, setUploadDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Subject Modal State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");

  // Review & Edit Workbench State
  const [reviewMaterial, setReviewMaterial] = useState<LearningMaterialItem | null>(null);
  const [activeTab, setActiveTab] = useState<"quiz" | "worksheet">("quiz");
  const [editQuiz, setEditQuiz] = useState<GeneratedAssessment | null>(null);
  const [editWorksheet, setEditWorksheet] = useState<GeneratedAssessment | null>(null);
  const [savingEdits, setSavingEdits] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenCount, setRegenCount] = useState(5);
  const [regenDifficulty, setRegenDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Assign Modal State
  const [assignMaterialTarget, setAssignMaterialTarget] = useState<LearningMaterialItem | null>(null);
  const [assignDeadline, setAssignDeadline] = useState("2026-10-30T17:00");
  const [assigning, setAssigning] = useState(false);

  // Printable School PDF Preview State
  const [printPreviewItem, setPrintPreviewItem] = useState<{
    material: LearningMaterialItem;
    type: "quiz" | "worksheet";
    assessment: GeneratedAssessment;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, matRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/materials"),
      ]);
      const subData = await subRes.json();
      const matData = await matRes.json();

      if (subData.subjects) {
        setSubjects(subData.subjects);
        if (subData.subjects.length > 0 && !targetSubjectId) {
          setTargetSubjectId(subData.subjects[0].id);
        }
      }
      if (matData.materials) {
        setMaterials(matData.materials);
      }
    } catch (e) {
      console.error("Failed to load materials data:", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
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
          description: newSubjectDesc.trim() || `${newSubjectName} textbooks & study materials`,
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
        showToast(`Created folder "${data.subject.name}"`);
      }
    } catch (err) {
      console.error("Failed to create subject:", err);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim() || !targetSubjectId || !chapterTopic.trim()) {
      setUploadError("Please fill in all required fields (Title, Subject, Class, Chapter).");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadStep("Uploading study material...");

    try {
      const targetSub = subjects.find((s) => s.id === targetSubjectId);
      const fileName = uploadedFile ? uploadedFile.name : `${materialTitle.trim().replace(/\s+/g, "_")}.pdf`;
      const fileSize = uploadedFile ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB` : "2.1 MB";

      if (autoProcessOnUpload) {
        setUploadStep("Sending file to AI for analysis & question synthesis...");
      }

      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: materialTitle.trim(),
          subjectId: targetSubjectId,
          subjectName: targetSub ? targetSub.name : "General",
          grade: targetGrade,
          chapterTopic: chapterTopic.trim(),
          fileName,
          fileSize,
          autoProcess: autoProcessOnUpload,
          questionCount: uploadQuestionCount,
          difficulty: uploadDifficulty,
        }),
      });

      const data = await res.json();
      if (data.success && data.material) {
        setMaterials((prev) => [data.material, ...prev]);
        setShowUploadModal(false);
        setMaterialTitle("");
        setChapterTopic("");
        setUploadedFile(null);
        showToast(
          autoProcessOnUpload
            ? "Material uploaded & AI generated Quiz + Worksheet! Ready for review."
            : "Material uploaded successfully."
        );

        if (autoProcessOnUpload) {
          openReviewWorkbench(data.material);
        }
      } else {
        setUploadError(data.error || "Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
      setUploadStep("");
    }
  };

  const handleDeleteMaterial = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/materials?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
        if (reviewMaterial?.id === id) setReviewMaterial(null);
        showToast("Material removed.");
      }
    } catch (err) {
      console.error("Failed to delete material:", err);
    }
  };

  const openReviewWorkbench = (material: LearningMaterialItem) => {
    setReviewMaterial(material);
    if (material.generatedContent) {
      setEditQuiz(JSON.parse(JSON.stringify(material.generatedContent.quiz)));
      setEditWorksheet(JSON.parse(JSON.stringify(material.generatedContent.worksheet)));
    } else {
      setEditQuiz(null);
      setEditWorksheet(null);
    }
  };

  const handleTriggerAiProcess = async (materialId: string) => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/materials/${materialId}/ai-process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionCount: regenCount,
          difficulty: regenDifficulty,
        }),
      });
      const data = await res.json();
      if (data.success && data.material) {
        setMaterials((prev) =>
          prev.map((m) => (m.id === materialId ? data.material : m))
        );
        if (reviewMaterial?.id === materialId) {
          setReviewMaterial(data.material);
          setEditQuiz(JSON.parse(JSON.stringify(data.material.generatedContent.quiz)));
          setEditWorksheet(JSON.parse(JSON.stringify(data.material.generatedContent.worksheet)));
        }
        showToast("AI regenerated Quiz and Worksheet successfully!");
      } else {
        alert(data.error || "AI processing failed.");
      }
    } catch (err) {
      console.error("AI trigger failed:", err);
      alert("Failed to connect to AI service.");
    } finally {
      setRegenerating(false);
    }
  };

  // Inline Question Edit Handlers
  const handleQuizQuestionChange = (index: number, field: string, value: any) => {
    if (!editQuiz) return;
    const updated = { ...editQuiz };
    const q = updated.questions[index];
    if (field === "question") q.question = value;
    if (field === "correctAnswer") q.correctAnswer = value;
    if (field === "explanation") q.explanation = value;
    if (field === "marks") q.marks = Number(value) || 2;
    setEditQuiz(updated);
  };

  const handleQuizOptionChange = (qIndex: number, optIndex: number, value: string) => {
    if (!editQuiz) return;
    const updated = { ...editQuiz };
    if (updated.questions[qIndex].options) {
      updated.questions[qIndex].options![optIndex] = value;
    }
    setEditQuiz(updated);
  };

  const handleRemoveQuizQuestion = (qIndex: number) => {
    if (!editQuiz) return;
    const updated = { ...editQuiz };
    updated.questions.splice(qIndex, 1);
    updated.questions.forEach((q, i) => (q.questionNumber = i + 1));
    updated.totalMarks = updated.questions.reduce((sum, q) => sum + (q.marks || 2), 0);
    setEditQuiz(updated);
  };

  const handleAddQuizQuestion = () => {
    if (!editQuiz) return;
    const updated = { ...editQuiz };
    const nextNum = updated.questions.length + 1;
    updated.questions.push({
      id: `q-custom-${Date.now()}`,
      questionNumber: nextNum,
      question: "New conceptual quiz question...",
      type: "mcq",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: "Explanation from chapter notes.",
      marks: 2,
    });
    updated.totalMarks = updated.questions.reduce((sum, q) => sum + (q.marks || 2), 0);
    setEditQuiz(updated);
  };

  const handleWorksheetQuestionChange = (index: number, field: string, value: any) => {
    if (!editWorksheet) return;
    const updated = { ...editWorksheet };
    const q = updated.questions[index];
    if (field === "question") q.question = value;
    if (field === "suggestedAnswer") q.suggestedAnswer = value;
    if (field === "writingSpaceLines") q.writingSpaceLines = Number(value) || 3;
    if (field === "marks") q.marks = Number(value) || 4;
    setEditWorksheet(updated);
  };

  const handleRemoveWorksheetQuestion = (qIndex: number) => {
    if (!editWorksheet) return;
    const updated = { ...editWorksheet };
    updated.questions.splice(qIndex, 1);
    updated.questions.forEach((q, i) => (q.questionNumber = i + 1));
    updated.totalMarks = updated.questions.reduce((sum, q) => sum + (q.marks || 4), 0);
    setEditWorksheet(updated);
  };

  const handleAddWorksheetQuestion = () => {
    if (!editWorksheet) return;
    const updated = { ...editWorksheet };
    const nextNum = updated.questions.length + 1;
    updated.questions.push({
      id: `qw-custom-${Date.now()}`,
      questionNumber: nextNum,
      question: `Q${nextNum}. Write a descriptive answer about the core concept...`,
      type: "descriptive",
      writingSpaceLines: 4,
      suggestedAnswer: "Suggested sample student response.",
      marks: 4,
    });
    updated.totalMarks = updated.questions.reduce((sum, q) => sum + (q.marks || 4), 0);
    setEditWorksheet(updated);
  };

  const handleSaveEdits = async () => {
    if (!reviewMaterial || !editQuiz || !editWorksheet) return;
    setSavingEdits(true);

    try {
      const res = await fetch(`/api/materials/${reviewMaterial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatedContent: {
            quiz: editQuiz,
            worksheet: editWorksheet,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.material) {
        setMaterials((prev) =>
          prev.map((m) => (m.id === reviewMaterial.id ? data.material : m))
        );
        setReviewMaterial(data.material);
        showToast("Changes saved successfully.");
      }
    } catch (err) {
      console.error("Save edits failed:", err);
      alert("Failed to save question edits.");
    } finally {
      setSavingEdits(false);
    }
  };

  const handleApproveContent = async () => {
    if (!reviewMaterial || !editQuiz || !editWorksheet) return;
    setSavingEdits(true);

    try {
      const res = await fetch(`/api/materials/${reviewMaterial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalStatus: "approved",
          approvedAt: new Date().toISOString(),
          generatedContent: {
            quiz: editQuiz,
            worksheet: editWorksheet,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.material) {
        setMaterials((prev) =>
          prev.map((m) => (m.id === reviewMaterial.id ? data.material : m))
        );
        setReviewMaterial(data.material);
        showToast("Content approved! Downloadable school PDFs are now generated and ready.");
      }
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Failed to approve material.");
    } finally {
      setSavingEdits(false);
    }
  };

  const handleAssignToStudents = async () => {
    if (!assignMaterialTarget) return;
    setAssigning(true);

    try {
      const res = await fetch(`/api/materials/${assignMaterialTarget.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: assignDeadline }),
      });
      const data = await res.json();
      if (data.success) {
        setMaterials((prev) =>
          prev.map((m) => (m.id === assignMaterialTarget.id ? data.material : m))
        );
        if (reviewMaterial?.id === assignMaterialTarget.id) {
          setReviewMaterial(data.material);
        }
        setAssignMaterialTarget(null);
        showToast(
          `Published as worksheet for students! Deadline: ${new Date(assignDeadline).toLocaleDateString()}`
        );
      } else {
        alert(data.error || "Assignment failed.");
      }
    } catch (err) {
      console.error("Assignment failed:", err);
      alert("Failed to assign material.");
    } finally {
      setAssigning(false);
    }
  };

  // Filter materials based on subject folder & search query
  const filteredMaterials = materials.filter((m) => {
    if (selectedFolder !== "all" && m.subjectId !== selectedFolder) return false;
    if (
      searchQuery &&
      !m.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.chapterTopic.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.grade.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans antialiased text-ink">
      <TeacherSideNav />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                  Books & Study Materials
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Upload textbooks, chapter notes, and learning materials. AI reads them to generate class-appropriate quizzes and worksheets.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubjectModal(true)}
                className="h-9 text-xs font-medium border-gray-300"
              >
                <FolderPlus className="w-4 h-4 mr-1.5 text-gray-500" />
                New Folder
              </Button>
              <Button
                size="sm"
                onClick={() => setShowUploadModal(true)}
                className="h-9 text-xs font-semibold bg-emerald hover:bg-emerald/90 text-white shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Upload Material
              </Button>
            </div>
          </div>

          {/* Toast Notice */}
          {toastMessage && (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-xs font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage("")} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Subject Folders Bar */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Subject Folders
              </span>
              <span className="text-xs text-gray-400">
                {subjects.length} subjects • {materials.length} total materials
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedFolder("all")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                  selectedFolder === "all"
                    ? "bg-ink text-white border-ink"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                )}
              >
                <Folder className="w-3.5 h-3.5 text-amber-500" />
                <span>All Materials</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  selectedFolder === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                )}>
                  {materials.length}
                </span>
              </button>

              {subjects.map((sub) => {
                const isSelected = selectedFolder === sub.id;
                const count = materials.filter((m) => m.subjectId === sub.id).length;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedFolder(sub.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                      isSelected
                        ? "bg-ink text-white border-ink"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <Folder className="w-3.5 h-3.5 text-amber-500" />
                    <span>{sub.name}</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px]",
                      isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Search & Material Roster */}
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books, chapters, or grades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-hidden focus:border-emerald"
                />
              </div>

              <div className="text-xs text-gray-500">
                Showing {filteredMaterials.length} materials
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Loading study materials...
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-medium text-gray-600">No study materials found</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Upload a PDF textbook, chapter notes, or worksheet to let AI generate quizzes and assignments.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  className="text-xs font-semibold bg-emerald text-white mt-2"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Upload First Material
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Material & Chapter</th>
                      <th className="py-2.5 px-3 font-semibold">Subject & Class</th>
                      <th className="py-2.5 px-3 font-semibold">File Info</th>
                      <th className="py-2.5 px-3 font-semibold">AI & Review Status</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMaterials.map((mat) => {
                      const isApproved = mat.approvalStatus === "approved" || mat.approvalStatus === "assigned";
                      const isAssigned = mat.approvalStatus === "assigned";
                      const isReady = mat.status === "ready";
                      const isProcessing = mat.status === "processing";

                      return (
                        <tr key={mat.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-ink flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{mat.title}</span>
                              </div>
                              <div className="text-[11px] text-gray-500">
                                {mat.chapterTopic}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <span className="font-medium text-gray-800">{mat.subjectName}</span>
                              <div className="text-[11px] text-gray-500">{mat.grade}</div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <span className="font-mono text-gray-600 truncate block max-w-[150px]" title={mat.fileName}>
                                {mat.fileName}
                              </span>
                              <div className="text-[10px] text-gray-400">{mat.fileSize || "1.8 MB"}</div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {isProcessing ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                                AI Processing...
                              </span>
                            ) : isAssigned ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                                <FileCheck className="w-3 h-3 text-blue-600" />
                                Assigned to Class
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald" />
                                Approved • PDF Ready
                              </span>
                            ) : isReady ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Ready for Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                Uploaded
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* If not processed yet, allow processing */}
                              {mat.status !== "ready" && !isProcessing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTriggerAiProcess(mat.id)}
                                  className="h-7 text-[11px] px-2 text-emerald border-emerald/30 hover:bg-emerald-50 font-medium"
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Process AI
                                </Button>
                              )}

                              {/* Review & Edit Workbench */}
                              {mat.generatedContent && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openReviewWorkbench(mat)}
                                  className="h-7 text-[11px] px-2 text-gray-700 hover:text-ink font-medium border-gray-300"
                                >
                                  <Edit3 className="w-3 h-3 mr-1 text-gray-500" />
                                  Review & Edit
                                </Button>
                              )}

                              {/* Printable School PDFs */}
                              {isApproved && mat.generatedContent && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setPrintPreviewItem({
                                        material: mat,
                                        type: "quiz",
                                        assessment: mat.generatedContent!.quiz,
                                      })
                                    }
                                    title="Preview & Print School Quiz PDF"
                                    className="h-7 text-[11px] px-2 text-gray-700 border-gray-300 hover:bg-gray-100 font-medium"
                                  >
                                    <Printer className="w-3 h-3 mr-1 text-gray-500" />
                                    Quiz PDF
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setPrintPreviewItem({
                                        material: mat,
                                        type: "worksheet",
                                        assessment: mat.generatedContent!.worksheet,
                                      })
                                    }
                                    title="Preview & Print School Worksheet PDF"
                                    className="h-7 text-[11px] px-2 text-gray-700 border-gray-300 hover:bg-gray-100 font-medium"
                                  >
                                    <Printer className="w-3 h-3 mr-1 text-gray-500" />
                                    Worksheet PDF
                                  </Button>
                                </>
                              )}

                              {/* Assign Action */}
                              {isApproved && (
                                <Button
                                  size="sm"
                                  onClick={() => setAssignMaterialTarget(mat)}
                                  className={cn(
                                    "h-7 text-[11px] px-2 font-medium",
                                    isAssigned
                                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      : "bg-emerald text-white hover:bg-emerald/90"
                                  )}
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  {isAssigned ? "Re-assign" : "Assign"}
                                </Button>
                              )}

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors"
                                title="Delete material"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL 1: Upload Learning Material */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg max-w-lg w-full p-5 space-y-4 shadow-lg animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald" />
                <h3 className="text-sm font-bold text-ink">Upload Book / Study Material</h3>
              </div>
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                className="text-gray-400 hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadMaterial} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Material Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SCERT Science Chapter 4 Notes or Math Fractions"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  disabled={uploading}
                  className="w-full p-2 border border-gray-300 rounded focus:border-emerald focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Subject Folder <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={targetSubjectId}
                    onChange={(e) => setTargetSubjectId(e.target.value)}
                    disabled={uploading}
                    className="w-full p-2 border border-gray-300 rounded focus:border-emerald focus:outline-hidden bg-white"
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Class / Grade Level <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    disabled={uploading}
                    className="w-full p-2 border border-gray-300 rounded focus:border-emerald focus:outline-hidden bg-white"
                  >
                    <option value="Grade 1">Grade 1 (Class 1)</option>
                    <option value="Grade 2">Grade 2 (Class 2)</option>
                    <option value="Grade 3">Grade 3 (Class 3)</option>
                    <option value="Grade 4">Grade 4 (Class 4)</option>
                    <option value="Grade 5">Grade 5 (Class 5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Chapter / Topic <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4: Plant Roots, Leaves & Forest Trees"
                  value={chapterTopic}
                  onChange={(e) => setChapterTopic(e.target.value)}
                  disabled={uploading}
                  className="w-full p-2 border border-gray-300 rounded focus:border-emerald focus:outline-hidden"
                  required
                />
              </div>

              {/* PDF File Picker */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Upload PDF File
                </label>
                <div className="border-2 border-dashed border-gray-200 hover:border-emerald/50 rounded-lg p-3 text-center transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFile(e.target.files[0]);
                      }
                    }}
                    disabled={uploading}
                    className="hidden"
                    id="material-file-input"
                  />
                  <label htmlFor="material-file-input" className="cursor-pointer block space-y-1">
                    <UploadCloud className="w-6 h-6 text-gray-400 mx-auto" />
                    <div className="text-xs text-gray-700 font-medium">
                      {uploadedFile ? uploadedFile.name : "Click to select textbook or chapter PDF"}
                    </div>
                    <p className="text-[10px] text-gray-400">PDF, DOC up to 50MB</p>
                  </label>
                </div>
              </div>

              {/* AI Auto-Processing Options */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoProcessOnUpload}
                      onChange={(e) => setAutoProcessOnUpload(e.target.checked)}
                      disabled={uploading}
                      className="rounded text-emerald focus:ring-emerald"
                    />
                    <span className="font-semibold text-ink">
                      Process with AI immediately upon upload
                    </span>
                  </label>
                  <Sparkles className="w-3.5 h-3.5 text-emerald" />
                </div>

                {autoProcessOnUpload && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-gray-600 block mb-0.5">Questions to generate:</span>
                      <select
                        value={uploadQuestionCount}
                        onChange={(e) => setUploadQuestionCount(Number(e.target.value))}
                        disabled={uploading}
                        className="w-full p-1.5 border border-gray-300 rounded bg-white"
                      >
                        <option value={3}>3 Questions</option>
                        <option value={5}>5 Questions (Recommended)</option>
                        <option value={8}>8 Questions</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-0.5">Difficulty level:</span>
                      <select
                        value={uploadDifficulty}
                        onChange={(e) => setUploadDifficulty(e.target.value as any)}
                        disabled={uploading}
                        className="w-full p-1.5 border border-gray-300 rounded bg-white"
                      >
                        <option value="Easy">Easy (Foundation)</option>
                        <option value="Medium">Medium (Grade-Level)</option>
                        <option value="Hard">Hard (Challenging)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Processing Progress Feedback */}
              {uploading && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs space-y-1">
                  <div className="flex items-center gap-2 text-emerald font-semibold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{uploadStep}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    AI is analyzing the chapter text, extracting concepts, and synthesizing quiz and worksheet items...
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={uploading}
                  className="text-xs font-semibold bg-emerald text-white hover:bg-emerald/90"
                >
                  {uploading ? "Processing..." : "Upload & Analyze"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Subject Folder */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg max-w-sm w-full p-5 space-y-4 shadow-lg animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-emerald" />
                <h3 className="text-sm font-bold text-ink">New Subject Folder</h3>
              </div>
              <button onClick={() => setShowSubjectModal(false)} className="text-gray-400 hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Subject Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Environmental Studies (EVS)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:border-emerald focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="e.g. SCERT textbooks, village biodiversity, and seasonal studies"
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded focus:border-emerald focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubjectModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-semibold bg-emerald text-white hover:bg-emerald/90"
                >
                  Create Folder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Teacher Review & Edit Workbench */}
      {reviewMaterial && editQuiz && editWorksheet && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-lg max-w-4xl w-full my-auto max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            {/* Workbench Header */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/70">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald uppercase tracking-wider">
                    Teacher AI Review Workbench
                  </span>
                  <span className="text-[11px] text-gray-500">• {reviewMaterial.grade}</span>
                </div>
                <h2 className="text-base font-bold text-ink">
                  {reviewMaterial.title}
                </h2>
                <p className="text-xs text-gray-500">
                  Topic: {reviewMaterial.chapterTopic} • Source file: {reviewMaterial.fileName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewMaterial(null)}
                  className="p-1.5 text-gray-400 hover:text-ink hover:bg-gray-100 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Summary Banner */}
            {reviewMaterial.aiSummary && (
              <div className="px-4 py-2 bg-emerald-50/50 border-b border-emerald-100 flex items-start gap-2 text-xs text-emerald-900">
                <Sparkles className="w-3.5 h-3.5 text-emerald shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold">AI Generation Summary: </span>
                  <span>{reviewMaterial.aiSummary}</span>
                </div>
              </div>
            )}

            {/* Workbench Navigation Tabs & Regeneration Bar */}
            <div className="px-4 py-2 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("quiz")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5",
                    activeTab === "quiz"
                      ? "bg-emerald text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <span>Generated Quiz ({editQuiz.questions.length})</span>
                  <span className="text-[10px] opacity-80">• {editQuiz.totalMarks} Marks</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("worksheet")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5",
                    activeTab === "worksheet"
                      ? "bg-emerald text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <span>Generated Worksheet ({editWorksheet.questions.length})</span>
                  <span className="text-[10px] opacity-80">• {editWorksheet.totalMarks} Marks</span>
                </button>
              </div>

              {/* Regeneration Controls */}
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={regenCount}
                  onChange={(e) => setRegenCount(Number(e.target.value))}
                  disabled={regenerating}
                  className="p-1 border border-gray-300 rounded text-xs bg-white"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                </select>

                <select
                  value={regenDifficulty}
                  onChange={(e) => setRegenDifficulty(e.target.value as any)}
                  disabled={regenerating}
                  className="p-1 border border-gray-300 rounded text-xs bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTriggerAiProcess(reviewMaterial.id)}
                  disabled={regenerating}
                  className="h-7 text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <RefreshCw className={cn("w-3 h-3 mr-1", regenerating && "animate-spin")} />
                  {regenerating ? "Regenerating..." : "Regenerate AI"}
                </Button>
              </div>
            </div>

            {/* Questions Editor Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === "quiz" ? (
                /* QUIZ QUESTIONS LIST */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
                    <span>
                      Review and edit multiple choice questions. Students see these in school-style quizzes.
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddQuizQuestion}
                      className="h-7 text-xs border-dashed text-gray-700"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Question
                    </Button>
                  </div>

                  {editQuiz.questions.map((q, qIndex) => (
                    <div
                      key={q.id || qIndex}
                      className="p-3 bg-gray-50/70 border border-gray-200 rounded-lg space-y-2.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-bold text-gray-700 px-1.5 py-0.5 bg-gray-200 rounded text-[11px]">
                            Q{q.questionNumber}
                          </span>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) =>
                              handleQuizQuestionChange(qIndex, "question", e.target.value)
                            }
                            className="flex-1 p-1.5 bg-white border border-gray-300 rounded font-medium focus:outline-hidden focus:border-emerald"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-500">Marks:</span>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={q.marks || 2}
                              onChange={(e) =>
                                handleQuizQuestionChange(qIndex, "marks", e.target.value)
                              }
                              className="w-12 p-1 bg-white border border-gray-300 rounded text-center text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuizQuestion(qIndex)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded"
                            title="Remove Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Options */}
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                          {q.options.map((opt, optIndex) => {
                            const optLetter = String.fromCharCode(65 + optIndex);
                            const isCorrect = q.correctAnswer === opt;

                            return (
                              <div
                                key={optIndex}
                                className={cn(
                                  "flex items-center gap-1.5 p-1 rounded border",
                                  isCorrect
                                    ? "bg-emerald-50/60 border-emerald-300"
                                    : "bg-white border-gray-200"
                                )}
                              >
                                <span className="font-bold text-gray-500 text-[10px] w-4 text-center">
                                  {optLetter}
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) =>
                                    handleQuizOptionChange(qIndex, optIndex, e.target.value)
                                  }
                                  className="flex-1 p-1 text-xs bg-transparent border-none focus:outline-hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuizQuestionChange(qIndex, "correctAnswer", opt)
                                  }
                                  title="Mark as correct answer"
                                  className={cn(
                                    "p-0.5 rounded text-[10px] font-semibold transition-colors",
                                    isCorrect
                                      ? "text-emerald bg-emerald-100 px-1"
                                      : "text-gray-400 hover:text-ink px-1"
                                  )}
                                >
                                  {isCorrect ? "Correct" : "Set Correct"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="pl-6 pt-1 flex items-center gap-2">
                        <span className="text-[11px] font-medium text-gray-500 shrink-0">
                          Explanation:
                        </span>
                        <input
                          type="text"
                          value={q.explanation || ""}
                          onChange={(e) =>
                            handleQuizQuestionChange(qIndex, "explanation", e.target.value)
                          }
                          placeholder="Reasoning / textbook reference..."
                          className="flex-1 p-1 bg-white border border-gray-200 rounded text-[11px] text-gray-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* WORKSHEET QUESTIONS LIST */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
                    <span>
                      Review and edit descriptive worksheet questions. Includes formatted handwriting space for students.
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddWorksheetQuestion}
                      className="h-7 text-xs border-dashed text-gray-700"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Question
                    </Button>
                  </div>

                  {editWorksheet.questions.map((q, qIndex) => (
                    <div
                      key={q.id || qIndex}
                      className="p-3 bg-gray-50/70 border border-gray-200 rounded-lg space-y-2.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-bold text-gray-700 px-1.5 py-0.5 bg-gray-200 rounded text-[11px]">
                            Q{q.questionNumber}
                          </span>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) =>
                              handleWorksheetQuestionChange(qIndex, "question", e.target.value)
                            }
                            className="flex-1 p-1.5 bg-white border border-gray-300 rounded font-medium focus:outline-hidden focus:border-emerald"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-500">Lines:</span>
                            <select
                              value={q.writingSpaceLines || 4}
                              onChange={(e) =>
                                handleWorksheetQuestionChange(qIndex, "writingSpaceLines", e.target.value)
                              }
                              className="p-1 bg-white border border-gray-300 rounded text-xs"
                            >
                              <option value={2}>2 lines</option>
                              <option value={3}>3 lines</option>
                              <option value={4}>4 lines</option>
                              <option value={5}>5 lines</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-500">Marks:</span>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={q.marks || 4}
                              onChange={(e) =>
                                handleWorksheetQuestionChange(qIndex, "marks", e.target.value)
                              }
                              className="w-12 p-1 bg-white border border-gray-300 rounded text-center text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveWorksheetQuestion(qIndex)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded"
                            title="Remove Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Suggested Answer */}
                      <div className="pl-6 space-y-1">
                        <span className="text-[11px] font-medium text-gray-600">
                          Suggested / Model Answer Key:
                        </span>
                        <textarea
                          rows={2}
                          value={q.suggestedAnswer || ""}
                          onChange={(e) =>
                            handleWorksheetQuestionChange(qIndex, "suggestedAnswer", e.target.value)
                          }
                          className="w-full p-1.5 bg-white border border-gray-200 rounded text-[11px] text-gray-700 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workbench Footer: Save & Approval Actions */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveEdits}
                  disabled={savingEdits}
                  className="text-xs border-gray-300"
                >
                  {savingEdits ? "Saving..." : "Save Question Edits"}
                </Button>

                {/* Previews if approved */}
                {(reviewMaterial.approvalStatus === "approved" ||
                  reviewMaterial.approvalStatus === "assigned") && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPrintPreviewItem({
                          material: reviewMaterial,
                          type: "quiz",
                          assessment: editQuiz,
                        })
                      }
                      className="text-xs border-gray-300 text-gray-700"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1 text-gray-500" />
                      Preview Quiz PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPrintPreviewItem({
                          material: reviewMaterial,
                          type: "worksheet",
                          assessment: editWorksheet,
                        })
                      }
                      className="text-xs border-gray-300 text-gray-700"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1 text-gray-500" />
                      Preview Worksheet PDF
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewMaterial(null)}
                  className="text-xs"
                >
                  Close
                </Button>

                {reviewMaterial.approvalStatus === "pending_review" ? (
                  <Button
                    size="sm"
                    onClick={handleApproveContent}
                    disabled={savingEdits}
                    className="text-xs font-semibold bg-emerald text-white hover:bg-emerald/90 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Approve Content & Generate PDFs
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setAssignMaterialTarget(reviewMaterial);
                      setReviewMaterial(null);
                    }}
                    className="text-xs font-semibold bg-emerald text-white hover:bg-emerald/90 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Assign Worksheet to Students
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Assign to Students */}
      {assignMaterialTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald" />
                <h3 className="text-sm font-bold text-ink">Assign Worksheet to Class</h3>
              </div>
              <button
                onClick={() => setAssignMaterialTarget(null)}
                className="text-gray-400 hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1">
                <div className="font-semibold text-ink">{assignMaterialTarget.title}</div>
                <div className="text-gray-600">
                  Subject: {assignMaterialTarget.subjectName} • Class: {assignMaterialTarget.grade}
                </div>
                <div className="text-gray-500">
                  Topic: {assignMaterialTarget.chapterTopic}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Submission Due Date & Time <span className="text-rose-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={assignDeadline}
                  onChange={(e) => setAssignDeadline(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:border-emerald focus:outline-hidden"
                  required
                />
              </div>

              <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 text-emerald-900 rounded text-[11px] space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                  What happens next:
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-emerald-800">
                  <li>This worksheet automatically appears in student portal worksheets.</li>
                  <li>All enrolled students receive a new assignment notification.</li>
                  <li>Students can submit answers and handwritten work for evaluation.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAssignMaterialTarget(null)}
                  disabled={assigning}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAssignToStudents}
                  disabled={assigning}
                  className="text-xs font-semibold bg-emerald text-white hover:bg-emerald/90"
                >
                  {assigning ? "Publishing..." : "Assign to Students"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Clean School-Style Printable PDF Preview */}
      {printPreviewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-gray-300 rounded-lg max-w-3xl w-full my-auto max-h-[95vh] flex flex-col shadow-2xl animate-in fade-in">
            {/* Control Bar (not printed) */}
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald" />
                <span className="text-xs font-bold text-ink">
                  Printable School Assessment Preview ({printPreviewItem.type === "quiz" ? "Quiz" : "Worksheet"})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="h-7 text-xs bg-emerald text-white hover:bg-emerald/90 font-semibold"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Print / Save as PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPrintPreviewItem(null)}
                  className="h-7 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Formal School Paper Document */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white font-serif text-black leading-relaxed space-y-6 printable-exam-sheet">
              {/* School Header */}
              <div className="text-center pb-4 border-b-2 border-black space-y-1">
                <h1 className="text-xl font-bold tracking-wide uppercase">
                  राजकीय प्राथमिक विद्यालय, दुमका (झारखंड)
                </h1>
                <h2 className="text-sm font-semibold tracking-wider uppercase text-gray-700">
                  RAJKIYA PRATHMIK VIDYALAYA, DUMKA • AAROH EDUCATION PORTAL
                </h2>
                <div className="text-xs font-medium text-gray-800 pt-1">
                  Continuous Comprehensive Evaluation & Classroom Practice
                </div>
              </div>

              {/* Assessment Title & Metadata */}
              <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-bold uppercase border-b border-black pb-2 gap-2">
                <div>Subject: {printPreviewItem.material.subjectName}</div>
                <div>Class: {printPreviewItem.material.grade}</div>
                <div>Topic: {printPreviewItem.material.chapterTopic}</div>
                <div>Total Marks: {printPreviewItem.assessment.totalMarks}</div>
              </div>

              {/* Student Metadata Box */}
              <div className="border border-black p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div>
                  <span className="font-bold">Student Name:</span> _________________
                </div>
                <div>
                  <span className="font-bold">Roll No:</span> _________
                </div>
                <div>
                  <span className="font-bold">Date:</span> _________
                </div>
                <div>
                  <span className="font-bold">Marks Scored:</span> _____ / {printPreviewItem.assessment.totalMarks}
                </div>
              </div>

              {/* General Instructions */}
              <div className="text-xs italic bg-gray-50 border border-gray-200 p-2.5 rounded">
                <span className="font-bold not-italic">Instructions: </span>
                {printPreviewItem.assessment.instructions}
              </div>

              {/* Questions Rendered for Paper Examination */}
              <div className="space-y-6 pt-2">
                {printPreviewItem.type === "quiz" ? (
                  /* QUIZ PAPER */
                  printPreviewItem.assessment.questions.map((q) => (
                    <div key={q.id} className="text-sm space-y-2 pb-3 border-b border-dashed border-gray-300">
                      <div className="flex justify-between items-start font-semibold">
                        <span>
                          Q{q.questionNumber}. {q.question}
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-600 shrink-0 ml-2">
                          [{q.marks} Marks]
                        </span>
                      </div>

                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-4 text-xs font-sans">
                          {q.options.map((opt, i) => {
                            const letter = String.fromCharCode(65 + i);
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <span className="inline-block w-4 h-4 border border-black rounded-full text-center text-[10px] leading-3.5 font-bold">
                                  {letter}
                                </span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  /* WORKSHEET PAPER WITH RULED WRITING SPACES */
                  printPreviewItem.assessment.questions.map((q) => (
                    <div key={q.id} className="text-sm space-y-3 pb-4 border-b border-dashed border-gray-300">
                      <div className="flex justify-between items-start font-semibold">
                        <span>
                          Q{q.questionNumber}. {q.question.replace(/^Q\d+\.\s*/, "")}
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-600 shrink-0 ml-2">
                          [{q.marks} Marks]
                        </span>
                      </div>

                      {/* Ruled handwriting spaces for rural students */}
                      <div className="space-y-3 pt-2 pl-2">
                        {Array.from({ length: q.writingSpaceLines || 4 }).map((_, lineIdx) => (
                          <div
                            key={lineIdx}
                            className="border-b border-dotted border-gray-400 h-5 w-full"
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Document Page Footer */}
              <div className="pt-6 border-t border-black flex justify-between items-center text-[11px] font-mono text-gray-600">
                <div>AAROH Rural Education Platform • Rajkiya Prathmik Vidyalaya</div>
                <div>Teacher Sign: ____________</div>
                <div>Page 1 of 1</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
