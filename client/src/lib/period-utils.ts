export interface PayPeriod {
  periodNumber:          number;
  year:                  number;
  startDate:             Date;
  endDate:               Date;
  isThreePaycheckMonth:  boolean;
}

export function generatePayPeriods(firstPayDate: Date, year: number): PayPeriod[] {
  const periods: Array<{ periodNumber: number; startDate: Date; endDate: Date }> = [];
  const current = new Date(firstPayDate);

  for (let i = 0; i < 26; i++) {
    const start = new Date(current);
    const end   = new Date(current);
    end.setDate(end.getDate() + 13);
    periods.push({ periodNumber: i + 1, startDate: start, endDate: end });
    current.setDate(current.getDate() + 14);
  }

  const monthCounts: Record<number, number> = {};
  periods.forEach(p => {
    const m = p.startDate.getMonth();
    monthCounts[m] = (monthCounts[m] ?? 0) + 1;
  });

  return periods.map(p => ({
    ...p,
    year,
    isThreePaycheckMonth: (monthCounts[p.startDate.getMonth()] ?? 0) >= 3,
  }));
}

export function findCurrentPeriod(periods: PayPeriod[]): PayPeriod | undefined {
  const today = new Date();
  return periods.find(
    p => today >= p.startDate && today <= p.endDate
  );
}

export function formatPeriodLabel(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}
