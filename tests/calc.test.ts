import { describe, expect, it } from "vitest";
import { cagr, lumpsum, sip, sipFutureValue, stepUpSip, swp, swpClosedForm } from "@/lib/calc/investing";
import { fd, ppf, ppfClosedForm, rd, rdClosedForm } from "@/lib/calc/savings";
import { epf, epfMonthlySplit, growingAnnuityDue, nps, retirementPlan } from "@/lib/calc/retirement";
import { amortise, emi, loanWithPrepayment } from "@/lib/calc/loans";
import { compareRegimes, computeTax, hraExemption, type TaxInput } from "@/lib/calc/tax";
import { amountInWords, formatINR, formatINRCompact } from "@/lib/format";

// Reference values are the figures published by widely used Indian calculators
// (Groww, SBI, ClearTax, Income Tax Department examples), rounded to the rupee.

describe("SIP", () => {
  it("₹10,000 a month at 12% for 10 years matches the standard SIP table", () => {
    const r = sip(10000, 12, 10);
    expect(Math.round(r.value)).toBe(2323391);
    expect(r.invested).toBe(1200000);
  });
  it("₹5,000 a month at 12% for 20 years", () => {
    expect(Math.round(sipFutureValue(5000, 12, 240))).toBe(4995740);
  });
  it("yearly rows end at the final value", () => {
    const r = sip(2500, 10, 7);
    expect(r.rows).toHaveLength(7);
    expect(r.rows.at(-1)!.value).toBeCloseTo(r.value, 6);
  });
  it("zero return is just the sum of instalments", () => {
    expect(sip(1000, 0, 5).value).toBe(60000);
  });
});

describe("Lumpsum", () => {
  it("₹1 lakh at 12% for 10 years", () => {
    expect(Math.round(lumpsum(100000, 12, 10).value)).toBe(310585);
  });
  it("returns = value − invested", () => {
    const r = lumpsum(250000, 8, 6);
    expect(r.returns).toBeCloseTo(r.value - 250000, 6);
  });
});

describe("Step-up SIP", () => {
  it("equals a plain SIP when the step-up is zero", () => {
    expect(stepUpSip(10000, 0, 12, 10).value).toBeCloseTo(sip(10000, 12, 10).value, 4);
  });
  it("matches the year-by-year closed form", () => {
    const P = 10000, s = 0.1, Y = 10, i = 0.01;
    const year = ((Math.pow(1 + i, 12) - 1) / i) * (1 + i);
    let expected = 0;
    for (let k = 0; k < Y; k++) expected += P * Math.pow(1 + s, k) * year * Math.pow(1 + i, 12 * (Y - 1 - k));
    const r = stepUpSip(P, 10, 12, Y);
    expect(r.value).toBeCloseTo(expected, 4);
    expect(Math.round(r.invested)).toBe(1912491);
    expect(Math.round(r.finalInstalment)).toBe(23579);
  });
});

describe("SWP", () => {
  it("₹10 lakh, ₹10,000 a month at 8% for 10 years matches the closed form", () => {
    const r = swp(1000000, 10000, 8, 10);
    expect(r.finalValue).toBeCloseTo(swpClosedForm(1000000, 10000, 8, 120), 4);
    expect(Math.round(r.finalValue)).toBe(390180);
    expect(r.totalWithdrawn).toBe(1200000);
    expect(r.depletedAtMonth).toBeNull();
  });
  it("reports the month the corpus runs out", () => {
    const r = swp(500000, 20000, 6, 5);
    expect(r.depletedAtMonth).toBe(27);
    expect(r.finalValue).toBe(0);
  });
});

describe("CAGR", () => {
  it("doubling in 6 years is about 12.25%", () => {
    expect(cagr(100000, 200000, 6)).toBeCloseTo(12.2462, 3);
  });
  it("is negative when value falls", () => {
    expect(cagr(100, 81, 2)).toBeCloseTo(-10, 6);
  });
});

describe("PPF", () => {
  it("₹1.5 lakh a year at 7.1% for 15 years", () => {
    const r = ppf(150000, 7.1, 15);
    expect(Math.round(r.maturity)).toBe(4068209);
    expect(r.deposited).toBe(2250000);
    expect(r.maturity).toBeCloseTo(ppfClosedForm(150000, 7.1, 15), 4);
  });
});

describe("FD", () => {
  it("₹1 lakh at 7% compounded quarterly for 5 years", () => {
    expect(Math.round(fd(100000, 7, 60, "quarterly").maturity)).toBe(141478);
  });
  it("yearly compounding equals simple lumpsum growth", () => {
    expect(fd(100000, 7, 36, "yearly").maturity).toBeCloseTo(lumpsum(100000, 7, 3).value, 6);
  });
});

describe("RD", () => {
  it("instalment sum equals the bank closed-form formula", () => {
    expect(rd(5000, 7, 60).maturity).toBeCloseTo(rdClosedForm(5000, 7, 60), 4);
  });
  it("₹5,000 a month at 7% for 5 years", () => {
    expect(Math.round(rd(5000, 7, 60).maturity)).toBe(359664);
  });
});

