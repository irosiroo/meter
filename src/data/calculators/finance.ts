/**
 * METER · Finance (25 tools)
 *
 * Time-value-of-money calculators. All rates are entered as annual percentages
 * and converted to the appropriate period internally. The amortised-payment
 * formula PMT = P·i / (1 − (1+i)⁻ⁿ) is shared by the loan, mortgage, auto and
 * annuity tools via the local `amort` helper.
 */

import { needPos, needNonNeg, out, P, R, M, Good, Warn, money, fmt, pct } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

const amort = (principal: number, i: number, n: number) =>
  i === 0 ? principal / n : (principal * i) / (1 - Math.pow(1 + i, -n));

const FREQ = [
  { value: "1", label: "Annually" },
  { value: "2", label: "Semi-annually" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
  { value: "365", label: "Daily" },
];

export const CALCULATORS: CalcSpec[] = [
  {
    id: "loan-payment", name: "Loan Payment Calculator", category: "finance",
    description: "Find the monthly payment, total repaid and total interest on any fixed-rate loan.",
    keywords: ["loan", "payment", "monthly", "amortization", "installment", "emi"],
    icon: "Banknote", featured: true, popularity: 94,
    fields: [
      { key: "principal", label: "Loan amount", def: 20000, min: 0, unit: "$" },
      { key: "rate", label: "Annual interest rate", def: 6, min: 0, step: 0.01, unit: "%" },
      { key: "years", label: "Term", def: 5, min: 0, step: 0.5, unit: "years" },
    ],
    formula: "PMT = P · i / (1 − (1 + i)⁻ⁿ),  i = annual rate / 12,  n = months",
    how: "The loan is amortised: each payment covers that month's interest first, and the rest reduces the balance. Early payments are mostly interest; later ones mostly principal.",
    compute: (v) => {
      const p = needPos(v.principal, "Loan amount");
      const r = needNonNeg(v.rate, "Rate");
      const y = needPos(v.years, "Term");
      const i = r / 100 / 12;
      const n = Math.round(y * 12);
      const pay = amort(p, i, n);
      const total = pay * n;
      return out(
        [
          P("Monthly payment", money(pay)),
          R("Number of payments", `${n}`),
          R("Total repaid", money(total)),
          R("Total interest", money(total - p), pct((total - p) / p * 100) + " of principal"),
        ],
        { note: `Over ${fmt(y)} years you repay ${money(total)} on a ${money(p)} loan.` },
      );
    },
    examples: [
      { label: "$20,000 at 6% over 5 years", inputs: { principal: 20000, rate: 6, years: 5 }, expect: "386.6" },
      { label: "$5,000 at 0% over 2 years", inputs: { principal: 5000, rate: 0, years: 2 }, expect: "208" },
    ],
  },
  {
    id: "mortgage-calculator", name: "Mortgage Calculator", category: "finance",
    description: "Estimate a monthly mortgage payment including principal, interest, tax and insurance.",
    keywords: ["mortgage", "home loan", "house", "piti", "property", "monthly payment"],
    icon: "Home", featured: true, popularity: 96,
    fields: [
      { key: "price", label: "Home price", def: 350000, min: 0, unit: "$" },
      { key: "down", label: "Down payment", def: 70000, min: 0, unit: "$" },
      { key: "rate", label: "Interest rate", def: 6.5, min: 0, step: 0.01, unit: "%" },
      { key: "years", label: "Loan term", def: 30, min: 1, unit: "years" },
      { key: "tax", label: "Property tax / yr", def: 0, min: 0, unit: "$", optional: true },
      { key: "ins", label: "Home insurance / yr", def: 0, min: 0, unit: "$", optional: true },
    ],
    formula: "Monthly = P&I + tax/12 + insurance/12",
    compute: (v) => {
      const price = needPos(v.price, "Home price");
      const down = needNonNeg(v.down, "Down payment");
      const loan = price - down;
      if (loan <= 0) return [P("Loan amount", money(0), "Home is fully covered by the down payment")];
      const i = needNonNeg(v.rate, "Rate") / 100 / 12;
      const n = Math.round(needPos(v.years, "Term") * 12);
      const pi = amort(loan, i, n);
      const tax = (Number.isFinite(v.tax) ? v.tax : 0) / 12;
      const ins = (Number.isFinite(v.ins) ? v.ins : 0) / 12;
      const monthly = pi + tax + ins;
      return out(
        [
          P("Monthly payment", money(monthly)),
          R("Loan amount", money(loan), pct(loan / price * 100) + " of price"),
          R("Principal & interest", money(pi)),
          tax ? R("Property tax", money(tax)) : M("Property tax", "—"),
          ins ? R("Insurance", money(ins)) : M("Insurance", "—"),
          R("Total interest", money(pi * n - loan)),
        ],
        { note: `Down payment of ${money(down)} is ${pct(down / price * 100)} of the home price.` },
      );
    },
    examples: [
      { label: "$300k home, $60k down, 6% / 30 yr", inputs: { price: 300000, down: 60000, rate: 6, years: 30 }, expect: "1,438" },
    ],
  },
  {
    id: "compound-interest", name: "Compound Interest Calculator", category: "finance",
    description: "Grow a lump sum with interest compounded annually, monthly or daily.",
    keywords: ["compound", "interest", "growth", "investment", "savings", "apy"],
    icon: "TrendingUp", featured: true, popularity: 93,
    fields: [
      { key: "principal", label: "Starting amount", def: 1000, min: 0, unit: "$" },
      { key: "rate", label: "Annual rate", def: 5, min: 0, step: 0.01, unit: "%" },
      { key: "freq", label: "Compounding", kind: "select", def: "12", options: FREQ },
      { key: "years", label: "Years", def: 10, min: 0, step: 0.5 },
    ],
    formula: "A = P · (1 + r/n)^(n·t)",
    compute: (v) => {
      const p = needPos(v.principal, "Starting amount");
      const r = needNonNeg(v.rate, "Rate") / 100;
      const n = Number(v.freq);
      const t = needNonNeg(v.years, "Years");
      const a = p * Math.pow(1 + r / n, n * t);
      return out(
        [
          P("Future value", money(a)),
          R("Interest earned", money(a - p)),
          R("Total growth", pct((a / p - 1) * 100)),
        ],
        { note: `Compounded ${n === 1 ? "annually" : n === 12 ? "monthly" : n === 365 ? "daily" : n + "×/yr"} for ${fmt(t)} years.` },
      );
    },
    examples: [
      { label: "$1,000 at 10% annually, 10 years", inputs: { principal: 1000, rate: 10, freq: "1", years: 10 }, expect: "2,593" },
    ],
  },
  {
    id: "simple-interest", name: "Simple Interest Calculator", category: "finance",
    description: "Interest that accrues only on the original principal — no compounding.",
    keywords: ["simple interest", "interest", "principal", "loan", "flat rate"],
    icon: "Percent", popularity: 70,
    fields: [
      { key: "principal", label: "Principal", def: 1000, min: 0, unit: "$" },
      { key: "rate", label: "Annual rate", def: 5, min: 0, step: 0.01, unit: "%" },
      { key: "years", label: "Time", def: 3, min: 0, step: 0.25, unit: "years" },
    ],
    formula: "I = P · r · t",
    compute: (v) => {
      const p = needPos(v.principal, "Principal");
      const r = needNonNeg(v.rate, "Rate") / 100;
      const t = needNonNeg(v.years, "Time");
      const interest = p * r * t;
      return [P("Interest", money(interest)), R("Total amount", money(p + interest)), M("Principal", money(p))];
    },
    examples: [{ label: "$1,000 at 5% for 3 years", inputs: { principal: 1000, rate: 5, years: 3 }, expect: "150" }],
  },
  {
    id: "auto-loan", name: "Car Loan Calculator", category: "finance",
    description: "Monthly car payment after down payment and trade-in on a financed vehicle.",
    keywords: ["car", "auto", "vehicle", "loan", "payment", "finance"],
    icon: "Car", popularity: 75,
    fields: [
      { key: "price", label: "Vehicle price", def: 30000, min: 0, unit: "$" },
      { key: "down", label: "Down payment", def: 5000, min: 0, unit: "$" },
      { key: "trade", label: "Trade-in value", def: 0, min: 0, unit: "$", optional: true },
      { key: "rate", label: "Interest rate", def: 7, min: 0, step: 0.01, unit: "%" },
      { key: "years", label: "Term", def: 5, min: 0.5, step: 0.5, unit: "years" },
    ],
    compute: (v) => {
      const price = needPos(v.price, "Vehicle price");
      const loan = price - needNonNeg(v.down, "Down payment") - (Number.isFinite(v.trade) ? v.trade : 0);
      if (loan <= 0) return [P("Amount financed", money(0), "No financing needed")];
      const i = needNonNeg(v.rate, "Rate") / 100 / 12;
      const n = Math.round(needPos(v.years, "Term") * 12);
      const pay = amort(loan, i, n);
      return [
        P("Monthly payment", money(pay)),
        R("Amount financed", money(loan)),
        R("Total of payments", money(pay * n)),
        R("Total interest", money(pay * n - loan)),
      ];
    },
    examples: [{ label: "$30k car, $5k down, 6% / 5 yr", inputs: { price: 30000, down: 5000, rate: 6, years: 5 }, expect: "483" }],
  },
  {
    id: "credit-card-payoff", name: "Credit Card Payoff Calculator", category: "finance",
    description: "How long it takes to clear a card balance at a fixed monthly payment.",
    keywords: ["credit card", "payoff", "debt", "balance", "apr", "minimum payment"],
    icon: "CreditCard", featured: true, popularity: 82,
    fields: [
      { key: "balance", label: "Card balance", def: 5000, min: 0, unit: "$" },
      { key: "apr", label: "APR", def: 20, min: 0, step: 0.01, unit: "%" },
      { key: "payment", label: "Monthly payment", def: 200, min: 0, unit: "$" },
    ],
    compute: (v) => {
      const b = needPos(v.balance, "Balance");
      const i = needNonNeg(v.apr, "APR") / 100 / 12;
      const pmt = needPos(v.payment, "Monthly payment");
      const minInterest = b * i;
      if (pmt <= minInterest) return [Warn("Never paid off", "Payment too low", `Interest is ${money(minInterest)}/mo — raise your payment`)];
      const n = i === 0 ? b / pmt : -Math.log(1 - (i * b) / pmt) / Math.log(1 + i);
      const months = Math.ceil(n);
      const totalPaid = i === 0 ? b : pmt * n;
      return out(
        [
          P("Months to pay off", `${months}`, `≈ ${fmt(months / 12, 1)} years`),
          R("Total paid", money(totalPaid)),
          R("Total interest", money(totalPaid - b)),
        ],
        { note: `Paying ${money(pmt)}/month on a ${money(b)} balance at ${fmt(v.apr)}% APR.` },
      );
    },
    examples: [{ label: "$5,000 at 20% APR, $200/mo", inputs: { balance: 5000, apr: 20, payment: 200 }, expect: "33" }],
  },
  {
    id: "savings-goal", name: "Savings Goal Calculator", category: "finance",
    description: "Monthly deposit needed to reach a target by a certain date.",
    keywords: ["savings", "goal", "target", "deposit", "monthly", "save"],
    icon: "PiggyBank", popularity: 74,
    fields: [
      { key: "goal", label: "Savings goal", def: 10000, min: 0, unit: "$" },
      { key: "current", label: "Current savings", def: 0, min: 0, unit: "$", optional: true },
      { key: "years", label: "Time to goal", def: 5, min: 0.5, step: 0.5, unit: "years" },
      { key: "rate", label: "Annual return", def: 4, min: 0, step: 0.01, unit: "%" },
    ],
    compute: (v) => {
      const goal = needPos(v.goal, "Goal");
      const pv = Number.isFinite(v.current) ? v.current : 0;
      const i = needNonNeg(v.rate, "Return") / 100 / 12;
      const nMonths = Math.round(needPos(v.years, "Time") * 12);
      const grownPv = pv * Math.pow(1 + i, nMonths);
      const need = goal - grownPv;
      if (need <= 0) return [Good("Goal already met", money(pv), "Your current savings will grow past the goal")];
      const pmt = i === 0 ? need / nMonths : (need * i) / (Math.pow(1 + i, nMonths) - 1);
      return out(
        [
          P("Monthly deposit", money(pmt)),
          R("Total deposited", money(pmt * nMonths + pv)),
          R("Interest earned", money(goal - pmt * nMonths - pv)),
        ],
        { note: `Reach ${money(goal)} in ${fmt(v.years)} years.` },
      );
    },
    examples: [{ label: "$10,000 in 5 years, 0% return", inputs: { goal: 10000, current: 0, years: 5, rate: 0 }, expect: "166.6" }],
  },
  {
    id: "retirement-savings", name: "Retirement Savings Calculator", category: "finance",
    description: "Project your nest egg at retirement from current savings and monthly contributions.",
    keywords: ["retirement", "401k", "nest egg", "pension", "savings", "future value"],
    icon: "Landmark", popularity: 80,
    fields: [
      { key: "age", label: "Current age", def: 30, min: 0, max: 100 },
      { key: "retire", label: "Retirement age", def: 65, min: 1, max: 110 },
      { key: "current", label: "Current savings", def: 20000, min: 0, unit: "$" },
      { key: "monthly", label: "Monthly contribution", def: 500, min: 0, unit: "$" },
      { key: "rate", label: "Annual return", def: 7, min: 0, step: 0.01, unit: "%" },
    ],
    compute: (v) => {
      const age = needNonNeg(v.age, "Age");
      const retire = needPos(v.retire, "Retirement age");
      if (retire <= age) return [Warn("Check ages", "—", "Retirement age must be greater than current age")];
      const pv = needNonNeg(v.current, "Current savings");
      const pmt = needNonNeg(v.monthly, "Contribution");
      const i = needNonNeg(v.rate, "Return") / 100 / 12;
      const n = Math.round((retire - age) * 12);
      const fv = pv * Math.pow(1 + i, n) + (i === 0 ? pmt * n : pmt * ((Math.pow(1 + i, n) - 1) / i));
      const contributed = pv + pmt * n;
      return out(
        [
          P("Balance at retirement", money(fv)),
          R("You contribute", money(contributed)),
          R("Investment growth", money(fv - contributed)),
          R("Years of saving", `${fmt(retire - age)}`),
        ],
        { note: `Assuming a ${fmt(v.rate)}% average annual return, compounded monthly.` },
      );
    },
    examples: [{ label: "1 year, $100/mo, 0% return", inputs: { age: 30, retire: 31, current: 0, monthly: 100, rate: 0 }, expect: "1,200" }],
  },
  {
    id: "roi-calculator", name: "ROI Calculator", category: "finance",
    description: "Return on investment as a percentage of the amount invested.",
    keywords: ["roi", "return", "investment", "profit", "gain", "yield"],
    icon: "TrendingUp", popularity: 78,
    fields: [
      { key: "initial", label: "Amount invested", def: 1000, min: 0, unit: "$" },
      { key: "final", label: "Final value", def: 1500, min: 0, unit: "$" },
    ],
    formula: "ROI = (final − initial) / initial × 100",
    compute: (v) => {
      const init = needPos(v.initial, "Amount invested");
      const fin = needNonNeg(v.final, "Final value");
      const gain = fin - init;
      const roi = (gain / init) * 100;
      return [
        P("ROI", pct(roi), gain >= 0 ? "profit" : "loss"),
        (gain >= 0 ? Good : Warn)("Net gain", money(gain)),
      ];
    },
    examples: [{ label: "$1,000 → $1,500", inputs: { initial: 1000, final: 1500 }, expect: "50" }],
  },
  {
    id: "future-value", name: "Future Value Calculator", category: "finance",
    description: "What a sum invested today will be worth after compound growth.",
    keywords: ["future value", "fv", "investment", "growth", "compound"],
    icon: "TrendingUp", popularity: 66,
    fields: [
      { key: "pv", label: "Present value", def: 1000, min: 0, unit: "$" },
      { key: "rate", label: "Annual rate", def: 5, min: 0, step: 0.01, unit: "%" },
      { key: "years", label: "Years", def: 10, min: 0, step: 0.5 },
    ],
    formula: "FV = PV · (1 + r)^t",
    compute: (v) => {
      const pv = needPos(v.pv, "Present value");
      const r = needNonNeg(v.rate, "Rate") / 100;
      const t = needNonNeg(v.years, "Years");
      const fv = pv * Math.pow(1 + r, t);
      return [P("Future value", money(fv)), R("Total growth", money(fv - pv)), M("Present value", money(pv))];
    },
    examples: [{ label: "$1,000 at 10% for 10 years", inputs: { pv: 1000, rate: 10, years: 10 }, expect: "2,593" }],
  },
  {
    id: "present-value", name: "Present Value Calculator", category: "finance",
    description: "Today's worth of a future sum, discounted at a given rate.",
    keywords: ["present value", "pv", "discount", "npv", "time value"],
    icon: "TrendingDown", popularity: 60,
    fields: [
      { key: "fv", label: "Future value", def: 1100, min: 0, unit: "$" },
      { key: "rate", label: "Discount rate", def: 10, min: 0, step: 0.01, unit: "%" },
      { key: "years", label: "Years", def: 1, min: 0, step: 0.5 },
    ],
    formula: "PV = FV / (1 + r)^t",
    compute: (v) => {
      const fv = needPos(v.fv, "Future value");
      const r = needNonNeg(v.rate, "Rate") / 100;
      const t = needNonNeg(v.years, "Years");
      const pv = fv / Math.pow(1 + r, t);
      return [P("Present value", money(pv)), R("Discount", money(fv - pv)), M("Future value", money(fv))];
    },
    examples: [{ label: "$1,100 in 1 year at 10%", inputs: { fv: 1100, rate: 10, years: 1 }, expect: "1,000" }],
  },
  {
    id: "annuity-payout", name: "Annuity Payout Calculator", category: "finance",
    description: "Level monthly income a lump sum can provide over a fixed number of years.",
    keywords: ["annuity", "payout", "income", "drawdown", "pension", "withdrawal"],
    icon: "Coins", popularity: 58,
    fields: [
      { key: "principal", label: "Starting balance", def: 100000, min: 0, unit: "$" },
      { key: "rate", label: "Annual return", def: 5, min: 0, step: 0.01, unit: "%" },
      { key: "years", label: "Payout period", def: 20, min: 0.5, step: 0.5, unit: "years" },
    ],
    compute: (v) => {
      const p = needPos(v.principal, "Balance");
      const i = needNonNeg(v.rate, "Return") / 100 / 12;
      const n = Math.round(needPos(v.years, "Period") * 12);
      const pay = amort(p, i, n);
      return [
        P("Monthly payout", money(pay)),
        R("Total received", money(pay * n)),
        R("Interest portion", money(pay * n - p)),
      ];
    },
    examples: [{ label: "$100k at 6% over 10 years", inputs: { principal: 100000, rate: 6, years: 10 }, expect: "1,110" }],
  },
  {
    id: "apr-to-apy", name: "APR to APY Converter", category: "finance",
    description: "Convert a nominal APR into the effective annual yield (APY) it produces.",
    keywords: ["apr", "apy", "effective rate", "nominal", "yield", "interest"],
    icon: "Percent", popularity: 54,
    fields: [
      { key: "apr", label: "APR (nominal)", def: 12, min: 0, step: 0.01, unit: "%" },
      { key: "freq", label: "Compounding", kind: "select", def: "12", options: FREQ },
    ],
    formula: "APY = (1 + APR/n)^n − 1",
    compute: (v) => {
      const apr = needNonNeg(v.apr, "APR") / 100;
      const n = Number(v.freq);
      const apy = Math.pow(1 + apr / n, n) - 1;
      return [P("APY (effective)", pct(apy * 100)), M("APR (nominal)", pct(apr * 100)), R("Extra from compounding", pct((apy - apr) * 100))];
    },
    examples: [{ label: "12% APR compounded monthly", inputs: { apr: 12, freq: "12" }, expect: "12.68" }],
  },
  {
    id: "inflation-calculator", name: "Inflation Calculator", category: "finance",
    description: "How inflation changes prices and erodes purchasing power over time.",
    keywords: ["inflation", "purchasing power", "cost of living", "cpi", "real value"],
    icon: "TrendingUp", popularity: 62,
    fields: [
      { key: "amount", label: "Amount today", def: 1000, min: 0, unit: "$" },
      { key: "rate", label: "Inflation rate", def: 3, min: 0, step: 0.01, unit: "%" },
      { key: "years", label: "Years", def: 10, min: 0, step: 0.5 },
    ],
    compute: (v) => {
      const a = needPos(v.amount, "Amount");
      const r = needNonNeg(v.rate, "Rate") / 100;
      const t = needNonNeg(v.years, "Years");
      const future = a * Math.pow(1 + r, t);
      const power = a / Math.pow(1 + r, t);
      return out(
        [
          P("Cost in the future", money(future), `what ${money(a)} of goods will cost`),
          R("Future buying power of today's money", money(power)),
        ],
        { note: `At ${fmt(v.rate)}% inflation, prices ${fmt(future / a, 2)}× over ${fmt(t)} years.` },
      );
    },
    examples: [{ label: "$1,000 at 3% for 10 years", inputs: { amount: 1000, rate: 3, years: 10 }, expect: "1,343" }],
  },
  {
    id: "tip-calculator", name: "Tip Calculator", category: "finance",
    description: "Add a gratuity to a bill and split the total between any number of people.",
    keywords: ["tip", "gratuity", "restaurant", "bill", "split", "service"],
    icon: "Receipt", featured: true, popularity: 88,
    fields: [
      { key: "bill", label: "Bill amount", def: 50, min: 0, unit: "$" },
      { key: "tip", label: "Tip", def: 18, min: 0, step: 0.5, unit: "%" },
      { key: "people", label: "Split between", def: 1, min: 1, step: 1, unit: "people" },
    ],
    compute: (v) => {
      const bill = needPos(v.bill, "Bill");
      const tipPct = needNonNeg(v.tip, "Tip");
      const people = Math.max(1, Math.round(needPos(v.people, "People")));
      const tip = (bill * tipPct) / 100;
      const total = bill + tip;
      return [
        P("Total to pay", money(total)),
        R("Tip amount", money(tip)),
        people > 1 ? R("Each person pays", money(total / people)) : M("Split", "1 person"),
      ];
    },
    examples: [{ label: "$50 bill, 20% tip, 2 people", inputs: { bill: 50, tip: 20, people: 2 }, expect: "60" }],
  },
  {
    id: "discount-calculator", name: "Discount Calculator", category: "finance",
    description: "Final price and savings after a percentage discount.",
    keywords: ["discount", "sale", "percent off", "savings", "markdown", "price"],
    icon: "Percent", popularity: 84,
    fields: [
      { key: "price", label: "Original price", def: 100, min: 0, unit: "$" },
      { key: "discount", label: "Discount", def: 25, min: 0, max: 100, step: 0.5, unit: "%" },
    ],
    compute: (v) => {
      const price = needPos(v.price, "Price");
      const d = needNonNeg(v.discount, "Discount");
      const savings = (price * d) / 100;
      return [P("Final price", money(price - savings)), Good("You save", money(savings)), M("Original price", money(price))];
    },
    examples: [{ label: "$100 at 25% off", inputs: { price: 100, discount: 25 }, expect: "75" }],
  },
  {
    id: "sales-tax", name: "Sales Tax Calculator", category: "finance",
    description: "Add sales tax to a price and see the tax amount and grand total.",
    keywords: ["sales tax", "vat", "gst", "tax", "total", "price"],
    icon: "Receipt", popularity: 72,
    fields: [
      { key: "amount", label: "Pre-tax amount", def: 100, min: 0, unit: "$" },
      { key: "rate", label: "Tax rate", def: 8, min: 0, step: 0.01, unit: "%" },
    ],
    compute: (v) => {
      const a = needPos(v.amount, "Amount");
      const r = needNonNeg(v.rate, "Rate");
      const tax = (a * r) / 100;
      return [P("Total with tax", money(a + tax)), R("Tax amount", money(tax)), M("Pre-tax", money(a))];
    },
    examples: [{ label: "$100 at 8% tax", inputs: { amount: 100, rate: 8 }, expect: "108" }],
  },
  {
    id: "down-payment", name: "Down Payment Calculator", category: "finance",
    description: "Down payment amount and remaining loan from a purchase price and percentage.",
    keywords: ["down payment", "deposit", "home", "percent down", "loan"],
    icon: "Home", popularity: 64,
    fields: [
      { key: "price", label: "Purchase price", def: 300000, min: 0, unit: "$" },
      { key: "pct", label: "Down payment", def: 20, min: 0, max: 100, step: 0.5, unit: "%" },
    ],
    compute: (v) => {
      const price = needPos(v.price, "Price");
      const dp = needNonNeg(v.pct, "Down payment %");
      const down = (price * dp) / 100;
      return [P("Down payment", money(down)), R("Loan amount", money(price - down)), M("Purchase price", money(price))];
    },
    examples: [{ label: "20% of $300,000", inputs: { price: 300000, pct: 20 }, expect: "60,000" }],
  },
  {
    id: "debt-to-income", name: "Debt-to-Income Ratio", category: "finance",
    description: "The share of gross monthly income that goes to debt payments.",
    keywords: ["dti", "debt to income", "ratio", "mortgage qualify", "lending"],
    icon: "Scale", popularity: 56,
    fields: [
      { key: "debt", label: "Monthly debt payments", def: 1500, min: 0, unit: "$" },
      { key: "income", label: "Gross monthly income", def: 5000, min: 0, unit: "$" },
    ],
    formula: "DTI = monthly debt / gross monthly income × 100",
    compute: (v) => {
      const debt = needNonNeg(v.debt, "Debt");
      const income = needPos(v.income, "Income");
      const dti = (debt / income) * 100;
      const tone = dti <= 36 ? Good : dti <= 43 ? Warn : Warn;
      return [
        P("DTI ratio", pct(dti)),
        tone("Lender view", dti <= 36 ? "Healthy" : dti <= 43 ? "Acceptable" : "High", "≤36% is ideal, ≤43% often the limit"),
      ];
    },
    examples: [{ label: "$1,500 debt on $5,000 income", inputs: { debt: 1500, income: 5000 }, expect: "30" }],
  },
  {
    id: "break-even-revenue", name: "Break-Even Calculator", category: "finance",
    description: "Units and revenue needed to cover fixed and variable costs.",
    keywords: ["break even", "breakeven", "fixed cost", "variable cost", "margin", "units"],
    icon: "Target", popularity: 60,
    fields: [
      { key: "fixed", label: "Fixed costs", def: 10000, min: 0, unit: "$" },
      { key: "price", label: "Price per unit", def: 50, min: 0, unit: "$" },
      { key: "variable", label: "Variable cost per unit", def: 30, min: 0, unit: "$" },
    ],
    formula: "Break-even units = fixed costs / (price − variable cost)",
    compute: (v) => {
      const fixed = needPos(v.fixed, "Fixed costs");
      const price = needPos(v.price, "Price");
      const variable = needNonNeg(v.variable, "Variable cost");
      const margin = price - variable;
      if (margin <= 0) return [Warn("No break-even", "—", "Price must exceed variable cost per unit")];
      const units = fixed / margin;
      return out(
        [
          P("Break-even units", fmt(Math.ceil(units))),
          R("Break-even revenue", money(Math.ceil(units) * price)),
          R("Contribution margin", money(margin), pct(margin / price * 100) + " per unit"),
        ],
        { note: `Each unit contributes ${money(margin)} toward the ${money(fixed)} of fixed costs.` },
      );
    },
    examples: [{ label: "$10k fixed, $50 price, $30 variable", inputs: { fixed: 10000, price: 50, variable: 30 }, expect: "500" }],
  },
  {
    id: "net-worth", name: "Net Worth Calculator", category: "finance",
    description: "Total assets minus total liabilities — a snapshot of financial health.",
    keywords: ["net worth", "assets", "liabilities", "wealth", "balance sheet"],
    icon: "Landmark", popularity: 68,
    fields: [
      { key: "assets", label: "Total assets", def: 250000, min: 0, unit: "$" },
      { key: "liabilities", label: "Total liabilities", def: 100000, min: 0, unit: "$" },
    ],
    compute: (v) => {
      const a = needNonNeg(v.assets, "Assets");
      const l = needNonNeg(v.liabilities, "Liabilities");
      const nw = a - l;
      return [
        (nw >= 0 ? Good : Warn)("Net worth", money(nw)),
        R("Total assets", money(a)),
        R("Total liabilities", money(l)),
      ];
    },
    examples: [{ label: "$250k assets, $100k debt", inputs: { assets: 250000, liabilities: 100000 }, expect: "150,000" }],
  },
  {
    id: "salary-to-hourly", name: "Salary to Hourly Calculator", category: "finance",
    description: "Convert an annual salary to hourly, weekly and monthly pay.",
    keywords: ["salary", "hourly", "wage", "annual", "pay", "income"],
    icon: "Briefcase", popularity: 76,
    fields: [
      { key: "salary", label: "Annual salary", def: 52000, min: 0, unit: "$" },
      { key: "hours", label: "Hours per week", def: 40, min: 1, max: 168 },
      { key: "weeks", label: "Weeks per year", def: 52, min: 1, max: 52 },
    ],
    compute: (v) => {
      const salary = needPos(v.salary, "Salary");
      const hours = needPos(v.hours, "Hours");
      const weeks = needPos(v.weeks, "Weeks");
      const hourly = salary / (hours * weeks);
      return [
        P("Hourly rate", money(hourly)),
        R("Weekly pay", money(salary / weeks)),
        R("Monthly pay", money(salary / 12)),
      ];
    },
    examples: [{ label: "$52,000 at 40 h × 52 wk", inputs: { salary: 52000, hours: 40, weeks: 52 }, expect: "25" }],
  },
  {
    id: "cagr-calculator", name: "CAGR Calculator", category: "finance",
    description: "Compound annual growth rate between a starting and ending value.",
    keywords: ["cagr", "growth rate", "annualized", "return", "investment"],
    icon: "LineChart", popularity: 64,
    fields: [
      { key: "begin", label: "Beginning value", def: 1000, min: 0, unit: "$" },
      { key: "end", label: "Ending value", def: 2000, min: 0, unit: "$" },
      { key: "years", label: "Years", def: 10, min: 0.5, step: 0.5 },
    ],
    formula: "CAGR = (end / begin)^(1/years) − 1",
    compute: (v) => {
      const b = needPos(v.begin, "Beginning value");
      const e = needPos(v.end, "Ending value");
      const y = needPos(v.years, "Years");
      const cagr = (Math.pow(e / b, 1 / y) - 1) * 100;
      return [P("CAGR", pct(cagr)), R("Total return", pct((e / b - 1) * 100)), M("Over", `${fmt(y)} years`)];
    },
    examples: [{ label: "$1,000 → $2,000 in 10 years", inputs: { begin: 1000, end: 2000, years: 10 }, expect: "7.18" }],
  },
  {
    id: "rule-of-72", name: "Rule of 72 Calculator", category: "finance",
    description: "Estimate how many years it takes an investment to double.",
    keywords: ["rule of 72", "double", "doubling time", "interest", "growth"],
    icon: "Repeat", popularity: 58,
    fields: [{ key: "rate", label: "Annual return rate", def: 8, min: 0.1, step: 0.1, unit: "%" }],
    formula: "Years to double ≈ 72 / rate",
    compute: (v) => {
      const r = needPos(v.rate, "Rate");
      const exact = Math.log(2) / Math.log(1 + r / 100);
      return out(
        [
          P("Years to double", fmt(72 / r, 1), "Rule of 72 estimate"),
          R("Rule of 70", fmt(70 / r, 1)),
          R("Exact doubling time", fmt(exact, 2) + " years"),
        ],
        { note: "The rule of 72 is a quick mental approximation of exact compound doubling time." },
      );
    },
    examples: [{ label: "8% annual return", inputs: { rate: 8 }, expect: "9" }],
  },
  {
    id: "refinance-savings", name: "Refinance Savings Calculator", category: "finance",
    description: "Monthly savings and break-even point when refinancing a loan.",
    keywords: ["refinance", "refi", "savings", "break even", "mortgage", "closing costs"],
    icon: "Repeat", popularity: 52,
    fields: [
      { key: "current", label: "Current monthly payment", def: 1500, min: 0, unit: "$" },
      { key: "next", label: "New monthly payment", def: 1300, min: 0, unit: "$" },
      { key: "costs", label: "Closing costs", def: 4000, min: 0, unit: "$" },
    ],
    compute: (v) => {
      const cur = needPos(v.current, "Current payment");
      const nxt = needNonNeg(v.next, "New payment");
      const costs = needNonNeg(v.costs, "Closing costs");
      const save = cur - nxt;
      if (save <= 0) return [Warn("No savings", money(0), "The new payment is not lower")];
      const months = costs / save;
      return out(
        [
          P("Monthly savings", money(save)),
          R("Break-even point", `${fmt(Math.ceil(months))} months`, `≈ ${fmt(months / 12, 1)} years`),
          R("Savings after 5 years", money(save * 60 - costs)),
        ],
        { note: `You recoup the ${money(costs)} in closing costs after ${fmt(Math.ceil(months))} months.` },
      );
    },
    examples: [{ label: "$200/mo saved, $4,000 costs", inputs: { current: 1500, next: 1300, costs: 4000 }, expect: "200" }],
  },
];
