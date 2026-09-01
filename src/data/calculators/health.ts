/**
 * METER · Health & Fitness (19 tools)
 *
 * Body-composition, metabolic and cardio calculators. Inputs are metric
 * (kg, cm) so the underlying formulas (Mifflin-St Jeor, US Navy body fat,
 * Mosteller BSA, Boer LBM, Widmark BAC) stay exact and testable.
 */

import { fail, needPos, needNonNeg, out, P, R, M, Good, Warn, fmt, unit, pct } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

const SEX = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }];
const ACTIVITY = [
  { value: "1.2", label: "Sedentary (little exercise)" },
  { value: "1.375", label: "Light (1–3 days/week)" },
  { value: "1.55", label: "Moderate (3–5 days/week)" },
  { value: "1.725", label: "Active (6–7 days/week)" },
  { value: "1.9", label: "Very active (hard training)" },
];

const bmiCategory = (bmi: number) =>
  bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal weight" : bmi < 30 ? "Overweight" : "Obese";

const mifflin = (w: number, h: number, a: number, male: boolean) =>
  10 * w + 6.25 * h - 5 * a + (male ? 5 : -161);

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export const CALCULATORS: CalcSpec[] = [
  {
    id: "bmi-calculator", name: "BMI Calculator", category: "health",
    description: "Body Mass Index and weight category from height and weight.",
    keywords: ["bmi", "body mass index", "weight", "obesity", "healthy weight"],
    icon: "Scale", featured: true, popularity: 96,
    fields: [
      { key: "weight", label: "Weight", def: 70, min: 0, unit: "kg" },
      { key: "height", label: "Height", def: 175, min: 1, unit: "cm" },
    ],
    formula: "BMI = weight(kg) / height(m)²",
    compute: (v) => {
      const w = needPos(v.weight, "Weight");
      const m = needPos(v.height, "Height") / 100;
      const bmi = w / (m * m);
      const cat = bmiCategory(bmi);
      const tone = cat === "Normal weight" ? Good : Warn;
      return [P("BMI", fmt(bmi, 2)), tone("Category", cat), M("Healthy BMI range", "18.5 – 24.9")];
    },
    examples: [{ label: "70 kg, 175 cm", inputs: { weight: 70, height: 175 }, expect: "22.86" }],
  },
  {
    id: "bmr-calculator", name: "BMR Calculator", category: "health",
    description: "Basal metabolic rate — calories burned at complete rest.",
    keywords: ["bmr", "basal metabolic rate", "calories", "metabolism", "mifflin"],
    icon: "Flame", featured: true, popularity: 84,
    fields: [
      { key: "weight", label: "Weight", def: 70, min: 0, unit: "kg" },
      { key: "height", label: "Height", def: 175, min: 1, unit: "cm" },
      { key: "age", label: "Age", def: 30, min: 1, max: 120, unit: "yr" },
      { key: "sex", label: "Sex", kind: "select", def: "male", options: SEX },
    ],
    formula: "Mifflin-St Jeor equation",
    compute: (v) => {
      const bmr = mifflin(needPos(v.weight, "Weight"), needPos(v.height, "Height"), needPos(v.age, "Age"), String(v.sex) === "male");
      return [P("BMR", `${fmt(bmr, 0)} kcal/day`), M("Method", "Mifflin-St Jeor")];
    },
    examples: [{ label: "70 kg, 175 cm, 30 yr, male", inputs: { weight: 70, height: 175, age: 30, sex: "male" }, expect: "1,649" }],
  },
  {
    id: "tdee-calculator", name: "TDEE Calculator", category: "health",
    description: "Total daily energy expenditure from BMR and activity level.",
    keywords: ["tdee", "calories", "energy expenditure", "maintenance", "activity"],
    icon: "Flame", featured: true, popularity: 82,
    fields: [
      { key: "weight", label: "Weight", def: 70, min: 0, unit: "kg" },
      { key: "height", label: "Height", def: 175, min: 1, unit: "cm" },
      { key: "age", label: "Age", def: 30, min: 1, max: 120, unit: "yr" },
      { key: "sex", label: "Sex", kind: "select", def: "male", options: SEX },
      { key: "activity", label: "Activity level", kind: "select", def: "1.375", options: ACTIVITY },
    ],
    compute: (v) => {
      const bmr = mifflin(needPos(v.weight, "Weight"), needPos(v.height, "Height"), needPos(v.age, "Age"), String(v.sex) === "male");
      const tdee = bmr * Number(v.activity);
      return [P("TDEE", `${fmt(tdee, 0)} kcal/day`), R("BMR", `${fmt(bmr, 0)} kcal/day`), M("Activity factor", `${v.activity}×`)];
    },
    examples: [{ label: "70 kg, 175 cm, 30, light activity", inputs: { weight: 70, height: 175, age: 30, sex: "male", activity: "1.375" }, expect: "2,267" }],
  },
  {
    id: "body-fat-navy", name: "Body Fat Percentage (US Navy)", category: "health",
    description: "Estimate body fat percentage from tape measurements.",
    keywords: ["body fat", "navy method", "circumference", "composition", "fat percentage"],
    icon: "PersonStanding", popularity: 74,
    fields: [
      { key: "sex", label: "Sex", kind: "select", def: "male", options: SEX },
      { key: "height", label: "Height", def: 175, min: 1, unit: "cm" },
      { key: "neck", label: "Neck circumference", def: 40, min: 1, unit: "cm" },
      { key: "waist", label: "Waist circumference", def: 90, min: 1, unit: "cm" },
      { key: "hip", label: "Hip circumference", def: 100, min: 1, unit: "cm", showIf: { key: "sex", in: ["female"] } },
    ],
    formula: "US Navy circumference method",
    compute: (v) => {
      const male = String(v.sex) === "male";
      const h = needPos(v.height, "Height");
      const neck = needPos(v.neck, "Neck");
      const waist = needPos(v.waist, "Waist");
      let bf: number;
      if (male) {
        if (waist - neck <= 0) fail("Waist must be larger than neck");
        bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
      } else {
        const hip = needPos(v.hip, "Hip");
        if (waist + hip - neck <= 0) fail("Check your measurements");
        bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(h)) - 450;
      }
      return [P("Body fat", pct(bf, 1)), M("Method", "US Navy tape measure")];
    },
    examples: [{ label: "Male, 175 cm, 40 neck, 90 waist", inputs: { sex: "male", height: 175, neck: 40, waist: 90 }, expect: "19.2" }],
  },
  {
    id: "ideal-weight", name: "Ideal Weight Calculator", category: "health",
    description: "Estimated ideal body weight from several clinical formulas.",
    keywords: ["ideal weight", "devine", "robinson", "body weight", "healthy"],
    icon: "Scale", popularity: 70,
    fields: [
      { key: "height", label: "Height", def: 175, min: 1, unit: "cm" },
      { key: "sex", label: "Sex", kind: "select", def: "male", options: SEX },
    ],
    compute: (v) => {
      const inchesOver5ft = Math.max(0, needPos(v.height, "Height") / 2.54 - 60);
      const male = String(v.sex) === "male";
      const devine = (male ? 50 : 45.5) + 2.3 * inchesOver5ft;
      const robinson = (male ? 52 : 49) + (male ? 1.9 : 1.7) * inchesOver5ft;
      const hamwi = (male ? 48 : 45.5) + (male ? 2.7 : 2.2) * inchesOver5ft;
      return [P("Devine formula", unit(devine, "kg")), R("Robinson formula", unit(robinson, "kg")), R("Hamwi formula", unit(hamwi, "kg"))];
    },
    examples: [{ label: "175 cm male", inputs: { height: 175, sex: "male" }, expect: "70.46" }],
  },
  {
    id: "daily-calorie-needs", name: "Daily Calorie Needs", category: "health",
    description: "Calorie targets for maintaining, losing or gaining weight.",
    keywords: ["calories", "calorie needs", "weight loss", "deficit", "surplus", "diet"],
    icon: "Utensils", popularity: 80,
    fields: [
      { key: "weight", label: "Weight", def: 70, min: 0, unit: "kg" },
      { key: "height", label: "Height", def: 175, min: 1, unit: "cm" },
      { key: "age", label: "Age", def: 30, min: 1, max: 120, unit: "yr" },
      { key: "sex", label: "Sex", kind: "select", def: "male", options: SEX },
      { key: "activity", label: "Activity level", kind: "select", def: "1.375", options: ACTIVITY },
    ],
    compute: (v) => {
      const bmr = mifflin(needPos(v.weight, "Weight"), needPos(v.height, "Height"), needPos(v.age, "Age"), String(v.sex) === "male");
      const tdee = bmr * Number(v.activity);
      return [
        P("Maintain weight", `${fmt(tdee, 0)} kcal/day`),
        R("Lose weight (−0.5 kg/wk)", `${fmt(tdee - 500, 0)} kcal/day`),
        R("Gain weight (+0.5 kg/wk)", `${fmt(tdee + 500, 0)} kcal/day`),
      ];
    },
    examples: [{ label: "70 kg, 175 cm, 30, light", inputs: { weight: 70, height: 175, age: 30, sex: "male", activity: "1.375" }, expect: "2,267" }],
  },
  {
    id: "water-intake", name: "Water Intake Calculator", category: "health",
    description: "Recommended daily water intake based on body weight.",
    keywords: ["water", "hydration", "fluid", "intake", "drink", "daily"],
    icon: "Droplets", popularity: 76,
    fields: [{ key: "weight", label: "Weight", def: 70, min: 0, unit: "kg" }],
    formula: "≈ 35 ml per kg of body weight",
    compute: (v) => {
      const ml = needPos(v.weight, "Weight") * 35;
      return [P("Daily water", unit(ml / 1000, "L")), R("In millilitres", unit(ml, "ml")), R("Roughly", `${fmt(ml / 240, 0)} cups`)];
    },
    examples: [{ label: "70 kg", inputs: { weight: 70 }, expect: "2.45" }],
  },
  {
    id: "max-heart-rate", name: "Maximum Heart Rate", category: "health",
    description: "Estimated maximum heart rate from age.",
    keywords: ["heart rate", "max hr", "cardio", "bpm", "exercise"],
    icon: "HeartPulse", popularity: 66,
    fields: [{ key: "age", label: "Age", def: 30, min: 1, max: 120, unit: "yr" }],
    formula: "MHR = 220 − age",
    compute: (v) => {
      const age = needPos(v.age, "Age");
      return [P("Max heart rate", unit(220 - age, "bpm")), R("Tanaka formula", unit(208 - 0.7 * age, "bpm"))];
    },
    examples: [{ label: "Age 30", inputs: { age: 30 }, expect: "190" }],
  },
  {
    id: "target-heart-rate", name: "Target Heart Rate Zone", category: "health",
    description: "Training heart-rate zone using the Karvonen method.",
    keywords: ["target heart rate", "karvonen", "zone", "cardio", "training", "bpm"],
    icon: "HeartPulse", popularity: 60,
    fields: [
      { key: "age", label: "Age", def: 30, min: 1, max: 120, unit: "yr" },
      { key: "resting", label: "Resting heart rate", def: 60, min: 30, max: 120, unit: "bpm" },
      { key: "low", label: "Lower intensity", def: 50, min: 0, max: 100, unit: "%" },
      { key: "high", label: "Upper intensity", def: 85, min: 0, max: 100, unit: "%" },
    ],
    compute: (v) => {
      const hrr = 220 - needPos(v.age, "Age") - needNonNeg(v.resting, "Resting HR");
      const rest = needNonNeg(v.resting, "Resting HR");
      const lo = hrr * (needNonNeg(v.low, "Lower") / 100) + rest;
      const hi = hrr * (needNonNeg(v.high, "Upper") / 100) + rest;
      return [P("Lower target", unit(Math.round(lo), "bpm")), R("Upper target", unit(Math.round(hi), "bpm")), M("Heart-rate reserve", unit(hrr, "bpm"))];
    },
    examples: [{ label: "Age 30, resting 60", inputs: { age: 30, resting: 60, low: 50, high: 85 }, expect: "125" }],
  },
  {
    id: "waist-to-hip-ratio", name: "Waist-to-Hip Ratio", category: "health",
    description: "Body-shape health indicator from waist and hip measurements.",
    keywords: ["waist to hip", "ratio", "whr", "body shape", "health risk"],
    icon: "PersonStanding", popularity: 52,
    fields: [
      { key: "waist", label: "Waist", def: 80, min: 1, unit: "cm" },
      { key: "hip", label: "Hip", def: 100, min: 1, unit: "cm" },
      { key: "sex", label: "Sex", kind: "select", def: "male", options: SEX },
    ],
    compute: (v) => {
      const ratio = needPos(v.waist, "Waist") / needPos(v.hip, "Hip");
      const male = String(v.sex) === "male";
      const risk = ratio > (male ? 0.9 : 0.85) ? "Elevated risk" : "Low risk";
      return [P("Waist-to-hip ratio", fmt(ratio, 2)), (risk === "Low risk" ? Good : Warn)("Health indicator", risk)];
    },
    examples: [{ label: "80 cm waist, 100 cm hip", inputs: { waist: 80, hip: 100, sex: "male" }, expect: "0.8" }],
  },
  {
    id: "body-surface-area", name: "Body Surface Area", category: "health",
    description: "Body surface area using the Mosteller formula.",
    keywords: ["bsa", "body surface area", "mosteller", "dosing", "medical"],
    icon: "PersonStanding", popularity: 48,
    fields: [
      { key: "weight", label: "Weight", def: 70, min: 0, unit: "kg" },
      { key: "height", label: "Height", def: 175, min: 1, unit: "cm" },
    ],
    formula: "BSA = √(height × weight / 3600)",
    compute: (v) => {
      const bsa = Math.sqrt((needPos(v.height, "Height") * needPos(v.weight, "Weight")) / 3600);
      return [P("Body surface area", unit(bsa, "m²")), M("Method", "Mosteller")];
    },
    examples: [{ label: "70 kg, 175 cm", inputs: { weight: 70, height: 175 }, expect: "1.84" }],
  },
  {
    id: "lean-body-mass", name: "Lean Body Mass Calculator", category: "health",
    description: "Fat-free body mass using the Boer formula.",
    keywords: ["lean body mass", "lbm", "boer", "muscle", "fat free"],
    icon: "Dumbbell", popularity: 50,
    fields: [
      { key: "weight", label: "Weight", def: 70, min: 0, unit: "kg" },
      { key: "height", label: "Height", def: 175, min: 1, unit: "cm" },
      { key: "sex", label: "Sex", kind: "select", def: "male", options: SEX },
    ],
    compute: (v) => {
      const w = needPos(v.weight, "Weight");
      const h = needPos(v.height, "Height");
      const lbm = String(v.sex) === "male" ? 0.407 * w + 0.267 * h - 19.2 : 0.252 * w + 0.473 * h - 48.3;
      return [P("Lean body mass", unit(lbm, "kg")), R("Body fat mass", unit(w - lbm, "kg"))];
    },
    examples: [{ label: "70 kg, 175 cm, male", inputs: { weight: 70, height: 175, sex: "male" }, expect: "56" }],
  },
  {
    id: "macro-calculator", name: "Macro Calculator", category: "health",
    description: "Split daily calories into protein, carbohydrate and fat grams.",
    keywords: ["macros", "protein", "carbs", "fat", "macronutrients", "diet"],
    icon: "Utensils", featured: true, popularity: 72,
    fields: [
      { key: "calories", label: "Daily calories", def: 2000, min: 0, unit: "kcal" },
      {
        key: "split", label: "Macro split", kind: "select", def: "balanced",
        options: [
          { value: "balanced", label: "Balanced (40C / 30P / 30F)" },
          { value: "lowcarb", label: "Low carb (20C / 40P / 40F)" },
          { value: "highprotein", label: "High protein (40C / 40P / 20F)" },
          { value: "keto", label: "Keto (5C / 30P / 65F)" },
        ],
      },
    ],
    compute: (v) => {
      const cal = needPos(v.calories, "Calories");
      const splits: Record<string, [number, number, number]> = {
        balanced: [40, 30, 30], lowcarb: [20, 40, 40], highprotein: [40, 40, 20], keto: [5, 30, 65],
      };
      const [c, p, f] = splits[String(v.split)] ?? splits.balanced;
      const carbs = (cal * c) / 100 / 4;
      const protein = (cal * p) / 100 / 4;
      const fat = (cal * f) / 100 / 9;
      return out(
        [P("Protein", unit(protein, "g")), R("Carbohydrates", unit(carbs, "g")), R("Fat", unit(fat, "g"))],
        { bars: [
          { label: "Protein", value: protein, tone: "good" },
          { label: "Carbs", value: carbs, tone: "primary" },
          { label: "Fat", value: fat, tone: "warn" },
        ] },
      );
    },
    examples: [{ label: "2000 kcal, balanced", inputs: { calories: 2000, split: "balanced" }, expect: "150" }],
  },
  {
    id: "protein-intake", name: "Protein Intake Calculator", category: "health",
    description: "Recommended daily protein based on weight and training level.",
    keywords: ["protein", "intake", "grams", "muscle", "diet", "nutrition"],
    icon: "Dumbbell", popularity: 64,
    fields: [
      { key: "weight", label: "Weight", def: 70, min: 0, unit: "kg" },
      {
        key: "level", label: "Goal / activity", kind: "select", def: "1.6",
        options: [
          { value: "0.8", label: "Sedentary (0.8 g/kg)" },
          { value: "1.2", label: "Active (1.2 g/kg)" },
          { value: "1.6", label: "Building muscle (1.6 g/kg)" },
          { value: "2.2", label: "Athlete / cutting (2.2 g/kg)" },
        ],
      },
    ],
    compute: (v) => {
      const grams = needPos(v.weight, "Weight") * Number(v.level);
      return [P("Daily protein", unit(grams, "g")), M("Rate", `${v.level} g per kg`)];
    },
    examples: [{ label: "70 kg building muscle", inputs: { weight: 70, level: "1.6" }, expect: "112" }],
  },
  {
    id: "calories-burned", name: "Calories Burned Calculator", category: "health",
    description: "Energy burned during exercise from MET value, weight and time.",
    keywords: ["calories burned", "exercise", "met", "workout", "activity", "energy"],
    icon: "Activity", popularity: 68,
    fields: [
      {
        key: "met", label: "Activity", kind: "select", def: "8",
        options: [
          { value: "3", label: "Walking (3 MET)" },
          { value: "6", label: "Cycling, moderate (6 MET)" },
          { value: "8", label: "Running (8 MET)" },
          { value: "10", label: "Swimming, fast (10 MET)" },
          { value: "12", label: "Jumping rope (12 MET)" },
        ],
      },
      { key: "weight", label: "Weight", def: 70, min: 0, unit: "kg" },
      { key: "minutes", label: "Duration", def: 60, min: 0, unit: "min" },
    ],
    formula: "kcal = MET × weight(kg) × hours",
    compute: (v) => {
      const kcal = Number(v.met) * needPos(v.weight, "Weight") * (needNonNeg(v.minutes, "Duration") / 60);
      return [P("Calories burned", `${fmt(kcal, 0)} kcal`), M("Intensity", `${v.met} MET`)];
    },
    examples: [{ label: "Running 60 min at 70 kg", inputs: { met: "8", weight: 70, minutes: 60 }, expect: "560" }],
  },
  {
    id: "pregnancy-due-date", name: "Pregnancy Due Date Calculator", category: "health",
    description: "Estimated due date and conception date from the last period.",
    keywords: ["pregnancy", "due date", "gestation", "conception", "edd", "baby"],
    icon: "CalendarDays", popularity: 62,
    fields: [{ key: "lmp", label: "First day of last period", kind: "date", def: "2025-01-01" }],
    formula: "Due date = last period + 280 days (Naegele's rule)",
    compute: (v) => {
      const base = new Date(String(v.lmp || ""));
      if (isNaN(base.getTime())) fail("Enter a valid date");
      const due = new Date(base.getTime() + 280 * 86400000);
      const conception = new Date(base.getTime() + 14 * 86400000);
      return out(
        [P("Estimated due date", isoDate(due)), R("Approx. conception", isoDate(conception)), M("Gestation", "40 weeks")],
        { note: "Naegele's rule assumes a regular 28-day cycle; your provider's estimate may differ." },
      );
    },
    examples: [{ label: "Last period 2025-01-01", inputs: { lmp: "2025-01-01" }, expect: "2025-10-08" }],
  },
  {
    id: "blood-alcohol", name: "Blood Alcohol (BAC) Calculator", category: "health",
    description: "Estimated blood alcohol concentration using the Widmark formula.",
    keywords: ["bac", "blood alcohol", "widmark", "drinks", "intoxication", "alcohol"],
    icon: "Wine", popularity: 58,
    fields: [
      { key: "drinks", label: "Standard drinks", def: 3, min: 0, step: 0.5 },
      { key: "weight", label: "Body weight", def: 80, min: 1, unit: "kg" },
      { key: "sex", label: "Sex", kind: "select", def: "male", options: SEX },
      { key: "hours", label: "Hours since first drink", def: 2, min: 0, step: 0.5 },
    ],
    formula: "BAC = grams alcohol / (weight × r) − 0.015 × hours",
    compute: (v) => {
      const grams = needNonNeg(v.drinks, "Drinks") * 14;
      const r = String(v.sex) === "male" ? 0.68 : 0.55;
      const raw = (grams / (needPos(v.weight, "Weight") * 1000 * r)) * 100 - 0.015 * needNonNeg(v.hours, "Hours");
      const bac = Math.max(0, raw);
      return [
        P("Estimated BAC", pct(bac, 3)),
        (bac < 0.08 ? Good : Warn)("Legal driving (US)", bac < 0.08 ? "Under 0.08%" : "Over the 0.08% limit"),
      ];
    },
    examples: [{ label: "3 drinks, 80 kg male, 2 h", inputs: { drinks: 3, weight: 80, sex: "male", hours: 2 }, expect: "0.047" }],
  },
  {
    id: "healthy-weight-range", name: "Healthy Weight Range", category: "health",
    description: "Weight range for a normal BMI at your height.",
    keywords: ["healthy weight", "weight range", "bmi range", "normal weight", "target"],
    icon: "Scale", popularity: 60,
    fields: [{ key: "height", label: "Height", def: 175, min: 1, unit: "cm" }],
    compute: (v) => {
      const m = needPos(v.height, "Height") / 100;
      const lo = 18.5 * m * m;
      const hi = 25 * m * m;
      return [P("Lower (BMI 18.5)", unit(lo, "kg")), R("Upper (BMI 25)", unit(hi, "kg")), M("Healthy range", `${fmt(lo, 1)} – ${fmt(hi, 1)} kg`)];
    },
    examples: [{ label: "175 cm", inputs: { height: 175 }, expect: "56.7" }],
  },
  {
    id: "weight-loss-timeline", name: "Weight Loss Timeline", category: "health",
    description: "Time to reach a goal weight at a given daily calorie deficit.",
    keywords: ["weight loss", "timeline", "deficit", "goal weight", "diet", "weeks"],
    icon: "TrendingDown", popularity: 64,
    fields: [
      { key: "current", label: "Current weight", def: 90, min: 0, unit: "kg" },
      { key: "goal", label: "Goal weight", def: 80, min: 0, unit: "kg" },
      { key: "deficit", label: "Daily calorie deficit", def: 500, min: 1, unit: "kcal" },
    ],
    formula: "1 kg fat ≈ 7,700 kcal",
    compute: (v) => {
      const cur = needPos(v.current, "Current weight");
      const goal = needNonNeg(v.goal, "Goal weight");
      if (goal >= cur) return [Good("Already at goal", "0 weeks", "Goal weight is at or above current weight")];
      const perWeek = (needPos(v.deficit, "Deficit") * 7) / 7700;
      const weeks = (cur - goal) / perWeek;
      return [
        P("Time to goal", `${fmt(Math.round(weeks))} weeks`),
        R("Weekly loss", unit(perWeek, "kg")),
        R("Total to lose", unit(cur - goal, "kg")),
      ];
    },
    examples: [{ label: "90 → 80 kg, 500 kcal deficit", inputs: { current: 90, goal: 80, deficit: 500 }, expect: "22" }],
  },
];
