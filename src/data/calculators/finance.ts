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
    how: "A fixed-rate loan is repaid through amortisation, a structured schedule where every payment is the same size but the split between interest and principal shifts over the life of the loan. This tool calculates that fixed monthly payment using the standard amortisation formula, PMT = P × i ÷ (1 − (1+i)⁻ⁿ), where P is the loan amount, i is the monthly interest rate (the annual rate divided by 12), and n is the total number of monthly payments.\n\nThe mechanics behind amortisation matter more than the formula itself. Each month, interest is charged on whatever principal balance remains at that point. Early in the loan, the balance is still large, so a large share of each payment goes toward interest, and only a small share actually reduces what you owe. As the balance gradually shrinks month by month, the interest portion of each payment shrinks with it, while the principal portion grows — even though the total payment amount never changes. This is why the first few years of a long-term loan can feel like you're barely making progress on the balance, even while paying on time every month.\n\nThe tool reports the total number of payments over the full term, the total amount repaid across the life of the loan, and the total interest paid — shown both as a dollar figure and as a percentage of the original principal, which is often a more striking way to see the true cost of borrowing. A $20,000 loan at 6% over 5 years, for instance, results in several thousand dollars of interest on top of the principal, a cost that is easy to overlook when focusing only on the monthly payment figure.\n\nThis structure applies identically to personal loans, auto loans, mortgages and any other fixed-rate installment debt, which is why the same amortisation formula powers several other calculators across this site. Understanding it helps explain why making extra principal payments early in a loan saves disproportionately more interest than making the same extra payment later — every dollar of principal paid down early stops accruing interest for the entire remaining term, while a dollar paid down near the end only avoids a few months of interest.",
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
    how: "A mortgage payment is rarely just principal and interest — lenders and homeowners commonly bundle in property tax and homeowners insurance as well, producing what's often abbreviated as PITI (principal, interest, taxes, insurance). This calculator reflects that full picture rather than showing only the loan-amortisation portion, which by itself can understate your real monthly housing cost by hundreds of dollars.\n\nThe process starts by subtracting your down payment from the home price to find the actual loan amount being financed. That loan amount is then run through the same amortisation formula used for any fixed-rate installment loan — PMT = P × i ÷ (1 − (1+i)⁻ⁿ) — to find the principal-and-interest portion of the payment, using the monthly interest rate and the total number of monthly payments over the loan term. Annual property tax and annual insurance premiums, when provided, are simply divided by 12 and added on top, since lenders typically collect these in equal monthly installments alongside the loan payment itself, holding them in escrow to pay the actual tax and insurance bills when they come due.\n\nThe tool reports the loan amount as a percentage of the home price, which is a useful cross-check against lending requirements — many conventional mortgages require the loan to be no more than 80% of the home's value (equivalent to a 20% down payment) to avoid additional mortgage insurance costs. The down payment itself is also expressed as a percentage of the purchase price for the same reason.\n\nSeparating the principal-and-interest figure from the tax and insurance components matters because only the principal-and-interest portion is fixed for the life of a fixed-rate loan; property tax assessments and insurance premiums can both change from year to year, meaning your total monthly payment may drift over time even on an otherwise fixed-rate mortgage. Total interest paid over the life of the loan is also calculated, which for a 30-year mortgage is often larger than the original loan amount itself — a figure worth seeing clearly before committing to a long amortisation term, and useful for comparing the true cost of different loan terms or interest rates side by side.",
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
    how: "Compound interest grows a balance faster than simple interest because, after the first period, interest starts earning interest of its own — the balance the formula operates on keeps increasing, not just the original principal. This tool applies the compound growth formula, A = P × (1 + r/n)^(n×t), where P is the starting principal, r is the annual interest rate, n is how many times per year interest compounds, and t is the number of years invested.\n\nThe compounding frequency matters more than many people expect. Interest that compounds monthly grows a balance faster than interest compounding annually at the same nominal rate, because interest earned in January starts earning its own interest as early as February, rather than waiting until the following year. Interest compounding daily grows faster still, though the difference between monthly and daily compounding at typical rates is usually modest — the biggest jump in outcome comes from moving away from annual compounding to any more frequent schedule, not from squeezing extra frequency beyond monthly.\n\nThis tool lets you select the compounding frequency directly — annually, semi-annually, quarterly, monthly or daily — so you can match it to how your actual savings account, CD or investment product compounds, since comparing two accounts at the same nominal rate but different compounding frequencies without accounting for this difference can lead to choosing the wrong one.\n\nThe results separate the interest earned from the original principal, and express total growth as a percentage — useful for comparing the same investment across different time horizons, since a longer holding period doesn't just add more interest, it adds more interest on top of previously-earned interest, producing the distinctive accelerating curve that makes compound growth so powerful over long periods. This is the same mathematical structure behind long-term retirement investing, and it is why financial advice consistently emphasises starting to invest early: money given more years to compound grows disproportionately faster than the same amount invested for a shorter period, even at an identical rate of return.",
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
    how: "Simple interest is the more basic counterpart to compound interest, and the distinction between the two matters a great deal over any meaningful time period. With simple interest, calculated here as I = P × r × t, interest accrues only on the original principal amount for the entire duration — it never earns interest on previously accumulated interest, unlike compound interest where the base amount grows over time.\n\nBecause the principal used in the calculation never changes, simple interest grows in a straight line: doubling the time period exactly doubles the interest earned, and the interest earned in the tenth year is identical to the interest earned in the first year, given the same rate and principal. This is a meaningfully different pattern from compound interest, where later years earn progressively more than earlier years because they're compounding on a larger base.\n\nSimple interest calculations appear in specific real-world contexts: certain short-term loans, some bonds, add-on interest auto loans, and basic interest problems in introductory finance and math education, where the straightforward, non-compounding structure makes the underlying relationship between principal, rate and time easier to see clearly without the added complexity of a compounding schedule.\n\nThe tool reports the interest earned separately from the total amount (principal plus interest), so you can see exactly how much the original sum grew by, independent of the base amount you started with. Because the calculation is a straightforward multiplication rather than an exponential formula, it's also useful as a quick sanity check or teaching example — a $1,000 principal at a 5% annual rate for 3 years earns exactly $150 in interest ($1,000 × 0.05 × 3), a result you can verify by hand in seconds, unlike the more involved exponential arithmetic that compound interest requires. Understanding the difference between simple and compound interest is genuinely useful outside the classroom too: when comparing loan or investment offers, it's worth checking explicitly which method a given product uses, since a compound-interest product will produce a meaningfully different total than a simple-interest product advertised at the same headline rate over a multi-year term.",
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
    how: "Financing a vehicle purchase typically involves more moving pieces than a standard personal loan, because the amount actually financed depends on the vehicle price minus both a cash down payment and any trade-in value applied toward the purchase. This tool starts by combining those three figures — vehicle price, down payment and trade-in value — to determine the true amount being financed, before applying the same amortisation formula used for any fixed-rate installment loan to find the resulting monthly payment.\n\nOnce the amount financed is known, the calculation proceeds exactly like a standard loan payment calculation: the monthly interest rate (the annual rate divided by 12) and the total number of monthly payments (the loan term in years multiplied by 12) are used in the amortisation formula PMT = P × i ÷ (1 − (1+i)⁻ⁿ) to find the fixed monthly payment that will fully pay off the loan by the end of the term.\n\nIf the down payment and trade-in value together cover the full vehicle price, the tool reports that no financing is needed at all, rather than attempting to calculate a payment on a zero or negative loan amount. This is a genuinely useful edge case to surface clearly, since it confirms the purchase can be made without financing rather than the tool silently returning a meaningless result.\n\nThe tool also reports the total of all payments across the full loan term and the total interest paid — figures that are easy to overlook when a dealership presents financing purely in terms of the monthly payment, but which reveal the true total cost of the loan. Auto loan interest rates and terms vary considerably based on credit profile, new versus used vehicle status, and lender, so running the same vehicle price and down payment through different rate and term combinations is a practical way to compare financing offers side by side before signing, rather than evaluating each offer in isolation based on the monthly payment figure alone, which can be made to look similar across very different total costs by simply extending the loan term.",
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
    how: "Credit card debt behaves differently from a fixed-term loan because there's no predetermined end date built into the balance itself — how long it takes to pay off depends entirely on how much you pay each month relative to how fast interest accrues. This tool works backward from a fixed monthly payment to calculate how many months it will take to fully clear the balance, using the relationship n = −ln(1 − (i×b)/pmt) ÷ ln(1+i), where b is the starting balance, i is the monthly interest rate (APR divided by 12), and pmt is your chosen monthly payment.\n\nThe most important check this tool performs is comparing your monthly payment against the minimum interest charge on the current balance. If your payment doesn't even exceed the interest accruing each month, the balance will never actually decrease — it will grow indefinitely regardless of how many payments you make, since every payment is being entirely consumed by interest with nothing left over to reduce principal. The tool detects this situation explicitly and reports it as “never paid off,” showing exactly how much of a payment increase is needed to make genuine progress, rather than letting you unknowingly calculate a payoff timeline for a payment that can never actually pay off the debt.\n\nCredit cards typically carry among the highest interest rates of any common consumer debt — often well above 15-20% APR — which makes the gap between the minimum payment and a more aggressive payment dramatically consequential. Because interest compounds monthly on the remaining balance, a modest increase in monthly payment can cut the payoff time substantially more than the payment increase itself might suggest, since a shorter payoff period means dramatically less total interest accrues along the way.\n\nThe tool reports the total amount paid across the full payoff period and the total interest paid, both critical figures for understanding the true cost of carrying a revolving balance rather than paying it off quickly. Comparing the payoff time and total interest at a few different candidate monthly payments — the current minimum versus a higher fixed amount — is a practical way to see concretely how much money a more aggressive payoff strategy would actually save, which is often the motivation needed to commit to paying more than the minimum each month.",
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
    how: "Reaching a specific savings target by a specific date requires knowing exactly how much to set aside each month, and that figure depends on three interacting factors: how much you already have saved, how many months remain until your deadline, and what rate of return your savings will earn along the way. This tool solves directly for the required monthly deposit using the future-value-of-an-annuity formula rearranged to isolate the payment: pmt = (goal − grown current savings) × i ÷ ((1+i)ⁿ − 1), where i is the monthly rate of return and n is the number of months remaining.\n\nThe calculation first projects your current savings forward on its own, growing at the specified rate with no further contributions, to see how much of the goal that existing balance alone will cover by the target date. Only the remaining shortfall — the gap between the goal and what your current savings will grow into unaided — needs to be covered by new monthly deposits, which is why the tool grows the current balance separately before solving for the deposit amount rather than simply dividing the goal by the number of months.\n\nIf your current savings, left to grow on their own, will already exceed the goal by the target date, the tool reports this directly rather than calculating a nonsensical negative deposit requirement — in that case you've effectively already met your goal through growth alone and no further contribution is strictly necessary, though of course continuing to save would only build a larger cushion.\n\nThe assumed rate of return matters enormously to the required monthly deposit, and it's worth running the calculation at a conservative rate as well as a more optimistic one to see the range of outcomes, since a savings goal funded through a low-risk account earning close to 0% will require substantially larger monthly deposits than the same goal pursued through an investment vehicle with a higher expected but less certain return. The tool reports the total amount you'll have personally deposited by the goal date alongside the interest earned along the way, making clear how much of the final goal comes from your own contributions versus investment growth — a distinction that becomes more pronounced the longer the savings horizon and the higher the assumed rate of return.",
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
    how: "Projecting a retirement balance combines two separate growth mechanisms working together: your existing savings compounding on their own over the years remaining until retirement, and a stream of new monthly contributions that are themselves added to, and then compound within, that growing balance. This tool models both simultaneously using the standard future-value formulas for a lump sum and for a regular annuity, combined into a single projected balance at your chosen retirement age.\n\nThe existing balance grows using compound interest applied over the full number of months between your current age and retirement age: pv × (1+i)ⁿ. The stream of monthly contributions grows using the future-value-of-an-annuity formula, pmt × ((1+i)ⁿ − 1) ÷ i, which accounts for the fact that contributions made early in your working life have far more time to compound than contributions made in the final years before retirement — the very first contribution you make benefits from compounding across the entire remaining timeline, while the very last contribution barely compounds at all before the projection ends.\n\nThe tool separates the projected balance into what you personally contribute (your starting balance plus every monthly deposit added up) versus what comes purely from investment growth, and for a multi-decade retirement horizon at a realistic average return, the growth portion is often substantially larger than the total amount actually contributed — a striking illustration of how much of long-term wealth building comes from time and compounding rather than the raw dollar amount set aside.\n\nA validity check ensures the retirement age is genuinely later than the current age before running any calculation, since a retirement date in the past or present has no meaningful projection to offer. The assumed annual return is, necessarily, an estimate rather than a guarantee — real investment returns vary year to year and rarely follow a smooth compounding curve in practice — so this projection is best understood as a planning estimate under a constant-return assumption, useful for comparing how different contribution levels, starting ages or target retirement ages change the trajectory, rather than a precise forecast of an actual future account balance.",
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
    how: "Return on investment (ROI) is one of the simplest and most widely used measures of investment performance, expressing the gain or loss from an investment as a percentage of the amount originally put in: ROI = (final value − initial investment) ÷ initial investment × 100. This tool calculates that figure directly from an initial and final value, and clearly labels the result as either a profit or a loss depending on the sign of the underlying gain.\n\nExpressing performance as a percentage rather than a raw dollar figure is what makes ROI genuinely useful for comparison: a $500 gain on a $1,000 investment (50% ROI) represents a dramatically better performance than the same $500 gain on a $50,000 investment (1% ROI), even though the dollar amount gained is identical in both cases. This is precisely the kind of comparison that raw profit-and-loss figures obscure but a percentage return reveals immediately, which is why ROI is the standard metric used to compare the performance of investments of very different sizes.\n\nOne limitation worth understanding is that plain ROI, as calculated here, does not account for the time period over which the gain occurred — a 50% return earned over one year is a dramatically different result from the same 50% return earned over ten years, even though the ROI figure itself is identical in both cases. For time-sensitive comparisons between investments held for different lengths of time, an annualised measure like CAGR (compound annual growth rate) is the more appropriate metric, and this site includes a dedicated calculator for that specific case.\n\nThe tool reports the net dollar gain or loss alongside the percentage figure, and marks a positive result as a gain and a negative result as a loss using distinct visual treatment, so the direction of the outcome is immediately clear without needing to interpret the sign of the percentage. ROI is applicable to nearly any investment context — stocks, real estate, a business venture, even a single transaction like buying and reselling an item — as long as you have a clear initial cost and a clear final value to compare it against.",
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
    how: "Future value answers a forward-looking question: if I invest a specific amount today at a given rate of return, what will it be worth after a certain number of years? This tool calculates that projection using the standard compound growth formula, FV = PV × (1 + r)^t, where PV is the present value (the amount invested today), r is the annual rate of return, and t is the number of years the investment is held.\n\nThis is the same underlying mathematical relationship that powers compound interest calculations generally, but framed specifically around a single lump-sum investment with no additional contributions along the way — useful for projecting the growth of an inheritance, a bonus, a lump-sum settlement, or any one-time amount you plan to invest and leave untouched rather than add to over time.\n\nBecause the growth is compound rather than linear, the relationship between time and future value is not proportional: doubling the number of years does not simply double the future value, it can more than double it, since a longer holding period means more compounding cycles building on an increasingly larger base. This exponential relationship is why even modest differences in the assumed annual rate of return produce dramatically different outcomes over long time horizons — a rate that seems only slightly higher can compound into a meaningfully larger balance across a multi-decade projection, which is worth keeping in mind when comparing investment options that appear similar based on their stated rates alone.\n\nThe tool reports the total growth in dollar terms — the difference between the future value and the original present value — alongside the present value itself for direct comparison. This makes it straightforward to see not just what the final balance will be, but how much of that final balance represents genuine growth versus the original invested amount, which becomes an increasingly large share of the total the longer the money is left to compound. Running the same present value through a few different assumed rates or time horizons is a quick way to build intuition for how sensitive long-term projections are to both variables.",
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
    how: "Present value asks the reverse of the future value question: given a specific amount you expect to receive at some point in the future, what is that future amount actually worth today, once you account for the fact that money available now can be invested and grow, while money received later cannot start growing until it arrives? This tool calculates that today's-worth figure using the standard discounting formula, PV = FV ÷ (1 + r)^t, where FV is the future amount, r is the discount rate, and t is the number of years until that amount is received.\n\nThe discount rate represents the rate of return you could otherwise earn on money available today — sometimes called the opportunity cost of capital. A higher discount rate means future money is considered less valuable in today's terms, because the alternative of investing money now at that higher rate would grow into a larger sum by the same future date; a lower discount rate means future money retains more of its face value in present terms, since the forgone growth opportunity is smaller.\n\nThis calculation underlies a wide range of financial decisions beyond simple investment comparisons: valuing a future payment from a settlement, comparing a lump-sum payout against an annuity of the same nominal total paid over time, evaluating whether a business investment that pays off years from now is worth its upfront cost today, and pricing bonds and other fixed-income securities that promise specific future cash flows. In every case, the core question is the same — how much would I need to invest today, at the discount rate, to end up with that exact future amount by that exact future date?\n\nThe tool reports the discount — the numerical gap between the future value and its present-value equivalent — alongside the future value itself, making the size of the time-value-of-money effect immediately visible. As either the discount rate or the time horizon increases, that gap widens, illustrating why a payment promised decades from now can be worth substantially less in today's terms than its face value might suggest, particularly at higher discount rates.",
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
    how: "An annuity payout calculation answers a practical retirement-planning question: given a lump sum of savings, how much level monthly income can it provide over a fixed number of years, assuming the remaining balance keeps earning a return throughout the payout period? This tool calculates that sustainable monthly payout using the same amortisation formula used for loan payments, PMT = P × i ÷ (1 − (1+i)⁻ⁿ), but applied in reverse: instead of a lender extending a loan by drawing down their own capital pool over time, the retiree is drawing down their own accumulated savings.\n\nThe key insight behind this formula is that the remaining balance keeps earning a return throughout the payout period, which means the monthly payout can be meaningfully higher than simply dividing the starting balance by the number of months — investment growth on the remaining balance effectively subsidises part of each payment, extending how much can be withdrawn each month without running out early. This is precisely why the formula requires the assumed rate of return as an input, not just the starting balance and the payout period.\n\nThe tool reports the total amount received across the entire payout period alongside the interest portion of that total — the amount that came from investment growth rather than the original principal. For a longer payout period at a reasonable assumed return, the interest portion frequently makes up a substantial share of total payments received, illustrating how continued investment growth during retirement can meaningfully extend the sustainability of a fixed nest egg, rather than the balance simply being spent down at a flat, uninvested rate.\n\nThis calculation assumes the balance is fully exhausted at the end of the specified payout period, providing a completely level monthly income throughout — a useful structure for planning a fixed-term drawdown, though real-world retirement income planning often needs to account for additional factors like inflation eroding the purchasing power of a level nominal payment over a long retirement, uncertain lifespan (running the risk of outliving a fixed-term payout), and variable rather than guaranteed investment returns. As a planning tool, it's most useful for comparing how different payout periods, starting balances or assumed return rates change the sustainable monthly income figure.",
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
    how: "APR (annual percentage rate) and APY (annual percentage yield) both describe interest rates, but they answer subtly different questions, and the gap between them grows with how frequently interest compounds — a distinction that matters when comparing loan or savings products that quote one figure but not the other. This tool converts a nominal APR into its effective APY using the formula APY = (1 + APR/n)^n − 1, where n is the number of compounding periods per year.\n\nAPR is a nominal, or stated, annual rate that does not account for the effect of compounding within the year — it simply describes the rate before considering how often interest is applied. APY, by contrast, is the effective rate you actually earn (or pay) over a full year once compounding is factored in, and it is always equal to or greater than the APR whenever compounding happens more than once per year, because each compounding period allows previously-earned interest to start earning interest of its own before the year is over.\n\nThe gap between APR and APY grows both with the compounding frequency and with the size of the rate itself: a 12% APR compounded monthly produces an APY noticeably above 12%, since interest compounds twelve separate times within the year rather than just once, and each of those eleven intermediate compounding events adds a small additional boost on top of the nominal rate. At higher rates or more frequent compounding (daily compounding, for instance), this gap becomes even more pronounced.\n\nThis distinction is directly relevant when comparing two savings or loan products: a product advertising a lower APR but compounding daily can, once converted to APY, actually offer a better effective rate than a competing product with a higher stated APR that only compounds annually. Regulatory disclosure requirements in many jurisdictions require lenders and financial institutions to state APY specifically for savings products, precisely because it is the figure that reflects what you'll actually earn, while APR remains more common for loan disclosures — making the ability to convert cleanly between the two genuinely useful for apples-to-apples comparison shopping.",
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
    how: "Inflation erodes the purchasing power of money over time, meaning the same nominal amount buys progressively less as prices rise — and this tool quantifies that erosion in two complementary directions using the compound growth formula applied to inflation rather than investment returns: future cost = amount × (1 + rate)^years, and the mirror-image calculation of what today's money will be able to buy in the future.\n\nThe first calculation projects forward how much a given amount of goods or services will cost at a future date, given a constant assumed inflation rate — useful for understanding how much more an item, a service, or a general basket of goods is likely to cost years from now if current inflation trends continue. The second calculation, working in the opposite direction, shows the future buying power of today's money: how much a fixed amount held today would actually be able to purchase at that same future date, once prices have risen. These are two ways of describing exactly the same underlying erosion of value, just framed from different starting points — one asks what a fixed basket of goods will cost, the other asks what a fixed amount of money will be able to buy.\n\nBecause inflation compounds the same way interest does, its effects accelerate over longer time horizons in a way that's easy to underestimate when only considering a single year at a time. A modest inflation rate that seems negligible year to year can still meaningfully erode value over a decade or more, since each year's price increase compounds on top of the previous year's already-higher prices, rather than simply adding up in a straight line.\n\nUnderstanding this compounding effect is central to long-term financial planning: a retirement savings target set today needs to account for the fact that the same nominal dollar amount will buy meaningfully less by the time it's actually needed, decades in the future, which is why serious retirement projections are typically expressed in either inflation-adjusted (“real”) terms or explicitly built around a return rate that already exceeds the assumed inflation rate. This tool is a straightforward way to see that erosion made concrete for any specific amount, rate and time horizon you want to examine.",
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
    how: "Calculating a tip and splitting a bill are two separate steps that this tool combines into one calculation, avoiding the common friction of working out the gratuity first and then doing a second round of mental math to divide the total fairly among a group. The tip amount is calculated as a straightforward percentage of the pre-tip bill — bill × tip percentage ÷ 100 — and added to the original bill to produce the total amount due.\n\nWhen more than one person is splitting the bill, the tool divides the combined total (bill plus tip) evenly across the number of people specified, giving a single per-person amount that already includes both their share of the food or service cost and their share of the gratuity. This avoids a subtle but common error people make when splitting bills manually: calculating the tip on the whole bill correctly, but then dividing only the original bill by the headcount and treating the tip as a separate, sometimes overlooked, addition.\n\nTip percentage conventions vary by country, by type of establishment, and by local custom, and this tool makes no assumption about what percentage is appropriate — it simply calculates the result precisely for whatever percentage you enter, whether that's a modest gratuity for counter service, a standard restaurant tip, or a more generous amount for exceptional service. The default value shown is a common general restaurant benchmark, but adjusting it takes a moment and the result recalculates instantly.\n\nFor a single diner, the tool reports the tip amount and total clearly without introducing an unnecessary per-person breakdown, since a party of one has nothing to split. For larger groups, it's worth noting the calculation assumes an even split, which works well when everyone ordered roughly similar amounts; for a group where costs varied significantly between people — one person ordering a full meal and drinks while another had only a coffee, for instance — a proportional split based on what each person actually ordered would be fairer than an even division, though that calculation requires knowing each individual's subtotal rather than just the group total this tool works from.",
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
    how: "Working out a sale price by hand means calculating a percentage of the original price and subtracting it — simple in principle, but easy to get slightly wrong when done quickly in a store, especially with an odd discount percentage or a price that isn't a round number. This tool calculates the exact savings amount as price × discount percentage ÷ 100, then subtracts that from the original price to give the precise final price you'll actually pay.\n\nThe calculation is deliberately kept simple and general enough to apply to any single discount scenario: a straightforward percentage-off sale, a clearance markdown, a promotional discount code, or a negotiated price reduction — anywhere a percentage reduction is being applied to a known original price. The tool reports both the savings amount and the final price prominently, since different situations call for focusing on different figures: a shopper comparing deals across stores might care most about the final price, while someone tracking how much a promotion actually saved them might care more about the savings figure itself.\n\nOne situation this single-discount tool does not directly handle is stacked or sequential discounts — for example, an additional 10% off a price that has already been discounted 25%. Sequential percentage discounts do not simply add together the way it might seem intuitive to assume: applying 25% off followed by 10% off the already-reduced price results in a smaller total discount than a flat 35% off the original price would, because the second discount is calculated on the smaller, already-reduced amount rather than the original price. To calculate a stacked discount accurately, you would run the original price through this tool first at the initial discount rate, then take the resulting final price and run it through again at the second discount rate — applying discounts sequentially rather than trying to add percentages together directly, which is a common and understandable shortcut that produces an incorrect answer.\n\nThe original price is also shown alongside the result for easy reference, useful when comparing several different discount scenarios against the same starting price to see which offers the best actual savings.",
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
    how: "Sales tax, VAT and GST all work the same way mathematically even though the terminology and rates vary considerably by country and jurisdiction: a percentage is calculated on a pre-tax amount and added on top to produce the final total the buyer actually pays. This tool calculates that tax amount as pre-tax amount × tax rate ÷ 100, then adds it to the original amount to give the grand total.\n\nThe distinction between tax-inclusive and tax-exclusive pricing matters for how this tool should be used: in places where prices are displayed before tax (as is common in the United States, where sales tax is added at the register), this tool works directly on the sticker price to show what you'll actually pay at checkout. In places where prices are already tax-inclusive by law or convention (as is common with VAT in much of Europe), the displayed price already contains this calculation, and using this tool would only be useful for working backward to see the tax component embedded within an already-inclusive price, or for calculating what a pre-tax business cost would become once tax is applied for accounting or invoicing purposes.\n\nSales tax rates commonly vary not just between countries but between states, provinces, counties and even individual cities within the same country, and can also vary by the category of goods being purchased — some jurisdictions exempt groceries, prescription medication or other categories from tax entirely, or apply a reduced rate. This tool doesn't attempt to look up or apply any specific jurisdiction's rate automatically; instead it calculates precisely and instantly once you supply whatever rate is actually applicable to your specific purchase and location, which you'll need to know or look up separately.\n\nThe tool reports the tax amount separately from the total, which is useful for record-keeping, expense reports, and any situation where you need to itemise the tax component of a purchase rather than working only with the combined total — a distinction many receipts show explicitly for exactly this reason.",
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
    how: "A down payment is the portion of a purchase price paid upfront in cash, with the remainder typically financed through a loan — and this tool calculates both pieces directly from a purchase price and a chosen down payment percentage: down payment amount = price × percentage ÷ 100, with the loan amount simply being whatever remains of the purchase price after the down payment is subtracted.\n\nWhile this calculation is straightforward multiplication, the percentage itself carries real financial significance, particularly for large purchases like homes. Many mortgage lenders use specific down payment percentage thresholds as cutoffs for different loan terms: putting down less than 20% on a conventional home purchase, for instance, commonly triggers a requirement for private mortgage insurance (an additional monthly cost protecting the lender, not the borrower, in case of default), while reaching or exceeding 20% down typically avoids that extra cost entirely. Understanding exactly how much a specific percentage translates to in dollar terms — and how that dollar amount changes as the target percentage moves up or down — is directly useful when deciding how much to save toward a large purchase before applying for financing.\n\nThe tool reports the purchase price alongside both calculated figures, making it easy to see the full picture at a glance: how much cash is needed upfront, and how large the resulting loan will be. Running the same purchase price through a few different down payment percentages — comparing 10%, 15% and 20%, for instance — is a quick way to see concretely how much additional cash saved upfront translates to a smaller loan amount, which in turn affects the size of the eventual monthly loan payment once financing terms are applied through a dedicated loan or mortgage calculator.\n\nThis calculation applies to any large financed purchase that conventionally involves a partial cash payment upfront — not just homes, but vehicles, and other significant purchases where a lender expects the buyer to have some equity stake in the purchase from the outset rather than financing the entire cost.",
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
    how: "Debt-to-income ratio (DTI) is a standard measure lenders use to assess how much of a borrower's income is already committed to debt payments, expressed as a simple percentage: monthly debt payments ÷ gross monthly income × 100. This tool calculates that ratio directly and also contextualises the result against commonly used lending benchmarks, since the raw percentage on its own doesn't tell you much without knowing what range is considered healthy versus risky from a lender's perspective.\n\nThe “monthly debt payments” figure that belongs in this calculation should include recurring debt obligations — things like existing loan payments, minimum credit card payments, and (importantly, if you're evaluating a potential new mortgage) the mortgage payment itself — but should not include regular living expenses like groceries, utilities or discretionary spending, which lenders generally don't factor into DTI even though they're very real ongoing costs. “Gross monthly income” means income before taxes and other deductions are taken out, not the smaller take-home amount that actually lands in a bank account, which is a distinction that matters since gross income is consistently larger than net income.\n\nThe tool applies commonly cited lending guideline thresholds to the calculated ratio: a DTI at or below 36% is generally viewed as healthy and gives borrowers the most flexibility and the best loan terms; a DTI up to roughly 43% is often the upper limit many conventional mortgage lenders will still approve, though typically with less favourable terms or additional scrutiny; and a DTI above that range is flagged as high, since it suggests a large share of income is already committed before accounting for the new debt being considered, leaving less room for the borrower to absorb unexpected expenses or income disruption.\n\nThese specific thresholds are common industry guidelines rather than universal rules — actual lending criteria vary by lender, loan type, and other factors in a borrower's overall financial profile — but the ratio itself is a genuinely useful self-assessment tool for understanding your own debt burden before applying for new credit, independent of what any specific lender's cutoff might be.",
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
    how: "Break-even analysis answers a foundational business question: how many units do I need to sell, at this price and this cost structure, before I stop losing money and start turning a profit? This tool calculates that break-even point using the relationship between fixed costs, price per unit, and variable cost per unit: break-even units = fixed costs ÷ (price − variable cost).\n\nThe calculation rests on separating costs into two fundamentally different categories. Fixed costs are expenses that don't change based on how many units you sell — rent, salaries, equipment, insurance — they're incurred regardless of sales volume. Variable costs, by contrast, scale directly with each unit sold — materials, per-unit labour, packaging, shipping. The difference between the selling price and the variable cost per unit is called the contribution margin: it's the amount each individual sale contributes toward covering the fixed costs, after that unit's own variable cost has already been accounted for.\n\nOnce you know the contribution margin per unit, dividing the total fixed costs by that margin tells you exactly how many units need to be sold before the accumulated contribution from all those sales equals the fixed costs — the point at which the business has neither a profit nor a loss. Every unit sold beyond that break-even point contributes its full margin directly to profit, since the fixed costs have already been fully covered.\n\nIf the selling price doesn't exceed the variable cost per unit, the tool reports that no break-even point exists at all, since in that situation every unit sold actually loses money on a per-unit basis before even considering fixed costs — no sales volume, however large, could ever recover the fixed costs under those conditions, and the underlying pricing or cost structure would need to change first. The tool reports break-even units rounded up to the nearest whole unit (since a fractional unit can't actually be sold), the corresponding break-even revenue, and the contribution margin both as a dollar figure and as a percentage of price — useful context for understanding how much pricing or cost flexibility exists before profitability is at risk.",
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
    how: "Net worth is the most fundamental single-number snapshot of financial position, calculated simply as total assets minus total liabilities — everything you own of value, minus everything you owe. This tool performs that subtraction directly and flags whether the result is positive (a healthy sign, meaning assets exceed debts) or negative (meaning liabilities currently outweigh assets), using clearly distinct visual treatment for each case.\n\nAssets in this calculation should include everything of genuine financial value: cash and savings account balances, investment account balances, retirement account balances, the market value of property or real estate you own, vehicles, and any other significant possessions with resale value. Liabilities should include every outstanding debt: mortgage balances, auto loan balances, student loan balances, credit card balances, and any other money owed. Getting an accurate net worth figure depends entirely on being reasonably thorough and honest in both categories — leaving out a liability, or overvaluing an illiquid asset, will distort the result away from your true financial position.\n\nA single net worth figure calculated once has some value, but the metric becomes considerably more useful when tracked over time, since the trend — whether net worth is growing, shrinking, or holding steady from one calculation to the next — says more about financial trajectory than any single snapshot can on its own. A negative net worth is common and often expected earlier in life or a career, particularly for anyone carrying student loans or a large mortgage relative to their current asset base, and isn't inherently alarming in isolation; what matters more is whether the trend over subsequent years moves in a positive direction as debts are paid down and assets accumulate.\n\nThe tool reports total assets and total liabilities separately alongside the net figure, which is useful context beyond the single bottom-line number — two people could arrive at an identical net worth figure through very different combinations of assets and debts, and seeing both components separately gives a fuller picture of the underlying financial structure, not just the final balance.",
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
    how: "Converting an annual salary into an hourly rate is a useful comparison when evaluating a salaried position against an hourly one, freelance or contract work, or simply understanding what your time is worth on an hour-by-hour basis. This tool calculates the hourly equivalent as annual salary ÷ (hours worked per week × weeks worked per year), along with the corresponding weekly and monthly pay figures for the same salary.\n\nThe two input assumptions — hours per week and weeks per year — matter more than they might first appear, and adjusting them changes the resulting hourly rate meaningfully. The default assumption of 40 hours per week and 52 weeks per year represents a standard full-time schedule with no unpaid time off factored in, but many salaried roles involve unpaid holidays, unpaid leave, or working hours that differ from a standard 40-hour week, all of which change the effective hourly rate once accounted for. Someone who works 45 hours a week for the same annual salary is effectively earning a lower true hourly rate than someone earning the identical salary for 40 hours a week, even though their salary figures on paper are the same.\n\nThis conversion is particularly useful when comparing a salaried job offer against an hourly or contract opportunity, since job postings and offers don't always present compensation in directly comparable terms — converting both offers to a common hourly basis removes that ambiguity and allows a genuinely apples-to-apples comparison of compensation, separate from any differences in benefits, which this calculation does not attempt to account for.\n\nThe weekly and monthly pay figures are calculated straightforwardly by dividing the annual salary by the number of weeks worked and by 12 months respectively, giving quick reference points useful for budgeting purposes — monthly figures in particular are often more directly useful for household budgeting than an annual salary figure, since most recurring expenses (rent, utilities, subscriptions) are billed monthly rather than annually.",
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
    how: "Compound annual growth rate (CAGR) answers a specific and genuinely useful investment question: if an investment grew from a beginning value to an ending value over a certain number of years, what single, constant annual growth rate would have produced that exact same result? This tool calculates CAGR using the formula (ending value ÷ beginning value)^(1/years) − 1, which finds that implied constant rate directly.\n\nThe key insight behind CAGR is that real investments rarely grow at a perfectly smooth, constant rate year after year — a stock portfolio might gain 20% one year, lose 5% the next, and gain 12% the year after that. CAGR smooths all of that year-to-year volatility into a single representative annual figure, answering “what flat, unchanging annual rate would have gotten me from where I started to where I ended up, over this many years?” It's a mathematical simplification of a genuinely lumpy, uneven growth path into one clean, comparable number.\n\nThis makes CAGR the standard tool for comparing the performance of two investments held over different or even the same time periods, since it accounts for the compounding effect of time in a way that a simple total-return percentage does not. A 50% total return earned over 3 years represents a meaningfully higher CAGR than the same 50% total return earned over 10 years, because the shorter time period means that growth compounded faster — the total-return figure alone would make both investments look identical, while CAGR correctly distinguishes between them.\n\nThe tool reports both the CAGR and the plain total return over the full period side by side, which makes this distinction directly visible: the total return tells you the overall percentage gain across the whole holding period, while the CAGR tells you the annualised, compounding-adjusted equivalent rate. Comparing CAGR figures across different investments, funds, or time periods is one of the most common and legitimate ways investors evaluate historical performance on a genuinely comparable basis, even when the underlying investments were held for different lengths of time.",
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
    how: "The Rule of 72 is a mental-math shortcut, centuries old, for estimating how long it takes an investment to double in value at a given constant annual growth rate, without needing to work through the full exponential doubling-time formula by hand. The approximation is simply: years to double ≈ 72 ÷ annual rate. This tool calculates that quick estimate alongside the closely related Rule of 70 (a slightly different, sometimes-preferred approximation using 70 instead of 72) and the mathematically exact doubling time for direct comparison.\n\nThe exact doubling time is derived from the compound growth formula by solving for the time at which an initial amount doubles: t = ln(2) ÷ ln(1 + r), where r is the annual rate expressed as a decimal. This exact formula is more cumbersome to compute mentally, which is precisely why the Rule of 72 exists as a practical shortcut — 72 happens to have many small integer divisors (1, 2, 3, 4, 6, 8, 9, 12), making the mental division especially easy for common round interest rates, while still producing a result reasonably close to the mathematically exact answer across a wide range of typical rates.\n\nThe approximation is most accurate for moderate interest rates, roughly in the single digits to low double digits, which happens to cover the range of rates most relevant to typical savings accounts, bonds, and long-term stock market returns. At very high or very low interest rates, the gap between the Rule of 72 estimate and the exact doubling time widens somewhat, though it remains a reasonably useful ballpark figure across most realistically encountered rates.\n\nBeyond its use in projecting investment growth, the same rule applies equally well in reverse to any exponential decay or growth process — it can estimate how long it takes debt to double under a given interest rate if left unpaid, how long inflation takes to halve the purchasing power of money at a given rate, or roughly how long a population or quantity growing at a steady percentage rate takes to double in size. The tool's side-by-side comparison of the Rule of 72 estimate, the Rule of 70 estimate, and the exact figure is useful both for quick mental-math practice and for understanding exactly how much precision the shortcut sacrifices for its convenience.",
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
    how: "Refinancing a loan — replacing an existing loan with a new one, typically to secure a lower interest rate or better terms — usually involves upfront closing costs, which means the decision to refinance isn't simply about whether the new payment is lower, but about whether the resulting monthly savings are large enough to justify those costs within a reasonable time frame. This tool calculates exactly that break-even point: months to break even = closing costs ÷ monthly savings, where monthly savings is the difference between your current payment and the new, refinanced payment.\n\nIf the new payment isn't actually lower than the current one, the tool reports that there are no savings to speak of, since a refinance that doesn't reduce the monthly payment offers no monthly-savings-based justification for the transaction cost involved, regardless of what other reasons (like shortening a loan term) might separately motivate it.\n\nThe break-even point is the critical number in any refinance decision: if you plan to keep the loan (and stay in the associated property, if it's a mortgage) well beyond that break-even point, the refinance is very likely worthwhile purely on a monthly-savings basis, since every month beyond break-even represents pure net savings that wouldn't have existed otherwise. If you expect to sell the property, pay off the loan early, or refinance again before reaching that break-even point, the closing costs may end up outweighing the savings actually realised, making the refinance a net loss despite the lower monthly payment looking attractive on paper.\n\nThe tool also projects total savings after 5 years specifically, since that's a commonly used reference horizon for evaluating whether a refinance decision paid off — calculated as five years of monthly savings minus the upfront closing costs, giving a single concrete dollar figure for the net benefit over that period. Comparing this 5-year net savings figure against your realistic expectation of how long you'll keep the loan is a more complete way to evaluate a refinance opportunity than looking at the new monthly payment in isolation, since a lower payment alone doesn't guarantee the refinance was financially worthwhile once the transaction costs are properly accounted for.",
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
