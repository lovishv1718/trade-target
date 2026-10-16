// Investment calculators: SIP, lumpsum, step-up SIP, SWP and CAGR.
// All rates are annual percentages (12 means 12% a year).

export type GrowthRow = {
  year: number;
  invested: number;
  returns: number;
  value: number;
};

const monthlyRate = (annualPct: number) => annualPct / 100 / 12;

/** Future value of an annuity due: instalment at the start of each month, compounded monthly. */
export function sipFutureValue(monthly: number, annualPct: number, months: number): number {
  const i = monthlyRate(annualPct);
  if (months <= 0) return 0;
  if (i === 0) return monthly * months;
  return monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
}

export function sip(monthly: number, annualPct: number, years: number) {
  const months = Math.round(years * 12);
  const rows: GrowthRow[] = [];
  for (let y = 1; y <= Math.ceil(years); y++) {
    const m = Math.min(y * 12, months);
    const value = sipFutureValue(monthly, annualPct, m);
    const invested = monthly * m;
    rows.push({ year: y, invested, returns: value - invested, value });
  }
  const value = sipFutureValue(monthly, annualPct, months);
  const invested = monthly * months;
  return { invested, returns: value - invested, value, rows };
}

export function lumpsum(principal: number, annualPct: number, years: number) {
  const r = annualPct / 100;
  const rows: GrowthRow[] = [];
  for (let y = 1; y <= Math.ceil(years); y++) {
    const t = Math.min(y, years);
    const value = principal * Math.pow(1 + r, t);
    rows.push({ year: y, invested: principal, returns: value - principal, value });
  }
  const value = principal * Math.pow(1 + r, years);
  return { invested: principal, returns: value - principal, value, rows };
}

export type StepUpRow = GrowthRow & { monthlyInstalment: number };

/** SIP whose instalment rises by stepUpPct once every 12 months. */
export function stepUpSip(monthly: number, stepUpPct: number, annualPct: number, years: number) {
  const i = monthlyRate(annualPct);
  const months = Math.round(years * 12);
  let balance = 0;
  let invested = 0;
  const rows: StepUpRow[] = [];
  for (let m = 1; m <= months; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    const instalment = monthly * Math.pow(1 + stepUpPct / 100, yearIndex);
    balance = (balance + instalment) * (1 + i);
    invested += instalment;
    if (m % 12 === 0 || m === months) {
      rows.push({ year: Math.ceil(m / 12), invested, returns: balance - invested, value: balance, monthlyInstalment: instalment });
    }
  }
  return { invested, returns: balance - invested, value: balance, rows, finalInstalment: rows.at(-1)?.monthlyInstalment ?? monthly };
}

export type SwpRow = {
  year: number;
  opening: number;
  withdrawn: number;
  returns: number;
  closing: number;
};

/** Systematic withdrawal: each month the balance earns a month's return, then the withdrawal is paid out. */
export function swp(corpus: number, monthlyWithdrawal: number, annualPct: number, years: number) {
  const i = monthlyRate(annualPct);
  const months = Math.round(years * 12);
  let balance = corpus;
  let totalWithdrawn = 0;
  let depletedAtMonth: number | null = null;
  const rows: SwpRow[] = [];
  let yearOpening = corpus;
  let yearWithdrawn = 0;
  let yearReturns = 0;
  for (let m = 1; m <= months; m++) {
    const growth = balance * i;
    balance += growth;
    yearReturns += growth;
    const w = Math.min(monthlyWithdrawal, balance);
    balance -= w;
    totalWithdrawn += w;
    yearWithdrawn += w;
    if (balance <= 0.005 && depletedAtMonth === null) {
      balance = 0;
      depletedAtMonth = m;
    }
    if (m % 12 === 0 || m === months) {
      rows.push({ year: Math.ceil(m / 12), opening: yearOpening, withdrawn: yearWithdrawn, returns: yearReturns, closing: balance });
      yearOpening = balance;
      yearWithdrawn = 0;
      yearReturns = 0;
    }
  }
  return {
    corpus,
    totalWithdrawn,
    finalValue: balance,
    totalReturns: balance + totalWithdrawn - corpus,
    depletedAtMonth,
    rows,
  };
}

/** Closed form of the SWP balance after n months when the corpus does not run out. */
export function swpClosedForm(corpus: number, monthlyWithdrawal: number, annualPct: number, months: number) {
  const i = monthlyRate(annualPct);
  if (i === 0) return corpus - monthlyWithdrawal * months;
  const g = Math.pow(1 + i, months);
  return corpus * g - monthlyWithdrawal * ((g - 1) / i);
}

export function cagr(start: number, end: number, years: number): number {
  if (start <= 0 || years <= 0) return 0;
  return (Math.pow(end / start, 1 / years) - 1) * 100;
}

export function cagrPath(start: number, ratePct: number, years: number) {
  const rows: { year: number; value: number }[] = [{ year: 0, value: start }];
  for (let y = 1; y <= Math.ceil(years); y++) {
    rows.push({ year: y, value: start * Math.pow(1 + ratePct / 100, Math.min(y, years)) });
  }
  return rows;
}
