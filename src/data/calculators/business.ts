/**
 * METER · Business (14 tools)
 *
 * Small-business and marketing maths: margins and markup, break-even, ROI,
 * unit economics (CAC, LTV, conversion, churn) and everyday fees (payment
 * processing, commission). Percentages are shown as "NN%" for quick reading.
 */

import { needPos, needNonNeg, fail, out, P, R, M, fmt, money } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

export const CALCULATORS: CalcSpec[] = [
  {
    id: "profit-margin", name: "Profit Margin Calculator", category: "business",
    description: "Gross margin and markup from revenue and cost.",
    keywords: ["profit margin", "gross margin", "markup", "revenue", "cost", "profit"],
    icon: "TrendingUp", featured: true, popularity: 76,
    fields: [
      { key: "revenue", label: "Revenue (selling price)", def: 100, min: 0, unit: "$" },
      { key: "cost", label: "Cost", def: 60, min: 0, unit: "$" },
    ],
    formula: "margin = (revenue − cost) / revenue × 100",
    compute: (v) => {
      const rev = needNonNeg(v.revenue, "Revenue");
      const cost = needNonNeg(v.cost, "Cost");
      const profit = rev - cost;
      return [
        P("Gross margin", `${fmt(rev ? (profit / rev) * 100 : 0)}%`),
        R("Markup", `${fmt(cost ? (profit / cost) * 100 : 0)}%`),
        R("Profit", money(profit)),
      ];
    },
    examples: [{ label: "$100 revenue, $60 cost", inputs: { revenue: 100, cost: 60 }, expect: "40" }],
  },
  {
    id: "break-even-point", name: "Break-Even Point Calculator", category: "business",
    description: "Units you must sell to cover your fixed costs.",
    keywords: ["break even", "units", "fixed costs", "contribution margin", "profit"],
    icon: "Scale", featured: true, popularity: 68,
    fields: [
      { key: "fixed", label: "Fixed costs", def: 10000, min: 0, unit: "$" },
      { key: "price", label: "Price per unit", def: 50, min: 0, unit: "$" },
      { key: "variable", label: "Variable cost per unit", def: 30, min: 0, unit: "$" },
    ],
    formula: "break-even units = fixed costs / (price − variable cost)",
    compute: (v) => {
      const fixed = needNonNeg(v.fixed, "Fixed costs");
      const price = needNonNeg(v.price, "Price");
      const variable = needNonNeg(v.variable, "Variable cost");
      const cm = price - variable;
      if (cm <= 0) fail("Price must be greater than the variable cost per unit.");
      const units = fixed / cm;
      return out(
        [P("Break-even units", fmt(units)), R("Break-even revenue", money(units * price)), M("Contribution margin", money(cm))],
        { note: "Every unit past break-even contributes its full margin to profit." },
      );
    },
    examples: [{ label: "$10k fixed, $50 price, $30 variable", inputs: { fixed: 10000, price: 50, variable: 30 }, expect: "500" }],
  },
  {
    id: "markup-calculator", name: "Markup Calculator", category: "business",
    description: "Selling price from cost and a markup percentage.",
    keywords: ["markup", "selling price", "cost plus", "pricing", "retail", "margin"],
    icon: "Tag", popularity: 62,
    fields: [
      { key: "cost", label: "Cost", def: 60, min: 0, unit: "$" },
      { key: "markup", label: "Markup", def: 50, min: 0, unit: "%" },
    ],
    formula: "price = cost × (1 + markup / 100)",
    compute: (v) => {
      const cost = needNonNeg(v.cost, "Cost");
      const markup = needNonNeg(v.markup, "Markup") / 100;
      const price = cost * (1 + markup);
      return [P("Selling price", money(price)), R("Profit", money(price - cost)), M("Gross margin", `${fmt(price ? ((price - cost) / price) * 100 : 0)}%`)];
    },
    examples: [{ label: "$60 cost, 50% markup", inputs: { cost: 60, markup: 50 }, expect: "90" }],
  },
  {
    id: "churn-rate", name: "Customer Churn Rate Calculator", category: "business",
    description: "Share of customers lost over a period, and the retention rate.",
    keywords: ["churn rate", "attrition", "retention", "customers lost", "saas", "subscription"],
    icon: "UserMinus", featured: true, popularity: 56,
    fields: [
      { key: "start", label: "Customers at start", def: 500, min: 1, step: 1 },
      { key: "lost", label: "Customers lost", def: 25, min: 0, step: 1 },
    ],
    formula: "churn = customers lost / customers at start × 100",
    compute: (v) => {
      const start = needPos(v.start, "Customers at start");
      const lost = needNonNeg(v.lost, "Customers lost");
      if (lost > start) fail("Customers lost cannot exceed customers at the start.");
      const churn = (lost / start) * 100;
      return [
        P("Churn rate", `${fmt(churn)}%`),
        R("Retention rate", `${fmt(100 - churn)}%`),
        R("Customers retained", fmt(start - lost)),
        M("Customers lost", fmt(lost)),
      ];
    },
    examples: [{ label: "25 of 500 lost", inputs: { start: 500, lost: 25 }, expect: "5" }],
  },
  {
    id: "business-roi", name: "Return on Investment (ROI)", category: "business",
    description: "ROI and net profit from an investment and its return.",
    keywords: ["roi", "return on investment", "profit", "gain", "investment", "yield"],
    icon: "TrendingUp", popularity: 66,
    fields: [
      { key: "cost", label: "Investment cost", def: 10000, min: 0.01, unit: "$" },
      { key: "return", label: "Total return", def: 15000, min: 0, unit: "$" },
    ],
    formula: "ROI = (return − cost) / cost × 100",
    compute: (v) => {
      const cost = needPos(v.cost, "Investment cost");
      const ret = needNonNeg(v.return, "Return");
      const profit = ret - cost;
      return [P("ROI", `${fmt((profit / cost) * 100)}%`), R("Net profit", money(profit)), M("Return multiple", `${fmt(ret / cost)}×`)];
    },
    examples: [{ label: "$10k in, $15k out", inputs: { cost: 10000, return: 15000 }, expect: "50" }],
  },
  {
    id: "customer-acquisition-cost", name: "Customer Acquisition Cost (CAC)", category: "business",
    description: "Average cost to acquire one customer.",
    keywords: ["cac", "customer acquisition cost", "marketing", "sales", "spend", "unit economics"],
    icon: "UserPlus", popularity: 56,
    fields: [
      { key: "spend", label: "Sales & marketing spend", def: 5000, min: 0, unit: "$" },
      { key: "customers", label: "New customers acquired", def: 100, min: 1, step: 1 },
    ],
    formula: "CAC = spend / new customers",
    compute: (v) => {
      const spend = needNonNeg(v.spend, "Spend");
      const customers = needPos(v.customers, "Customers");
      return [P("Cost per customer", money(spend / customers)), M("Customers acquired", fmt(customers))];
    },
    examples: [{ label: "$5,000 for 100 customers", inputs: { spend: 5000, customers: 100 }, expect: "50.00" }],
  },
  {
    id: "customer-lifetime-value", name: "Customer Lifetime Value (LTV)", category: "business",
    description: "Total revenue expected from an average customer.",
    keywords: ["ltv", "clv", "lifetime value", "retention", "revenue", "unit economics"],
    icon: "Users", popularity: 54,
    fields: [
      { key: "avgPurchase", label: "Average purchase value", def: 50, min: 0, unit: "$" },
      { key: "frequency", label: "Purchases per year", def: 4, min: 0 },
      { key: "lifespan", label: "Customer lifespan", def: 3, min: 0, unit: "yr" },
    ],
    formula: "LTV = avg purchase × frequency × lifespan",
    compute: (v) => {
      const avg = needNonNeg(v.avgPurchase, "Average purchase");
      const freq = needNonNeg(v.frequency, "Frequency");
      const years = needNonNeg(v.lifespan, "Lifespan");
      return [P("Lifetime value", money(avg * freq * years)), R("Annual value", money(avg * freq)), M("Lifespan", `${fmt(years)} years`)];
    },
    examples: [{ label: "$50 × 4/yr × 3 yr", inputs: { avgPurchase: 50, frequency: 4, lifespan: 3 }, expect: "600" }],
  },
  {
    id: "conversion-rate", name: "Conversion Rate Calculator", category: "business",
    description: "Conversion rate from visitors and conversions.",
    keywords: ["conversion rate", "cvr", "visitors", "leads", "sales funnel", "marketing"],
    icon: "Filter", featured: true, popularity: 60,
    fields: [
      { key: "conversions", label: "Conversions", def: 50, min: 0, step: 1 },
      { key: "visitors", label: "Total visitors", def: 1000, min: 1, step: 1 },
    ],
    formula: "rate = conversions / visitors × 100",
    compute: (v) => {
      const conv = needNonNeg(v.conversions, "Conversions");
      const visitors = needPos(v.visitors, "Visitors");
      const rate = (conv / visitors) * 100;
      return [P("Conversion rate", `${fmt(rate)}%`), M("Roughly", rate > 0 ? `1 in ${fmt(visitors / conv)}` : "no conversions")];
    },
    examples: [{ label: "50 of 1,000 visitors", inputs: { conversions: 50, visitors: 1000 }, expect: "5" }],
  },
  {
    id: "inventory-turnover", name: "Inventory Turnover Calculator", category: "business",
    description: "How many times inventory sells through in a year.",
    keywords: ["inventory turnover", "cogs", "stock", "days inventory", "retail", "supply"],
    icon: "Package", popularity: 48,
    fields: [
      { key: "cogs", label: "Cost of goods sold (year)", def: 500000, min: 0, unit: "$" },
      { key: "inventory", label: "Average inventory", def: 100000, min: 0.01, unit: "$" },
    ],
    formula: "turnover = COGS / average inventory",
    compute: (v) => {
      const cogs = needNonNeg(v.cogs, "COGS");
      const inv = needPos(v.inventory, "Average inventory");
      const turns = cogs / inv;
      return [P("Inventory turnover", `${fmt(turns)}×`), R("Days on hand", turns > 0 ? `${fmt(365 / turns)} days` : "—")];
    },
    examples: [{ label: "$500k COGS, $100k stock", inputs: { cogs: 500000, inventory: 100000 }, expect: "5" }],
  },
  {
    id: "payment-processing-fee", name: "Payment Processing Fee Calculator", category: "business",
    description: "Processor fee and net amount from a transaction.",
    keywords: ["processing fee", "stripe", "paypal", "transaction", "net", "card fee"],
    icon: "CreditCard", popularity: 52,
    fields: [
      { key: "amount", label: "Transaction amount", def: 100, min: 0, unit: "$" },
      { key: "percent", label: "Percentage fee", def: 2.9, min: 0, step: 0.1, unit: "%" },
      { key: "fixed", label: "Fixed fee", def: 0.3, min: 0, step: 0.01, unit: "$" },
    ],
    formula: "fee = amount × percent / 100 + fixed",
    compute: (v) => {
      const amount = needNonNeg(v.amount, "Amount");
      const pctFee = needNonNeg(v.percent, "Percentage fee") / 100;
      const fixed = needNonNeg(v.fixed, "Fixed fee");
      const fee = amount * pctFee + fixed;
      return [P("Processing fee", money(fee)), R("You receive", money(amount - fee)), M("Effective rate", `${fmt(amount ? (fee / amount) * 100 : 0)}%`)];
    },
    examples: [{ label: "$100 at 2.9% + $0.30", inputs: { amount: 100, percent: 2.9, fixed: 0.3 }, expect: "3.20" }],
  },
  {
    id: "freelance-hourly-rate", name: "Freelance Hourly Rate Calculator", category: "business",
    description: "The hourly rate needed to reach a target annual income.",
    keywords: ["freelance", "hourly rate", "contractor", "income", "billable", "consulting"],
    icon: "Briefcase", popularity: 58,
    fields: [
      { key: "income", label: "Target annual income", def: 80000, min: 0, unit: "$" },
      { key: "hours", label: "Billable hours per week", def: 25, min: 0.1, unit: "h" },
      { key: "weeks", label: "Working weeks per year", def: 48, min: 1, max: 52 },
    ],
    formula: "rate = income / (billable hours × weeks)",
    compute: (v) => {
      const income = needNonNeg(v.income, "Income");
      const hours = needPos(v.hours, "Hours");
      const weeks = needPos(v.weeks, "Weeks");
      const billable = hours * weeks;
      return [P("Hourly rate", money(income / billable)), R("Billable hours/year", fmt(billable)), M("Target income", money(income))];
    },
    examples: [{ label: "$80k, 25 h/wk, 48 wks", inputs: { income: 80000, hours: 25, weeks: 48 }, expect: "66.67" }],
  },
  {
    id: "sales-commission", name: "Sales Commission Calculator", category: "business",
    description: "Commission earned on a sale at a given rate.",
    keywords: ["commission", "sales", "rate", "earnings", "payout", "incentive"],
    icon: "BadgeDollarSign", popularity: 50,
    fields: [
      { key: "sale", label: "Sale amount", def: 20000, min: 0, unit: "$" },
      { key: "rate", label: "Commission rate", def: 3, min: 0, step: 0.1, unit: "%" },
      { key: "base", label: "Base salary (per period)", def: 0, min: 0, unit: "$", optional: true },
    ],
    formula: "commission = sale × rate / 100",
    compute: (v) => {
      const sale = needNonNeg(v.sale, "Sale");
      const rate = needNonNeg(v.rate, "Rate") / 100;
      const base = Number.isFinite(v.base) ? Math.max(0, v.base) : 0;
      const commission = sale * rate;
      return [P("Commission", money(commission)), R("Total earnings", money(commission + base)), M("Rate", `${fmt(rate * 100)}%`)];
    },
    examples: [{ label: "$20,000 sale at 3%", inputs: { sale: 20000, rate: 3, base: 0 }, expect: "600" }],
  },
  {
    id: "revenue-growth", name: "Revenue Growth Rate Calculator", category: "business",
    description: "Percentage growth between two periods.",
    keywords: ["revenue growth", "growth rate", "percentage change", "yoy", "increase", "trend"],
    icon: "LineChart", popularity: 54,
    fields: [
      { key: "previous", label: "Previous period", def: 100000, min: 0.01, unit: "$" },
      { key: "current", label: "Current period", def: 125000, min: 0, unit: "$" },
    ],
    formula: "growth = (current − previous) / previous × 100",
    compute: (v) => {
      const prev = needPos(v.previous, "Previous");
      const cur = needNonNeg(v.current, "Current");
      const growth = ((cur - prev) / prev) * 100;
      return [P("Growth rate", `${fmt(growth)}%`), R("Change", money(cur - prev)), M(growth >= 0 ? "Trend" : "Trend", growth >= 0 ? "Growth" : "Decline")];
    },
    examples: [{ label: "$100k → $125k", inputs: { previous: 100000, current: 125000 }, expect: "25" }],
  },
  {
    id: "roas", name: "Return on Ad Spend (ROAS)", category: "business",
    description: "Revenue generated for each unit of currency spent on advertising.",
    keywords: ["roas", "return on ad spend", "advertising", "marketing", "ppc", "campaign"],
    icon: "TrendingUp", popularity: 52,
    fields: [
      { key: "revenue", label: "Revenue from ads", def: 8000, min: 0, unit: "$" },
      { key: "spend", label: "Advertising spend", def: 2000, min: 0.01, unit: "$" },
    ],
    formula: "ROAS = ad revenue / ad spend",
    compute: (v) => {
      const revenue = needNonNeg(v.revenue, "Revenue");
      const spend = needPos(v.spend, "Ad spend");
      const roas = revenue / spend;
      return [P("ROAS", `${fmt(roas)}×`), R("As percentage", `${fmt(roas * 100)}%`), M("Profit from ads", money(revenue - spend))];
    },
    examples: [{ label: "$8,000 from $2,000 spend", inputs: { revenue: 8000, spend: 2000 }, expect: "4" }],
  },
];