describe("EPF", () => {
  it("splits the employer share between EPS and EPF", () => {
    expect(epfMonthlySplit(30000)).toEqual({ employee: 3600, employerEpf: 2350, eps: 1250 });
    expect(epfMonthlySplit(10000)).toEqual({ employee: 1200, employerEpf: 367, eps: 833 });
  });
  it("one year at 8.25% with monthly running-balance interest", () => {
    const r = epf({ basic: 30000, age: 30, retireAge: 31, annualIncreasePct: 0, ratePct: 8.25 });
    // 5,950 a month; interest = 5950 × (1 + 2 + ... + 12) × 0.0825 / 12
    expect(r.totalInterest).toBeCloseTo((5950 * 78 * 0.0825) / 12, 6);
    expect(Math.round(r.corpus)).toBe(74591);
  });
  it("adds the opening balance and compounds it", () => {
    const r = epf({ basic: 0, age: 30, retireAge: 32, annualIncreasePct: 0, ratePct: 8, currentBalance: 100000 });
    expect(r.corpus).toBeCloseTo(116640, 6);
  });
});

describe("NPS", () => {
  it("splits the corpus into annuity and lump sum", () => {
    const r = nps({ monthly: 5000, age: 30, retireAge: 60, returnPct: 10, annuityPct: 40, annuityRatePct: 6 });
    expect(r.corpus).toBeCloseTo(sipFutureValue(5000, 10, 360), 4);
    expect(r.annuityAmount).toBeCloseTo(r.corpus * 0.4, 6);
    expect(r.lumpSum + r.annuityAmount).toBeCloseTo(r.corpus, 6);
    expect(r.monthlyPension).toBeCloseTo((r.corpus * 0.4 * 0.06) / 12, 6);
    expect(Math.round(r.corpus)).toBe(11396627);
  });
});

describe("Retirement", () => {
  it("growing annuity due equals the explicit sum", () => {
    let sum = 0;
    for (let k = 0; k < 25; k++) sum += 600000 * Math.pow(1.06, k) / Math.pow(1.08, k);
    expect(growingAnnuityDue(600000, 8, 6, 25)).toBeCloseTo(sum, 4);
  });
  it("equal return and inflation means expenses × years", () => {
    expect(growingAnnuityDue(500000, 6, 6, 20)).toBeCloseTo(10000000, 4);
  });
  it("the monthly SIP closes the gap exactly", () => {
    const r = retirementPlan({ age: 30, retireAge: 60, lifeExpectancy: 85, monthlyExpense: 50000, inflationPct: 6, preReturnPct: 12, postReturnPct: 8, currentSavings: 500000 });
    expect(r.rows.at(-1)!.value).toBeCloseTo(r.corpusNeeded, 0);
    expect(Math.round(r.monthlyExpenseAtRetirement)).toBe(287175);
  });
});

describe("EMI and amortisation", () => {
  it("₹50 lakh at 8.5% for 20 years", () => {
    expect(Math.round(emi(5000000, 8.5, 240))).toBe(43391);
  });
  it("₹10 lakh at 10.5% for 5 years", () => {
    expect(Math.round(emi(1000000, 10.5, 60))).toBe(21494);
  });
  it("principal repaid equals the loan", () => {
    const r = amortise(2500000, 9, 180);
    const paid = r.rows.reduce((s, x) => s + x.principalPaid, 0);
    expect(paid).toBeCloseTo(2500000, 2);
    expect(r.totalInterest).toBeCloseTo(r.emi * 180 - 2500000, 2);
  });
  it("prepayment shortens the loan and saves interest", () => {
    const r = loanWithPrepayment(5000000, 8.5, 240, { lumpSum: 500000, lumpSumMonth: 24 });
    expect(r.monthsSaved).toBeGreaterThan(0);
    expect(r.interestSaved).toBeGreaterThan(0);
    const paid = r.withPrepay.rows.reduce((s, x) => s + x.principalPaid + x.prepaid, 0);
    expect(paid).toBeCloseTo(5000000, 2);
  });
});

const base: TaxInput = { salary: 0, otherIncome: 0, age: "below60", sec80C: 0, sec80D: 0, sec80CCD1B: 0, homeLoanInterest: 0, hraExemption: 0, otherDeductions: 0 };

