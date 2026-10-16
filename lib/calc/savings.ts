// Deposit calculators: PPF, FD and RD.

export type DepositRow = {
  year: number;
  deposited: number;
  interest: number;
  balance: number;
};

/** PPF: yearly deposit at the start of each year, interest compounded annually. */
export function ppf(yearlyDeposit: number, annualPct: number, years: number) {
  const r = annualPct / 100;
  let balance = 0;
  let deposited = 0;
  const rows: DepositRow[] = [];
  for (let y = 1; y <= years; y++) {
    balance += yearlyDeposit;
    deposited += yearlyDeposit;
    const interest = balance * r;
    balance += interest;
    rows.push({ year: y, deposited, interest: balance - deposited, balance });
  }
  return { deposited, interest: balance - deposited, maturity: balance, rows };
}

/** Closed form for PPF maturity: P × [((1 + r)^n − 1) / r] × (1 + r). */
export function ppfClosedForm(yearlyDeposit: number, annualPct: number, years: number) {
  const r = annualPct / 100;
  if (r === 0) return yearlyDeposit * years;
  return yearlyDeposit * ((Math.pow(1 + r, years) - 1) / r) * (1 + r);
}

export const COMPOUNDING = {
  monthly: 12,
  quarterly: 4,
  "half-yearly": 2,
  yearly: 1,
} as const;
export type Compounding = keyof typeof COMPOUNDING;

/** Cumulative FD: A = P × (1 + r/n)^(n × t). Tenure is in months. */
export function fd(principal: number, annualPct: number, months: number, compounding: Compounding = "quarterly") {
  const n = COMPOUNDING[compounding];
  const r = annualPct / 100;
  const amountAt = (m: number) => principal * Math.pow(1 + r / n, (n * m) / 12);
  const rows: DepositRow[] = [];
  for (let y = 1; y <= Math.ceil(months / 12); y++) {
    const balance = amountAt(Math.min(y * 12, months));
    rows.push({ year: y, deposited: principal, interest: balance - principal, balance });
  }
  const maturity = amountAt(months);
  return { deposited: principal, interest: maturity - principal, maturity, rows };
}

/**
 * Recurring deposit with quarterly compounding, as Indian banks calculate it.
 * The k-th instalment from the end stays invested for k months and earns
 * (1 + r/4)^(k/3).
 */
export function rd(monthly: number, annualPct: number, months: number) {
  const q = annualPct / 400;
  const valueAfter = (m: number) => {
    let total = 0;
    for (let k = 1; k <= m; k++) total += monthly * Math.pow(1 + q, k / 3);
    return total;
  };
  const rows: DepositRow[] = [];
  for (let y = 1; y <= Math.ceil(months / 12); y++) {
    const m = Math.min(y * 12, months);
    const balance = valueAfter(m);
    rows.push({ year: y, deposited: monthly * m, interest: balance - monthly * m, balance });
  }
  const maturity = valueAfter(months);
  return { deposited: monthly * months, interest: maturity - monthly * months, maturity, rows };
}

/** Bank formula: M = R × [(1 + i)^n − 1] / [1 − (1 + i)^(−1/3)], n in quarters. */
export function rdClosedForm(monthly: number, annualPct: number, months: number) {
  const i = annualPct / 400;
  const n = months / 3;
  return (monthly * (Math.pow(1 + i, n) - 1)) / (1 - Math.pow(1 + i, -1 / 3));
}
