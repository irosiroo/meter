/**
 * METER · Biology (10 tools)
 *
 * Genetics, population and cell-biology calculators. Growth models use the
 * continuous form N = N₀·eʳᵗ; the Punnett and allele tools parse simple
 * one-locus genotypes written with upper/lower-case alleles.
 */

import { fail, need, needPos, needNonNeg, out, P, R, M, fmt, pct, unit } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

export const CALCULATORS: CalcSpec[] = [
  {
    id: "hardy-weinberg", name: "Hardy-Weinberg Calculator", category: "biology",
    description: "Allele and genotype frequencies from the recessive phenotype.",
    keywords: ["hardy weinberg", "allele frequency", "genotype", "population genetics", "equilibrium"],
    icon: "Dna", featured: true, popularity: 66,
    fields: [{ key: "q2", label: "Recessive phenotype frequency (q²)", def: 0.16, min: 0, max: 1, step: 0.01 }],
    formula: "p² + 2pq + q² = 1,  p + q = 1",
    compute: (v) => {
      const q2 = needNonNeg(v.q2, "q²");
      if (q2 > 1) fail("Frequency cannot exceed 1.");
      const q = Math.sqrt(q2);
      const p = 1 - q;
      return [
        P("Carrier frequency (2pq)", pct(2 * p * q * 100)),
        R("Dominant allele (p)", fmt(p)),
        R("Recessive allele (q)", fmt(q)),
        R("Homozygous dominant (p²)", pct(p * p * 100)),
        R("Homozygous recessive (q²)", pct(q2 * 100)),
      ];
    },
    examples: [{ label: "q² = 0.16", inputs: { q2: 0.16 }, expect: "48" }],
  },
  {
    id: "population-growth", name: "Population Growth Calculator", category: "biology",
    description: "Exponential population size after a period of continuous growth.",
    keywords: ["population growth", "exponential", "growth rate", "ecology", "compound"],
    icon: "Sprout", featured: true, popularity: 58,
    fields: [
      { key: "n0", label: "Initial population", def: 1000, min: 0 },
      { key: "rate", label: "Growth rate", def: 5, unit: "%/period" },
      { key: "time", label: "Number of periods", def: 10, min: 0 },
    ],
    formula: "N = N₀ · e^(r·t)",
    compute: (v) => {
      const n0 = needNonNeg(v.n0, "Initial population");
      const r = need(v.rate, "Growth rate") / 100;
      const t = needNonNeg(v.time, "Periods");
      const n = n0 * Math.exp(r * t);
      return [P("Final population", fmt(n)), R("Increase", fmt(n - n0)), R("Growth factor", `${fmt(n / (n0 || 1))}×`)];
    },
    examples: [{ label: "1000 at 5% for 10 periods", inputs: { n0: 1000, rate: 5, time: 10 }, expect: "1,648" }],
  },
  {
    id: "bacterial-growth", name: "Bacterial Growth Calculator", category: "biology",
    description: "Cell count after a number of doublings from the doubling time.",
    keywords: ["bacterial growth", "doubling time", "exponential", "cells", "culture", "generation"],
    icon: "Bug", popularity: 52,
    fields: [
      { key: "n0", label: "Initial count", def: 500, min: 0 },
      { key: "doubling", label: "Doubling time", def: 30, min: 0.01, unit: "min" },
      { key: "elapsed", label: "Elapsed time", def: 120, min: 0, unit: "min" },
    ],
    formula: "N = N₀ · 2^(t / t_d)",
    compute: (v) => {
      const n0 = needNonNeg(v.n0, "Initial count");
      const td = needPos(v.doubling, "Doubling time");
      const t = needNonNeg(v.elapsed, "Elapsed time");
      const doublings = t / td;
      return [P("Final count", fmt(n0 * Math.pow(2, doublings))), R("Doublings", fmt(doublings)), M("Generations", `${fmt(doublings)} in ${fmt(t)} min`)];
    },
    examples: [{ label: "500 cells, 30 min doubling, 2 h", inputs: { n0: 500, doubling: 30, elapsed: 120 }, expect: "8,000" }],
  },
  {
    id: "gc-content", name: "GC Content Calculator", category: "biology",
    description: "Percentage of G and C bases in a DNA sequence.",
    keywords: ["gc content", "dna", "sequence", "guanine", "cytosine", "genomics"],
    icon: "Dna", popularity: 54,
    fields: [{ key: "seq", label: "DNA sequence", kind: "textarea", def: "GGCCATGC", wide: true, placeholder: "e.g. ATGCGGCTAA" }],
    formula: "GC% = (G + C) / total bases × 100",
    compute: (v) => {
      const seq = String(v.seq ?? "").toUpperCase().replace(/[^ACGT]/g, "");
      if (!seq) fail("Enter a DNA sequence using A, C, G and T.");
      const gc = (seq.match(/[GC]/g) ?? []).length;
      const at = seq.length - gc;
      return [P("GC content", pct((gc / seq.length) * 100)), R("AT content", pct((at / seq.length) * 100)), M("Length", `${seq.length} bp`)];
    },
    examples: [{ label: "GGCCATGC", inputs: { seq: "GGCCATGC" }, expect: "75" }],
  },
  {
    id: "punnett-square", name: "Punnett Square (Monohybrid)", category: "biology",
    description: "Genotype and phenotype ratios of a single-gene cross.",
    keywords: ["punnett square", "genetics", "cross", "genotype", "phenotype", "mendel"],
    icon: "Grid3x3", featured: true, popularity: 62,
    fields: [
      { key: "p1", label: "Parent 1 genotype", kind: "text", def: "Aa", placeholder: "e.g. Aa" },
      { key: "p2", label: "Parent 2 genotype", kind: "text", def: "Aa", placeholder: "e.g. Aa" },
    ],
    compute: (v) => {
      const parse = (s: unknown, label: string) => {
        const c = String(s ?? "").replace(/\s/g, "");
        if (c.length !== 2 || !/^[A-Za-z]{2}$/.test(c)) fail(`${label} must be two alleles, e.g. "Aa".`);
        return [c[0], c[1]];
      };
      const A = parse(v.p1, "Parent 1");
      const B = parse(v.p2, "Parent 2");
      const tally: Record<string, number> = {};
      let dom = 0;
      for (const a of A) for (const b of B) {
        const g = [a, b].sort().join("");
        tally[g] = (tally[g] ?? 0) + 1;
        if (/[A-Z]/.test(g)) dom++;
      }
      const geno = Object.entries(tally).map(([g, n]) => `${g} ${n}/4`).join(",  ");
      return out(
        [
          P("Dominant phenotype", pct((dom / 4) * 100)),
          R("Recessive phenotype", pct(((4 - dom) / 4) * 100)),
          R("Genotype ratio", geno),
        ],
        { note: "Assumes complete dominance at a single independently-assorting locus." },
      );
    },
    examples: [{ label: "Aa × Aa", inputs: { p1: "Aa", p2: "Aa" }, expect: "75" }],
  },
  {
    id: "microscope-magnification", name: "Microscope Magnification", category: "biology",
    description: "Total magnification from ocular and objective lens powers.",
    keywords: ["microscope", "magnification", "ocular", "objective", "lens", "total"],
    icon: "Microscope", popularity: 48,
    fields: [
      { key: "ocular", label: "Ocular (eyepiece)", def: 10, min: 0, unit: "×" },
      { key: "objective", label: "Objective lens", def: 40, min: 0, unit: "×" },
    ],
    formula: "Total = ocular × objective",
    compute: (v) => {
      const oc = needPos(v.ocular, "Ocular");
      const ob = needPos(v.objective, "Objective");
      return [P("Total magnification", `${fmt(oc * ob)}×`)];
    },
    examples: [{ label: "10× eyepiece, 40× objective", inputs: { ocular: 10, objective: 40 }, expect: "400" }],
  },
  {
    id: "allele-frequency", name: "Allele Frequency Calculator", category: "biology",
    description: "Allele frequencies from observed genotype counts.",
    keywords: ["allele frequency", "genotype", "population", "genetics", "p and q"],
    icon: "Dna", popularity: 46,
    fields: [
      { key: "aa", label: "Homozygous dominant (AA)", def: 30, min: 0, step: 1 },
      { key: "ab", label: "Heterozygous (Aa)", def: 60, min: 0, step: 1 },
      { key: "bb", label: "Homozygous recessive (aa)", def: 10, min: 0, step: 1 },
    ],
    formula: "p = (2·AA + Aa) / (2·total)",
    compute: (v) => {
      const aa = needNonNeg(v.aa, "AA");
      const ab = needNonNeg(v.ab, "Aa");
      const bb = needNonNeg(v.bb, "aa");
      const total = aa + ab + bb;
      if (total <= 0) fail("Enter at least one individual.");
      const p = (2 * aa + ab) / (2 * total);
      return [P("Dominant allele (p)", fmt(p)), R("Recessive allele (q)", fmt(1 - p)), M("Population size", `${total}`)];
    },
    examples: [{ label: "30 AA, 60 Aa, 10 aa", inputs: { aa: 30, ab: 60, bb: 10 }, expect: "0.6" }],
  },
  {
    id: "dna-to-protein", name: "DNA Codon & Protein Length", category: "biology",
    description: "Number of codons and amino acids encoded by a nucleotide count.",
    keywords: ["codon", "protein", "amino acid", "dna", "translation", "reading frame"],
    icon: "Dna", popularity: 44,
    fields: [{ key: "bases", label: "Number of nucleotides", def: 300, min: 0, step: 1 }],
    formula: "codons = ⌊bases / 3⌋",
    compute: (v) => {
      const bases = needNonNeg(v.bases, "Nucleotides");
      const codons = Math.floor(bases / 3);
      return [P("Codons", `${codons}`), R("Amino acids (approx.)", `${Math.max(0, codons)}`), M("Leftover bases", `${bases % 3}`)];
    },
    examples: [{ label: "300 nucleotides", inputs: { bases: 300 }, expect: "100" }],
  },
  {
    id: "cell-doubling-time", name: "Cell Doubling Time", category: "biology",
    description: "Doubling time from initial and final cell counts over a period.",
    keywords: ["doubling time", "cell", "growth rate", "culture", "proliferation"],
    icon: "Bug", popularity: 42,
    fields: [
      { key: "n0", label: "Initial count", def: 1000, min: 1 },
      { key: "n1", label: "Final count", def: 8000, min: 1 },
      { key: "time", label: "Elapsed time", def: 6, min: 0.01, unit: "h" },
    ],
    formula: "t_d = t · ln2 / ln(N/N₀)",
    compute: (v) => {
      const n0 = needPos(v.n0, "Initial count");
      const n1 = needPos(v.n1, "Final count");
      const t = needPos(v.time, "Elapsed time");
      if (n1 <= n0) fail("Final count must exceed the initial count.");
      const doublings = Math.log2(n1 / n0);
      return [P("Doubling time", unit(t / doublings, "h")), R("Number of doublings", fmt(doublings)), M("Fold increase", `${fmt(n1 / n0)}×`)];
    },
    examples: [{ label: "1000 → 8000 in 6 h", inputs: { n0: 1000, n1: 8000, time: 6 }, expect: "2" }],
  },
  {
    id: "surface-area-volume-ratio", name: "Surface-Area-to-Volume Ratio", category: "biology",
    description: "SA:V ratio of a cell modelled as a sphere or cube.",
    keywords: ["surface area", "volume", "ratio", "cell", "sa v", "diffusion"],
    icon: "Box", popularity: 40,
    fields: [
      { key: "shape", label: "Cell shape", kind: "select", def: "sphere", options: [{ value: "sphere", label: "Sphere" }, { value: "cube", label: "Cube" }] },
      { key: "size", label: "Radius / side length", def: 5, min: 0.01, unit: "µm" },
    ],
    compute: (v) => {
      const s = needPos(v.size, "Size");
      let sa: number, vol: number;
      if (String(v.shape) === "cube") { sa = 6 * s * s; vol = s * s * s; }
      else { sa = 4 * Math.PI * s * s; vol = (4 / 3) * Math.PI * s * s * s; }
      return [P("SA : V ratio", fmt(sa / vol)), R("Surface area", unit(sa, "µm²")), R("Volume", unit(vol, "µm³"))];
    },
    examples: [{ label: "Sphere, radius 5 µm", inputs: { shape: "sphere", size: 5 }, expect: "0.6" }],
  },
];
