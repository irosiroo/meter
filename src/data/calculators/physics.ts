/**
 * METER · Physics (18 tools)
 *
 * Classical-mechanics, thermal and wave calculators. Angles are entered in
 * degrees and converted with rad(); gravitational acceleration g defaults to
 * Earth's 9.81 m/s² but is editable so the same tools work on other bodies.
 */

import { needPos, needNonNeg, need, P, R, unit, rad } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

const G = 6.674e-11; // gravitational constant, N·m²/kg²

export const CALCULATORS: CalcSpec[] = [
  {
    id: "velocity", name: "Velocity Calculator", category: "physics",
    description: "Average velocity from distance travelled and time taken.",
    keywords: ["velocity", "speed", "distance", "time", "motion"],
    icon: "Gauge", featured: true, popularity: 78,
    fields: [
      { key: "distance", label: "Distance", def: 100, min: 0, unit: "m" },
      { key: "time", label: "Time", def: 10, min: 0, unit: "s" },
    ],
    formula: "v = d / t",
    compute: (v) => {
      const d = needNonNeg(v.distance, "Distance");
      const t = needPos(v.time, "Time");
      const vel = d / t;
      return [P("Velocity", unit(vel, "m/s")), R("In km/h", unit(vel * 3.6, "km/h"))];
    },
    examples: [{ label: "100 m in 10 s", inputs: { distance: 100, time: 10 }, expect: "10" }],
  },
  {
    id: "acceleration", name: "Acceleration Calculator", category: "physics",
    description: "Acceleration from the change in velocity over time.",
    keywords: ["acceleration", "velocity", "change", "motion", "kinematics"],
    icon: "TrendingUp", popularity: 66,
    fields: [
      { key: "vi", label: "Initial velocity", def: 0, unit: "m/s" },
      { key: "vf", label: "Final velocity", def: 20, unit: "m/s" },
      { key: "time", label: "Time", def: 4, min: 0, unit: "s" },
    ],
    formula: "a = (v_f − v_i) / t",
    compute: (v) => {
      const vi = need(v.vi, "Initial velocity");
      const vf = need(v.vf, "Final velocity");
      const t = needPos(v.time, "Time");
      return [P("Acceleration", unit((vf - vi) / t, "m/s²"))];
    },
    examples: [{ label: "0 → 20 m/s in 4 s", inputs: { vi: 0, vf: 20, time: 4 }, expect: "5" }],
  },
  {
    id: "newtons-second-law", name: "Force Calculator (F = ma)", category: "physics",
    description: "Newton's second law: force from mass and acceleration.",
    keywords: ["force", "newton", "mass", "acceleration", "f=ma", "dynamics"],
    icon: "Move", featured: true, popularity: 74,
    fields: [
      { key: "mass", label: "Mass", def: 10, min: 0, unit: "kg" },
      { key: "accel", label: "Acceleration", def: 5, unit: "m/s²" },
    ],
    formula: "F = m · a",
    compute: (v) => {
      const m = needPos(v.mass, "Mass");
      const a = need(v.accel, "Acceleration");
      return [P("Force", unit(m * a, "N")), R("Weight equivalent", unit((m * a) / 9.80665, "kgf"))];
    },
    examples: [{ label: "10 kg at 5 m/s²", inputs: { mass: 10, accel: 5 }, expect: "50" }],
  },
  {
    id: "kinetic-energy", name: "Kinetic Energy Calculator", category: "physics",
    description: "Energy of a moving object from its mass and speed.",
    keywords: ["kinetic energy", "energy", "motion", "joules", "mass", "velocity"],
    icon: "Zap", popularity: 70,
    fields: [
      { key: "mass", label: "Mass", def: 2, min: 0, unit: "kg" },
      { key: "velocity", label: "Velocity", def: 10, unit: "m/s" },
    ],
    formula: "KE = ½ · m · v²",
    compute: (v) => {
      const m = needPos(v.mass, "Mass");
      const vel = need(v.velocity, "Velocity");
      return [P("Kinetic energy", unit(0.5 * m * vel * vel, "J"))];
    },
    examples: [{ label: "2 kg at 10 m/s", inputs: { mass: 2, velocity: 10 }, expect: "100" }],
  },
  {
    id: "potential-energy", name: "Potential Energy Calculator", category: "physics",
    description: "Gravitational potential energy from mass, height and gravity.",
    keywords: ["potential energy", "gravity", "height", "energy", "joules"],
    icon: "TrendingUp", popularity: 62,
    fields: [
      { key: "mass", label: "Mass", def: 2, min: 0, unit: "kg" },
      { key: "height", label: "Height", def: 5, min: 0, unit: "m" },
      { key: "g", label: "Gravity", def: 9.81, min: 0, step: 0.01, unit: "m/s²" },
    ],
    formula: "PE = m · g · h",
    compute: (v) => {
      const m = needPos(v.mass, "Mass");
      const h = needNonNeg(v.height, "Height");
      const g = needPos(v.g, "Gravity");
      return [P("Potential energy", unit(m * g * h, "J"))];
    },
    examples: [{ label: "2 kg at 5 m", inputs: { mass: 2, height: 5, g: 9.81 }, expect: "98.1" }],
  },
  {
    id: "momentum", name: "Momentum Calculator", category: "physics",
    description: "Linear momentum of a moving object.",
    keywords: ["momentum", "mass", "velocity", "impulse", "collision"],
    icon: "Move", popularity: 56,
    fields: [
      { key: "mass", label: "Mass", def: 5, min: 0, unit: "kg" },
      { key: "velocity", label: "Velocity", def: 4, unit: "m/s" },
    ],
    formula: "p = m · v",
    compute: (v) => {
      const m = needPos(v.mass, "Mass");
      const vel = need(v.velocity, "Velocity");
      return [P("Momentum", unit(m * vel, "kg·m/s"))];
    },
    examples: [{ label: "5 kg at 4 m/s", inputs: { mass: 5, velocity: 4 }, expect: "20" }],
  },
  {
    id: "work-done", name: "Work Done Calculator", category: "physics",
    description: "Mechanical work from a force acting over a distance at an angle.",
    keywords: ["work", "force", "distance", "energy", "joules"],
    icon: "Move", popularity: 54,
    fields: [
      { key: "force", label: "Force", def: 10, min: 0, unit: "N" },
      { key: "distance", label: "Distance", def: 5, min: 0, unit: "m" },
      { key: "angle", label: "Angle to motion", def: 0, min: 0, max: 180, unit: "°" },
    ],
    formula: "W = F · d · cos θ",
    compute: (v) => {
      const f = needNonNeg(v.force, "Force");
      const d = needNonNeg(v.distance, "Distance");
      const angle = need(v.angle, "Angle");
      return [P("Work done", unit(f * d * Math.cos(rad(angle)), "J"))];
    },
    examples: [{ label: "10 N over 5 m", inputs: { force: 10, distance: 5, angle: 0 }, expect: "50" }],
  },
  {
    id: "power-physics", name: "Power Calculator (Physics)", category: "physics",
    description: "Rate of doing work — energy transferred per unit time.",
    keywords: ["power", "work", "energy", "time", "watts"],
    icon: "Zap", popularity: 52,
    fields: [
      { key: "work", label: "Work / energy", def: 1000, min: 0, unit: "J" },
      { key: "time", label: "Time", def: 10, min: 0, unit: "s" },
    ],
    formula: "P = W / t",
    compute: (v) => {
      const w = needNonNeg(v.work, "Work");
      const t = needPos(v.time, "Time");
      return [P("Power", unit(w / t, "W")), R("Horsepower", unit(w / t / 745.699872, "hp"))];
    },
    examples: [{ label: "1000 J in 10 s", inputs: { work: 1000, time: 10 }, expect: "100" }],
  },
  {
    id: "projectile-motion", name: "Projectile Motion Calculator", category: "physics",
    description: "Range, maximum height and flight time of a launched projectile.",
    keywords: ["projectile", "trajectory", "range", "launch angle", "ballistics"],
    icon: "Rocket", featured: true, popularity: 72,
    fields: [
      { key: "v0", label: "Launch speed", def: 20, min: 0, unit: "m/s" },
      { key: "angle", label: "Launch angle", def: 45, min: 0, max: 90, unit: "°" },
      { key: "g", label: "Gravity", def: 9.81, min: 0.01, step: 0.01, unit: "m/s²" },
    ],
    formula: "Range = v₀²·sin(2θ)/g",
    compute: (v) => {
      const v0 = needPos(v.v0, "Launch speed");
      const angle = needNonNeg(v.angle, "Angle");
      const g = needPos(v.g, "Gravity");
      const th = rad(angle);
      const range = (v0 * v0 * Math.sin(2 * th)) / g;
      const height = (v0 * v0 * Math.sin(th) * Math.sin(th)) / (2 * g);
      const flight = (2 * v0 * Math.sin(th)) / g;
      return [
        P("Range", unit(range, "m")),
        R("Maximum height", unit(height, "m")),
        R("Time of flight", unit(flight, "s")),
      ];
    },
    examples: [{ label: "20 m/s at 45°", inputs: { v0: 20, angle: 45, g: 9.81 }, expect: "40.7" }],
  },
  {
    id: "free-fall", name: "Free Fall Calculator", category: "physics",
    description: "Distance fallen and impact speed of an object dropped from rest.",
    keywords: ["free fall", "gravity", "drop", "falling", "impact velocity"],
    icon: "TrendingDown", popularity: 58,
    fields: [
      { key: "time", label: "Fall time", def: 3, min: 0, unit: "s" },
      { key: "g", label: "Gravity", def: 9.81, min: 0.01, step: 0.01, unit: "m/s²" },
    ],
    formula: "d = ½·g·t²,  v = g·t",
    compute: (v) => {
      const t = needNonNeg(v.time, "Fall time");
      const g = needPos(v.g, "Gravity");
      return [P("Distance fallen", unit(0.5 * g * t * t, "m")), R("Impact speed", unit(g * t, "m/s"))];
    },
    examples: [{ label: "Falling for 3 s", inputs: { time: 3, g: 9.81 }, expect: "44.1" }],
  },
  {
    id: "density-calculator", name: "Density Calculator", category: "physics",
    description: "Density of a substance from its mass and volume.",
    keywords: ["density", "mass", "volume", "specific gravity", "g/cm3"],
    icon: "Layers", popularity: 60,
    fields: [
      { key: "mass", label: "Mass", def: 100, min: 0, unit: "g" },
      { key: "volume", label: "Volume", def: 50, min: 0, unit: "cm³" },
    ],
    formula: "ρ = m / V",
    compute: (v) => {
      const m = needNonNeg(v.mass, "Mass");
      const vol = needPos(v.volume, "Volume");
      const d = m / vol;
      return [P("Density", unit(d, "g/cm³")), R("In kg/m³", unit(d * 1000, "kg/m³"))];
    },
    examples: [{ label: "100 g in 50 cm³", inputs: { mass: 100, volume: 50 }, expect: "2" }],
  },
  {
    id: "pressure-physics", name: "Pressure Calculator", category: "physics",
    description: "Pressure exerted by a force distributed over an area.",
    keywords: ["pressure", "force", "area", "pascal", "stress"],
    icon: "Gauge", popularity: 50,
    fields: [
      { key: "force", label: "Force", def: 100, min: 0, unit: "N" },
      { key: "area", label: "Area", def: 2, min: 0, unit: "m²" },
    ],
    formula: "P = F / A",
    compute: (v) => {
      const f = needNonNeg(v.force, "Force");
      const a = needPos(v.area, "Area");
      const p = f / a;
      return [P("Pressure", unit(p, "Pa")), R("In kilopascals", unit(p / 1000, "kPa"))];
    },
    examples: [{ label: "100 N over 2 m²", inputs: { force: 100, area: 2 }, expect: "50" }],
  },
  {
    id: "wave-speed", name: "Wave Speed Calculator", category: "physics",
    description: "Wave speed from frequency and wavelength.",
    keywords: ["wave", "speed", "frequency", "wavelength", "sound", "light"],
    icon: "Waves", popularity: 48,
    fields: [
      { key: "freq", label: "Frequency", def: 50, min: 0, unit: "Hz" },
      { key: "wavelength", label: "Wavelength", def: 4, min: 0, unit: "m" },
    ],
    formula: "v = f · λ",
    compute: (v) => {
      const f = needPos(v.freq, "Frequency");
      const w = needPos(v.wavelength, "Wavelength");
      return [P("Wave speed", unit(f * w, "m/s"))];
    },
    examples: [{ label: "50 Hz, 4 m wavelength", inputs: { freq: 50, wavelength: 4 }, expect: "200" }],
  },
  {
    id: "gravitational-force", name: "Gravitational Force Calculator", category: "physics",
    description: "Newton's law of universal gravitation between two masses.",
    keywords: ["gravity", "gravitational force", "newton", "universal gravitation", "attraction"],
    icon: "Orbit", popularity: 46,
    fields: [
      { key: "m1", label: "Mass 1", def: 5.972e24, min: 0, unit: "kg" },
      { key: "m2", label: "Mass 2", def: 7.348e22, min: 0, unit: "kg" },
      { key: "r", label: "Distance between centres", def: 3.844e8, min: 0, unit: "m" },
    ],
    formula: "F = G · m₁ · m₂ / r²",
    compute: (v) => {
      const m1 = needPos(v.m1, "Mass 1");
      const m2 = needPos(v.m2, "Mass 2");
      const r = needPos(v.r, "Distance");
      return [P("Gravitational force", unit((G * m1 * m2) / (r * r), "N"))];
    },
    examples: [{ label: "Two 1,000,000 kg masses, 1 m apart", inputs: { m1: 1e6, m2: 1e6, r: 1 }, expect: "66.74" }],
  },
  {
    id: "pendulum-period", name: "Pendulum Period Calculator", category: "physics",
    description: "Period of a simple pendulum from its length.",
    keywords: ["pendulum", "period", "oscillation", "swing", "harmonic"],
    icon: "Clock", popularity: 44,
    fields: [
      { key: "length", label: "Pendulum length", def: 1, min: 0, step: 0.01, unit: "m" },
      { key: "g", label: "Gravity", def: 9.81, min: 0.01, step: 0.01, unit: "m/s²" },
    ],
    formula: "T = 2π · √(L / g)",
    compute: (v) => {
      const l = needPos(v.length, "Length");
      const g = needPos(v.g, "Gravity");
      const t = 2 * Math.PI * Math.sqrt(l / g);
      return [P("Period", unit(t, "s")), R("Frequency", unit(1 / t, "Hz"))];
    },
    examples: [{ label: "1 m pendulum", inputs: { length: 1, g: 9.81 }, expect: "2.00" }],
  },
  {
    id: "centripetal-force", name: "Centripetal Force Calculator", category: "physics",
    description: "Inward force needed to keep an object moving in a circle.",
    keywords: ["centripetal force", "circular motion", "radius", "orbit", "rotation"],
    icon: "Orbit", popularity: 42,
    fields: [
      { key: "mass", label: "Mass", def: 2, min: 0, unit: "kg" },
      { key: "velocity", label: "Speed", def: 10, min: 0, unit: "m/s" },
      { key: "radius", label: "Radius", def: 5, min: 0, unit: "m" },
    ],
    formula: "F = m · v² / r",
    compute: (v) => {
      const m = needPos(v.mass, "Mass");
      const vel = needPos(v.velocity, "Speed");
      const r = needPos(v.radius, "Radius");
      return [P("Centripetal force", unit((m * vel * vel) / r, "N"))];
    },
    examples: [{ label: "2 kg at 10 m/s, r = 5 m", inputs: { mass: 2, velocity: 10, radius: 5 }, expect: "40" }],
  },
  {
    id: "heat-energy", name: "Heat Energy Calculator", category: "physics",
    description: "Heat needed to change a substance's temperature (Q = mcΔT).",
    keywords: ["heat", "thermal energy", "specific heat", "temperature", "calorimetry"],
    icon: "Flame", popularity: 50,
    fields: [
      { key: "mass", label: "Mass", def: 1, min: 0, unit: "kg" },
      { key: "c", label: "Specific heat", def: 4186, min: 0, unit: "J/kg·K" },
      { key: "dt", label: "Temperature change", def: 10, unit: "K" },
    ],
    formula: "Q = m · c · ΔT",
    compute: (v) => {
      const m = needPos(v.mass, "Mass");
      const c = needPos(v.c, "Specific heat");
      const dt = need(v.dt, "Temperature change");
      const q = m * c * dt;
      return [P("Heat energy", unit(q, "J")), R("In kilojoules", unit(q / 1000, "kJ")), R("In calories", unit(q / 4.184, "cal"))];
    },
    examples: [{ label: "Heat 1 kg water by 10 K", inputs: { mass: 1, c: 4186, dt: 10 }, expect: "41,860" }],
  },
  {
    id: "escape-velocity", name: "Escape Velocity Calculator", category: "physics",
    description: "Minimum speed to escape a body's gravity from its surface.",
    keywords: ["escape velocity", "gravity", "orbit", "rocket", "planet"],
    icon: "Rocket", popularity: 44,
    fields: [
      { key: "mass", label: "Body mass", def: 5.972e24, min: 0, unit: "kg" },
      { key: "radius", label: "Body radius", def: 6.371e6, min: 0, unit: "m" },
    ],
    formula: "v = √(2 · G · M / r)",
    compute: (v) => {
      const m = needPos(v.mass, "Body mass");
      const r = needPos(v.radius, "Body radius");
      const vel = Math.sqrt((2 * G * m) / r);
      return [P("Escape velocity", unit(vel, "m/s")), R("In km/s", unit(vel / 1000, "km/s"))];
    },
    examples: [{ label: "Earth", inputs: { mass: 5.972e24, radius: 6.371e6 }, expect: "11,1" }],
  },
];
