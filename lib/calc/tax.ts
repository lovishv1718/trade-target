// Income tax (old vs new regime) and HRA exemption for FY 2026-27 (tax year 2026-27).
// Slabs follow Budget 2025, which Budget 2026 left unchanged.

export type Slab = { upTo: number; rate: number };
export type AgeGroup = "below60" | "60to80" | "above80";
export type Regime = "old" | "new";

export const NEW_REGIME_SLABS: Slab[] = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 5 },
  { upTo: 1200000, rate: 10 },
  { upTo: 1600000, rate: 15 },
  { upTo: 2000000, rate: 20 },
  { upTo: 2400000, rate: 25 },
  { upTo: Infinity, rate: 30 },
];

export function oldRegimeSlabs(age: AgeGroup): Slab[] {
  const exempt = age === "above80" ? 500000 : age === "60to80" ? 300000 : 250000;
  const slabs: Slab[] = [{ upTo: exempt, rate: 0 }];
  if (exempt < 500000) slabs.push({ upTo: 500000, rate: 5 });
  slabs.push({ upTo: 1000000, rate: 20 }, { upTo: Infinity, rate: 30 });
  return slabs;
}

export const STANDARD_DEDUCTION = { old: 50000, new: 75000 } as const;
export const REBATE = {
  old: { limit: 500000, max: 12500 },
  new: { limit: 1200000, max: 60000 },
} as const;
export const LIMITS = { sec80C: 150000, sec80CCD1B: 50000, sec24b: 200000, professionalTax: 2500 } as const;

export type SlabLine = { from: number; to: number; rate: number; taxable: number; tax: number };

export function slabTax(income: number, slabs: Slab[]) {
  let prev = 0;
  let total = 0;
  const lines: SlabLine[] = [];
  for (const s of slabs) {
    const taxable = Math.max(Math.min(income, s.upTo) - prev, 0);
    const tax = (taxable * s.rate) / 100;
    lines.push({ from: prev, to: s.upTo, rate: s.rate, taxable, tax });
    total += tax;
    prev = s.upTo;
    if (income <= s.upTo) break;
  }
  return { total, lines };
}

const SURCHARGE_BANDS = [
  { above: 5_00_00_000, rate: 37 },
  { above: 2_00_00_000, rate: 25 },
  { above: 1_00_00_000, rate: 15 },
  { above: 50_00_000, rate: 10 },
];

export function surchargeRate(income: number, regime: Regime) {
  const band = SURCHARGE_BANDS.find((b) => income > b.above);
  if (!band) return 0;
  return regime === "new" ? Math.min(band.rate, 25) : band.rate;
}

export type TaxInput = {
  salary: number;
  otherIncome: number;
  age: AgeGroup;
  /** Old-regime deductions */
  sec80C: number;
  sec80D: number;
  sec80CCD1B: number;
  homeLoanInterest: number;
  hraExemption: number;
  otherDeductions: number;
};

export type TaxResult = {
  regime: Regime;
  grossIncome: number;
  standardDeduction: number;
  deductions: { label: string; amount: number }[];
  totalDeductions: number;
  taxableIncome: number;
  slabLines: SlabLine[];
  slabTax: number;
  rebate: number;
  marginalRelief87A: number;
  surcharge: number;
  surchargeRelief: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  monthlyTax: number;
};

const round10 = (n: number) => Math.round(n / 10) * 10;

