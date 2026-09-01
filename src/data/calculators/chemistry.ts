/**
 * METER · Chemistry (14 tools)
 *
 * Stoichiometry, solutions and gas-law calculators. The molar-mass tool parses
 * a chemical formula (with nested parentheses) against a table of common
 * atomic weights. Gas laws use R = 0.082057 L·atm·mol⁻¹·K⁻¹.
 */

import { fail, needPos, needNonNeg, out, P, R, M, fmt, unit, pct, sci } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

const R_GAS = 0.082057; // L·atm / (mol·K)
const AVOGADRO = 6.02214076e23;

const ATOMIC: Record<string, number> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
  Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996,
  Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.63,
  As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Ag: 107.87, Cd: 112.41, Sn: 118.71, Sb: 121.76, I: 126.9, Xe: 131.29, Cs: 132.91, Ba: 137.33,
  Pt: 195.08, Au: 196.97, Hg: 200.59, Pb: 207.2, Bi: 208.98, U: 238.03,
};

function molarMass(raw: string): number {
  const formula = raw.replace(/\s+/g, "");
  if (!formula) fail("Enter a chemical formula, e.g. H2O");
  let i = 0;
  const readNum = () => {
    let n = "";
    while (i < formula.length && /[0-9]/.test(formula[i])) n += formula[i++];
    return n === "" ? 1 : parseInt(n, 10);
  };
  const group = (): number => {
    let total = 0;
    while (i < formula.length) {
      const ch = formula[i];
      if (ch === "(" || ch === "[") { i++; total += group() * readNum(); }
      else if (ch === ")" || ch === "]") { i++; return total; }
      else if (/[A-Z]/.test(ch)) {
        let sym = formula[i++];
        while (i < formula.length && /[a-z]/.test(formula[i])) sym += formula[i++];
        const m = ATOMIC[sym];
        if (m === undefined) fail(`Unknown element "${sym}"`);
        total += m * readNum();
      } else fail(`Unexpected character "${ch}"`);
    }
    return total;
  };
  const total = group();
  if (total <= 0) fail("Could not parse that formula");
  return total;
}

