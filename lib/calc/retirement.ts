// Retirement calculators: EPF, NPS and retirement corpus planning.

import { sipFutureValue } from "./investing";

export const EPS_WAGE_CEILING = 15000;
export const EPS_RATE = 0.0833;
export const EPS_MAX = 1250;

/** Split of the monthly EPF contributions for a given basic pay plus DA. */
export function epfMonthlySplit(basic: number, employeePct = 12, employerPct = 12) {
  const employee = (basic * employeePct) / 100;
  const eps = Math.min(Math.round(Math.min(basic, EPS_WAGE_CEILING) * EPS_RATE), EPS_MAX);
  const employerEpf = Math.max((basic * employerPct) / 100 - eps, 0);
  return { employee, employerEpf, eps };
}

export type EpfRow = {
  year: number;
  age: number;
  basic: number;
  employee: number;
  employer: number;
  interest: number;
  balance: number;
};

/**
 * EPF corpus. Contributions are added monthly, interest is worked out each month
 * on the running balance at rate/12 and credited at the end of the year, as EPFO does.
 */
export function epf(opts: {
  basic: number;
  age: number;
  retireAge: number;
  annualIncreasePct: number;
  ratePct: number;
  currentBalance?: number;
  employeePct?: number;
}) {
  const { age, retireAge, annualIncreasePct, ratePct } = opts;
  let basic = opts.basic;
  let balance = opts.currentBalance ?? 0;
  const years = Math.max(retireAge - age, 0);
  const rows: EpfRow[] = [];
  let totalEmployee = 0;
  let totalEmployer = 0;
  let totalInterest = 0;
  let totalEps = 0;
  for (let y = 1; y <= years; y++) {
    const split = epfMonthlySplit(basic, opts.employeePct ?? 12);
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      balance += split.employee + split.employerEpf;
      yearInterest += (balance * ratePct) / 100 / 12;
    }
    balance += yearInterest;
    totalEmployee += split.employee * 12;
    totalEmployer += split.employerEpf * 12;
    totalEps += split.eps * 12;
    totalInterest += yearInterest;
    rows.push({ year: y, age: age + y, basic, employee: split.employee * 12, employer: split.employerEpf * 12, interest: yearInterest, balance });
    basic = basic * (1 + annualIncreasePct / 100);
  }
  return {
    corpus: balance,
    totalEmployee,
    totalEmployer,
    totalInterest,
    totalEps,
    openingBalance: opts.currentBalance ?? 0,
    rows,
  };
}

export type NpsRow = { year: number; age: number; invested: number; value: number };

export function nps(opts: {
  monthly: number;
  age: number;
  retireAge: number;
  returnPct: number;
  annuityPct: number;
  annuityRatePct: number;
  stepUpPct?: number;
}) {
  const { monthly, age, retireAge, returnPct, annuityPct, annuityRatePct } = opts;
  const step = opts.stepUpPct ?? 0;
  const i = returnPct / 100 / 12;
  const months = Math.max(retireAge - age, 0) * 12;
  let balance = 0;
  let invested = 0;
  const rows: NpsRow[] = [];
  for (let m = 1; m <= months; m++) {
    const instalment = monthly * Math.pow(1 + step / 100, Math.floor((m - 1) / 12));
    balance = (balance + instalment) * (1 + i);
    invested += instalment;
    if (m % 12 === 0) rows.push({ year: m / 12, age: age + m / 12, invested, value: balance });
  }
  const annuityAmount = (balance * annuityPct) / 100;
  const lumpSum = balance - annuityAmount;
  const monthlyPension = (annuityAmount * annuityRatePct) / 100 / 12;
  return { corpus: balance, invested, returns: balance - invested, annuityAmount, lumpSum, monthlyPension, rows };
}

/**
 * Present value at retirement of expenses that start at `firstYearExpense`, are paid at the
 * start of each year for `years`, grow at inflation `g` and are discounted at return `r`.
 */
export function growingAnnuityDue(firstYearExpense: number, rPct: number, gPct: number, years: number) {
  const r = rPct / 100;
  const g = gPct / 100;
  if (years <= 0) return 0;
  if (Math.abs(r - g) < 1e-9) return firstYearExpense * years;
  return firstYearExpense * ((1 - Math.pow((1 + g) / (1 + r), years)) / (r - g)) * (1 + r);
}

export type RetirementRow = { year: number; age: number; invested: number; value: number; target: number };

export function retirementPlan(opts: {
  age: number;
  retireAge: number;
  lifeExpectancy: number;
  monthlyExpense: number;
  inflationPct: number;
  preReturnPct: number;
  postReturnPct: number;
  currentSavings: number;
}) {
  const yearsToRetire = Math.max(opts.retireAge - opts.age, 0);
  const yearsInRetirement = Math.max(opts.lifeExpectancy - opts.retireAge, 0);
  const monthlyExpenseAtRetirement = opts.monthlyExpense * Math.pow(1 + opts.inflationPct / 100, yearsToRetire);
  const corpusNeeded = growingAnnuityDue(monthlyExpenseAtRetirement * 12, opts.postReturnPct, opts.inflationPct, yearsInRetirement);
  const savingsAtRetirement = opts.currentSavings * Math.pow(1 + opts.preReturnPct / 100, yearsToRetire);
  const shortfall = Math.max(corpusNeeded - savingsAtRetirement, 0);
  const months = yearsToRetire * 12;
  const unit = sipFutureValue(1, opts.preReturnPct, months);
  const monthlySip = months > 0 && unit > 0 ? shortfall / unit : shortfall;
  const rows: RetirementRow[] = [];
  for (let y = 1; y <= yearsToRetire; y++) {
    const fromSip = sipFutureValue(monthlySip, opts.preReturnPct, y * 12);
    const fromSavings = opts.currentSavings * Math.pow(1 + opts.preReturnPct / 100, y);
    rows.push({ year: y, age: opts.age + y, invested: opts.currentSavings + monthlySip * 12 * y, value: fromSip + fromSavings, target: corpusNeeded });
  }
  return {
    yearsToRetire,
    yearsInRetirement,
    monthlyExpenseAtRetirement,
    corpusNeeded,
    savingsAtRetirement,
    shortfall,
    monthlySip,
    totalSipInvested: monthlySip * months,
    rows,
  };
}
