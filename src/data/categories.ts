/**
 * METER · category registry
 * 20 professional categories. Order here is the order used across the product.
 */

import type { Category, CategoryId } from "../lib/calc/types";

export const CATEGORIES: Category[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    description:
      "Arithmetic, algebra, number theory and sequences — from a quick percentage to matrix inverses and equation solving.",
    tagline: "Pure numbers, solved cleanly.",
    icon: "Sigma",
    accent: "blue",
  },
  {
    id: "finance",
    name: "Finance",
    description:
      "Loans, mortgages, interest, investing, tax and payroll. Every schedule and rate computed with full precision.",
    tagline: "Every rate, term and payment.",
    icon: "Landmark",
    accent: "emerald",
  },
  {
    id: "unit-conversion",
    name: "Unit Conversion",
    description:
      "Length, mass, volume, temperature, data, pressure and more — each converter shows the full unit table, not just one answer.",
    tagline: "Any unit into any other.",
    icon: "Ruler",
    accent: "cyan",
  },
  {
    id: "engineering",
    name: "Engineering",
    description:
      "Electrical, mechanical and fluid engineering essentials: circuits, beams, gears, torque, pumps and tolerances.",
    tagline: "Specs, loads and margins.",
    icon: "Cog",
    accent: "indigo",
  },
  {
    id: "physics",
    name: "Physics",
    description:
      "Kinematics, dynamics, energy, waves, optics, thermodynamics and electromagnetism with SI-correct results.",
    tagline: "Motion, force, energy, light.",
    icon: "Atom",
    accent: "violet",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description:
      "Moles, molarity, dilution, pH, gas laws and stoichiometry — including a real periodic-table molar mass parser.",
    tagline: "Moles, mixtures and reactions.",
    icon: "FlaskConical",
    accent: "teal",
  },
  {
    id: "construction",
    name: "Construction",
    description:
      "Material take-offs and site maths: concrete, mortar, bricks, tiles, paint, decking, roofing, stairs and excavation.",
    tagline: "Quantities, before you order.",
    icon: "HardHat",
    accent: "amber",
  },
  {
    id: "health",
    name: "Health",
    description:
      "Body composition, energy needs, hydration, cardiovascular and clinical indices using published, citable formulas.",
    tagline: "Body metrics that make sense.",
    icon: "HeartPulse",
    accent: "rose",
  },
  {
    id: "statistics",
    name: "Statistics",
    description:
      "Descriptive statistics, distributions, confidence intervals, hypothesis tests, regression and sample sizing.",
    tagline: "From raw data to inference.",
    icon: "BarChart3",
    accent: "indigo",
  },
  {
    id: "biology",
    name: "Biology",
    description:
      "Genetics, populations, cell growth, molecular biology and lab arithmetic for the bench.",
    tagline: "Cells, genes and populations.",
    icon: "Dna",
    accent: "teal",
  },
  {
    id: "food-nutrition",
    name: "Food & Nutrition",
    description:
      "Macros, recipe scaling, baker's percentages, caffeine, alcohol units and kitchen conversions.",
    tagline: "Kitchen and macro precision.",
    icon: "Apple",
    accent: "amber",
  },
  {
    id: "everyday-life",
    name: "Everyday Life",
    description:
      "Tips, fuel, splitting bills, travel, shopping and the small decisions that deserve a straight answer.",
    tagline: "Small maths, everyday wins.",
    icon: "Lightbulb",
    accent: "blue",
  },
  {
    id: "time-date",
    name: "Time & Date",
    description:
      "Date differences, deadlines, business days, age, time zones, timesheets and countdowns.",
    tagline: "Dates, spans and deadlines.",
    icon: "CalendarClock",
    accent: "cyan",
  },
  {
    id: "digital-technology",
    name: "Digital & Technology",
    description:
      "Bandwidth, storage, subnets, hashes, encoding, screen maths and developer utilities.",
    tagline: "Bits, bytes and bandwidth.",
    icon: "Cpu",
    accent: "violet",
  },
  {
    id: "energy-environment",
    name: "Energy & Environment",
    description:
      "Electricity costs, solar sizing, battery capacity, heat loss, emissions and efficiency.",
    tagline: "Watts, costs and carbon.",
    icon: "Leaf",
    accent: "emerald",
  },
  {
    id: "sports",
    name: "Sports",
    description:
      "Pace, splits, VO₂ max, one-rep max, cycling power, swimming and scoring maths for athletes.",
    tagline: "Pace, power and performance.",
    icon: "Dumbbell",
    accent: "rose",
  },
  {
    id: "education",
    name: "Education",
    description:
      "Grades, GPA, weighted marks, curves, reading level and study planning.",
    tagline: "Marks, grades and planning.",
    icon: "GraduationCap",
    accent: "indigo",
  },
  {
    id: "business",
    name: "Business",
    description:
      "Pricing, margins, break-even, CAC, LTV, churn, runway and operational KPIs.",
    tagline: "Unit economics that hold up.",
    icon: "Briefcase",
    accent: "blue",
  },
  {
    id: "geometry",
    name: "Geometry",
    description:
      "Areas, perimeters, volumes, surfaces, triangles, circles and coordinate geometry in 2D and 3D.",
    tagline: "Shapes, exactly measured.",
    icon: "Shapes",
    accent: "cyan",
  },
  {
    id: "other-tools",
    name: "Other Tools",
    description:
      "Handy utilities that defy categories — generators, checkers and text instruments.",
    tagline: "The useful odds and ends.",
    icon: "Wrench",
    accent: "teal",
  },
];

export const CATEGORY_BY_ID: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function categoryName(id: CategoryId): string {
  return CATEGORY_BY_ID[id]?.name ?? id;
}
