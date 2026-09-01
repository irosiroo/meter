/**
 * METER · Sports & Fitness (10 tools)
 *
 * Endurance and strength maths: running/swimming pace, race-time prediction
 * (Riegel), one-rep-max (Epley), VO₂-max (Cooper test) and cycling power zones.
 * Paces are shown as m:ss so they read the way athletes write them.
 */

import { needPos, out, P, R, M, fmt, unit } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

/** Format a number of seconds as m:ss (used for pace and finish times). */
const pace = (secs: number): string => {
  const s = Math.max(0, Math.round(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const CALCULATORS: CalcSpec[] = [
  {
    id: "running-pace", name: "Running Pace Calculator", category: "sports",
    description: "Pace per kilometre and average speed from distance and time.",
    keywords: ["pace", "running", "min per km", "speed", "marathon", "jogging"],
    icon: "Timer", featured: true, popularity: 74,
    fields: [
      { key: "distance", label: "Distance", def: 10, min: 0.01, unit: "km" },
      { key: "time", label: "Time", def: 50, min: 0.01, unit: "min" },
    ],
    formula: "pace = time / distance",
    compute: (v) => {
      const dist = needPos(v.distance, "Distance");
      const time = needPos(v.time, "Time");
      const secPerKm = (time * 60) / dist;
      return [P("Pace", `${pace(secPerKm)} /km`), R("Speed", unit(dist / (time / 60), "km/h")), M("Pace per mile", `${pace(secPerKm * 1.60934)} /mi`)];
    },
    examples: [{ label: "10 km in 50 min", inputs: { distance: 10, time: 50 }, expect: "5:00" }],
  },
  {
    id: "one-rep-max", name: "One-Rep Max Calculator", category: "sports",
    description: "Estimated one-rep max from a weight lifted for several reps.",
    keywords: ["one rep max", "1rm", "strength", "lifting", "epley", "weightlifting"],
    icon: "Dumbbell", featured: true, popularity: 70,
    fields: [
      { key: "weight", label: "Weight lifted", def: 100, min: 0, unit: "kg" },
      { key: "reps", label: "Repetitions", def: 5, min: 1, max: 20, step: 1 },
    ],
    formula: "1RM = weight × (1 + reps / 30)   (Epley)",
    compute: (v) => {
      const w = needPos(v.weight, "Weight");
      const reps = needPos(v.reps, "Reps");
      const orm = w * (1 + reps / 30);
      return [
        P("One-rep max", unit(orm, "kg", 1)),
        R("95% (2–3 reps)", unit(orm * 0.95, "kg", 1)),
        R("80% (8 reps)", unit(orm * 0.8, "kg", 1)),
        M("70% (12 reps)", unit(orm * 0.7, "kg", 1)),
      ];
    },
    examples: [{ label: "100 kg for 5 reps", inputs: { weight: 100, reps: 5 }, expect: "116.7" }],
  },
  {
    id: "vo2-max", name: "VO₂ Max Calculator (Cooper Test)", category: "sports",
    description: "Aerobic fitness from the distance run in a 12-minute test.",
    keywords: ["vo2 max", "cooper test", "aerobic", "fitness", "cardio", "endurance"],
    icon: "HeartPulse", featured: true, popularity: 58,
    fields: [{ key: "distance", label: "Distance in 12 minutes", def: 2400, min: 0, unit: "m" }],
    formula: "VO₂max = (distance − 504.9) / 44.73",
    compute: (v) => {
      const dist = needPos(v.distance, "Distance");
      const vo2 = (dist - 504.9) / 44.73;
      const rating = vo2 >= 52 ? "Excellent" : vo2 >= 42 ? "Good" : vo2 >= 34 ? "Average" : "Below average";
      return out([P("VO₂ max", unit(vo2, "mL/kg/min", 1)), R("Rating", rating)], {
        note: "Cooper 12-minute run test; ratings are for adults and vary by age and sex.",
      });
    },
    examples: [{ label: "2400 m in 12 min", inputs: { distance: 2400 }, expect: "42.4" }],
  },
  {
    id: "race-time-predictor", name: "Race Time Predictor", category: "sports",
    description: "Predict a race time at a new distance from a known result.",
    keywords: ["race predictor", "riegel", "finish time", "marathon", "10k", "endurance"],
    icon: "Trophy", popularity: 54,
    fields: [
      { key: "d1", label: "Known distance", def: 5, min: 0.01, unit: "km" },
      { key: "t1", label: "Known time", def: 25, min: 0.01, unit: "min" },
      { key: "d2", label: "Target distance", def: 10, min: 0.01, unit: "km" },
    ],
    formula: "T₂ = T₁ × (D₂ / D₁)^1.06   (Riegel)",
    compute: (v) => {
      const d1 = needPos(v.d1, "Known distance");
      const t1 = needPos(v.t1, "Known time");
      const d2 = needPos(v.d2, "Target distance");
      const t2 = t1 * Math.pow(d2 / d1, 1.06);
      return [P("Predicted time", unit(t2, "min", 2)), R("As m:ss", pace(t2 * 60)), M("Predicted pace", `${pace((t2 * 60) / d2)} /km`)];
    },
    examples: [{ label: "5 km in 25 min → 10 km", inputs: { d1: 5, t1: 25, d2: 10 }, expect: "52.1" }],
  },
  {
    id: "running-calories", name: "Running Calorie Calculator", category: "sports",
    description: "Calories burned running a distance for your body weight.",
    keywords: ["running calories", "calories burned", "run", "energy", "weight loss"],
    icon: "Flame", popularity: 56,
    fields: [
      { key: "weight", label: "Body weight", def: 70, min: 0, unit: "kg" },
      { key: "distance", label: "Distance", def: 5, min: 0, unit: "km" },
    ],
    formula: "kcal ≈ weight(kg) × distance(km) × 1.036",
    compute: (v) => {
      const w = needPos(v.weight, "Weight");
      const dist = needPos(v.distance, "Distance");
      const kcal = w * dist * 1.036;
      return [P("Calories burned", unit(kcal, "kcal", 1)), M("Per kilometre", unit(w * 1.036, "kcal"))];
    },
    examples: [{ label: "70 kg over 5 km", inputs: { weight: 70, distance: 5 }, expect: "362.6" }],
  },
  {
    id: "swim-pace", name: "Swimming Pace Calculator", category: "sports",
    description: "Pace per 100 m from a swim distance and time.",
    keywords: ["swim", "pace", "per 100m", "swimming", "speed", "lap"],
    icon: "Waves", popularity: 46,
    fields: [
      { key: "distance", label: "Distance", def: 1500, min: 1, unit: "m" },
      { key: "time", label: "Time", def: 30, min: 0.01, unit: "min" },
    ],
    formula: "pace = time / (distance / 100)",
    compute: (v) => {
      const dist = needPos(v.distance, "Distance");
      const time = needPos(v.time, "Time");
      const secPer100 = (time * 60) / (dist / 100);
      return [P("Pace per 100 m", `${pace(secPer100)} /100m`), R("Speed", unit(dist / (time / 60) / 1000 * 60, "km/h"))];
    },
    examples: [{ label: "1500 m in 30 min", inputs: { distance: 1500, time: 30 }, expect: "2:00" }],
  },
  {
    id: "steps-to-distance", name: "Steps to Distance Converter", category: "sports",
    description: "Distance walked from a step count and stride length.",
    keywords: ["steps", "distance", "pedometer", "walking", "stride", "10000 steps"],
    icon: "Footprints", popularity: 52,
    fields: [
      { key: "steps", label: "Number of steps", def: 10000, min: 0, step: 1 },
      { key: "stride", label: "Stride length", def: 0.75, min: 0.1, step: 0.01, unit: "m" },
    ],
    formula: "distance = steps × stride length",
    compute: (v) => {
      const steps = needPos(v.steps, "Steps");
      const stride = needPos(v.stride, "Stride length");
      const metres = steps * stride;
      return [P("Distance", unit(metres / 1000, "km")), R("In miles", unit(metres / 1609.34, "mi")), M("In metres", unit(metres, "m"))];
    },
    examples: [{ label: "10,000 steps, 0.75 m stride", inputs: { steps: 10000, stride: 0.75 }, expect: "7.5" }],
  },
  {
    id: "finish-time", name: "Finish Time Calculator", category: "sports",
    description: "Total finish time from a target pace and distance.",
    keywords: ["finish time", "pace", "target", "race", "goal", "running"],
    icon: "Flag", popularity: 48,
    fields: [
      { key: "pace", label: "Pace per km", def: 5, min: 0.01, unit: "min/km" },
      { key: "distance", label: "Distance", def: 10, min: 0.01, unit: "km" },
    ],
    formula: "time = pace × distance",
    compute: (v) => {
      const p = needPos(v.pace, "Pace");
      const dist = needPos(v.distance, "Distance");
      const totalMin = p * dist;
      return [P("Finish time", pace(totalMin * 60)), R("In minutes", unit(totalMin, "min")), M("Pace", `${pace(p * 60)} /km`)];
    },
    examples: [{ label: "5 min/km for 10 km", inputs: { pace: 5, distance: 10 }, expect: "50:00" }],
  },
  {
    id: "batting-average", name: "Batting Average Calculator", category: "sports",
    description: "Baseball batting average from hits and at-bats.",
    keywords: ["batting average", "baseball", "hits", "at bats", "stats", "avg"],
    icon: "Target", popularity: 44,
    fields: [
      { key: "hits", label: "Hits", def: 150, min: 0, step: 1 },
      { key: "atBats", label: "At-bats", def: 500, min: 1, step: 1 },
    ],
    formula: "AVG = hits / at-bats",
    compute: (v) => {
      const hits = needPos(v.hits, "Hits");
      const ab = needPos(v.atBats, "At-bats");
      if (hits > ab) return [P("Batting average", "—"), M("Note", "Hits cannot exceed at-bats.")];
      return [P("Batting average", (hits / ab).toFixed(3)), M("On", `${fmt(hits)} of ${fmt(ab)}`)];
    },
    examples: [{ label: "150 hits in 500 at-bats", inputs: { hits: 150, atBats: 500 }, expect: "0.300" }],
  },
  {
    id: "ftp-power-zones", name: "Cycling FTP Power Zones", category: "sports",
    description: "Training power zones from your functional threshold power.",
    keywords: ["ftp", "power zones", "cycling", "training", "watts", "threshold"],
    icon: "Bike", popularity: 50,
    fields: [{ key: "ftp", label: "Functional threshold power", def: 250, min: 1, unit: "W" }],
    formula: "Zones are percentages of FTP (Coggan model)",
    compute: (v) => {
      const ftp = needPos(v.ftp, "FTP");
      const z = (lo: number, hi: number) => `${Math.round(lo * ftp)}–${Math.round(hi * ftp)} W`;
      return out(
        [
          P("FTP", `${fmt(ftp)} W`),
          R("Z2 Endurance (56–75%)", z(0.56, 0.75)),
          R("Z3 Tempo (76–90%)", z(0.76, 0.9)),
          R("Z4 Threshold (91–105%)", z(0.91, 1.05)),
          M("Z5 VO₂max (106–120%)", z(1.06, 1.2)),
        ],
        { note: "Coggan seven-zone model; Z1 recovery is below 55% of FTP." },
      );
    },
    examples: [{ label: "FTP 250 W", inputs: { ftp: 250 }, expect: "140" }],
  },
];
