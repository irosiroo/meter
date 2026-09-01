/**
 * METER · Everyday Life (14 tools)
 *
 * Practical day-to-day maths: splitting bills, trip fuel costs, unit-price
 * comparison shopping, sleep cycles and paycheque estimates. Money is shown
 * with a neutral "$" symbol — the arithmetic is currency-agnostic.
 */

import { needPos, needNonNeg, fail, out, P, R, M, fmt, money, unit } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

const parseTime = (s: unknown): number => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(s ?? "").trim());
  if (!m) fail("Enter a time like 07:00.");
  const h = parseInt(m![1], 10);
  const min = parseInt(m![2], 10);
  if (h > 23 || min > 59) fail("Enter a valid 24-hour time.");
  return h * 60 + min;
};
const fmtTime = (minutes: number): string => {
  const t = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

export const CALCULATORS: CalcSpec[] = [
  {
    id: "bill-split-tip", name: "Bill Split & Tip Calculator", category: "everyday-life",
    description: "Split a restaurant bill with tip evenly between people.",
    keywords: ["bill split", "tip", "gratuity", "restaurant", "share", "per person"],
    icon: "Receipt", featured: true, popularity: 80,
    fields: [
      { key: "bill", label: "Bill amount", def: 100, min: 0, unit: "$" },
      { key: "tip", label: "Tip", def: 18, min: 0, unit: "%" },
      { key: "people", label: "Number of people", def: 4, min: 1, step: 1 },
    ],
    compute: (v) => {
      const bill = needNonNeg(v.bill, "Bill");
      const tip = needNonNeg(v.tip, "Tip") / 100;
      const people = needPos(v.people, "People");
      const total = bill * (1 + tip);
      return [
        P("Each person pays", money(total / people)),
        R("Total with tip", money(total)),
        R("Tip amount", money(bill * tip)),
      ];
    },
    examples: [{ label: "$100, 18% tip, 4 people", inputs: { bill: 100, tip: 18, people: 4 }, expect: "29.50" }],
  },
  {
    id: "fuel-cost-trip", name: "Trip Fuel Cost Calculator", category: "everyday-life",
    description: "Fuel needed and its cost for a journey of a given distance.",
    keywords: ["fuel cost", "trip", "gas", "petrol", "journey", "mpg"],
    icon: "Fuel", featured: true, popularity: 72,
    fields: [
      { key: "distance", label: "Distance", def: 300, min: 0, unit: "mi" },
      { key: "efficiency", label: "Fuel economy", def: 30, min: 0.1, unit: "mpg" },
      { key: "price", label: "Fuel price", def: 3.5, min: 0, step: 0.01, unit: "$/gal" },
    ],
    compute: (v) => {
      const dist = needNonNeg(v.distance, "Distance");
      const mpg = needPos(v.efficiency, "Fuel economy");
      const price = needNonNeg(v.price, "Fuel price");
      const gallons = dist / mpg;
      return [P("Trip cost", money(gallons * price)), R("Fuel used", unit(gallons, "gal")), R("Cost per mile", money((gallons * price) / (dist || 1)))];
    },
    examples: [{ label: "300 mi at 30 mpg, $3.50/gal", inputs: { distance: 300, efficiency: 30, price: 3.5 }, expect: "35.00" }],
  },
  {
    id: "gas-mileage", name: "Gas Mileage Calculator", category: "everyday-life",
    description: "Fuel economy from distance travelled and fuel used.",
    keywords: ["gas mileage", "mpg", "fuel economy", "l/100km", "efficiency"],
    icon: "Gauge", popularity: 62,
    fields: [
      { key: "distance", label: "Distance", def: 300, min: 0, unit: "mi" },
      { key: "fuel", label: "Fuel used", def: 10, min: 0.01, unit: "gal" },
    ],
    formula: "mpg = distance / fuel",
    compute: (v) => {
      const dist = needNonNeg(v.distance, "Distance");
      const fuel = needPos(v.fuel, "Fuel used");
      const mpg = dist / fuel;
      return [P("Fuel economy", unit(mpg, "mpg")), R("Metric", unit(235.214583 / mpg, "L/100km")), R("km per litre", unit(mpg * 0.425144, "km/L"))];
    },
    examples: [{ label: "300 mi on 10 gal", inputs: { distance: 300, fuel: 10 }, expect: "30" }],
  },
  {
    id: "unit-price", name: "Unit Price Comparison", category: "everyday-life",
    description: "Price per unit so you can compare package sizes.",
    keywords: ["unit price", "price per", "comparison", "shopping", "value", "per ounce"],
    icon: "Tag", featured: true, popularity: 66,
    fields: [
      { key: "price", label: "Price", def: 4.5, min: 0, step: 0.01, unit: "$" },
      { key: "quantity", label: "Quantity", def: 15, min: 0.0001, unit: "units" },
    ],
    formula: "unit price = price / quantity",
    compute: (v) => {
      const price = needNonNeg(v.price, "Price");
      const qty = needPos(v.quantity, "Quantity");
      return [P("Price per unit", money(price / qty)), R("Units per dollar", fmt(qty / (price || 1)))];
    },
    examples: [{ label: "$4.50 for 15 units", inputs: { price: 4.5, quantity: 15 }, expect: "0.30" }],
  },
  {
    id: "sleep-calculator", name: "Sleep Cycle Calculator", category: "everyday-life",
    description: "Best bedtimes to wake refreshed at the end of a 90-minute cycle.",
    keywords: ["sleep", "bedtime", "wake up", "cycle", "rem", "rest"],
    icon: "Moon", featured: true, popularity: 70,
    fields: [
      { key: "wake", label: "Wake-up time", kind: "time", def: "07:00" },
      { key: "latency", label: "Time to fall asleep", def: 15, min: 0, unit: "min" },
    ],
    formula: "bedtime = wake − (cycles × 90 min + latency)",
    compute: (v) => {
      const wake = parseTime(v.wake);
      const latency = needNonNeg(v.latency, "Latency");
      const bed = (n: number) => fmtTime(wake - (n * 90 + latency));
      return out(
        [
          P("6 cycles (9 h) — go to bed", bed(6)),
          R("5 cycles (7.5 h)", bed(5)),
          R("4 cycles (6 h)", bed(4)),
        ],
        { note: "Each sleep cycle is about 90 minutes; waking at the end of one feels more refreshing." },
      );
    },
    examples: [{ label: "Wake at 07:00", inputs: { wake: "07:00", latency: 15 }, expect: "21:45" }],
  },
  {
    id: "speed-distance-time", name: "Speed, Distance & Time", category: "everyday-life",
    description: "Solve for speed, distance or travel time given the other two.",
    keywords: ["speed", "distance", "time", "travel", "journey", "velocity"],
    icon: "Timer", popularity: 64,
    fields: [
      {
        key: "solve", label: "Solve for", kind: "select", def: "speed",
        options: [{ value: "speed", label: "Speed" }, { value: "distance", label: "Distance" }, { value: "time", label: "Time" }],
      },
      { key: "distance", label: "Distance", def: 150, min: 0, unit: "km", showIf: { key: "solve", in: ["speed", "time"] } },
      { key: "time", label: "Time", def: 2, min: 0, unit: "h", showIf: { key: "solve", in: ["speed", "distance"] } },
      { key: "speed", label: "Speed", def: 60, min: 0, unit: "km/h", showIf: { key: "solve", in: ["distance", "time"] } },
    ],
    formula: "distance = speed × time",
    compute: (v) => {
      const solve = String(v.solve);
      if (solve === "distance") return [P("Distance", unit(needPos(v.speed, "Speed") * needPos(v.time, "Time"), "km"))];
      if (solve === "time") return [P("Time", unit(needPos(v.distance, "Distance") / needPos(v.speed, "Speed"), "h"))];
      return [P("Speed", unit(needPos(v.distance, "Distance") / needPos(v.time, "Time"), "km/h"))];
    },
    examples: [{ label: "150 km in 2 h", inputs: { solve: "speed", distance: 150, time: 2 }, expect: "75" }],
  },
  {
    id: "electricity-cost", name: "Electricity Cost Calculator", category: "everyday-life",
    description: "Running cost of an appliance from its power and usage.",
    keywords: ["electricity cost", "appliance", "kwh", "energy bill", "power", "watts"],
    icon: "Plug", popularity: 68,
    fields: [
      { key: "power", label: "Power", def: 1500, min: 0, unit: "W" },
      { key: "hours", label: "Hours per day", def: 4, min: 0, max: 24, unit: "h" },
      { key: "rate", label: "Electricity rate", def: 0.15, min: 0, step: 0.01, unit: "$/kWh" },
    ],
    formula: "cost = power(kW) × hours × rate",
    compute: (v) => {
      const kw = needNonNeg(v.power, "Power") / 1000;
      const hours = needNonNeg(v.hours, "Hours");
      const rate = needNonNeg(v.rate, "Rate");
      const daily = kw * hours * rate;
      return out(
        [P("Daily cost", money(daily)), R("Monthly (30 days)", money(daily * 30)), R("Yearly", money(daily * 365)), M("Energy per day", unit(kw * hours, "kWh"))],
        { note: "Based on continuous running at the rated power." },
      );
    },
    examples: [{ label: "1500 W, 4 h/day, $0.15/kWh", inputs: { power: 1500, hours: 4, rate: 0.15 }, expect: "0.90" }],
  },
  {
    id: "pizza-party", name: "Pizza Party Calculator", category: "everyday-life",
    description: "How many pizzas to order for a group of guests.",
    keywords: ["pizza", "party", "guests", "slices", "order", "food"],
    icon: "Pizza", popularity: 58,
    fields: [
      { key: "guests", label: "Number of guests", def: 10, min: 1, step: 1 },
      { key: "slices", label: "Slices per guest", def: 3, min: 1, step: 1 },
      { key: "perPizza", label: "Slices per pizza", def: 8, min: 1, step: 1 },
    ],
    compute: (v) => {
      const guests = needPos(v.guests, "Guests");
      const slices = needPos(v.slices, "Slices per guest");
      const perPizza = needPos(v.perPizza, "Slices per pizza");
      const needed = Math.ceil((guests * slices) / perPizza);
      return [P("Pizzas to order", `${needed}`), R("Total slices", `${fmt(guests * slices)}`), M("Leftover slices", `${needed * perPizza - guests * slices}`)];
    },
    examples: [{ label: "10 guests, 3 slices each", inputs: { guests: 10, slices: 3, perPizza: 8 }, expect: "4" }],
  },
  {
    id: "party-drinks", name: "Party Drinks Calculator", category: "everyday-life",
    description: "Estimate how many drinks to buy for a party.",
    keywords: ["party", "drinks", "alcohol", "guests", "beverages", "hosting"],
    icon: "Wine", popularity: 50,
    fields: [
      { key: "guests", label: "Guests", def: 10, min: 1, step: 1 },
      { key: "hours", label: "Party length", def: 3, min: 0, unit: "h" },
      { key: "rate", label: "Drinks per guest per hour", def: 1, min: 0, step: 0.5 },
    ],
    compute: (v) => {
      const total = needPos(v.guests, "Guests") * needNonNeg(v.hours, "Hours") * needNonNeg(v.rate, "Rate");
      return [P("Total drinks", `${fmt(Math.ceil(total))}`), M("Rule of thumb", "≈ 1 drink per guest per hour")];
    },
    examples: [{ label: "10 guests, 3 h, 1/hr", inputs: { guests: 10, hours: 3, rate: 1 }, expect: "30" }],
  },
  {
    id: "paycheck-hours", name: "Hourly Paycheck Calculator", category: "everyday-life",
    description: "Gross pay from hours worked, including overtime past 40 hours.",
    keywords: ["paycheck", "hourly", "wage", "overtime", "gross pay", "hours"],
    icon: "Wallet", popularity: 60,
    fields: [
      { key: "hours", label: "Hours worked", def: 45, min: 0, unit: "h" },
      { key: "rate", label: "Hourly rate", def: 20, min: 0, step: 0.01, unit: "$/h" },
      { key: "otMultiplier", label: "Overtime multiplier", def: 1.5, min: 1, step: 0.1 },
    ],
    formula: "OT past 40 h paid at rate × multiplier",
    compute: (v) => {
      const hours = needNonNeg(v.hours, "Hours");
      const rate = needNonNeg(v.rate, "Rate");
      const mult = needPos(v.otMultiplier, "Overtime multiplier");
      const reg = Math.min(hours, 40);
      const ot = Math.max(0, hours - 40);
      const pay = reg * rate + ot * rate * mult;
      return [P("Gross pay", money(pay)), R("Regular", money(reg * rate)), R("Overtime", money(ot * rate * mult)), M("Overtime hours", `${fmt(ot)} h`)];
    },
    examples: [{ label: "45 h at $20 (1.5× OT)", inputs: { hours: 45, rate: 20, otMultiplier: 1.5 }, expect: "950" }],
  },
  {
    id: "cost-per-use", name: "Cost Per Use Calculator", category: "everyday-life",
    description: "The true cost of a purchase spread over how often you use it.",
    keywords: ["cost per use", "value", "purchase", "worth it", "amortize"],
    icon: "Tag", popularity: 44,
    fields: [
      { key: "price", label: "Purchase price", def: 120, min: 0, unit: "$" },
      { key: "uses", label: "Expected uses", def: 60, min: 1, step: 1 },
    ],
    formula: "cost per use = price / uses",
    compute: (v) => {
      const price = needNonNeg(v.price, "Price");
      const uses = needPos(v.uses, "Uses");
      return [P("Cost per use", money(price / uses)), M("Over", `${fmt(uses)} uses`)];
    },
    examples: [{ label: "$120 over 60 uses", inputs: { price: 120, uses: 60 }, expect: "2.00" }],
  },
  {
    id: "dog-age", name: "Dog Age Calculator", category: "everyday-life",
    description: "Approximate a dog's age in human-equivalent years.",
    keywords: ["dog age", "dog years", "human years", "pet", "age"],
    icon: "Dog", popularity: 54,
    fields: [{ key: "years", label: "Dog's age", def: 5, min: 0, step: 0.5, unit: "yr" }],
    formula: "First 2 years ≈ 10.5 human years each, then +4/year",
    compute: (v) => {
      const y = needPos(v.years, "Age");
      const human = y <= 2 ? y * 10.5 : 21 + (y - 2) * 4;
      return [P("Human-equivalent age", `${fmt(human)} years`)];
    },
    examples: [{ label: "5-year-old dog", inputs: { years: 5 }, expect: "33" }],
  },
  {
    id: "subscription-cost", name: "Subscription Cost Calculator", category: "everyday-life",
    description: "See what a recurring subscription costs per year and per day.",
    keywords: ["subscription", "recurring", "monthly", "yearly", "cost", "budget"],
    icon: "CreditCard", popularity: 48,
    fields: [{ key: "monthly", label: "Monthly cost", def: 15, min: 0, step: 0.01, unit: "$" }],
    compute: (v) => {
      const m = needNonNeg(v.monthly, "Monthly cost");
      return [P("Yearly cost", money(m * 12)), R("Per day", money((m * 12) / 365)), M("Over 5 years", money(m * 60))];
    },
    examples: [{ label: "$15 per month", inputs: { monthly: 15 }, expect: "180" }],
  },
  {
    id: "discount-sale-price", name: "Discount & Sale Price Calculator", category: "everyday-life",
    description: "Final price and money saved after a percentage discount.",
    keywords: ["discount", "sale", "percent off", "savings", "coupon", "sale price", "deal"],
    icon: "Tag", featured: true, popularity: 62,
    fields: [
      { key: "price", label: "Original price", def: 80, min: 0, unit: "$" },
      { key: "discount", label: "Discount", def: 25, min: 0, max: 100, unit: "%" },
    ],
    formula: "sale price = price × (1 − discount / 100)",
    compute: (v) => {
      const price = needNonNeg(v.price, "Price");
      const disc = needNonNeg(v.discount, "Discount") / 100;
      const sale = price * (1 - disc);
      return [P("Sale price", money(sale)), R("You save", money(price - sale)), M("Discount", `${fmt(disc * 100)}%`)];
    },
    examples: [{ label: "$80 at 25% off", inputs: { price: 80, discount: 25 }, expect: "60.00" }],
  },
];
