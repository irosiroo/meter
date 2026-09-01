/**
 * METER · Education (10 tools)
 *
 * Grading and study-planning maths: GPA (weighted by credit hours), the score
 * needed on a final, weighted category grades and letter-grade conversion on
 * the US 4.0 scale. Grade→point mapping lives in GRADE_POINTS below.
 */

import { fail, needPos, needNonNeg, out, P, R, M, fmt } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

const GRADE_POINTS: Record<string, number> = {
  "A+": 4, "A": 4, "A-": 3.7, "B+": 3.3, "B": 3, "B-": 2.7,
  "C+": 2.3, "C": 2, "C-": 1.7, "D+": 1.3, "D": 1, "D-": 0.7, "F": 0,
};
const letterFromPct = (p: number): string =>
  p >= 93 ? "A" : p >= 90 ? "A-" : p >= 87 ? "B+" : p >= 83 ? "B" : p >= 80 ? "B-"
    : p >= 77 ? "C+" : p >= 73 ? "C" : p >= 70 ? "C-" : p >= 67 ? "D+" : p >= 63 ? "D" : p >= 60 ? "D-" : "F";

export const CALCULATORS: CalcSpec[] = [
  {
    id: "gpa-calculator", name: "GPA Calculator", category: "education",
    description: "Grade point average weighted by each course's credit hours.",
    keywords: ["gpa", "grade point average", "credits", "college", "university", "semester"],
    icon: "GraduationCap", featured: true, popularity: 78,
    fields: [{ key: "courses", label: "Courses (grade, credits per line)", kind: "textarea", def: "A, 3\nB, 4\nA, 3", wide: true, placeholder: "A, 3\nB+, 4" }],
    formula: "GPA = Σ(grade points × credits) / Σ credits",
    compute: (v) => {
      const lines = String(v.courses ?? "").split(/[\n;]+/).map((s) => s.trim()).filter(Boolean);
      if (!lines.length) fail("Enter at least one course, e.g. \"A, 3\".");
      let quality = 0, credits = 0;
      for (const line of lines) {
        const [g, c] = line.split(/[,\t]/).map((x) => x.trim());
        const gp = GRADE_POINTS[(g ?? "").toUpperCase()];
        if (gp === undefined) fail(`Unknown grade "${g}". Use A, A-, B+, … F.`);
        const credit = parseFloat(c);
        if (!Number.isFinite(credit) || credit < 0) fail(`"${c}" is not a valid credit value.`);
        quality += gp * credit; credits += credit;
      }
      if (credits === 0) fail("Total credits cannot be zero.");
      return out(
        [P("GPA", fmt(quality / credits)), R("Total credits", fmt(credits)), M("Quality points", fmt(quality))],
        { note: "US 4.0 scale; A/A+ = 4.0. Add one course per line as \"grade, credits\"." },
      );
    },
    examples: [{ label: "A/3, B/4, A/3", inputs: { courses: "A, 3\nB, 4\nA, 3" }, expect: "3.6" }],
  },
  {
    id: "final-exam-grade", name: "Final Exam Grade Calculator", category: "education",
    description: "The score you need on the final to hit a target grade.",
    keywords: ["final exam", "grade needed", "target grade", "what do i need", "final"],
    icon: "Target", featured: true, popularity: 72,
    fields: [
      { key: "current", label: "Current grade", def: 80, min: 0, unit: "%" },
      { key: "target", label: "Target grade", def: 85, min: 0, unit: "%" },
      { key: "weight", label: "Final exam weight", def: 40, min: 0.1, max: 100, unit: "%" },
    ],
    formula: "needed = (target − current × (1 − w)) / w",
    compute: (v) => {
      const current = needNonNeg(v.current, "Current grade");
      const target = needNonNeg(v.target, "Target grade");
      const w = needPos(v.weight, "Final weight") / 100;
      const needed = (target - current * (1 - w)) / w;
      const verdict = needed > 100 ? "Not reachable — even a perfect final falls short." : needed <= 0 ? "Already achieved — you could score 0 and still hit the target." : "Achievable with a strong final.";
      return out([P("Score needed on final", `${fmt(needed)}%`), M("Outlook", verdict)], {
        note: "Assumes everything else stays as your current grade.",
      });
    },
    examples: [{ label: "80% now, want 85%, final 40%", inputs: { current: 80, target: 85, weight: 40 }, expect: "92.5" }],
  },
  {
    id: "grade-percentage", name: "Grade Percentage Calculator", category: "education",
    description: "Percentage and letter grade from points earned.",
    keywords: ["grade", "percentage", "score", "letter grade", "assignment", "marks"],
    icon: "Percent", popularity: 66,
    fields: [
      { key: "score", label: "Points earned", def: 45, min: 0 },
      { key: "total", label: "Points possible", def: 50, min: 0.01 },
    ],
    formula: "percentage = score / total × 100",
    compute: (v) => {
      const score = needNonNeg(v.score, "Score");
      const total = needPos(v.total, "Total");
      const pctVal = (score / total) * 100;
      return [P("Percentage", `${fmt(pctVal)}%`), R("Letter grade", letterFromPct(pctVal)), M("Points", `${fmt(score)} / ${fmt(total)}`)];
    },
    examples: [{ label: "45 out of 50", inputs: { score: 45, total: 50 }, expect: "90" }],
  },
  {
    id: "weighted-grade", name: "Weighted Grade Calculator", category: "education",
    description: "Overall grade from category scores and their weights.",
    keywords: ["weighted grade", "categories", "final grade", "weights", "assessment"],
    icon: "Scale", featured: true, popularity: 60,
    fields: [{ key: "items", label: "Scores (score, weight per line)", kind: "textarea", def: "90, 40\n80, 60", wide: true, placeholder: "90, 40\n75, 60" }],
    formula: "grade = Σ(score × weight) / Σ weight",
    compute: (v) => {
      const lines = String(v.items ?? "").split(/[\n;]+/).map((s) => s.trim()).filter(Boolean);
      if (!lines.length) fail("Enter at least one \"score, weight\" line.");
      let sum = 0, wsum = 0;
      for (const line of lines) {
        const [s, w] = line.split(/[,\t]/).map((x) => parseFloat(x.trim()));
        if (!Number.isFinite(s) || !Number.isFinite(w)) fail(`Could not read "${line}" as "score, weight".`);
        sum += s * w; wsum += w;
      }
      if (wsum === 0) fail("Total weight cannot be zero.");
      return [P("Overall grade", `${fmt(sum / wsum)}%`), R("Letter grade", letterFromPct(sum / wsum)), M("Total weight", fmt(wsum))];
    },
    examples: [{ label: "90×40% + 80×60%", inputs: { items: "90, 40\n80, 60" }, expect: "84" }],
  },
  {
    id: "test-score-grade", name: "Test Score Calculator", category: "education",
    description: "Percentage and grade from questions answered correctly.",
    keywords: ["test score", "quiz", "correct", "questions", "grade", "exam"],
    icon: "ClipboardCheck", popularity: 58,
    fields: [
      { key: "correct", label: "Correct answers", def: 18, min: 0, step: 1 },
      { key: "total", label: "Total questions", def: 20, min: 1, step: 1 },
    ],
    compute: (v) => {
      const correct = needNonNeg(v.correct, "Correct");
      const total = needPos(v.total, "Total");
      const pctVal = (Math.min(correct, total) / total) * 100;
      return [P("Score", `${fmt(pctVal)}%`), R("Letter grade", letterFromPct(pctVal)), M("Incorrect", `${fmt(Math.max(0, total - correct))}`)];
    },
    examples: [{ label: "18 of 20 correct", inputs: { correct: 18, total: 20 }, expect: "90" }],
  },
  {
    id: "cumulative-gpa", name: "Cumulative GPA Calculator", category: "education",
    description: "New cumulative GPA after adding a term's results.",
    keywords: ["cumulative gpa", "overall gpa", "semester", "credits", "college"],
    icon: "GraduationCap", popularity: 54,
    fields: [
      { key: "priorGpa", label: "Prior GPA", def: 3.5, min: 0, max: 4, step: 0.01 },
      { key: "priorCredits", label: "Prior credits", def: 60, min: 0 },
      { key: "termGpa", label: "This term's GPA", def: 3.8, min: 0, max: 4, step: 0.01 },
      { key: "termCredits", label: "This term's credits", def: 15, min: 0 },
    ],
    compute: (v) => {
      const pg = needNonNeg(v.priorGpa, "Prior GPA");
      const pc = needNonNeg(v.priorCredits, "Prior credits");
      const tg = needNonNeg(v.termGpa, "Term GPA");
      const tc = needNonNeg(v.termCredits, "Term credits");
      const totalCredits = pc + tc;
      if (totalCredits === 0) fail("Enter some credit hours.");
      const cum = (pg * pc + tg * tc) / totalCredits;
      return [P("Cumulative GPA", fmt(cum)), M("Total credits", fmt(totalCredits))];
    },
    examples: [{ label: "3.5 (60 cr) + 3.8 (15 cr)", inputs: { priorGpa: 3.5, priorCredits: 60, termGpa: 3.8, termCredits: 15 }, expect: "3.56" }],
  },
  {
    id: "letter-grade-gpa", name: "Percentage to Letter Grade", category: "education",
    description: "Convert a percentage to a letter grade and 4.0-scale points.",
    keywords: ["letter grade", "gpa scale", "percentage", "convert", "4.0", "grade point"],
    icon: "Award", popularity: 50,
    fields: [{ key: "percent", label: "Percentage", def: 85, min: 0, max: 100, unit: "%" }],
    compute: (v) => {
      const p = needNonNeg(v.percent, "Percentage");
      const letter = letterFromPct(p);
      return [P("Letter grade", letter), R("GPA points", GRADE_POINTS[letter].toFixed(1))];
    },
    examples: [{ label: "85%", inputs: { percent: 85 }, expect: "B" }],
  },
  {
    id: "attendance-rate", name: "Attendance Rate Calculator", category: "education",
    description: "Attendance percentage from classes attended.",
    keywords: ["attendance", "rate", "classes", "absent", "percentage", "school"],
    icon: "CalendarCheck", popularity: 46,
    fields: [
      { key: "attended", label: "Classes attended", def: 42, min: 0, step: 1 },
      { key: "total", label: "Total classes", def: 48, min: 1, step: 1 },
    ],
    compute: (v) => {
      const attended = needNonNeg(v.attended, "Attended");
      const total = needPos(v.total, "Total");
      const rate = (Math.min(attended, total) / total) * 100;
      return [P("Attendance rate", `${fmt(rate)}%`), R("Missed", `${fmt(Math.max(0, total - attended))} classes`)];
    },
    examples: [{ label: "42 of 48 classes", inputs: { attended: 42, total: 48 }, expect: "87.5" }],
  },
  {
    id: "study-time-planner", name: "Study Time Planner", category: "education",
    description: "Recommended weekly study hours from your course load.",
    keywords: ["study time", "study hours", "credits", "planning", "college", "workload"],
    icon: "BookOpen", popularity: 44,
    fields: [
      { key: "credits", label: "Credit hours", def: 15, min: 0 },
      { key: "ratio", label: "Study hours per credit", def: 2, min: 0, step: 0.5, optional: true },
    ],
    formula: "study hours = credits × hours-per-credit",
    compute: (v) => {
      const credits = needPos(v.credits, "Credits");
      const ratio = Number.isFinite(v.ratio) ? Math.max(0, v.ratio) : 2;
      const weekly = credits * ratio;
      return [P("Weekly study time", `${fmt(weekly)} h`), R("Per day", `${fmt(weekly / 7)} h`), M("Plus class time", `${fmt(credits)} h/week`)];
    },
    examples: [{ label: "15 credits, 2 h each", inputs: { credits: 15, ratio: 2 }, expect: "30" }],
  },
  {
    id: "essay-word-count", name: "Essay Length Calculator", category: "education",
    description: "Pages and read-aloud time from an essay's word count.",
    keywords: ["essay", "word count", "pages", "words per page", "writing", "length"],
    icon: "FileText", popularity: 48,
    fields: [
      { key: "words", label: "Word count", def: 1500, min: 0, step: 1 },
      { key: "perPage", label: "Words per page", def: 500, min: 1, step: 1, optional: true },
    ],
    compute: (v) => {
      const words = needNonNeg(v.words, "Word count");
      const perPage = Number.isFinite(v.perPage) && v.perPage > 0 ? v.perPage : 500;
      return [P("Pages", fmt(words / perPage)), R("Reading time", `${fmt(words / 200)} min`), M("Speaking time", `${fmt(words / 130)} min`)];
    },
    examples: [{ label: "1500 words, 500/page", inputs: { words: 1500, perPage: 500 }, expect: "3" }],
  },
];
