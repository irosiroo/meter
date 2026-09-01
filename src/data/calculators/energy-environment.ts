/**
 * METER · Energy & Environment (12 tools)
 *
 * Home-energy economics and carbon-footprint estimates. Emission factors are
 * rounded industry averages (stated in each tool's note) — good for planning,
 * not regulatory reporting.
 */

import { needPos, needNonNeg, out, P, R, M, fmt, unit, money } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

export const CALCULATORS: CalcSpec[] = [
  {
    id: "solar-panel-output", name: "Solar Panel Output Calculator", category: "energy-environment",
    description: "Daily, monthly and yearly generation from a solar array.",
    keywords: ["solar", "panel", "output", "generation", "kwh", "photovoltaic", "renewable"],
    icon: "Sun", featured: true, popularity: 70,
    fields: [
      { key: "size", label: "System size", def: 5, min: 0, unit: "kW" },
      { key: "sunHours", label: "Peak sun hours per day", def: 4, min: 0, unit: "h" },
      { key: "efficiency", label: "System efficiency", def: 100, min: 1, max: 100, unit: "%", optional: true },
    ],
    formula: "daily kWh = size × sun hours × efficiency",
    compute: (v) => {
      const size = needNonNeg(v.size, "System size");
      const sun = needNonNeg(v.sunHours, "Sun hours");
      const eff = Number.isFinite(v.efficiency) ? Math.min(100, Math.max(0, v.efficiency)) / 100 : 1;
      const daily = size * sun * eff;
      return out(
        [P("Yearly generation", unit(daily * 365, "kWh")), R("Daily", unit(daily, "kWh")), R("Monthly", unit(daily * 30, "kWh"))],
        { note: "Actual output varies with weather, shading, orientation and panel age." },
      );
    },
    examples: [{ label: "5 kW, 4 sun hours", inputs: { size: 5, sunHours: 4, efficiency: 100 }, expect: "7,300" }],
  },
  {
    id: "co2-from-driving", name: "Driving CO₂ Emissions", category: "energy-environment",
    description: "Carbon dioxide emitted from driving a distance at a given economy.",
    keywords: ["co2", "carbon", "driving", "emissions", "car", "footprint", "gasoline"],
    icon: "Car", featured: true, popularity: 62,
    fields: [
      { key: "distance", label: "Distance driven", def: 250, min: 0, unit: "mi" },
      { key: "mpg", label: "Fuel economy", def: 25, min: 0.1, unit: "mpg" },
    ],
    formula: "CO₂ = (distance / mpg) × 8.887 kg per gallon",
    compute: (v) => {
      const dist = needNonNeg(v.distance, "Distance");
      const mpg = needPos(v.mpg, "Fuel economy");
      const gallons = dist / mpg;
      const kg = gallons * 8.887;
      return out(
        [P("CO₂ emitted", `${fmt(kg, 2)} kg`), R("In tonnes", unit(kg / 1000, "t")), M("Fuel burned", unit(gallons, "gal"))],
        { note: "Burning one US gallon of gasoline releases about 8.887 kg of CO₂ (EPA)." },
      );
    },
    examples: [{ label: "250 mi at 25 mpg", inputs: { distance: 250, mpg: 25 }, expect: "88.87" }],
  },
  {
    id: "flight-carbon-footprint", name: "Flight Carbon Footprint", category: "energy-environment",
    description: "Rough CO₂ footprint of a flight per passenger.",
    keywords: ["flight", "carbon", "footprint", "co2", "aviation", "travel", "emissions"],
    icon: "Plane", featured: true, popularity: 58,
    fields: [{ key: "distance", label: "Flight distance", def: 1000, min: 0, unit: "km" }],
    formula: "CO₂ ≈ distance × 0.15 kg per passenger-km",
    compute: (v) => {
      const dist = needNonNeg(v.distance, "Distance");
      const kg = dist * 0.15;
      return out(
        [P("CO₂ per passenger", `${fmt(kg)} kg`), R("In tonnes", unit(kg / 1000, "t"))],
        { note: "Uses 0.15 kg CO₂e per passenger-km, a rough average across flight lengths." },
      );
    },
    examples: [{ label: "1000 km flight", inputs: { distance: 1000 }, expect: "150" }],
  },
  {
    id: "led-savings", name: "LED Bulb Savings Calculator", category: "energy-environment",
    description: "Yearly cost and energy saved by switching to LED lighting.",
    keywords: ["led", "savings", "lighting", "energy", "incandescent", "bulb", "efficiency"],
    icon: "Lightbulb", popularity: 54,
    fields: [
      { key: "oldW", label: "Old bulb power", def: 60, min: 0, unit: "W" },
      { key: "newW", label: "LED power", def: 9, min: 0, unit: "W" },
      { key: "hours", label: "Hours used per day", def: 5, min: 0, max: 24, unit: "h" },
      { key: "rate", label: "Electricity rate", def: 0.15, min: 0, step: 0.01, unit: "$/kWh" },
    ],
    compute: (v) => {
      const oldW = needNonNeg(v.oldW, "Old power");
      const newW = needNonNeg(v.newW, "LED power");
      const hours = needNonNeg(v.hours, "Hours");
      const rate = needNonNeg(v.rate, "Rate");
      const kwhSaved = ((oldW - newW) / 1000) * hours * 365;
      return [P("Yearly saving", money(kwhSaved * rate)), R("Energy saved", unit(kwhSaved, "kWh/yr")), M("Power reduced", unit(oldW - newW, "W"))];
    },
    examples: [{ label: "60 W → 9 W, 5 h/day", inputs: { oldW: 60, newW: 9, hours: 5, rate: 0.15 }, expect: "13.96" }],
  },
  {
    id: "wind-turbine-power", name: "Wind Turbine Power Calculator", category: "energy-environment",
    description: "Available power from a wind turbine's rotor and wind speed.",
    keywords: ["wind", "turbine", "power", "renewable", "energy", "rotor", "betz"],
    icon: "Wind", popularity: 50,
    fields: [
      { key: "diameter", label: "Rotor diameter", def: 10, min: 0.1, unit: "m" },
      { key: "wind", label: "Wind speed", def: 8, min: 0, unit: "m/s" },
      { key: "cp", label: "Power coefficient (Cp)", def: 0.4, min: 0.01, max: 0.59, step: 0.01 },
    ],
    formula: "P = ½ · ρ · A · v³ · Cp   (ρ = 1.225 kg/m³)",
    compute: (v) => {
      const d = needPos(v.diameter, "Diameter");
      const wind = needNonNeg(v.wind, "Wind speed");
      const cp = needPos(v.cp, "Power coefficient");
      const area = Math.PI * (d / 2) ** 2;
      const watts = 0.5 * 1.225 * area * wind ** 3 * cp;
      return [P("Power output", unit(watts / 1000, "kW", 2)), R("Swept area", unit(area, "m²")), M("In watts", unit(watts, "W"))];
    },
    examples: [{ label: "10 m rotor, 8 m/s, Cp 0.4", inputs: { diameter: 10, wind: 8, cp: 0.4 }, expect: "9.85" }],
  },
  {
    id: "rainwater-harvesting", name: "Rainwater Harvesting Calculator", category: "energy-environment",
    description: "Water you can collect from a roof for a given rainfall.",
    keywords: ["rainwater", "harvesting", "collection", "roof", "rainfall", "water", "litres"],
    icon: "CloudRain", popularity: 46,
    fields: [
      { key: "area", label: "Roof catchment area", def: 100, min: 0, unit: "m²" },
      { key: "rainfall", label: "Rainfall", def: 25, min: 0, unit: "mm" },
      { key: "efficiency", label: "Collection efficiency", def: 80, min: 1, max: 100, unit: "%", optional: true },
    ],
    formula: "litres = area × rainfall × efficiency  (1 mm on 1 m² = 1 L)",
    compute: (v) => {
      const area = needNonNeg(v.area, "Area");
      const rain = needNonNeg(v.rainfall, "Rainfall");
      const eff = Number.isFinite(v.efficiency) ? Math.min(100, Math.max(0, v.efficiency)) / 100 : 0.8;
      const litres = area * rain * eff;
      return [P("Water collected", unit(litres, "L")), R("In US gallons", unit(litres * 0.264172, "gal"))];
    },
    examples: [{ label: "100 m² roof, 25 mm rain", inputs: { area: 100, rainfall: 25, efficiency: 80 }, expect: "2,000" }],
  },
  {
    id: "tree-co2-offset", name: "Tree CO₂ Offset Calculator", category: "energy-environment",
    description: "Carbon dioxide absorbed each year by a number of trees.",
    keywords: ["tree", "co2", "offset", "carbon", "absorption", "reforestation", "sequestration"],
    icon: "Trees", popularity: 48,
    fields: [
      { key: "trees", label: "Number of trees", def: 10, min: 0, step: 1 },
      { key: "perTree", label: "CO₂ absorbed per tree", def: 21, min: 0, unit: "kg/yr", optional: true },
    ],
    formula: "CO₂ absorbed = trees × per-tree rate",
    compute: (v) => {
      const trees = needNonNeg(v.trees, "Trees");
      const per = Number.isFinite(v.perTree) ? Math.max(0, v.perTree) : 21;
      const kg = trees * per;
      return out(
        [P("CO₂ absorbed per year", `${fmt(kg)} kg`), R("Over 10 years", unit((kg * 10) / 1000, "t"))],
        { note: "A mature tree absorbs roughly 21 kg of CO₂ per year; young trees far less." },
      );
    },
    examples: [{ label: "10 trees", inputs: { trees: 10, perTree: 21 }, expect: "210" }],
  },
  {
    id: "ev-charging-cost", name: "EV Charging Cost Calculator", category: "energy-environment",
    description: "Cost to charge an electric vehicle and its running cost.",
    keywords: ["ev", "electric vehicle", "charging", "cost", "battery", "kwh", "car"],
    icon: "BatteryCharging", popularity: 56,
    fields: [
      { key: "capacity", label: "Battery capacity", def: 60, min: 0, unit: "kWh" },
      { key: "rate", label: "Electricity rate", def: 0.15, min: 0, step: 0.01, unit: "$/kWh" },
      { key: "consumption", label: "Consumption", def: 18, min: 0.1, unit: "kWh/100km", optional: true },
    ],
    compute: (v) => {
      const cap = needNonNeg(v.capacity, "Capacity");
      const rate = needNonNeg(v.rate, "Rate");
      const rows = [P("Full charge cost", money(cap * rate))];
      if (Number.isFinite(v.consumption) && v.consumption > 0) {
        const per100 = v.consumption * rate;
        rows.push(R("Cost per 100 km", money(per100)));
        rows.push(M("Range per charge", unit((cap / v.consumption) * 100, "km")));
      }
      return rows;
    },
    examples: [{ label: "60 kWh battery at $0.15", inputs: { capacity: 60, rate: 0.15, consumption: 18 }, expect: "9.00" }],
  },
  {
    id: "appliance-energy", name: "Appliance Energy Use Calculator", category: "energy-environment",
    description: "Annual energy use and cost of an appliance.",
    keywords: ["appliance", "energy", "consumption", "annual", "kwh", "power", "running cost"],
    icon: "Plug", popularity: 52,
    fields: [
      { key: "power", label: "Power rating", def: 100, min: 0, unit: "W" },
      { key: "hours", label: "Hours used per day", def: 6, min: 0, max: 24, unit: "h" },
      { key: "rate", label: "Electricity rate", def: 0.15, min: 0, step: 0.01, unit: "$/kWh" },
    ],
    formula: "annual kWh = power(kW) × hours × 365",
    compute: (v) => {
      const kw = needNonNeg(v.power, "Power") / 1000;
      const hours = needNonNeg(v.hours, "Hours");
      const rate = needNonNeg(v.rate, "Rate");
      const annual = kw * hours * 365;
      return [P("Energy per year", unit(annual, "kWh")), R("Yearly cost", money(annual * rate)), M("Per day", unit(kw * hours, "kWh"))];
    },
    examples: [{ label: "100 W, 6 h/day", inputs: { power: 100, hours: 6, rate: 0.15 }, expect: "219" }],
  },
  {
    id: "kwh-to-co2", name: "Electricity CO₂ Calculator", category: "energy-environment",
    description: "Carbon emissions from electricity consumption.",
    keywords: ["kwh", "co2", "electricity", "carbon", "grid", "emissions", "footprint"],
    icon: "Zap", popularity: 44,
    fields: [
      { key: "energy", label: "Electricity used", def: 1000, min: 0, unit: "kWh" },
      { key: "factor", label: "Grid emission factor", def: 0.4, min: 0, step: 0.01, unit: "kg/kWh", optional: true },
    ],
    formula: "CO₂ = energy × emission factor",
    compute: (v) => {
      const energy = needNonNeg(v.energy, "Energy");
      const factor = Number.isFinite(v.factor) ? Math.max(0, v.factor) : 0.4;
      const kg = energy * factor;
      return [P("CO₂ emitted", `${fmt(kg)} kg`), R("In tonnes", unit(kg / 1000, "t"))];
    },
    examples: [{ label: "1000 kWh at 0.4 kg/kWh", inputs: { energy: 1000, factor: 0.4 }, expect: "400" }],
  },
  {
    id: "water-usage-cost", name: "Water Usage Cost Calculator", category: "energy-environment",
    description: "Monthly and yearly cost of water consumption.",
    keywords: ["water", "usage", "cost", "bill", "gallons", "consumption", "utility"],
    icon: "Droplet", popularity: 42,
    fields: [
      { key: "gallons", label: "Monthly usage", def: 3000, min: 0, unit: "gal" },
      { key: "rate", label: "Water rate", def: 0.005, min: 0, step: 0.001, unit: "$/gal" },
    ],
    compute: (v) => {
      const gal = needNonNeg(v.gallons, "Usage");
      const rate = needNonNeg(v.rate, "Rate");
      const monthly = gal * rate;
      return [P("Monthly cost", money(monthly)), R("Yearly cost", money(monthly * 12)), M("Daily usage", unit(gal / 30, "gal"))];
    },
    examples: [{ label: "3000 gal at $0.005", inputs: { gallons: 3000, rate: 0.005 }, expect: "15.00" }],
  },
  {
    id: "solar-payback", name: "Solar Payback Period Calculator", category: "energy-environment",
    description: "Years for solar savings to repay the system cost.",
    keywords: ["solar", "payback", "period", "roi", "savings", "break even", "investment"],
    icon: "Sun", popularity: 50,
    fields: [
      { key: "cost", label: "System cost", def: 15000, min: 0, unit: "$" },
      { key: "savings", label: "Annual savings", def: 1800, min: 0.01, unit: "$/yr" },
    ],
    formula: "payback = system cost / annual savings",
    compute: (v) => {
      const cost = needNonNeg(v.cost, "System cost");
      const savings = needPos(v.savings, "Annual savings");
      const years = cost / savings;
      return [P("Payback period", `${fmt(years)} years`), R("25-year net savings", money(savings * 25 - cost)), M("Annual savings", money(savings))];
    },
    examples: [{ label: "$15,000 system, $1,800/yr", inputs: { cost: 15000, savings: 1800 }, expect: "8.33" }],
  },
];