export const CALCULATORS: CalcSpec[] = [
  {
    id: "molar-mass", name: "Molar Mass Calculator", category: "chemistry",
    description: "Molecular weight of a compound from its chemical formula.",
    keywords: ["molar mass", "molecular weight", "formula", "grams per mole", "stoichiometry"],
    icon: "FlaskConical", featured: true, popularity: 82,
    fields: [{ key: "formula", label: "Chemical formula", kind: "text", def: "H2O", placeholder: "e.g. C6H12O6, Ca(OH)2" }],
    formula: "Sum of atomic masses × subscripts",
    how: "Each element symbol is looked up in a table of standard atomic weights, multiplied by its subscript, with parenthesised groups multiplied by their trailing number.",
    compute: (v) => {
      const mm = molarMass(String(v.formula ?? ""));
      return out([P("Molar mass", unit(mm, "g/mol")), R("Mass of 1 mole", unit(mm, "g"))], {
        note: `1 mole of ${String(v.formula).trim()} weighs ${fmt(mm, 3)} grams.`,
      });
    },
    examples: [
      { label: "Water (H2O)", inputs: { formula: "H2O" }, expect: "18.01" },
      { label: "Glucose (C6H12O6)", inputs: { formula: "C6H12O6" }, expect: "180" },
    ],
  },
  {
    id: "moles-to-grams", name: "Moles to Grams Converter", category: "chemistry",
    description: "Convert an amount in moles to a mass in grams using molar mass.",
    keywords: ["moles", "grams", "mass", "molar mass", "amount", "convert"],
    icon: "Beaker", popularity: 64,
    fields: [
      { key: "moles", label: "Amount", def: 2, min: 0, step: 0.01, unit: "mol" },
      { key: "molarMass", label: "Molar mass", def: 18, min: 0, step: 0.001, unit: "g/mol" },
    ],
    formula: "mass = moles × molar mass",
    compute: (v) => {
      const mol = needNonNeg(v.moles, "Amount");
      const mm = needPos(v.molarMass, "Molar mass");
      return [P("Mass", unit(mol * mm, "g")), R("Number of particles", sci(mol * AVOGADRO))];
    },
    examples: [{ label: "2 mol at 18 g/mol", inputs: { moles: 2, molarMass: 18 }, expect: "36" }],
  },
  {
    id: "molarity", name: "Molarity Calculator", category: "chemistry",
    description: "Molar concentration of a solution from moles of solute and volume.",
    keywords: ["molarity", "concentration", "moles", "litres", "solution", "mol/l"],
    icon: "FlaskRound", popularity: 66,
    fields: [
      { key: "moles", label: "Moles of solute", def: 0.5, min: 0, step: 0.01, unit: "mol" },
      { key: "liters", label: "Solution volume", def: 2, min: 0, step: 0.01, unit: "L" },
    ],
    formula: "M = moles / litres",
    compute: (v) => {
      const mol = needNonNeg(v.moles, "Moles");
      const l = needPos(v.liters, "Volume");
      return [P("Molarity", unit(mol / l, "mol/L"))];
    },
    examples: [{ label: "0.5 mol in 2 L", inputs: { moles: 0.5, liters: 2 }, expect: "0.25" }],
  },
  {
    id: "solution-dilution", name: "Solution Dilution Calculator", category: "chemistry",
    description: "Stock volume needed to prepare a diluted solution (C₁V₁ = C₂V₂).",
    keywords: ["dilution", "concentration", "stock", "c1v1", "molarity", "solution"],
    icon: "FlaskRound", popularity: 58,
    fields: [
      { key: "c1", label: "Stock concentration", def: 10, min: 0, step: 0.01, unit: "M" },
      { key: "c2", label: "Desired concentration", def: 2, min: 0, step: 0.01, unit: "M" },
      { key: "v2", label: "Final volume", def: 100, min: 0, unit: "mL" },
    ],
    formula: "V₁ = C₂ · V₂ / C₁",
    compute: (v) => {
      const c1 = needPos(v.c1, "Stock concentration");
      const c2 = needNonNeg(v.c2, "Desired concentration");
      const v2 = needPos(v.v2, "Final volume");
      if (c2 > c1) return [R("Not possible", "—", "Desired concentration exceeds the stock")];
      const v1 = (c2 * v2) / c1;
      return [P("Stock volume needed", unit(v1, "mL")), R("Solvent to add", unit(v2 - v1, "mL"))];
    },
    examples: [{ label: "10 M → 2 M in 100 mL", inputs: { c1: 10, c2: 2, v2: 100 }, expect: "20" }],
  },
  {
    id: "ideal-gas-law", name: "Ideal Gas Law Calculator", category: "chemistry",
    description: "Solve PV = nRT for pressure, volume, moles or temperature.",
    keywords: ["ideal gas", "pv=nrt", "pressure", "volume", "moles", "temperature"],
    icon: "FlaskConical", featured: true, popularity: 68,
    fields: [
      {
        key: "solve", label: "Solve for", kind: "select", def: "n",
        options: [
          { value: "P", label: "Pressure (P)" }, { value: "V", label: "Volume (V)" },
          { value: "n", label: "Moles (n)" }, { value: "T", label: "Temperature (T)" },
        ],
      },
      { key: "P", label: "Pressure", def: 1, min: 0, step: 0.01, unit: "atm", showIf: { key: "solve", in: ["V", "n", "T"] } },
      { key: "V", label: "Volume", def: 22.414, min: 0, step: 0.01, unit: "L", showIf: { key: "solve", in: ["P", "n", "T"] } },
      { key: "n", label: "Moles", def: 1, min: 0, step: 0.01, unit: "mol", showIf: { key: "solve", in: ["P", "V", "T"] } },
      { key: "T", label: "Temperature", def: 273.15, min: 0, step: 0.01, unit: "K", showIf: { key: "solve", in: ["P", "V", "n"] } },
    ],
    formula: "P · V = n · R · T",
    compute: (v) => {
      const solve = String(v.solve);
      if (solve === "P") { const r = (needPos(v.n, "Moles") * R_GAS * needPos(v.T, "Temperature")) / needPos(v.V, "Volume"); return [P("Pressure", unit(r, "atm"))]; }
      if (solve === "V") { const r = (needPos(v.n, "Moles") * R_GAS * needPos(v.T, "Temperature")) / needPos(v.P, "Pressure"); return [P("Volume", unit(r, "L"))]; }
      if (solve === "T") { const r = (needPos(v.P, "Pressure") * needPos(v.V, "Volume")) / (needPos(v.n, "Moles") * R_GAS); return [P("Temperature", unit(r, "K"))]; }
      const r = (needPos(v.P, "Pressure") * needPos(v.V, "Volume")) / (R_GAS * needPos(v.T, "Temperature"));
      return [P("Moles", unit(r, "mol"))];
    },
    examples: [{ label: "1 atm, 22.414 L at 273.15 K", inputs: { solve: "n", P: 1, V: 22.414, T: 273.15 }, expect: "1" }],
  },
  {
    id: "ph-calculator", name: "pH Calculator", category: "chemistry",
    description: "pH, pOH and hydroxide concentration from hydrogen-ion concentration.",
    keywords: ["ph", "poh", "acid", "base", "hydrogen ion", "concentration"],
    icon: "TestTube", popularity: 72,
    fields: [{ key: "h", label: "[H⁺] concentration", def: 1e-7, min: 0, step: 1e-9, unit: "mol/L" }],
    formula: "pH = −log₁₀[H⁺]",
    compute: (v) => {
      const h = needPos(v.h, "[H⁺]");
      const ph = -Math.log10(h);
      const poh = 14 - ph;
      const label = ph < 7 ? "Acidic" : ph > 7 ? "Basic" : "Neutral";
      return [
        P("pH", fmt(ph, 2), label),
        R("pOH", fmt(poh, 2)),
        R("[OH⁻]", sci(Math.pow(10, -poh)) + " mol/L"),
      ];
    },
    examples: [{ label: "[H⁺] = 1×10⁻³", inputs: { h: 0.001 }, expect: "3" }],
  },
  {
    id: "percent-yield", name: "Percent Yield Calculator", category: "chemistry",
    description: "Reaction efficiency: actual yield as a percentage of theoretical.",
    keywords: ["percent yield", "actual", "theoretical", "reaction", "efficiency"],
    icon: "Beaker", popularity: 60,
    fields: [
      { key: "actual", label: "Actual yield", def: 8, min: 0, step: 0.01, unit: "g" },
      { key: "theoretical", label: "Theoretical yield", def: 10, min: 0, step: 0.01, unit: "g" },
    ],
    formula: "% yield = actual / theoretical × 100",
    compute: (v) => {
      const a = needNonNeg(v.actual, "Actual yield");
      const t = needPos(v.theoretical, "Theoretical yield");
      return [P("Percent yield", pct((a / t) * 100)), M("Actual / theoretical", `${fmt(a)} / ${fmt(t)} g`)];
    },
    examples: [{ label: "8 g of 10 g possible", inputs: { actual: 8, theoretical: 10 }, expect: "80" }],
  },
  {
    id: "mass-percent-concentration", name: "Mass Percent Calculator", category: "chemistry",
    description: "Concentration of a solution by mass percentage.",
    keywords: ["mass percent", "concentration", "solute", "solvent", "weight percent"],
    icon: "FlaskRound", popularity: 50,
    fields: [
      { key: "solute", label: "Mass of solute", def: 10, min: 0, unit: "g" },
      { key: "solvent", label: "Mass of solvent", def: 90, min: 0, unit: "g" },
    ],
    formula: "% = solute / (solute + solvent) × 100",
    compute: (v) => {
      const solute = needNonNeg(v.solute, "Solute");
      const solvent = needNonNeg(v.solvent, "Solvent");
      const total = solute + solvent;
      if (total <= 0) return [R("Undefined", "—", "Total mass is zero")];
      return [P("Mass percent", pct((solute / total) * 100)), M("Total solution mass", unit(total, "g"))];
    },
    examples: [{ label: "10 g in 90 g solvent", inputs: { solute: 10, solvent: 90 }, expect: "10" }],
  },
  {
    id: "ppm-concentration", name: "PPM Concentration Calculator", category: "chemistry",
    description: "Parts-per-million concentration from solute and solution mass.",
    keywords: ["ppm", "parts per million", "concentration", "trace", "dilute"],
    icon: "Droplet", popularity: 46,
    fields: [
      { key: "solute", label: "Mass of solute", def: 2, min: 0, step: 0.001, unit: "g" },
      { key: "solution", label: "Mass of solution", def: 1000, min: 0, unit: "g" },
    ],
    formula: "ppm = solute / solution × 10⁶",
    compute: (v) => {
      const solute = needNonNeg(v.solute, "Solute");
      const solution = needPos(v.solution, "Solution");
      const ppm = (solute / solution) * 1e6;
      return [P("Concentration", unit(ppm, "ppm")), R("In ppb", unit(ppm * 1000, "ppb")), R("As percent", pct(ppm / 1e4))];
    },
    examples: [{ label: "2 g in 1000 g", inputs: { solute: 2, solution: 1000 }, expect: "2,000" }],
  },
  {
    id: "half-life", name: "Half-Life Calculator", category: "chemistry",
    description: "Remaining quantity of a substance after radioactive decay.",
    keywords: ["half life", "decay", "radioactive", "isotope", "exponential"],
    icon: "Radiation", popularity: 56,
    fields: [
      { key: "initial", label: "Initial quantity", def: 100, min: 0, unit: "g" },
      { key: "halfLife", label: "Half-life", def: 5, min: 0, step: 0.01, unit: "yr" },
      { key: "time", label: "Elapsed time", def: 15, min: 0, step: 0.01, unit: "yr" },
    ],
    formula: "N = N₀ · (½)^(t / t½)",
    compute: (v) => {
      const n0 = needPos(v.initial, "Initial quantity");
      const hl = needPos(v.halfLife, "Half-life");
      const t = needNonNeg(v.time, "Elapsed time");
      const halves = t / hl;
      const remaining = n0 * Math.pow(0.5, halves);
      return [
        P("Remaining", unit(remaining, "g")),
        R("Decayed", unit(n0 - remaining, "g")),
        R("Half-lives elapsed", fmt(halves, 2)),
      ];
    },
    examples: [{ label: "100 g, 5 yr half-life, 15 yr", inputs: { initial: 100, halfLife: 5, time: 15 }, expect: "12.5" }],
  },
  {
    id: "boyles-law", name: "Boyle's Law Calculator", category: "chemistry",
    description: "Final gas volume at constant temperature (P₁V₁ = P₂V₂).",
    keywords: ["boyles law", "pressure", "volume", "gas", "isothermal"],
    icon: "FlaskConical", popularity: 48,
    fields: [
      { key: "p1", label: "Initial pressure", def: 1, min: 0, step: 0.01, unit: "atm" },
      { key: "v1", label: "Initial volume", def: 10, min: 0, unit: "L" },
      { key: "p2", label: "Final pressure", def: 2, min: 0, step: 0.01, unit: "atm" },
    ],
    formula: "V₂ = P₁ · V₁ / P₂",
    compute: (v) => {
      const p1 = needPos(v.p1, "Initial pressure");
      const v1 = needPos(v.v1, "Initial volume");
      const p2 = needPos(v.p2, "Final pressure");
      return [P("Final volume", unit((p1 * v1) / p2, "L"))];
    },
    examples: [{ label: "1 atm, 10 L → 2 atm", inputs: { p1: 1, v1: 10, p2: 2 }, expect: "5" }],
  },
  {
    id: "charles-law", name: "Charles's Law Calculator", category: "chemistry",
    description: "Final gas volume at constant pressure (V₁/T₁ = V₂/T₂).",
    keywords: ["charles law", "volume", "temperature", "gas", "isobaric"],
    icon: "FlaskConical", popularity: 46,
    fields: [
      { key: "v1", label: "Initial volume", def: 10, min: 0, unit: "L" },
      { key: "t1", label: "Initial temperature", def: 300, min: 0.01, unit: "K" },
      { key: "t2", label: "Final temperature", def: 600, min: 0.01, unit: "K" },
    ],
    formula: "V₂ = V₁ · T₂ / T₁",
    compute: (v) => {
      const v1 = needPos(v.v1, "Initial volume");
      const t1 = needPos(v.t1, "Initial temperature");
      const t2 = needPos(v.t2, "Final temperature");
      return [P("Final volume", unit((v1 * t2) / t1, "L"))];
    },
    examples: [{ label: "10 L, 300 K → 600 K", inputs: { v1: 10, t1: 300, t2: 600 }, expect: "20" }],
  },
  {
    id: "combined-gas-law", name: "Combined Gas Law Calculator", category: "chemistry",
    description: "Final volume when pressure and temperature both change.",
    keywords: ["combined gas law", "pressure", "volume", "temperature", "gas"],
    icon: "FlaskConical", popularity: 44,
    fields: [
      { key: "p1", label: "Initial pressure", def: 1, min: 0, step: 0.01, unit: "atm" },
      { key: "v1", label: "Initial volume", def: 10, min: 0, unit: "L" },
      { key: "t1", label: "Initial temperature", def: 300, min: 0.01, unit: "K" },
      { key: "p2", label: "Final pressure", def: 2, min: 0, step: 0.01, unit: "atm" },
      { key: "t2", label: "Final temperature", def: 600, min: 0.01, unit: "K" },
    ],
    formula: "V₂ = P₁·V₁·T₂ / (T₁·P₂)",
    compute: (v) => {
      const p1 = needPos(v.p1, "Initial pressure");
      const v1 = needPos(v.v1, "Initial volume");
      const t1 = needPos(v.t1, "Initial temperature");
      const p2 = needPos(v.p2, "Final pressure");
      const t2 = needPos(v.t2, "Final temperature");
      return [P("Final volume", unit((p1 * v1 * t2) / (t1 * p2), "L"))];
    },
    examples: [{ label: "Doubled P and T", inputs: { p1: 1, v1: 10, t1: 300, p2: 2, t2: 600 }, expect: "10" }],
  },
  {
    id: "gay-lussacs-law", name: "Gay-Lussac's Law Calculator", category: "chemistry",
    description: "Final gas pressure at constant volume (P₁/T₁ = P₂/T₂).",
    keywords: ["gay lussac law", "pressure", "temperature", "gas", "isochoric", "constant volume"],
    icon: "FlaskConical", popularity: 42,
    fields: [
      { key: "p1", label: "Initial pressure", def: 1, min: 0, step: 0.01, unit: "atm" },
      { key: "t1", label: "Initial temperature", def: 300, min: 0.01, unit: "K" },
      { key: "t2", label: "Final temperature", def: 450, min: 0.01, unit: "K" },
    ],
    formula: "P₂ = P₁ · T₂ / T₁",
    compute: (v) => {
      const p1 = needPos(v.p1, "Initial pressure");
      const t1 = needPos(v.t1, "Initial temperature");
      const t2 = needPos(v.t2, "Final temperature");
      return [P("Final pressure", unit((p1 * t2) / t1, "atm"))];
    },
    examples: [{ label: "1 atm, 300 K → 450 K", inputs: { p1: 1, t1: 300, t2: 450 }, expect: "1.5" }],
  },
];
