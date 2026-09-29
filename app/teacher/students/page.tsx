"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Search,
  Check,
  Plus,
  KeyRound,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { TeacherSideNav } from "@/components/layout/teacher-side-nav";
import { Button } from "@/components/ui/button";
import { StudentRecord, SubmissionItem, SubjectItem } from "@/lib/db";
import { cn } from "@/lib/utils";

function TeacherStudentsContent() {
  const searchParams = useSearchParams();
  const initialWorksheetId = searchParams.get("worksheetId");

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("s1");
  const [searchStudentQuery, setSearchStudentQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "graded">("all");
  const [loading, setLoading] = useState(true);

  // Student Creation Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentSchool, setNewStudentSchool] = useState("Rajkiya Prathmik Vidyalaya, Dumka");
  const [newStudentGrade, setNewStudentGrade] = useState("Grade 4");
  const [newStudentRoll, setNewStudentRoll] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [addError, setAddError] = useState("");

  // Immediate PIN credential display modal
  const [createdStudentResult, setCreatedStudentResult] = useState<{
    name: string;
    school: string;
    grade: string;
    rollNo: string;
    pin: string;
  } | null>(null);

  // Reset PIN modal
  const [pinResetNotice, setPinResetNotice] = useState<{
    studentName: string;
    newPin: string;
  } | null>(null);

  // Evaluation modal
  const [activeSubmission, setActiveSubmission] = useState<SubmissionItem | null>(null);
  const [evalMarks, setEvalMarks] = useState("18/20");
  const [evalGrade, setEvalGrade] = useState("A");
  const [evalFeedback, setEvalFeedback] = useState("");
  const [showAiReverseTranslation, setShowAiReverseTranslation] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, submRes, subRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/submissions"),
        fetch("/api/subjects"),
      ]);
      const stuData = await stuRes.json();
      const submData = await submRes.json();
      const subData = await subRes.json();

      if (stuData.students) {
        setStudents(stuData.students);
      }
      if (subData.subjects) {
        setSubjects(subData.subjects);
      }
      if (submData.submissions) {
        setSubmissions(submData.submissions);
        if (initialWorksheetId) {
          const matched = submData.submissions.find(
            (s: SubmissionItem) => s.worksheetId === initialWorksheetId
          );
          if (matched) setSelectedStudentId(matched.studentId);
        }
      }
    } catch (e) {
      console.error("Failed to load student performance data:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  // Filtered roster
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      s.rollNo.includes(searchStudentQuery) ||
      (s.school && s.school.toLowerCase().includes(searchStudentQuery.toLowerCase()))
  );

  // Filtered submissions for selected student
  const studentSubmissions = submissions.filter((s) => {
    if (s.studentId !== selectedStudent?.id) return false;
    if (selectedSubjectFilter !== "all" && s.subjectId !== selectedSubjectFilter)
      return false;
    if (statusFilter === "pending") return s.status === "Submitted";
    if (statusFilter === "graded") return s.status === "Graded";
    return true;
  });

  const pendingTotal = submissions.filter((s) => s.status === "Submitted").length;

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setCreatingStudent(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudentName.trim(),
          school: newStudentSchool.trim(),
          grade: newStudentGrade.trim(),
          rollNo: newStudentRoll.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAddError(data.error || "Failed to create student account.");
        setCreatingStudent(false);
        return;
      }

      // Add to list and select newly created student
      setStudents((prev) => [...prev, data.student]);
      setSelectedStudentId(data.student.id);

      // Reset form
      setShowAddModal(false);
      setNewStudentName("");
      setNewStudentRoll("");

      // Show immediate PIN display modal so teacher can note it down
      setCreatedStudentResult({
        name: data.student.name,
        school: data.student.school,
        grade: data.student.grade,
        rollNo: data.student.rollNo,
        pin: data.generatedPin,
      });
    } catch (err) {
      setAddError("Could not connect to server. Please try again.");
    } finally {
      setCreatingStudent(false);
    }
  };

  const handleResetPin = async (studentId: string, studentName: string) => {
    if (!confirm(`Generate a new 4-digit PIN for ${studentName}? The previous PIN will stop working.`)) return;

    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: studentId, action: "reset-pin" }),
      });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, pin: data.newPin } : s))
        );
        setPinResetNotice({
          studentName,
          newPin: data.newPin,
        });
      }
    } catch (err) {
      console.error("PIN reset failed:", err);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName}'s student account?`)) return;

    try {
      const res = await fetch(`/api/students?id=${studentId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        if (selectedStudentId === studentId) {
          const remaining = students.filter((s) => s.id !== studentId);
          if (remaining.length > 0) setSelectedStudentId(remaining[0].id);
        }
        setToastMessage(`Student account for ${studentName} was removed.`);
        setTimeout(() => setToastMessage(""), 3500);
      }
    } catch (err) {
      console.error("Failed to delete student:", err);
    }
  };

  const handleOpenEvaluation = (sub: SubmissionItem) => {
    setActiveSubmission(sub);
    setEvalMarks(sub.marks && sub.marks !== "Pending" ? sub.marks : "18/20");
    setEvalGrade(sub.grade || "A");
    setEvalFeedback(
      sub.feedback ||
        "Good understanding of the core concept. Handwriting in Ol Chiki is neat and legible."
    );
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    setEvaluating(true);
    try {
      const res = await fetch(`/api/submissions/${activeSubmission.id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marks: evalMarks,
          grade: evalGrade,
          feedback: evalFeedback,
          scorePercentage: 90,
          checkedFileName: `${activeSubmission.studentName.replace(/\s+/g, "_")}_Checked.pdf`,
          aiConvertedFileName: `${activeSubmission.studentName.replace(/\s+/g, "_")}_Converted_En_Hi.pdf`,
          aiConvertedText:
            "Student submitted answers in Santali. Reverse translated to Hindi and English.",
          answers: activeSubmission.answers,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === data.submission.id ? data.submission : s))
        );
        setActiveSubmission(null);
        setToastMessage(`Marks and evaluation recorded for ${selectedStudent?.name}.`);
        setTimeout(() => setToastMessage(""), 3500);
      }
    } catch (err) {
      console.error("Failed to save evaluation:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleDownloadConverted = (sub: SubmissionItem) => {
    const content = `AAROH BILINGUAL EVALUATION REPORT
Student: ${sub.studentName} (Grade 4)
Worksheet: ${sub.worksheetTitle}
Subject: ${sub.subjectName}
Marks: ${sub.marks || "18/20"} | Grade: ${sub.grade || "A"}
Evaluation Date: ${sub.checkedAt ? new Date(sub.checkedAt).toLocaleDateString() : new Date().toLocaleDateString()}

TEACHER FEEDBACK:
${sub.feedback || "Good work."}

QUESTIONS & BILINGUAL REVERSE TRANSLATIONS:
${
  sub.answers
    ? sub.answers
        .map(
          (a, i) => `
Q${i + 1}: ${a.question}
Student Santali (Ol Chiki): ${a.studentAnswerSantali}
AI Reverse Translation (Hindi): ${a.aiConvertedHindi}
AI Reverse Translation (English): ${a.aiConvertedEnglish}
Marks: ${a.marksAwarded || "10/10"}
`
        )
        .join("\n---\n")
    : "Evaluated directly from submitted PDF."
}
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sub.studentName.replace(/\s+/g, "_")}_${sub.worksheetTitle.replace(/\s+/g, "_")}_Evaluation.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen md:flex bg-cream">
      <TeacherSideNav />

      <main className="flex-1 min-w-0 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-24 md:pb-12 space-y-6">
        {/* Header: Clean, professional school portal title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-ink">Student Management &amp; Evaluation</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage student accounts, credentials, gradebook, and worksheet evaluations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              <strong className="text-ink">{students.length}</strong> students ·{" "}
              <strong className={cn(pendingTotal > 0 ? "text-amber-800" : "text-gray-500")}>
                {pendingTotal} pending
              </strong>
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setAddError("");
                setShowAddModal(true);
              }}
              className="text-xs gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </Button>
          </div>
        </div>

        {/* Feedback alert */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 font-medium">
            {toastMessage}
          </div>
        )}

        {/* Section 1: Teacher Student Management Table */}
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Enrolled Students
              </h2>
              <p className="text-[11px] text-gray-500">
                Official roster: Login credentials (Roll Number &amp; 4-Digit PIN) and classroom records
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchStudentQuery}
                onChange={(e) => setSearchStudentQuery(e.target.value)}
                placeholder="Search name, roll no, or village..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded outline-none focus:border-emerald text-ink"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-white text-gray-500">
                  <th className="py-2.5 px-4 font-semibold">Student Name</th>
                  <th className="py-2.5 px-3 font-semibold">School / Village</th>
                  <th className="py-2.5 px-3 font-semibold">Class</th>
                  <th className="py-2.5 px-3 font-semibold font-mono">Roll Number</th>
                  <th className="py-2.5 px-3 font-semibold font-mono">4-Digit PIN</th>
                  <th className="py-2.5 px-3 font-semibold">Accuracy</th>
                  <th className="py-2.5 px-3 font-semibold">Worksheets</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((st) => {
                  const isSelected = selectedStudent?.id === st.id;
                  const stSubmissions = submissions.filter((s) => s.studentId === st.id);
                  const stPending = stSubmissions.filter((s) => s.status === "Submitted").length;
                  const stGraded = stSubmissions.filter((s) => s.status === "Graded").length;

                  return (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStudentId(st.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected
                          ? "bg-emerald-50/60 font-medium"
                          : "hover:bg-gray-50/70 text-gray-700"
                      )}
                    >
                      <td className="py-2.5 px-4 font-semibold text-ink">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald shrink-0" />}
                          <span>{st.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 max-w-[180px] truncate" title={st.school}>
                        {st.school || "Rajkiya Prathmik Vidyalaya, Dumka"}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{st.grade}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-ink">
                        {st.rollNo}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-800 font-semibold tracking-wider">
                          {st.pin || "••••"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald h-full rounded-full"
                              style={{ width: `${st.accuracy}%` }}
                            />
                          </div>
                          <span className="text-gray-700">{st.accuracy}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {stPending > 0 ? (
                          <span className="text-amber-800 font-medium">
                            {stPending} to check
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            {stGraded} graded
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(st.id)}
                            className={cn(
                              "px-2 py-1 rounded text-[11px] font-medium transition-colors",
                              isSelected
                                ? "bg-emerald text-white"
                                : "text-gray-600 hover:text-ink hover:bg-gray-100"
                            )}
                          >
                            {isSelected ? "Active" : "View"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResetPin(st.id, st.name)}
                            title="Generate a new 4-digit PIN"
                            className="p-1 text-gray-400 hover:text-ink hover:bg-gray-100 rounded"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(st.id, st.name)}
                            title="Delete student record"
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
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
        </section>

        {/* Section 2: Selected Student Overview (Compact Profile) */}
        {selectedStudent && (
          <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-ink">{selectedStudent.name}</h2>
                  <span className="text-xs text-gray-500 font-mono">Roll #{selectedStudent.rollNo}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-600">{selectedStudent.grade}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-500">{selectedStudent.school}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Login Credentials: Roll Number <strong className="text-gray-700 font-mono">{selectedStudent.rollNo}</strong> · PIN <strong className="text-gray-700 font-mono">{selectedStudent.pin || "••••"}</strong>
                </p>
              </div>

              {/* Compact Inline Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Accuracy</span>
                  <span className="font-semibold text-ink">{selectedStudent.accuracy}%</span>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div>
                  <span className="text-gray-400 block text-[11px]">Cards Seen</span>
                  <span className="font-semibold text-ink">{selectedStudent.cardsReviewed}</span>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div>
                  <span className="text-gray-400 block text-[11px]">Vocab Mastery</span>
                  <span className="font-semibold text-ink">{selectedStudent.masteryPercentage}%</span>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div>
                  <span className="text-gray-400 block text-[11px]">Badges</span>
                  <span className="font-semibold text-ink">{selectedStudent.badges}</span>
                </div>
              </div>
            </div>

            {/* Flashcard Progress & Target Revision Topics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-500 font-medium">Flashcard Retention:</span>
                <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="bg-emerald h-full rounded-full"
                    style={{ width: `${selectedStudent.accuracy}%` }}
                  />
                </div>
                <span className="text-gray-700 font-medium">{selectedStudent.accuracy}%</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-gray-500">Target revision topics:</span>
                {selectedStudent.weakConcepts?.length ? (
                  selectedStudent.weakConcepts.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[11px]"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">All topics on track</span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Section 3: Worksheets (Main Focus) */}
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Controls Bar */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Worksheet Submissions for {selectedStudent?.name}
              </h2>
              <p className="text-[11px] text-gray-500">
                Review submitted assignments, inspect Ol Chiki answers, and record marks
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Subject Filter */}
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-200 rounded bg-white text-gray-700 outline-none focus:border-emerald"
              >
                <option value="all">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <div className="flex items-center border border-gray-200 rounded bg-white text-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "px-2.5 py-1 font-medium transition-colors",
                    statusFilter === "all"
                      ? "bg-gray-100 text-ink font-semibold"
                      : "text-gray-500 hover:text-ink"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={cn(
                    "px-2.5 py-1 font-medium transition-colors border-l border-gray-200",
                    statusFilter === "pending"
                      ? "bg-gray-100 text-amber-900 font-semibold"
                      : "text-gray-500 hover:text-ink"
                  )}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("graded")}
                  className={cn(
                    "px-2.5 py-1 font-medium transition-colors border-l border-gray-200",
                    statusFilter === "graded"
                      ? "bg-gray-100 text-emerald-900 font-semibold"
                      : "text-gray-500 hover:text-ink"
                  )}
                >
                  Graded
                </button>
              </div>
            </div>
          </div>

          {/* Worksheets Table */}
          {studentSubmissions.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No worksheet submissions recorded for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-white text-gray-500">
                    <th className="py-2.5 px-4 font-semibold">Subject</th>
                    <th className="py-2.5 px-4 font-semibold">Worksheet</th>
                    <th className="py-2.5 px-3 font-semibold">Submitted</th>
                    <th className="py-2.5 px-3 font-semibold">Marks</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentSubmissions.map((sub) => {
                    const formattedDate = new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const isGraded = sub.status === "Graded";

                    return (
                      <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-700">
                          {sub.subjectName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-ink">{sub.worksheetTitle}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span>{sub.fileName}</span>
                          </div>
                          {isGraded && sub.feedback && (
                            <div className="mt-1 text-[11px] text-gray-600 italic bg-gray-50 px-2 py-1 rounded border border-gray-100">
                              Feedback: &quot;{sub.feedback}&quot;
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-3">
                          {isGraded ? (
                            <span className="font-semibold text-ink">
                              {sub.marks}{" "}
                              <span className="text-[11px] text-gray-400">({sub.grade})</span>
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isGraded ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald shrink-0" />
                              Graded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              Pending review
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {isGraded && (
                              <button
                                type="button"
                                onClick={() => handleDownloadConverted(sub)}
                                className="text-xs text-gray-500 hover:text-ink font-medium px-2 py-1 rounded hover:bg-gray-100"
                                title="Download evaluated marks report"
                              >
                                Download
                              </button>
                            )}

                            <Button
                              variant={isGraded ? "outline" : "primary"}
                              size="sm"
                              onClick={() => handleOpenEvaluation(sub)}
                              className="text-xs py-1 h-auto"
                            >
                              {isGraded ? "Review & Re-grade" : "Check & Grade"}
                            </Button>
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

        {/* Modal: Create Student Account */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-lg border border-gray-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-base font-bold text-ink">Add New Student Account</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    A unique 4-digit login PIN will be automatically generated upon creation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {addError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{addError}</span>
                </div>
              )}

              <form onSubmit={handleCreateStudent} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Student Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Mangal Marandi"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded outline-none focus:border-emerald font-medium text-ink bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    School / Village <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentSchool}
                    onChange={(e) => setNewStudentSchool(e.target.value)}
                    placeholder="e.g. Rajkiya Prathmik Vidyalaya, Dumka"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded outline-none focus:border-emerald text-ink bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Class / Grade <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudentGrade}
                      onChange={(e) => setNewStudentGrade(e.target.value)}
                      placeholder="e.g. Grade 4"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded outline-none focus:border-emerald text-ink bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Roll Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudentRoll}
                      onChange={(e) => setNewStudentRoll(e.target.value)}
                      placeholder="e.g. 29"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded outline-none focus:border-emerald font-mono font-medium text-ink bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">Login Credential Rules:</p>
                  <p>• Roll Number will be the student&apos;s Login ID.</p>
                  <p>• A random 4-digit unique PIN will be generated as their Password.</p>
                  <p>• You will be shown the PIN immediately to share with the student.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={creatingStudent}>
                    {creatingStudent ? "Creating..." : "Create Account & Generate PIN"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Immediate PIN Display Confirmation */}
        {createdStudentResult && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald" />
                <h3 className="text-base font-bold text-ink">Student Account Created!</h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Please write down or give these login credentials to the student. They will use their <strong>Roll Number as Login ID</strong> and <strong>4-digit PIN as Password</strong>.
              </p>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-semibold text-ink">{createdStudentResult.name}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span className="text-gray-500">Class &amp; School:</span>
                  <span className="font-medium text-ink">{createdStudentResult.grade} · {createdStudentResult.school}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span className="text-gray-500 font-medium">Login ID (Roll No):</span>
                  <span className="font-bold font-mono text-sm text-ink">{createdStudentResult.rollNo}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-emerald-900 font-bold">Password (4-Digit PIN):</span>
                  <span className="font-mono font-bold text-lg text-emerald-900 bg-white px-3 py-1 rounded border border-emerald-300 tracking-widest">
                    {createdStudentResult.pin}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setCreatedStudentResult(null)}
                >
                  Done, I Have Saved the PIN
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: PIN Reset Notification */}
        {pinResetNotice && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl border border-gray-200 space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald" />
                <h3 className="text-base font-bold text-ink">New PIN Generated</h3>
              </div>
              <p className="text-xs text-gray-600">
                New login PIN generated for <strong>{pinResetNotice.studentName}</strong>:
              </p>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
                <span className="font-mono font-bold text-xl text-ink tracking-widest block">
                  {pinResetNotice.newPin}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  The previous PIN is no longer valid.
                </span>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setPinResetNotice(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Teacher Evaluation Dialog */}
        {activeSubmission && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-5 shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-base font-bold text-ink">
                    Evaluate Worksheet Submission
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeSubmission.studentName} · {activeSubmission.worksheetTitle} (
                    {activeSubmission.subjectName})
                  </p>
                </div>
                <button
                  onClick={() => !evaluating && setActiveSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Student Answers with AI Reverse-Translation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Student Responses &amp; AI Reverse-Translation
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAiReverseTranslation(!showAiReverseTranslation)}
                    className="text-xs text-emerald font-medium hover:underline"
                  >
                    {showAiReverseTranslation ? "Hide Translations" : "Show Translations"}
                  </button>
                </div>

                {activeSubmission.answers && activeSubmission.answers.length > 0 ? (
                  <div className="space-y-3">
                    {activeSubmission.answers.map((ans, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 border border-gray-200 rounded text-xs space-y-2"
                      >
                        <div className="font-semibold text-gray-800">
                          Question {idx + 1}: {ans.question}
                        </div>

                        {/* Student written Santali */}
                        <div className="p-2 bg-white border border-gray-200 rounded">
                          <span className="text-[10px] font-bold text-gray-500 uppercase block">
                            Student Answer (Santali Ol Chiki):
                          </span>
                          <p className="text-xs font-medium text-ink mt-0.5">
                            {ans.studentAnswerSantali}
                          </p>
                        </div>

                        {/* AI Translations */}
                        {showAiReverseTranslation && (
                          <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 bg-amber-50/60 border border-amber-200/60 rounded">
                              <span className="font-bold text-amber-900 block text-[10px] uppercase">
                                Hindi Translation:
                              </span>
                              <span className="text-ink mt-0.5 block">{ans.aiConvertedHindi}</span>
                            </div>
                            <div className="p-2 bg-emerald-50/60 border border-emerald-200/60 rounded">
                              <span className="font-bold text-emerald-900 block text-[10px] uppercase">
                                English Translation:
                              </span>
                              <span className="text-ink mt-0.5 block">{ans.aiConvertedEnglish}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                    <p className="text-gray-700">
                      File: <span className="font-mono">{activeSubmission.fileName}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Evaluation Input Form */}
              <form onSubmit={handleSaveEvaluation} className="space-y-3 pt-2 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Marks Awarded
                    </label>
                    <input
                      type="text"
                      value={evalMarks}
                      onChange={(e) => setEvalMarks(e.target.value)}
                      placeholder="e.g. 19/20"
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded outline-none focus:border-emerald font-semibold text-ink"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Letter Grade
                    </label>
                    <select
                      value={evalGrade}
                      onChange={(e) => setEvalGrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded outline-none focus:border-emerald font-semibold text-ink bg-white"
                    >
                      <option value="A+">A+ (Outstanding)</option>
                      <option value="A">A (Excellent)</option>
                      <option value="B+">B+ (Very Good)</option>
                      <option value="B">B (Good)</option>
                      <option value="C">C (Needs Practice)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Teacher Feedback &amp; Suggestions
                  </label>
                  <textarea
                    rows={3}
                    value={evalFeedback}
                    onChange={(e) => setEvalFeedback(e.target.value)}
                    placeholder="Enter constructive remarks for the student..."
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded outline-none focus:border-emerald text-ink"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleDownloadConverted(activeSubmission)}
                    className="text-xs text-gray-500 hover:text-ink font-medium underline"
                  >
                    Download report text
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSubmission(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={evaluating}>
                      {evaluating ? "Saving..." : "Save Marks & Release"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TeacherStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen md:flex bg-cream items-center justify-center p-8">
          <div className="text-xs text-gray-500 font-medium">Loading student performance...</div>
        </div>
      }
    >
      <TeacherStudentsContent />
    </Suspense>
  );
}
