// Loan EMI, amortisation and prepayment.

export function emi(principal: number, annualPct: number, months: number): number {
  if (months <= 0) return 0;
  const r = annualPct / 100 / 12;
  if (r === 0) return principal / months;
  const g = Math.pow(1 + r, months);
  return (principal * r * g) / (g - 1);
}

export type AmortRow = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  prepaid: number;
  balance: number;
};

export type Prepayment = {
  /** One-time prepayment amount and the month (1-based) it is paid after */
  lumpSum?: number;
  lumpSumMonth?: number;
  /** Extra amount paid at the end of every 12th month */
  yearly?: number;
};

/**
 * Month-by-month amortisation. Prepayments reduce the outstanding balance and the EMI is kept
 * unchanged, so the loan closes earlier.
 */
export function amortise(principal: number, annualPct: number, months: number, prepay: Prepayment = {}) {
  const r = annualPct / 100 / 12;
  const instalment = emi(principal, annualPct, months);
  let balance = principal;
  let totalInterest = 0;
  let totalPrepaid = 0;
  let month = 0;
  const rows: AmortRow[] = [];
  let yp = 0;
  let yi = 0;
  let ypre = 0;
  while (balance > 0.005 && month < months) {
    month++;
    const interest = balance * r;
    const principalPart = Math.min(instalment - interest, balance);
    balance -= principalPart;
    totalInterest += interest;
    yp += principalPart;
    yi += interest;
    let extra = 0;
    if (prepay.lumpSum && prepay.lumpSumMonth === month) extra += prepay.lumpSum;
    if (prepay.yearly && month % 12 === 0) extra += prepay.yearly;
    extra = Math.min(extra, balance);
    balance -= extra;
    totalPrepaid += extra;
    ypre += extra;
    if (month % 12 === 0 || balance <= 0.005 || month === months) {
      rows.push({ year: Math.ceil(month / 12), principalPaid: yp, interestPaid: yi, prepaid: ypre, balance: Math.max(balance, 0) });
      yp = 0;
      yi = 0;
      ypre = 0;
    }
  }
  return {
    emi: instalment,
    months: month,
    totalInterest,
    totalPrepaid,
    totalPayment: principal + totalInterest,
    rows,
  };
}

/** Loan with a prepayment plan compared against the same loan without it. */
export function loanWithPrepayment(principal: number, annualPct: number, months: number, prepay: Prepayment) {
  const base = amortise(principal, annualPct, months);
  const withPrepay = amortise(principal, annualPct, months, prepay);
  return {
    base,
    withPrepay,
    interestSaved: base.totalInterest - withPrepay.totalInterest,
    monthsSaved: base.months - withPrepay.months,
  };
}
