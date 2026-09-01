/**
 * METER · Food & Nutrition (12 tools)
 *
 * Everyday kitchen and diet maths: macro-to-calorie conversion, recipe scaling,
 * label reading (net carbs, glycemic load) and brewing/baking ratios.
 */

import { needPos, needNonNeg, out, P, R, M, Good, Warn, fmt, pct, unit } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

export const CALCULATORS: CalcSpec[] = [
  {
    id: "food-calories", name: "Food Calorie Calculator", category: "food-nutrition",
    description: "Total calories from grams of protein, carbohydrate, fat and alcohol.",
    keywords: ["calories", "macros", "protein", "carbs", "fat", "food", "energy"],
    icon: "Utensils", featured: true, popularity: 76,
    fields: [
      { key: "protein", label: "Protein", def: 30, min: 0, unit: "g" },
      { key: "carbs", label: "Carbohydrate", def: 50, min: 0, unit: "g" },
      { key: "fat", label: "Fat", def: 10, min: 0, unit: "g" },
      { key: "alcohol", label: "Alcohol", def: 0, min: 0, unit: "g", optional: true },
    ],
    formula: "kcal = 4·protein + 4·carbs + 9·fat + 7·alcohol",
    compute: (v) => {
      const p = needNonNeg(v.protein, "Protein");
      const c = needNonNeg(v.carbs, "Carbohydrate");
      const f = needNonNeg(v.fat, "Fat");
      const a = Number.isFinite(v.alcohol) ? Math.max(0, v.alcohol) : 0;
      const kcal = 4 * p + 4 * c + 9 * f + 7 * a;
      return out(
        [
          P("Total calories", `${fmt(kcal)} kcal`),
          R("From protein", `${fmt(4 * p)} kcal`),
          R("From carbs", `${fmt(4 * c)} kcal`),
          R("From fat", `${fmt(9 * f)} kcal`),
        ],
        { bars: [
          { label: "Protein", value: 4 * p, tone: "good" },
          { label: "Carbs", value: 4 * c, tone: "primary" },
          { label: "Fat", value: 9 * f, tone: "warn" },
        ] },
      );
    },
    examples: [{ label: "30 P / 50 C / 10 F", inputs: { protein: 30, carbs: 50, fat: 10, alcohol: 0 }, expect: "410" }],
  },
  {
    id: "recipe-scaler", name: "Recipe Scaler", category: "food-nutrition",
    description: "Scale an ingredient amount from original to desired servings.",
    keywords: ["recipe", "scale", "servings", "ingredient", "cooking", "portions"],
    icon: "Utensils", featured: true, popularity: 68,
    fields: [
      { key: "amount", label: "Ingredient amount", def: 2, min: 0, step: 0.01 },
      { key: "from", label: "Original servings", def: 4, min: 1 },
      { key: "to", label: "Desired servings", def: 6, min: 1 },
    ],
    formula: "scaled = amount × desired / original",
    compute: (v) => {
      const amount = needNonNeg(v.amount, "Amount");
      const from = needPos(v.from, "Original servings");
      const to = needPos(v.to, "Desired servings");
      return [P("Scaled amount", fmt((amount * to) / from)), R("Scale factor", `${fmt(to / from)}×`)];
    },
    examples: [{ label: "2 → from 4 to 6 servings", inputs: { amount: 2, from: 4, to: 6 }, expect: "3" }],
  },
  {
    id: "net-carbs", name: "Net Carbs Calculator", category: "food-nutrition",
    description: "Digestible carbs after subtracting fibre and sugar alcohols.",
    keywords: ["net carbs", "keto", "fibre", "fiber", "sugar alcohol", "low carb"],
    icon: "Utensils", popularity: 58,
    fields: [
      { key: "total", label: "Total carbohydrate", def: 30, min: 0, unit: "g" },
      { key: "fiber", label: "Dietary fibre", def: 10, min: 0, unit: "g" },
      { key: "sugarAlcohol", label: "Sugar alcohols", def: 5, min: 0, unit: "g", optional: true },
    ],
    formula: "net = total − fibre − sugar alcohols",
    compute: (v) => {
      const total = needNonNeg(v.total, "Total carbs");
      const fiber = needNonNeg(v.fiber, "Fibre");
      const sa = Number.isFinite(v.sugarAlcohol) ? Math.max(0, v.sugarAlcohol) : 0;
      const net = Math.max(0, total - fiber - sa);
      return [P("Net carbs", unit(net, "g")), M("Subtracted", unit(fiber + sa, "g"))];
    },
    examples: [{ label: "30 total, 10 fibre, 5 SA", inputs: { total: 30, fiber: 10, sugarAlcohol: 5 }, expect: "15" }],
  },
  {
    id: "glycemic-load", name: "Glycemic Load Calculator", category: "food-nutrition",
    description: "Glycemic load of a food serving from its GI and carbs.",
    keywords: ["glycemic load", "gl", "glycemic index", "gi", "blood sugar", "carbs"],
    icon: "Utensils", popularity: 50,
    fields: [
      { key: "gi", label: "Glycemic index", def: 50, min: 0, max: 200 },
      { key: "carbs", label: "Carbs per serving", def: 30, min: 0, unit: "g" },
    ],
    formula: "GL = GI × carbs / 100",
    compute: (v) => {
      const gi = needNonNeg(v.gi, "Glycemic index");
      const carbs = needNonNeg(v.carbs, "Carbs");
      const gl = (gi * carbs) / 100;
      const cat = gl >= 20 ? "High" : gl >= 11 ? "Medium" : "Low";
      return out([P("Glycemic load", fmt(gl)), (cat === "Low" ? Good : Warn)("Category", cat)], {
        note: "Low ≤ 10, medium 11–19, high ≥ 20 glycemic load per serving.",
      });
    },
    examples: [{ label: "GI 50, 30 g carbs", inputs: { gi: 50, carbs: 30 }, expect: "15" }],
  },
  {
    id: "caffeine-calculator", name: "Caffeine Intake Calculator", category: "food-nutrition",
    description: "Total daily caffeine from your drinks against the safe limit.",
    keywords: ["caffeine", "coffee", "tea", "energy drink", "mg", "limit"],
    icon: "Coffee", featured: true, popularity: 64,
    fields: [
      {
        key: "drink", label: "Drink", kind: "select", def: "95",
        options: [
          { value: "95", label: "Brewed coffee (95 mg)" },
          { value: "63", label: "Espresso shot (63 mg)" },
          { value: "47", label: "Black tea (47 mg)" },
          { value: "80", label: "Energy drink (80 mg)" },
          { value: "34", label: "Cola (34 mg)" },
        ],
      },
      { key: "qty", label: "Servings per day", def: 3, min: 0, step: 1 },
    ],
    compute: (v) => {
      const mg = Number(v.drink) * needNonNeg(v.qty, "Servings");
      const limit = 400;
      const cat = mg <= limit ? "Within safe limit" : "Above the 400 mg limit";
      return out(
        [P("Daily caffeine", unit(mg, "mg")), (mg <= limit ? Good : Warn)("Status", cat), M("Of 400 mg limit", pct((mg / limit) * 100))],
        { note: "Up to 400 mg/day is considered safe for most healthy adults." },
      );
    },
    examples: [{ label: "3 brewed coffees", inputs: { drink: "95", qty: 3 }, expect: "285" }],
  },
  {
    id: "sugar-intake", name: "Sugar Intake Calculator", category: "food-nutrition",
    description: "Convert grams of sugar to teaspoons and compare to daily limits.",
    keywords: ["sugar", "teaspoons", "added sugar", "grams", "diet", "limit"],
    icon: "Utensils", popularity: 52,
    fields: [{ key: "grams", label: "Sugar", def: 50, min: 0, unit: "g" }],
    formula: "teaspoons = grams / 4",
    compute: (v) => {
      const g = needNonNeg(v.grams, "Sugar");
      return [P("Teaspoons", fmt(g / 4)), R("Of 36 g limit (men)", pct((g / 36) * 100)), R("Of 25 g limit (women)", pct((g / 25) * 100))];
    },
    examples: [{ label: "50 g of sugar", inputs: { grams: 50 }, expect: "12.5" }],
  },
  {
    id: "coffee-ratio", name: "Coffee-to-Water Ratio", category: "food-nutrition",
    description: "Grams of coffee for a target water volume at a chosen ratio.",
    keywords: ["coffee", "ratio", "brewing", "water", "grams", "pour over"],
    icon: "Coffee", featured: true, popularity: 60,
    fields: [
      { key: "water", label: "Water", def: 500, min: 0, unit: "mL" },
      { key: "ratio", label: "Ratio (1 : n)", def: 16, min: 1, step: 0.5 },
    ],
    formula: "coffee = water / ratio",
    compute: (v) => {
      const water = needPos(v.water, "Water");
      const ratio = needPos(v.ratio, "Ratio");
      return [P("Coffee needed", unit(water / ratio, "g")), M("Strength", `1 : ${fmt(ratio)} coffee to water`)];
    },
    examples: [{ label: "500 mL at 1:16", inputs: { water: 500, ratio: 16 }, expect: "31.25" }],
  },
  {
    id: "alcohol-calories", name: "Alcohol Calorie Calculator", category: "food-nutrition",
    description: "Calories in an alcoholic drink from its volume and ABV.",
    keywords: ["alcohol", "calories", "abv", "beer", "wine", "drink"],
    icon: "Wine", popularity: 48,
    fields: [
      { key: "volume", label: "Drink volume", def: 355, min: 0, unit: "mL" },
      { key: "abv", label: "Alcohol by volume", def: 5, min: 0, max: 100, unit: "%" },
    ],
    formula: "kcal = volume × ABV × 0.789 × 7",
    compute: (v) => {
      const vol = needNonNeg(v.volume, "Volume");
      const abv = needNonNeg(v.abv, "ABV") / 100;
      const grams = vol * abv * 0.789;
      return [P("Calories", `${fmt(grams * 7)} kcal`), R("Pure alcohol", unit(grams, "g"))];
    },
    examples: [{ label: "355 mL at 5% ABV", inputs: { volume: 355, abv: 5 }, expect: "98" }],
  },
  {
    id: "daily-fiber", name: "Daily Fibre Needs", category: "food-nutrition",
    description: "Recommended daily fibre from your calorie intake.",
    keywords: ["fibre", "fiber", "daily", "nutrition", "gut health", "diet"],
    icon: "Utensils", popularity: 44,
    fields: [{ key: "calories", label: "Daily calories", def: 2000, min: 0, unit: "kcal" }],
    formula: "fibre ≈ 14 g per 1,000 kcal",
    compute: (v) => {
      const cal = needPos(v.calories, "Calories");
      return [P("Daily fibre", unit((14 * cal) / 1000, "g")), M("Guideline", "14 g per 1,000 kcal")];
    },
    examples: [{ label: "2000 kcal diet", inputs: { calories: 2000 }, expect: "28" }],
  },
  {
    id: "meat-cooking-time", name: "Meat Cooking Time", category: "food-nutrition",
    description: "Roasting time from weight and a per-pound cooking rate.",
    keywords: ["cooking time", "roast", "meat", "turkey", "oven", "minutes per pound"],
    icon: "Utensils", popularity: 46,
    fields: [
      {
        key: "rate", label: "Meat & doneness", kind: "select", def: "20",
        options: [
          { value: "15", label: "Turkey (15 min/lb)" },
          { value: "20", label: "Beef, medium (20 min/lb)" },
          { value: "25", label: "Pork (25 min/lb)" },
          { value: "20b", label: "Whole chicken (20 min/lb)" },
        ],
      },
      { key: "weight", label: "Weight", def: 5, min: 0, unit: "lb" },
    ],
    compute: (v) => {
      const rate = parseInt(String(v.rate), 10);
      const minutes = needPos(v.weight, "Weight") * rate;
      const h = Math.floor(minutes / 60);
      const m = Math.round(minutes % 60);
      return [P("Cooking time", `${fmt(minutes)} min`), R("In hours", h ? `${h} h ${m} min` : `${m} min`), M("Rate", `${rate} min per lb`)];
    },
    examples: [{ label: "5 lb beef at 20 min/lb", inputs: { rate: "20", weight: 5 }, expect: "100" }],
  },
  {
    id: "bakers-percentage", name: "Baker's Percentage Calculator", category: "food-nutrition",
    description: "An ingredient's weight as a percentage of the flour weight.",
    keywords: ["bakers percentage", "baking", "hydration", "flour", "bread", "ratio"],
    icon: "Utensils", popularity: 42,
    fields: [
      { key: "flour", label: "Flour weight", def: 500, min: 0, unit: "g" },
      { key: "ingredient", label: "Ingredient weight", def: 350, min: 0, unit: "g" },
    ],
    formula: "% = ingredient / flour × 100",
    compute: (v) => {
      const flour = needPos(v.flour, "Flour");
      const ing = needNonNeg(v.ingredient, "Ingredient");
      return [P("Baker's percentage", pct((ing / flour) * 100)), M("Flour is always", "100%")];
    },
    examples: [{ label: "350 g water to 500 g flour", inputs: { flour: 500, ingredient: 350 }, expect: "70" }],
  },
  {
    id: "calories-per-serving", name: "Calories Per Serving", category: "food-nutrition",
    description: "Divide a recipe's total calories across its servings.",
    keywords: ["calories per serving", "recipe", "portion", "nutrition", "per serving"],
    icon: "Utensils", popularity: 50,
    fields: [
      { key: "total", label: "Total recipe calories", def: 2400, min: 0, unit: "kcal" },
      { key: "servings", label: "Number of servings", def: 6, min: 1 },
    ],
    formula: "per serving = total / servings",
    compute: (v) => {
      const total = needNonNeg(v.total, "Total calories");
      const servings = needPos(v.servings, "Servings");
      return [P("Per serving", `${fmt(total / servings)} kcal`), M("Servings", `${fmt(servings)}`)];
    },
    examples: [{ label: "2400 kcal over 6 servings", inputs: { total: 2400, servings: 6 }, expect: "400" }],
  },
];