export function computeTax(input: TaxInput, regime: Regime): TaxResult {
  const grossIncome = input.salary + input.otherIncome;
  const standardDeduction = input.salary > 0 ? Math.min(STANDARD_DEDUCTION[regime], input.salary) : 0;
  const deductions: { label: string; amount: number }[] = [];
  if (regime === "old") {
    deductions.push(
      { label: "Section 80C", amount: Math.min(input.sec80C, LIMITS.sec80C) },
      { label: "Section 80D", amount: Math.max(input.sec80D, 0) },
      { label: "Section 80CCD(1B) NPS", amount: Math.min(input.sec80CCD1B, LIMITS.sec80CCD1B) },
      { label: "Home loan interest, 24(b)", amount: Math.min(input.homeLoanInterest, LIMITS.sec24b) },
      { label: "HRA exemption", amount: Math.max(input.hraExemption, 0) },
      { label: "Other deductions", amount: Math.max(input.otherDeductions, 0) },
    );
  }
  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const taxableIncome = Math.max(round10(grossIncome - standardDeduction - totalDeductions), 0);

  const slabs = regime === "new" ? NEW_REGIME_SLABS : oldRegimeSlabs(input.age);
  const { total: baseTax, lines } = slabTax(taxableIncome, slabs);

  // Section 87A rebate, with marginal relief just above the limit in the new regime
  const rule = REBATE[regime];
  let rebate = 0;
  let marginalRelief87A = 0;
  if (taxableIncome <= rule.limit) {
    rebate = Math.min(baseTax, rule.max);
  } else if (regime === "new") {
    const excess = taxableIncome - rule.limit;
    if (baseTax > excess) marginalRelief87A = baseTax - excess;
  }
  const taxAfterRebate = baseTax - rebate - marginalRelief87A;

  // Surcharge, with marginal relief at each threshold
  const rate = surchargeRate(taxableIncome, regime);
  let surcharge = (taxAfterRebate * rate) / 100;
  let surchargeRelief = 0;
  if (rate > 0) {
    const threshold = SURCHARGE_BANDS.find((b) => taxableIncome > b.above)!.above;
    const taxAtThreshold = slabTax(threshold, slabs).total;
    const rateAtThreshold = surchargeRate(threshold, regime);
    const ceiling = taxAtThreshold * (1 + rateAtThreshold / 100) + (taxableIncome - threshold);
    if (taxAfterRebate + surcharge > ceiling) {
      surchargeRelief = taxAfterRebate + surcharge - ceiling;
      surcharge -= surchargeRelief;
    }
  }

  const cess = ((taxAfterRebate + surcharge) * 4) / 100;
  const totalTax = Math.round(taxAfterRebate + surcharge + cess);
  return {
    regime,
    grossIncome,
    standardDeduction,
    deductions,
    totalDeductions,
    taxableIncome,
    slabLines: lines,
    slabTax: baseTax,
    rebate,
    marginalRelief87A,
    surcharge,
    surchargeRelief,
    cess,
    totalTax,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
    monthlyTax: totalTax / 12,
  };
}

export function compareRegimes(input: TaxInput) {
  const oldR = computeTax(input, "old");
  const newR = computeTax(input, "new");
  const better: Regime = newR.totalTax <= oldR.totalTax ? "new" : "old";
  return { old: oldR, new: newR, better, saving: Math.abs(oldR.totalTax - newR.totalTax) };
}

// HRA ------------------------------------------------------------------------

/** Cities where the 50% limit applies from FY 2026-27 under the Income Tax Rules, 2026. */
export const HRA_METRO_CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru", "Hyderabad", "Pune", "Ahmedabad"] as const;

export function hraExemption(opts: { basic: number; da: number; hraReceived: number; rentPaid: number; metro: boolean }) {
  const salary = opts.basic + opts.da;
  const actual = opts.hraReceived;
  const rentMinus10 = Math.max(opts.rentPaid - 0.1 * salary, 0);
  const pctOfSalary = (opts.metro ? 0.5 : 0.4) * salary;
  const exempt = Math.max(Math.min(actual, rentMinus10, pctOfSalary), 0);
  const limits = [
    { key: "actual", label: "HRA received", amount: actual },
    { key: "rent", label: "Rent paid minus 10% of basic + DA", amount: rentMinus10 },
    { key: "salary", label: `${opts.metro ? "50" : "40"}% of basic + DA`, amount: pctOfSalary },
  ];
  const binding = limits.reduce((a, b) => (b.amount < a.amount ? b : a)).key;
  return { exempt, taxable: Math.max(actual - exempt, 0), limits, binding };
}
