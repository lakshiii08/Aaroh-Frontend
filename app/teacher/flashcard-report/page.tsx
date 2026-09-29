import { TeacherSideNav } from "@/components/layout/teacher-side-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { flashcardAnalytics, students } from "@/lib/mock-data";

const strugglingStudents = students.filter((s) => s.weakConcepts.length > 0);

export default function FlashcardReportPage() {
  const hardest = [...flashcardAnalytics].sort((a, b) => a.accuracy - b.accuracy)[0];

  return (
    <div className="min-h-screen md:flex">
      <TeacherSideNav />
      <main className="flex-1 min-w-0 max-w-6xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Flashcard mastery report</h1>
          <p className="text-ink/55 mt-1">Retention across the Santhali vocabulary deck, class-wide.</p>
        </div>

        <section className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 space-y-1">
              <p className="text-xs font-semibold text-ink/45">Hardest concept</p>
              <p className="font-display text-xl font-bold text-ink">{hardest.concept}</p>
              <p className="text-sm text-amber-dark font-semibold">{hardest.accuracy}% average accuracy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-1">
              <p className="text-xs font-semibold text-ink/45">Total card flips this week</p>
              <p className="font-display text-xl font-bold text-ink">
                {flashcardAnalytics.reduce((sum, f) => sum + f.flips, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-1">
              <p className="text-xs font-semibold text-ink/45">Students needing remediation</p>
              <p className="font-display text-xl font-bold text-ink">{strugglingStudents.length}</p>
            </CardContent>
          </Card>
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Word / concept retention</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink/40 border-b border-ink/8">
                    <th className="font-semibold py-2 px-5">Concept</th>
                    <th className="font-semibold py-2 px-3">Flips</th>
                    <th className="font-semibold py-2 px-3">Avg. accuracy</th>
                    <th className="font-semibold py-2 px-5">Struggling students</th>
                  </tr>
                </thead>
                <tbody>
                  {flashcardAnalytics.map((f) => (
                    <tr key={f.concept} className="border-b border-ink/5 last:border-0">
                      <td className="py-3 px-5 font-semibold text-ink">{f.concept}</td>
                      <td className="py-3 px-3 text-ink/60">{f.flips}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 w-28">
                          <Progress value={f.accuracy} tone={f.accuracy < 55 ? "amber" : "emerald"} className="flex-1" />
                          <span className="text-xs text-ink/50 w-8">{f.accuracy}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        {f.strugglingStudents === 0 ? (
                          <Badge tone="emerald">None</Badge>
                        ) : (
                          <Badge tone="amber">{f.strugglingStudents} students</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Targeted remediation list</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {strugglingStudents.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3 border-b border-ink/6 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-ink text-sm">{s.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.weakConcepts.map((w) => (
                        <Badge key={w} tone="amber" className="text-[10px]">
                          {w}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-ink/40 shrink-0">{s.accuracy}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