describe("Income tax, FY 2026-27", () => {
  it("new regime: ₹12.75 lakh salary pays no tax", () => {
    const r = computeTax({ ...base, salary: 1275000 }, "new");
    expect(r.taxableIncome).toBe(1200000);
    expect(r.totalTax).toBe(0);
  });
  it("new regime: marginal relief just above ₹12 lakh", () => {
    const r = computeTax({ ...base, salary: 1285000 }, "new");
    expect(r.taxableIncome).toBe(1210000);
    expect(r.totalTax).toBe(10400);
  });
  it("new regime: ₹13 lakh taxable income", () => {
    expect(computeTax({ ...base, salary: 1375000 }, "new").totalTax).toBe(78000);
  });
  it("new regime: surcharge at ₹60 lakh", () => {
    expect(computeTax({ ...base, salary: 6075000 }, "new").totalTax).toBe(1578720);
  });
  it("new regime: surcharge marginal relief just above ₹50 lakh", () => {
    const r = computeTax({ ...base, salary: 5175000 }, "new");
    expect(r.taxableIncome).toBe(5100000);
    expect(r.totalTax).toBe(1227200);
  });
  it("new regime caps surcharge at 25%", () => {
    const r = computeTax({ ...base, otherIncome: 60000000 }, "new");
    expect(r.surcharge / (r.slabTax)).toBeCloseTo(0.25, 6);
  });
  it("old regime: ₹10 lakh salary with full 80C", () => {
    expect(computeTax({ ...base, salary: 1000000, sec80C: 150000 }, "old").totalTax).toBe(75400);
  });
  it("old regime: rebate up to ₹5 lakh taxable", () => {
    expect(computeTax({ ...base, salary: 550000 }, "old").totalTax).toBe(0);
  });
  it("old regime: senior citizen exemption limit", () => {
    expect(computeTax({ ...base, otherIncome: 600000, age: "60to80" }, "old").totalTax).toBe(31200);
  });
  it("caps 80C at ₹1.5 lakh", () => {
    const a = computeTax({ ...base, salary: 1500000, sec80C: 400000 }, "old");
    const b = computeTax({ ...base, salary: 1500000, sec80C: 150000 }, "old");
    expect(a.totalTax).toBe(b.totalTax);
  });
  it("picks the cheaper regime", () => {
    const r = compareRegimes({ ...base, salary: 1800000 });
    expect(r.better).toBe("new");
    expect(r.saving).toBe(r.old.totalTax - r.new.totalTax);
  });
});

describe("HRA", () => {
  it("Mumbai: rent less 10% of salary is the binding limit", () => {
    const r = hraExemption({ basic: 600000, da: 0, hraReceived: 240000, rentPaid: 300000, metro: true });
    expect(r.exempt).toBe(240000);
    expect(r.taxable).toBe(0);
  });
  it("non-metro uses 40% of salary", () => {
    const r = hraExemption({ basic: 400000, da: 0, hraReceived: 200000, rentPaid: 300000, metro: false });
    expect(r.exempt).toBe(160000);
    expect(r.binding).toBe("salary");
  });
  it("no exemption when rent is below 10% of salary", () => {
    expect(hraExemption({ basic: 600000, da: 0, hraReceived: 200000, rentPaid: 50000, metro: true }).exempt).toBe(0);
  });
});

describe("Indian formatting", () => {
  it("groups in lakhs and crores", () => {
    expect(formatINR(12345678)).toBe("₹1,23,45,678");
    expect(formatINRCompact(12500000)).toBe("₹1.25 crore");
    expect(formatINRCompact(525000)).toBe("₹5.25 lakh");
  });
  it("writes amounts in words", () => {
    expect(amountInWords(500000)).toBe("5 lakh");
    expect(amountInWords(15000000)).toBe("1.5 crore");
    expect(amountInWords(45000)).toBe("45 thousand");
    expect(amountInWords(500)).toBe("500");
    expect(amountInWords(0)).toBe("0");
    expect(amountInWords(1000000)).toBe("10 lakh");
  });
  it("keeps whole numbers intact on chart axes", async () => {
    const { formatAxisINR } = await import("@/lib/format");
    expect(formatAxisINR(50000)).toBe("₹50K");
    expect(formatAxisINR(10000000)).toBe("₹1Cr");
    expect(formatAxisINR(2500000)).toBe("₹25L");
  });
});

describe("Dates", () => {
  it("formats WordPress (IST) timestamps", async () => {
    const { formatDate, formatDateTime } = await import("@/lib/format");
    expect(formatDate("2026-09-22T05:14:26")).toBe("22 Sep 2026");
    expect(formatDateTime("2026-09-22T17:05:00")).toBe("22 Sep 2026, 5:05 pm IST");
  });
});

describe("IPO status from dates", () => {
  it("moves through each stage", async () => {
    const { ipoStatus } = await import("@/lib/ipo");
    const ipo = { dates: { open: "2026-10-15", close: "2026-10-19", allotment: "2026-10-20", refund: "2026-10-21", demat: "2026-10-21", listing: "2026-10-22" } };
    expect(ipoStatus(ipo, "2026-10-14")).toBe("upcoming");
    expect(ipoStatus(ipo, "2026-10-15")).toBe("open");
    expect(ipoStatus(ipo, "2026-10-19")).toBe("open");
    expect(ipoStatus(ipo, "2026-10-20")).toBe("allotted");
    expect(ipoStatus(ipo, "2026-10-22")).toBe("listed");
  });
  it("lot sizes follow the ₹2 lakh retail limit", async () => {
    const { lotTable, getIpo } = await import("@/lib/ipo");
    const rows = lotTable(getIpo("hexagon-nutrition-ipo")!);
    // Matches the table published in TradeTarget's Hexagon Nutrition article
    expect(rows.map((r) => [r.lots, r.shares, r.amount])).toEqual([
      [1, 333, 14985],
      [13, 4329, 194805],
      [14, 4662, 209790],
      [66, 21978, 989010],
      [67, 22311, 1003995],
    ]);
  });
});
