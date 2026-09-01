/**
 * METER · Construction (14 tools)
 *
 * Material-takeoff calculators for building projects. Areas and volumes are
 * computed in the units a builder enters (feet, inches) and material counts
 * are rounded up, since you cannot buy a fraction of a sheet or a bag.
 */

import { needPos, needNonNeg, out, P, R, M, fmt, unit } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

export const CALCULATORS: CalcSpec[] = [
  {
    id: "concrete-volume", name: "Concrete Calculator", category: "construction",
    description: "Volume of concrete for a slab and the number of bags needed.",
    keywords: ["concrete", "slab", "cubic yards", "bags", "cement", "pour"],
    icon: "Box", featured: true, popularity: 84,
    fields: [
      { key: "length", label: "Length", def: 10, min: 0, unit: "ft" },
      { key: "width", label: "Width", def: 10, min: 0, unit: "ft" },
      { key: "depth", label: "Thickness", def: 4, min: 0, unit: "in" },
    ],
    formula: "Volume = length × width × thickness",
    compute: (v) => {
      const l = needPos(v.length, "Length");
      const w = needPos(v.width, "Width");
      const ft3 = l * w * (needPos(v.depth, "Thickness") / 12);
      return out(
        [
          P("Concrete needed", unit(ft3 / 27, "yd³")),
          R("In cubic feet", unit(ft3, "ft³")),
          R("In cubic metres", unit(ft3 * 0.0283168, "m³")),
          R("80 lb bags", `${Math.ceil(ft3 / 0.6)}`),
        ],
        { note: "Order 5–10% extra to allow for spillage and uneven subgrade." },
      );
    },
    examples: [{ label: "10 × 10 ft, 4 in thick", inputs: { length: 10, width: 10, depth: 4 }, expect: "1.23" }],
  },
  {
    id: "paint-calculator", name: "Paint Calculator", category: "construction",
    description: "Gallons of paint needed to cover a wall area with multiple coats.",
    keywords: ["paint", "coverage", "gallons", "wall", "coats", "painting"],
    icon: "PaintRoller", featured: true, popularity: 78,
    fields: [
      { key: "area", label: "Wall area", def: 400, min: 0, unit: "ft²" },
      { key: "coverage", label: "Coverage per gallon", def: 350, min: 1, unit: "ft²" },
      { key: "coats", label: "Coats", def: 2, min: 1, step: 1 },
    ],
    formula: "Gallons = area × coats / coverage",
    compute: (v) => {
      const area = needPos(v.area, "Wall area");
      const cov = needPos(v.coverage, "Coverage");
      const coats = needPos(v.coats, "Coats");
      const gallons = (area * coats) / cov;
      return [
        P("Paint to buy", `${Math.ceil(gallons)} gal`),
        R("Exact amount", unit(gallons, "gal")),
        M("Total area painted", unit(area * coats, "ft²")),
      ];
    },
    examples: [{ label: "400 ft², 2 coats", inputs: { area: 400, coverage: 350, coats: 2 }, expect: "3" }],
  },
  {
    id: "tile-calculator", name: "Tile Calculator", category: "construction",
    description: "Number of tiles needed for a floor or wall, including waste.",
    keywords: ["tile", "flooring", "wall", "ceramic", "square footage", "waste"],
    icon: "Grid3x3", popularity: 72,
    fields: [
      { key: "area", label: "Area to cover", def: 120, min: 0, unit: "ft²" },
      { key: "tileW", label: "Tile width", def: 12, min: 0.1, unit: "in" },
      { key: "tileL", label: "Tile length", def: 12, min: 0.1, unit: "in" },
      { key: "waste", label: "Waste allowance", def: 10, min: 0, max: 50, unit: "%" },
    ],
    compute: (v) => {
      const area = needPos(v.area, "Area");
      const tileFt2 = (needPos(v.tileW, "Tile width") / 12) * (needPos(v.tileL, "Tile length") / 12);
      const waste = needNonNeg(v.waste, "Waste") / 100;
      const tiles = Math.ceil((area / tileFt2) * (1 + waste));
      return [P("Tiles needed", `${tiles}`), M("Tile size", unit(tileFt2, "ft²")), R("Includes waste", `${fmt(waste * 100)}%`)];
    },
    examples: [{ label: "120 ft², 12″ tiles, 10% waste", inputs: { area: 120, tileW: 12, tileL: 12, waste: 10 }, expect: "132" }],
  },
  {
    id: "brick-calculator", name: "Brick Calculator", category: "construction",
    description: "Number of bricks for a wall using a per-square-metre rate.",
    keywords: ["brick", "wall", "masonry", "block", "mortar", "count"],
    icon: "Building", popularity: 64,
    fields: [
      { key: "area", label: "Wall area", def: 10, min: 0, unit: "m²" },
      { key: "perM2", label: "Bricks per m²", def: 60, min: 1, step: 1 },
      { key: "waste", label: "Waste allowance", def: 10, min: 0, max: 50, unit: "%" },
    ],
    compute: (v) => {
      const area = needPos(v.area, "Wall area");
      const rate = needPos(v.perM2, "Bricks per m²");
      const bricks = Math.ceil(area * rate * (1 + needNonNeg(v.waste, "Waste") / 100));
      return out([P("Bricks needed", `${bricks}`)], { note: "≈60 bricks/m² suits standard 215 × 65 mm bricks with 10 mm mortar joints." });
    },
    examples: [{ label: "10 m² wall, 10% waste", inputs: { area: 10, perM2: 60, waste: 10 }, expect: "660" }],
  },
  {
    id: "drywall-calculator", name: "Drywall Sheet Calculator", category: "construction",
    description: "Sheets of drywall needed to cover a wall or ceiling area.",
    keywords: ["drywall", "sheetrock", "gypsum", "sheets", "wall", "plasterboard"],
    icon: "Layers", popularity: 58,
    fields: [
      { key: "area", label: "Area to cover", def: 480, min: 0, unit: "ft²" },
      { key: "sheetW", label: "Sheet width", def: 4, min: 0.1, unit: "ft" },
      { key: "sheetL", label: "Sheet length", def: 8, min: 0.1, unit: "ft" },
    ],
    compute: (v) => {
      const area = needPos(v.area, "Area");
      const sheet = needPos(v.sheetW, "Sheet width") * needPos(v.sheetL, "Sheet length");
      const sheets = Math.ceil(area / sheet);
      return [P("Sheets needed", `${sheets}`), R("With 10% waste", `${Math.ceil((area / sheet) * 1.1)}`), M("Sheet coverage", unit(sheet, "ft²"))];
    },
    examples: [{ label: "480 ft², 4 × 8 sheets", inputs: { area: 480, sheetW: 4, sheetL: 8 }, expect: "15" }],
  },
  {
    id: "roofing-calculator", name: "Roofing Calculator", category: "construction",
    description: "Actual roof area and squares from footprint and roof pitch.",
    keywords: ["roofing", "roof", "shingles", "squares", "pitch", "slope"],
    icon: "Home", popularity: 60,
    fields: [
      { key: "footprint", label: "Ground footprint", def: 1200, min: 0, unit: "ft²" },
      { key: "rise", label: "Roof pitch (rise per 12)", def: 5, min: 0, unit: "/12" },
    ],
    formula: "Roof area = footprint × √(12² + rise²) / 12",
    compute: (v) => {
      const fp = needPos(v.footprint, "Footprint");
      const rise = needNonNeg(v.rise, "Rise");
      const mult = Math.sqrt(144 + rise * rise) / 12;
      const roof = fp * mult;
      return [
        P("Roof area", unit(roof, "ft²")),
        R("Roofing squares", `${Math.ceil(roof / 100)}`),
        R("Pitch multiplier", `${fmt(mult, 4)}×`),
      ];
    },
    examples: [{ label: "1200 ft² footprint, 5/12 pitch", inputs: { footprint: 1200, rise: 5 }, expect: "1,300" }],
  },
  {
    id: "board-feet", name: "Board Feet Calculator", category: "construction",
    description: "Board feet of lumber from its dimensions and quantity.",
    keywords: ["board feet", "lumber", "timber", "wood", "bdft", "hardwood"],
    icon: "Ruler", popularity: 50,
    fields: [
      { key: "thickness", label: "Thickness", def: 2, min: 0, unit: "in" },
      { key: "width", label: "Width", def: 6, min: 0, unit: "in" },
      { key: "length", label: "Length", def: 8, min: 0, unit: "ft" },
      { key: "qty", label: "Quantity", def: 1, min: 1, step: 1 },
    ],
    formula: "Board feet = T(in) × W(in) × L(ft) / 12 × quantity",
    compute: (v) => {
      const bf = ((needPos(v.thickness, "Thickness") * needPos(v.width, "Width") * needPos(v.length, "Length")) / 12) * needPos(v.qty, "Quantity");
      return [P("Board feet", fmt(bf, 2) + " bd ft")];
    },
    examples: [{ label: "2 × 6 × 8 ft board", inputs: { thickness: 2, width: 6, length: 8, qty: 1 }, expect: "8" }],
  },
  {
    id: "stair-calculator", name: "Stair Calculator", category: "construction",
    description: "Number of steps and riser height for a staircase.",
    keywords: ["stair", "steps", "riser", "tread", "staircase", "rise run"],
    icon: "Layers", popularity: 48,
    fields: [
      { key: "totalRise", label: "Total rise (floor to floor)", def: 108, min: 1, unit: "in" },
      { key: "idealRiser", label: "Ideal riser height", def: 7.5, min: 1, step: 0.1, unit: "in" },
    ],
    compute: (v) => {
      const rise = needPos(v.totalRise, "Total rise");
      const ideal = needPos(v.idealRiser, "Ideal riser");
      const steps = Math.max(1, Math.round(rise / ideal));
      return [
        P("Number of steps", `${steps}`),
        R("Actual riser height", unit(rise / steps, "in")),
        R("Treads", `${steps - 1}`),
      ];
    },
    examples: [{ label: "108 in total rise", inputs: { totalRise: 108, idealRiser: 7.5 }, expect: "14" }],
  },
  {
    id: "gravel-calculator", name: "Gravel & Aggregate Calculator", category: "construction",
    description: "Weight of gravel needed to fill an area to a given depth.",
    keywords: ["gravel", "aggregate", "stone", "tons", "landscaping", "fill"],
    icon: "Box", popularity: 54,
    fields: [
      { key: "length", label: "Length", def: 20, min: 0, unit: "ft" },
      { key: "width", label: "Width", def: 10, min: 0, unit: "ft" },
      { key: "depth", label: "Depth", def: 6, min: 0, unit: "in" },
      { key: "density", label: "Density", def: 100, min: 1, unit: "lb/ft³" },
    ],
    compute: (v) => {
      const ft3 = needPos(v.length, "Length") * needPos(v.width, "Width") * (needPos(v.depth, "Depth") / 12);
      const lb = ft3 * needPos(v.density, "Density");
      return [P("Weight needed", unit(lb / 2000, "tons")), R("Volume", unit(ft3 / 27, "yd³")), R("In pounds", unit(lb, "lb"))];
    },
    examples: [{ label: "20 × 10 ft, 6 in deep", inputs: { length: 20, width: 10, depth: 6, density: 100 }, expect: "5" }],
  },
  {
    id: "fence-calculator", name: "Fence Calculator", category: "construction",
    description: "Posts and sections needed for a straight fence line.",
    keywords: ["fence", "posts", "panels", "sections", "fencing", "yard"],
    icon: "Fence", popularity: 52,
    fields: [
      { key: "length", label: "Fence length", def: 200, min: 0, unit: "ft" },
      { key: "spacing", label: "Post spacing", def: 8, min: 1, unit: "ft" },
    ],
    compute: (v) => {
      const len = needPos(v.length, "Fence length");
      const spacing = needPos(v.spacing, "Post spacing");
      const sections = Math.ceil(len / spacing);
      return [P("Posts needed", `${sections + 1}`), R("Sections", `${sections}`), M("Fence length", unit(len, "ft"))];
    },
    examples: [{ label: "200 ft, posts every 8 ft", inputs: { length: 200, spacing: 8 }, expect: "26" }],
  },
  {
    id: "wall-framing", name: "Wall Framing Stud Calculator", category: "construction",
    description: "Number of wall studs for a given wall length and spacing.",
    keywords: ["framing", "studs", "wall", "spacing", "on center", "carpentry"],
    icon: "HardHat", popularity: 46,
    fields: [
      { key: "length", label: "Wall length", def: 20, min: 0, unit: "ft" },
      { key: "spacing", label: "Stud spacing", def: 16, min: 1, unit: "in" },
    ],
    compute: (v) => {
      const inches = needPos(v.length, "Wall length") * 12;
      const spacing = needPos(v.spacing, "Stud spacing");
      const studs = Math.ceil(inches / spacing) + 1;
      return [P("Studs needed", `${studs}`), M("Plus corners & openings", "add extra for each")];
    },
    examples: [{ label: "20 ft wall, 16″ OC", inputs: { length: 20, spacing: 16 }, expect: "16" }],
  },
  {
    id: "plywood-sheets", name: "Plywood / Sheathing Calculator", category: "construction",
    description: "Sheets of plywood needed to cover a floor or roof area.",
    keywords: ["plywood", "sheathing", "subfloor", "osb", "sheets", "panels"],
    icon: "Layers", popularity: 44,
    fields: [
      { key: "area", label: "Area to cover", def: 320, min: 0, unit: "ft²" },
      { key: "sheet", label: "Sheet size", def: 32, min: 1, unit: "ft²" },
    ],
    compute: (v) => {
      const area = needPos(v.area, "Area");
      const sheet = needPos(v.sheet, "Sheet size");
      return [P("Sheets needed", `${Math.ceil(area / sheet)}`), R("With 10% waste", `${Math.ceil((area / sheet) * 1.1)}`)];
    },
    examples: [{ label: "320 ft², 4 × 8 sheets", inputs: { area: 320, sheet: 32 }, expect: "10" }],
  },
  {
    id: "asphalt-calculator", name: "Asphalt Calculator", category: "construction",
    description: "Tons of asphalt to pave an area to a given depth.",
    keywords: ["asphalt", "paving", "driveway", "tons", "blacktop", "road"],
    icon: "Box", popularity: 42,
    fields: [
      { key: "length", label: "Length", def: 100, min: 0, unit: "ft" },
      { key: "width", label: "Width", def: 20, min: 0, unit: "ft" },
      { key: "depth", label: "Depth", def: 3, min: 0, unit: "in" },
      { key: "density", label: "Density", def: 145, min: 1, unit: "lb/ft³" },
    ],
    compute: (v) => {
      const ft3 = needPos(v.length, "Length") * needPos(v.width, "Width") * (needPos(v.depth, "Depth") / 12);
      const lb = ft3 * needPos(v.density, "Density");
      return [P("Asphalt needed", unit(lb / 2000, "tons")), R("Volume", unit(ft3, "ft³"))];
    },
    examples: [{ label: "100 × 20 ft, 3 in deep", inputs: { length: 100, width: 20, depth: 3, density: 145 }, expect: "36.25" }],
  },
  {
    id: "deck-boards", name: "Deck Board Calculator", category: "construction",
    description: "Rows of decking and linear footage for a rectangular deck.",
    keywords: ["deck", "decking", "boards", "linear feet", "patio", "lumber"],
    icon: "Ruler", popularity: 46,
    fields: [
      { key: "length", label: "Deck length (board run)", def: 16, min: 0, unit: "ft" },
      { key: "width", label: "Deck width", def: 12, min: 0, unit: "ft" },
      { key: "board", label: "Board width", def: 5.5, min: 0.1, step: 0.1, unit: "in" },
      { key: "gap", label: "Gap between boards", def: 0.125, min: 0, step: 0.01, unit: "in" },
    ],
    compute: (v) => {
      const len = needPos(v.length, "Deck length");
      const widthIn = needPos(v.width, "Deck width") * 12;
      const coverage = needPos(v.board, "Board width") + needNonNeg(v.gap, "Gap");
      const rows = Math.ceil(widthIn / coverage);
      return [P("Total linear feet", unit(rows * len, "ft")), R("Rows of decking", `${rows}`), M("Deck area", unit(len * needPos(v.width, "Deck width"), "ft²"))];
    },
    examples: [{ label: "16 × 12 ft deck, 5.5″ boards", inputs: { length: 16, width: 12, board: 5.5, gap: 0.125 }, expect: "416" }],
  },
];
