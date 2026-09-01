/**
 * METER · Engineering (16 tools)
 *
 * Electrical and mechanical engineering calculators. Electrical tools use SI
 * base units internally (volts, amps, ohms, farads, henries); the LED and
 * hydraulic tools convert from the practical units engineers actually type
 * (milliamps, bar, cm²).
 */

import { needPos, needNonNeg, P, R, M, fmt, unit } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

const TAU = Math.PI * 2;

export const CALCULATORS: CalcSpec[] = [
  {
    id: "ohms-law", name: "Ohm's Law Calculator", category: "engineering",
    description: "Solve for voltage, current or resistance and the power dissipated.",
    keywords: ["ohms law", "voltage", "current", "resistance", "power", "electrical"],
    icon: "Zap", featured: true, popularity: 90,
    fields: [
      {
        key: "pair", label: "What do you know?", kind: "select", def: "IR",
        options: [
          { value: "IR", label: "Current & Resistance" },
          { value: "VI", label: "Voltage & Current" },
          { value: "VR", label: "Voltage & Resistance" },
        ],
      },
      { key: "volts", label: "Voltage", def: 12, unit: "V", showIf: { key: "pair", in: ["VI", "VR"] } },
      { key: "amps", label: "Current", def: 2, unit: "A", showIf: { key: "pair", in: ["IR", "VI"] } },
      { key: "ohms", label: "Resistance", def: 5, unit: "Ω", showIf: { key: "pair", in: ["IR", "VR"] } },
    ],
    formula: "V = I · R,  P = V · I",
    compute: (v) => {
      const pair = String(v.pair);
      let volt: number, amp: number, ohm: number, primary: ReturnType<typeof P>;
      if (pair === "IR") {
        amp = needPos(v.amps, "Current"); ohm = needPos(v.ohms, "Resistance"); volt = amp * ohm;
        primary = P("Voltage", unit(volt, "V"));
      } else if (pair === "VI") {
        volt = needPos(v.volts, "Voltage"); amp = needPos(v.amps, "Current"); ohm = volt / amp;
        primary = P("Resistance", unit(ohm, "Ω"));
      } else {
        volt = needPos(v.volts, "Voltage"); ohm = needPos(v.ohms, "Resistance"); amp = volt / ohm;
        primary = P("Current", unit(amp, "A"));
      }
      return [primary, R("Power", unit(volt * amp, "W")), M("Voltage", unit(volt, "V")), M("Current", unit(amp, "A")), M("Resistance", unit(ohm, "Ω"))];
    },
    examples: [{ label: "2 A through 5 Ω", inputs: { pair: "IR", amps: 2, ohms: 5 }, expect: "10" }],
  },
  {
    id: "electrical-power", name: "Electrical Power Calculator", category: "engineering",
    description: "Power drawn by a DC load from its voltage and current.",
    keywords: ["power", "watts", "voltage", "current", "electrical", "dc"],
    icon: "Zap", popularity: 72,
    fields: [
      { key: "volts", label: "Voltage", def: 120, min: 0, unit: "V" },
      { key: "amps", label: "Current", def: 5, min: 0, unit: "A" },
    ],
    formula: "P = V · I",
    compute: (v) => {
      const volt = needPos(v.volts, "Voltage");
      const amp = needPos(v.amps, "Current");
      const watt = volt * amp;
      return [P("Power", unit(watt, "W")), R("In kilowatts", unit(watt / 1000, "kW")), R("Per hour", unit(watt / 1000, "kWh"))];
    },
    examples: [{ label: "120 V × 5 A", inputs: { volts: 120, amps: 5 }, expect: "600" }],
  },
  {
    id: "voltage-divider", name: "Voltage Divider Calculator", category: "engineering",
    description: "Output voltage from a two-resistor divider network.",
    keywords: ["voltage divider", "resistor", "vout", "potential divider", "circuit"],
    icon: "Zap", popularity: 66,
    fields: [
      { key: "vin", label: "Input voltage", def: 12, min: 0, unit: "V" },
      { key: "r1", label: "R1 (top)", def: 1000, min: 0, unit: "Ω" },
      { key: "r2", label: "R2 (bottom)", def: 2000, min: 0, unit: "Ω" },
    ],
    formula: "Vout = Vin · R2 / (R1 + R2)",
    compute: (v) => {
      const vin = needPos(v.vin, "Input voltage");
      const r1 = needNonNeg(v.r1, "R1");
      const r2 = needPos(v.r2, "R2");
      const vout = (vin * r2) / (r1 + r2);
      return [P("Output voltage", unit(vout, "V")), R("Current through divider", unit((vin / (r1 + r2)) * 1000, "mA"))];
    },
    examples: [{ label: "12 V, 1k / 2k", inputs: { vin: 12, r1: 1000, r2: 2000 }, expect: "8" }],
  },
  {
    id: "parallel-resistance", name: "Parallel & Series Resistance", category: "engineering",
    description: "Combined resistance of two resistors in parallel and in series.",
    keywords: ["parallel", "series", "resistance", "resistor", "combined", "circuit"],
    icon: "Cog", popularity: 64,
    fields: [
      { key: "r1", label: "Resistor 1", def: 100, min: 0, unit: "Ω" },
      { key: "r2", label: "Resistor 2", def: 100, min: 0, unit: "Ω" },
    ],
    formula: "Parallel: R = R1·R2 / (R1 + R2)   Series: R = R1 + R2",
    compute: (v) => {
      const r1 = needPos(v.r1, "Resistor 1");
      const r2 = needPos(v.r2, "Resistor 2");
      return [P("Parallel", unit((r1 * r2) / (r1 + r2), "Ω")), R("Series", unit(r1 + r2, "Ω"))];
    },
    examples: [{ label: "100 Ω ∥ 100 Ω", inputs: { r1: 100, r2: 100 }, expect: "50" }],
  },
  {
    id: "capacitor-energy", name: "Capacitor Energy Calculator", category: "engineering",
    description: "Energy stored in a charged capacitor.",
    keywords: ["capacitor", "energy", "joules", "charge", "farad"],
    icon: "Battery", popularity: 48,
    fields: [
      { key: "cap", label: "Capacitance", def: 2, min: 0, step: 0.001, unit: "F" },
      { key: "volts", label: "Voltage", def: 10, min: 0, unit: "V" },
    ],
    formula: "E = ½ · C · V²",
    compute: (v) => {
      const c = needPos(v.cap, "Capacitance");
      const volt = needNonNeg(v.volts, "Voltage");
      const e = 0.5 * c * volt * volt;
      return [P("Stored energy", unit(e, "J")), R("Charge", unit(c * volt, "C"))];
    },
    examples: [{ label: "2 F at 10 V", inputs: { cap: 2, volts: 10 }, expect: "100" }],
  },
  {
    id: "rc-time-constant", name: "RC Time Constant Calculator", category: "engineering",
    description: "Time constant and settling time of a resistor-capacitor circuit.",
    keywords: ["rc", "time constant", "tau", "charge", "discharge", "filter"],
    icon: "Timer", popularity: 50,
    fields: [
      { key: "res", label: "Resistance", def: 1000, min: 0, unit: "Ω" },
      { key: "cap", label: "Capacitance", def: 0.001, min: 0, step: 0.0000001, unit: "F" },
    ],
    formula: "τ = R · C",
    compute: (v) => {
      const r = needPos(v.res, "Resistance");
      const c = needPos(v.cap, "Capacitance");
      const tau = r * c;
      return [P("Time constant τ", unit(tau, "s")), R("Fully charged (5τ)", unit(5 * tau, "s")), R("Cutoff frequency", unit(1 / (TAU * tau), "Hz"))];
    },
    examples: [{ label: "1 kΩ × 1 mF", inputs: { res: 1000, cap: 0.001 }, expect: "1" }],
  },
  {
    id: "led-resistor", name: "LED Resistor Calculator", category: "engineering",
    description: "Series resistor needed to drive an LED safely from a supply voltage.",
    keywords: ["led", "resistor", "current limiting", "series resistor", "circuit"],
    icon: "Lightbulb", featured: true, popularity: 68,
    fields: [
      { key: "supply", label: "Supply voltage", def: 9, min: 0, unit: "V" },
      { key: "vled", label: "LED forward voltage", def: 2, min: 0, unit: "V" },
      { key: "current", label: "LED current", def: 20, min: 0.1, unit: "mA" },
    ],
    formula: "R = (Vsupply − Vled) / I",
    compute: (v) => {
      const supply = needPos(v.supply, "Supply voltage");
      const vled = needNonNeg(v.vled, "LED voltage");
      const i = needPos(v.current, "Current") / 1000;
      if (vled >= supply) return [R("Not possible", "—", "Supply must exceed the LED forward voltage")];
      const r = (supply - vled) / i;
      const power = (supply - vled) * i;
      return [P("Resistor", unit(r, "Ω")), R("Resistor power", unit(power * 1000, "mW")), M("Voltage across resistor", unit(supply - vled, "V"))];
    },
    examples: [{ label: "9 V supply, 2 V LED, 20 mA", inputs: { supply: 9, vled: 2, current: 20 }, expect: "350" }],
  },
  {
    id: "three-phase-power", name: "Three-Phase Power Calculator", category: "engineering",
    description: "Real power of a balanced three-phase load from line values.",
    keywords: ["three phase", "3 phase", "power", "kw", "power factor", "motor"],
    icon: "Zap", popularity: 44,
    fields: [
      { key: "voltage", label: "Line voltage", def: 400, min: 0, unit: "V" },
      { key: "current", label: "Line current", def: 10, min: 0, unit: "A" },
      { key: "pf", label: "Power factor", def: 0.8, min: 0, max: 1, step: 0.01 },
    ],
    formula: "P = √3 · V_L · I_L · pf",
    compute: (v) => {
      const volt = needPos(v.voltage, "Line voltage");
      const amp = needPos(v.current, "Line current");
      const pf = needPos(v.pf, "Power factor");
      const watt = Math.sqrt(3) * volt * amp * pf;
      return [P("Real power", unit(watt / 1000, "kW")), R("In watts", unit(watt, "W")), R("Apparent power", unit((Math.sqrt(3) * volt * amp) / 1000, "kVA"))];
    },
    examples: [{ label: "400 V, 10 A, pf 0.8", inputs: { voltage: 400, current: 10, pf: 0.8 }, expect: "5.54" }],
  },
  {
    id: "inductive-reactance", name: "Inductive Reactance Calculator", category: "engineering",
    description: "Reactance of an inductor at a given frequency.",
    keywords: ["inductive reactance", "inductor", "xl", "impedance", "ac"],
    icon: "Activity", popularity: 40,
    fields: [
      { key: "freq", label: "Frequency", def: 60, min: 0, unit: "Hz" },
      { key: "ind", label: "Inductance", def: 0.1, min: 0, step: 0.001, unit: "H" },
    ],
    formula: "X_L = 2π · f · L",
    compute: (v) => {
      const f = needPos(v.freq, "Frequency");
      const l = needPos(v.ind, "Inductance");
      return [P("Inductive reactance", unit(TAU * f * l, "Ω"))];
    },
    examples: [{ label: "60 Hz, 0.1 H", inputs: { freq: 60, ind: 0.1 }, expect: "37.69" }],
  },
  {
    id: "capacitive-reactance", name: "Capacitive Reactance Calculator", category: "engineering",
    description: "Reactance of a capacitor at a given frequency.",
    keywords: ["capacitive reactance", "capacitor", "xc", "impedance", "ac"],
    icon: "Activity", popularity: 40,
    fields: [
      { key: "freq", label: "Frequency", def: 60, min: 0, unit: "Hz" },
      { key: "cap", label: "Capacitance", def: 0.0001, min: 0, step: 0.0000001, unit: "F" },
    ],
    formula: "X_C = 1 / (2π · f · C)",
    compute: (v) => {
      const f = needPos(v.freq, "Frequency");
      const c = needPos(v.cap, "Capacitance");
      return [P("Capacitive reactance", unit(1 / (TAU * f * c), "Ω"))];
    },
    examples: [{ label: "60 Hz, 100 µF", inputs: { freq: 60, cap: 0.0001 }, expect: "26.52" }],
  },
  {
    id: "lc-resonant-frequency", name: "LC Resonant Frequency Calculator", category: "engineering",
    description: "Resonant frequency of an inductor-capacitor tank circuit.",
    keywords: ["resonant frequency", "lc circuit", "tank", "tuning", "oscillator"],
    icon: "Activity", popularity: 42,
    fields: [
      { key: "ind", label: "Inductance", def: 0.001, min: 0, step: 0.0001, unit: "H" },
      { key: "cap", label: "Capacitance", def: 0.000001, min: 0, step: 0.0000001, unit: "F" },
    ],
    formula: "f = 1 / (2π · √(L · C))",
    compute: (v) => {
      const l = needPos(v.ind, "Inductance");
      const c = needPos(v.cap, "Capacitance");
      const f = 1 / (TAU * Math.sqrt(l * c));
      return [P("Resonant frequency", unit(f, "Hz")), R("In kilohertz", unit(f / 1000, "kHz"))];
    },
    examples: [{ label: "1 mH, 1 µF", inputs: { ind: 0.001, cap: 0.000001 }, expect: "5,032" }],
  },
  {
    id: "power-dissipation", name: "Power Dissipation Calculator", category: "engineering",
    description: "Heat dissipated in a resistor from the current through it.",
    keywords: ["power dissipation", "i2r", "heat", "resistor", "watts"],
    icon: "Flame", popularity: 46,
    fields: [
      { key: "current", label: "Current", def: 3, min: 0, unit: "A" },
      { key: "res", label: "Resistance", def: 4, min: 0, unit: "Ω" },
    ],
    formula: "P = I² · R",
    compute: (v) => {
      const i = needPos(v.current, "Current");
      const r = needPos(v.res, "Resistance");
      const watt = i * i * r;
      return [P("Power dissipated", unit(watt, "W")), R("Voltage drop", unit(i * r, "V"))];
    },
    examples: [{ label: "3 A through 4 Ω", inputs: { current: 3, res: 4 }, expect: "36" }],
  },
  {
    id: "motor-power-torque", name: "Motor Power & Torque Calculator", category: "engineering",
    description: "Shaft power from torque and rotational speed.",
    keywords: ["motor", "torque", "power", "rpm", "shaft", "mechanical"],
    icon: "Cog", popularity: 54,
    fields: [
      { key: "torque", label: "Torque", def: 50, min: 0, unit: "N·m" },
      { key: "rpm", label: "Speed", def: 3000, min: 0, unit: "rpm" },
    ],
    formula: "P = T · 2π · N / 60",
    compute: (v) => {
      const t = needPos(v.torque, "Torque");
      const rpm = needPos(v.rpm, "Speed");
      const watt = (t * TAU * rpm) / 60;
      return [P("Power", unit(watt / 1000, "kW")), R("In watts", unit(watt, "W")), R("Horsepower", unit(watt / 745.699872, "hp"))];
    },
    examples: [{ label: "50 N·m at 3000 rpm", inputs: { torque: 50, rpm: 3000 }, expect: "15.7" }],
  },
  {
    id: "gear-ratio", name: "Gear Ratio Calculator", category: "engineering",
    description: "Gear ratio and output speed from the teeth on two gears.",
    keywords: ["gear ratio", "teeth", "rpm", "transmission", "mechanical advantage"],
    icon: "Cog", popularity: 52,
    fields: [
      { key: "driver", label: "Driver gear teeth", def: 12, min: 1, step: 1 },
      { key: "driven", label: "Driven gear teeth", def: 36, min: 1, step: 1 },
      { key: "speed", label: "Input speed", def: 3000, min: 0, unit: "rpm" },
    ],
    formula: "Ratio = driven / driver",
    compute: (v) => {
      const driver = needPos(v.driver, "Driver teeth");
      const driven = needPos(v.driven, "Driven teeth");
      const speed = needNonNeg(v.speed, "Input speed");
      const ratio = driven / driver;
      return [
        P("Gear ratio", `${fmt(ratio, 2)} : 1`),
        R("Output speed", unit(speed / ratio, "rpm")),
        R("Torque multiplier", `${fmt(ratio, 2)}×`),
      ];
    },
    examples: [{ label: "12 → 36 teeth", inputs: { driver: 12, driven: 36, speed: 3000 }, expect: "3" }],
  },
  {
    id: "belt-length", name: "Belt Length Calculator", category: "engineering",
    description: "Length of a belt around two pulleys of given diameters.",
    keywords: ["belt length", "pulley", "drive belt", "sheave", "mechanical"],
    icon: "Repeat", popularity: 38,
    fields: [
      { key: "d1", label: "Pulley 1 diameter", def: 100, min: 0, unit: "mm" },
      { key: "d2", label: "Pulley 2 diameter", def: 200, min: 0, unit: "mm" },
      { key: "center", label: "Centre distance", def: 500, min: 1, unit: "mm" },
    ],
    formula: "L = 2C + π(D1+D2)/2 + (D2−D1)² / (4C)",
    compute: (v) => {
      const d1 = needNonNeg(v.d1, "Pulley 1");
      const d2 = needNonNeg(v.d2, "Pulley 2");
      const c = needPos(v.center, "Centre distance");
      const l = 2 * c + (Math.PI * (d1 + d2)) / 2 + Math.pow(d2 - d1, 2) / (4 * c);
      return [P("Belt length", unit(l, "mm")), R("In metres", unit(l / 1000, "m"))];
    },
    examples: [{ label: "100 & 200 mm, 500 mm apart", inputs: { d1: 100, d2: 200, center: 500 }, expect: "1,476" }],
  },
  {
    id: "hydraulic-force", name: "Hydraulic Cylinder Force", category: "engineering",
    description: "Force produced by a hydraulic cylinder from pressure and bore area.",
    keywords: ["hydraulic", "force", "cylinder", "pressure", "pascal", "bore"],
    icon: "Gauge", popularity: 40,
    fields: [
      { key: "pressure", label: "Pressure", def: 100, min: 0, unit: "bar" },
      { key: "area", label: "Piston area", def: 10, min: 0, unit: "cm²" },
    ],
    formula: "F = P · A",
    compute: (v) => {
      const pBar = needPos(v.pressure, "Pressure");
      const areaCm2 = needPos(v.area, "Piston area");
      const force = pBar * 1e5 * (areaCm2 * 1e-4);
      return [P("Force", unit(force, "N")), R("In kilonewtons", unit(force / 1000, "kN")), R("Equivalent mass", unit(force / 9.80665, "kgf"))];
    },
    examples: [{ label: "100 bar on 10 cm²", inputs: { pressure: 100, area: 10 }, expect: "10,000" }],
  },
];
