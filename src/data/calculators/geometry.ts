/**
 * METER · Geometry (22 tools)
 *
 * Plane and solid geometry: areas and perimeters of 2-D shapes, volumes and
 * surface areas of 3-D solids, plus coordinate-geometry helpers (distance,
 * midpoint, slope). Lengths/areas/volumes are shown to 2 dp with generic
 * "units" so the tools are unit-agnostic.
 */

import { need, needPos, fail, out, P, R, M, fmt, unit } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

const A2 = (n: number) => unit(n, "units²", 2);
const A3 = (n: number) => unit(n, "units³", 2);
const L = (n: number) => unit(n, "units", 2);

export const CALCULATORS: CalcSpec[] = [
  {
    id: "circle-area", name: "Circle Area & Circumference", category: "geometry",
    description: "Area, circumference and diameter of a circle from its radius.",
    keywords: ["circle", "area", "circumference", "radius", "diameter", "pi"],
    icon: "Circle", featured: true, popularity: 78,
    fields: [{ key: "r", label: "Radius", def: 5, min: 0, unit: "units" }],
    formula: "A = πr²,  C = 2πr",
    compute: (v) => {
      const r = needPos(v.r, "Radius");
      return [P("Area", A2(Math.PI * r * r)), R("Circumference", L(2 * Math.PI * r)), M("Diameter", L(2 * r))];
    },
    examples: [{ label: "radius 5", inputs: { r: 5 }, expect: "78.54" }],
  },
  {
    id: "rectangle-area", name: "Rectangle Area & Perimeter", category: "geometry",
    description: "Area, perimeter and diagonal of a rectangle.",
    keywords: ["rectangle", "area", "perimeter", "diagonal", "length", "width"],
    icon: "RectangleHorizontal", featured: true, popularity: 70,
    fields: [
      { key: "l", label: "Length", def: 8, min: 0, unit: "units" },
      { key: "w", label: "Width", def: 5, min: 0, unit: "units" },
    ],
    formula: "A = l·w,  P = 2(l + w)",
    compute: (v) => {
      const l = needPos(v.l, "Length");
      const w = needPos(v.w, "Width");
      return [P("Area", A2(l * w)), R("Perimeter", L(2 * (l + w))), M("Diagonal", L(Math.hypot(l, w)))];
    },
    examples: [{ label: "8 × 5", inputs: { l: 8, w: 5 }, expect: "40" }],
  },
  {
    id: "triangle-area", name: "Triangle Area Calculator", category: "geometry",
    description: "Triangle area from base and height, or from three sides (Heron).",
    keywords: ["triangle", "area", "heron", "base", "height", "sides"],
    icon: "Triangle", featured: true, popularity: 66,
    fields: [
      { key: "method", label: "Method", kind: "select", def: "bh", options: [{ value: "bh", label: "Base & height" }, { value: "heron", label: "Three sides" }] },
      { key: "base", label: "Base", def: 10, min: 0, unit: "units", showIf: { key: "method", in: ["bh"] } },
      { key: "height", label: "Height", def: 6, min: 0, unit: "units", showIf: { key: "method", in: ["bh"] } },
      { key: "a", label: "Side a", def: 3, min: 0, unit: "units", showIf: { key: "method", in: ["heron"] } },
      { key: "b", label: "Side b", def: 4, min: 0, unit: "units", showIf: { key: "method", in: ["heron"] } },
      { key: "c", label: "Side c", def: 5, min: 0, unit: "units", showIf: { key: "method", in: ["heron"] } },
    ],
    compute: (v) => {
      if (String(v.method) === "heron") {
        const a = needPos(v.a, "Side a"), b = needPos(v.b, "Side b"), c = needPos(v.c, "Side c");
        if (a + b <= c || a + c <= b || b + c <= a) fail("Those side lengths cannot form a triangle.");
        const s = (a + b + c) / 2;
        return [P("Area", A2(Math.sqrt(s * (s - a) * (s - b) * (s - c)))), R("Perimeter", L(a + b + c))];
      }
      const base = needPos(v.base, "Base"), height = needPos(v.height, "Height");
      return [P("Area", A2(0.5 * base * height)), M("Formula", "½ × base × height")];
    },
    examples: [{ label: "base 10, height 6", inputs: { method: "bh", base: 10, height: 6 }, expect: "30" }],
  },
  {
    id: "square-area", name: "Square Area & Perimeter", category: "geometry",
    description: "Area, perimeter and diagonal of a square.",
    keywords: ["square", "area", "perimeter", "diagonal", "side"],
    icon: "Square", popularity: 60,
    fields: [{ key: "s", label: "Side length", def: 5, min: 0, unit: "units" }],
    formula: "A = s²,  P = 4s",
    compute: (v) => {
      const s = needPos(v.s, "Side");
      return [P("Area", A2(s * s)), R("Perimeter", L(4 * s)), M("Diagonal", L(s * Math.SQRT2))];
    },
    examples: [{ label: "side 5", inputs: { s: 5 }, expect: "25" }],
  },
  {
    id: "trapezoid-area", name: "Trapezoid Area Calculator", category: "geometry",
    description: "Area of a trapezoid from its two parallel sides and height.",
    keywords: ["trapezoid", "trapezium", "area", "parallel sides", "height"],
    icon: "Shapes", popularity: 50,
    fields: [
      { key: "a", label: "Parallel side a", def: 6, min: 0, unit: "units" },
      { key: "b", label: "Parallel side b", def: 10, min: 0, unit: "units" },
      { key: "h", label: "Height", def: 4, min: 0, unit: "units" },
    ],
    formula: "A = ½(a + b)·h",
    compute: (v) => {
      const a = needPos(v.a, "Side a"), b = needPos(v.b, "Side b"), h = needPos(v.h, "Height");
      return [P("Area", A2(0.5 * (a + b) * h)), M("Average width", L((a + b) / 2))];
    },
    examples: [{ label: "a 6, b 10, h 4", inputs: { a: 6, b: 10, h: 4 }, expect: "32" }],
  },
  {
    id: "parallelogram-area", name: "Parallelogram Area Calculator", category: "geometry",
    description: "Area of a parallelogram from its base and height.",
    keywords: ["parallelogram", "area", "base", "height"],
    icon: "Shapes", popularity: 46,
    fields: [
      { key: "base", label: "Base", def: 8, min: 0, unit: "units" },
      { key: "h", label: "Height", def: 5, min: 0, unit: "units" },
    ],
    formula: "A = base × height",
    compute: (v) => {
      const base = needPos(v.base, "Base"), h = needPos(v.h, "Height");
      return [P("Area", A2(base * h))];
    },
    examples: [{ label: "base 8, height 5", inputs: { base: 8, h: 5 }, expect: "40" }],
  },
  {
    id: "rhombus-area", name: "Rhombus Area Calculator", category: "geometry",
    description: "Area, side and perimeter of a rhombus from its diagonals.",
    keywords: ["rhombus", "area", "diagonals", "perimeter", "side"],
    icon: "Diamond", popularity: 44,
    fields: [
      { key: "d1", label: "Diagonal 1", def: 6, min: 0, unit: "units" },
      { key: "d2", label: "Diagonal 2", def: 8, min: 0, unit: "units" },
    ],
    formula: "A = ½·d₁·d₂",
    compute: (v) => {
      const d1 = needPos(v.d1, "Diagonal 1"), d2 = needPos(v.d2, "Diagonal 2");
      const side = Math.hypot(d1 / 2, d2 / 2);
      return [P("Area", A2(0.5 * d1 * d2)), R("Side length", L(side)), M("Perimeter", L(4 * side))];
    },
    examples: [{ label: "diagonals 6 and 8", inputs: { d1: 6, d2: 8 }, expect: "24" }],
  },
  {
    id: "ellipse-area", name: "Ellipse Area Calculator", category: "geometry",
    description: "Area and approximate perimeter of an ellipse.",
    keywords: ["ellipse", "area", "perimeter", "semi-axis", "oval"],
    icon: "Circle", popularity: 42,
    fields: [
      { key: "a", label: "Semi-major axis (a)", def: 5, min: 0, unit: "units" },
      { key: "b", label: "Semi-minor axis (b)", def: 3, min: 0, unit: "units" },
    ],
    formula: "A = π·a·b",
    compute: (v) => {
      const a = needPos(v.a, "Semi-major axis"), b = needPos(v.b, "Semi-minor axis");
      const perim = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
      return [P("Area", A2(Math.PI * a * b)), M("Perimeter (approx.)", L(perim))];
    },
    examples: [{ label: "a 5, b 3", inputs: { a: 5, b: 3 }, expect: "47.12" }],
  },
  {
    id: "regular-polygon-area", name: "Regular Polygon Area", category: "geometry",
    description: "Area and perimeter of a regular polygon from its side length.",
    keywords: ["regular polygon", "area", "pentagon", "hexagon", "sides", "apothem"],
    icon: "Hexagon", popularity: 48,
    fields: [
      { key: "n", label: "Number of sides", def: 6, min: 3, step: 1 },
      { key: "s", label: "Side length", def: 4, min: 0, unit: "units" },
    ],
    formula: "A = n·s² / (4·tan(π/n))",
    compute: (v) => {
      const n = Math.trunc(needPos(v.n, "Number of sides"));
      if (n < 3) fail("A polygon needs at least 3 sides.");
      const s = needPos(v.s, "Side length");
      const area = (n * s * s) / (4 * Math.tan(Math.PI / n));
      return [P("Area", A2(area)), R("Perimeter", L(n * s)), M("Apothem", L(s / (2 * Math.tan(Math.PI / n))))];
    },
    examples: [{ label: "hexagon, side 4", inputs: { n: 6, s: 4 }, expect: "41.57" }],
  },
  {
    id: "sector-area", name: "Circle Sector Area", category: "geometry",
    description: "Area and arc length of a circular sector.",
    keywords: ["sector", "area", "arc length", "angle", "circle", "slice"],
    icon: "PieChart", popularity: 46,
    fields: [
      { key: "r", label: "Radius", def: 6, min: 0, unit: "units" },
      { key: "angle", label: "Angle", def: 90, min: 0, max: 360, unit: "°" },
    ],
    formula: "A = (θ/360)·πr²",
    compute: (v) => {
      const r = needPos(v.r, "Radius");
      const angle = need(v.angle, "Angle");
      const frac = angle / 360;
      return [P("Sector area", A2(frac * Math.PI * r * r)), R("Arc length", L(frac * 2 * Math.PI * r)), M("Fraction of circle", `${fmt(frac * 100)}%`)];
    },
    examples: [{ label: "radius 6, 90°", inputs: { r: 6, angle: 90 }, expect: "28.27" }],
  },
  {
    id: "sphere-volume", name: "Sphere Volume & Surface Area", category: "geometry",
    description: "Volume and surface area of a sphere from its radius.",
    keywords: ["sphere", "volume", "surface area", "radius", "ball"],
    icon: "Circle", featured: true, popularity: 64,
    fields: [{ key: "r", label: "Radius", def: 2, min: 0, unit: "units" }],
    formula: "V = 4/3·πr³,  A = 4πr²",
    compute: (v) => {
      const r = needPos(v.r, "Radius");
      return [P("Volume", A3((4 / 3) * Math.PI * r ** 3)), R("Surface area", A2(4 * Math.PI * r * r))];
    },
    examples: [{ label: "radius 2", inputs: { r: 2 }, expect: "33.51" }],
  },
  {
    id: "cube-volume", name: "Cube Volume & Surface Area", category: "geometry",
    description: "Volume, surface area and diagonal of a cube.",
    keywords: ["cube", "volume", "surface area", "diagonal", "side"],
    icon: "Box", popularity: 56,
    fields: [{ key: "s", label: "Side length", def: 4, min: 0, unit: "units" }],
    formula: "V = s³,  A = 6s²",
    compute: (v) => {
      const s = needPos(v.s, "Side");
      return [P("Volume", A3(s ** 3)), R("Surface area", A2(6 * s * s)), M("Space diagonal", L(s * Math.sqrt(3)))];
    },
    examples: [{ label: "side 4", inputs: { s: 4 }, expect: "64" }],
  },
  {
    id: "cylinder-volume", name: "Cylinder Volume & Surface Area", category: "geometry",
    description: "Volume and total surface area of a cylinder.",
    keywords: ["cylinder", "volume", "surface area", "radius", "height"],
    icon: "Cylinder", featured: true, popularity: 62,
    fields: [
      { key: "r", label: "Radius", def: 3, min: 0, unit: "units" },
      { key: "h", label: "Height", def: 10, min: 0, unit: "units" },
    ],
    formula: "V = πr²h,  A = 2πr(r + h)",
    compute: (v) => {
      const r = needPos(v.r, "Radius"), h = needPos(v.h, "Height");
      return [P("Volume", A3(Math.PI * r * r * h)), R("Surface area", A2(2 * Math.PI * r * (r + h))), M("Lateral area", A2(2 * Math.PI * r * h))];
    },
    examples: [{ label: "radius 3, height 10", inputs: { r: 3, h: 10 }, expect: "282.74" }],
  },
  {
    id: "cone-volume", name: "Cone Volume & Surface Area", category: "geometry",
    description: "Volume, slant height and surface area of a cone.",
    keywords: ["cone", "volume", "surface area", "slant height", "radius"],
    icon: "Triangle", popularity: 50,
    fields: [
      { key: "r", label: "Radius", def: 3, min: 0, unit: "units" },
      { key: "h", label: "Height", def: 4, min: 0, unit: "units" },
    ],
    formula: "V = 1/3·πr²h",
    compute: (v) => {
      const r = needPos(v.r, "Radius"), h = needPos(v.h, "Height");
      const slant = Math.hypot(r, h);
      return [P("Volume", A3((1 / 3) * Math.PI * r * r * h)), R("Slant height", L(slant)), M("Surface area", A2(Math.PI * r * (r + slant)))];
    },
    examples: [{ label: "radius 3, height 4", inputs: { r: 3, h: 4 }, expect: "37.7" }],
  },
  {
    id: "rectangular-prism-volume", name: "Box (Prism) Volume", category: "geometry",
    description: "Volume and surface area of a rectangular box.",
    keywords: ["box", "prism", "volume", "surface area", "cuboid", "rectangular"],
    icon: "Box", popularity: 54,
    fields: [
      { key: "l", label: "Length", def: 4, min: 0, unit: "units" },
      { key: "w", label: "Width", def: 3, min: 0, unit: "units" },
      { key: "h", label: "Height", def: 5, min: 0, unit: "units" },
    ],
    formula: "V = l·w·h,  A = 2(lw + lh + wh)",
    compute: (v) => {
      const l = needPos(v.l, "Length"), w = needPos(v.w, "Width"), h = needPos(v.h, "Height");
      return [P("Volume", A3(l * w * h)), R("Surface area", A2(2 * (l * w + l * h + w * h))), M("Space diagonal", L(Math.sqrt(l * l + w * w + h * h)))];
    },
    examples: [{ label: "4 × 3 × 5", inputs: { l: 4, w: 3, h: 5 }, expect: "60" }],
  },
  {
    id: "pyramid-volume", name: "Pyramid Volume Calculator", category: "geometry",
    description: "Volume of a square-based pyramid.",
    keywords: ["pyramid", "volume", "base", "height", "square base"],
    icon: "Triangle", popularity: 44,
    fields: [
      { key: "side", label: "Base side length", def: 6, min: 0, unit: "units" },
      { key: "h", label: "Height", def: 10, min: 0, unit: "units" },
    ],
    formula: "V = 1/3·base area·height",
    compute: (v) => {
      const side = needPos(v.side, "Base side"), h = needPos(v.h, "Height");
      return [P("Volume", A3((1 / 3) * side * side * h)), M("Base area", A2(side * side))];
    },
    examples: [{ label: "base 6, height 10", inputs: { side: 6, h: 10 }, expect: "120" }],
  },
  {
    id: "pythagorean-theorem", name: "Pythagorean Theorem Calculator", category: "geometry",
    description: "Hypotenuse of a right triangle from its two legs.",
    keywords: ["pythagorean", "hypotenuse", "right triangle", "legs", "a2 b2 c2"],
    icon: "Triangle", featured: true, popularity: 72,
    fields: [
      { key: "a", label: "Leg a", def: 3, min: 0, unit: "units" },
      { key: "b", label: "Leg b", def: 4, min: 0, unit: "units" },
    ],
    formula: "c = √(a² + b²)",
    compute: (v) => {
      const a = needPos(v.a, "Leg a"), b = needPos(v.b, "Leg b");
      const c = Math.hypot(a, b);
      return [P("Hypotenuse", L(c)), R("Area", A2(0.5 * a * b)), M("Perimeter", L(a + b + c))];
    },
    examples: [{ label: "legs 3 and 4", inputs: { a: 3, b: 4 }, expect: "5" }],
  },
  {
    id: "distance-2d", name: "Distance Between Two Points", category: "geometry",
    description: "Straight-line distance between two points on a plane.",
    keywords: ["distance", "two points", "coordinates", "euclidean", "plane"],
    icon: "Ruler", popularity: 58,
    fields: [
      { key: "x1", label: "x₁", def: 0 }, { key: "y1", label: "y₁", def: 0 },
      { key: "x2", label: "x₂", def: 3 }, { key: "y2", label: "y₂", def: 4 },
    ],
    formula: "d = √((x₂−x₁)² + (y₂−y₁)²)",
    compute: (v) => {
      const dx = need(v.x2, "x₂") - need(v.x1, "x₁");
      const dy = need(v.y2, "y₂") - need(v.y1, "y₁");
      return [P("Distance", L(Math.hypot(dx, dy))), M("Δx, Δy", `${fmt(dx)}, ${fmt(dy)}`)];
    },
    examples: [{ label: "(0,0) to (3,4)", inputs: { x1: 0, y1: 0, x2: 3, y2: 4 }, expect: "5" }],
  },
  {
    id: "midpoint", name: "Midpoint Calculator", category: "geometry",
    description: "Midpoint of the segment between two points.",
    keywords: ["midpoint", "two points", "coordinates", "segment", "average"],
    icon: "GitCommitHorizontal", popularity: 48,
    fields: [
      { key: "x1", label: "x₁", def: 0 }, { key: "y1", label: "y₁", def: 0 },
      { key: "x2", label: "x₂", def: 4 }, { key: "y2", label: "y₂", def: 6 },
    ],
    formula: "M = ((x₁+x₂)/2, (y₁+y₂)/2)",
    compute: (v) => {
      const mx = (need(v.x1, "x₁") + need(v.x2, "x₂")) / 2;
      const my = (need(v.y1, "y₁") + need(v.y2, "y₂")) / 2;
      return [P("Midpoint", `(${fmt(mx)}, ${fmt(my)})`)];
    },
    examples: [{ label: "(0,0) and (4,6)", inputs: { x1: 0, y1: 0, x2: 4, y2: 6 }, expect: "(2, 3)" }],
  },
  {
    id: "slope-calculator", name: "Slope of a Line Calculator", category: "geometry",
    description: "Slope and equation of the line through two points.",
    keywords: ["slope", "gradient", "line", "two points", "rise over run", "equation"],
    icon: "TrendingUp", popularity: 52,
    fields: [
      { key: "x1", label: "x₁", def: 0 }, { key: "y1", label: "y₁", def: 0 },
      { key: "x2", label: "x₂", def: 2 }, { key: "y2", label: "y₂", def: 4 },
    ],
    formula: "m = (y₂ − y₁) / (x₂ − x₁)",
    compute: (v) => {
      const x1 = need(v.x1, "x₁"), y1 = need(v.y1, "y₁"), x2 = need(v.x2, "x₂"), y2 = need(v.y2, "y₂");
      const dx = x2 - x1;
      if (dx === 0) return [P("Slope", "Undefined"), M("Line", "Vertical line")];
      const m = (y2 - y1) / dx;
      const b = y1 - m * x1;
      return [P("Slope", fmt(m)), R("Y-intercept", fmt(b)), M("Equation", `y = ${fmt(m)}x ${b >= 0 ? "+" : "−"} ${fmt(Math.abs(b))}`)];
    },
    examples: [{ label: "(0,0) and (2,4)", inputs: { x1: 0, y1: 0, x2: 2, y2: 4 }, expect: "2" }],
  },
  {
    id: "arc-length", name: "Arc Length Calculator", category: "geometry",
    description: "Arc length and chord of a circular arc.",
    keywords: ["arc length", "circle", "angle", "chord", "radius"],
    icon: "Spline", popularity: 44,
    fields: [
      { key: "r", label: "Radius", def: 6, min: 0, unit: "units" },
      { key: "angle", label: "Angle", def: 90, min: 0, max: 360, unit: "°" },
    ],
    formula: "arc = (θ/360)·2πr",
    compute: (v) => {
      const r = needPos(v.r, "Radius");
      const angle = need(v.angle, "Angle");
      const rad = (angle * Math.PI) / 180;
      return [P("Arc length", L(r * rad)), R("Chord length", L(2 * r * Math.sin(rad / 2))), M("Angle", `${fmt(angle)}°`)];
    },
    examples: [{ label: "radius 6, 90°", inputs: { r: 6, angle: 90 }, expect: "9.42" }],
  },
  {
    id: "polygon-angles", name: "Polygon Interior Angles", category: "geometry",
    description: "Sum and size of the interior angles of a polygon.",
    keywords: ["polygon", "interior angles", "sum", "exterior", "sides", "pentagon"],
    icon: "Hexagon", popularity: 46,
    fields: [{ key: "n", label: "Number of sides", def: 6, min: 3, step: 1 }],
    formula: "sum = (n − 2) × 180°",
    compute: (v) => {
      const n = Math.trunc(needPos(v.n, "Number of sides"));
      if (n < 3) fail("A polygon needs at least 3 sides.");
      const sum = (n - 2) * 180;
      return out(
        [P("Sum of interior angles", `${fmt(sum)}°`), R("Each interior angle", `${fmt(sum / n)}°`), M("Each exterior angle", `${fmt(360 / n)}°`)],
        { note: "Interior-angle values assume a regular (equal-angled) polygon." },
      );
    },
    examples: [{ label: "hexagon (6 sides)", inputs: { n: 6 }, expect: "720" }],
  },
];
