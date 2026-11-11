import data from "../data/career-pathways.json";
export type CareerDepartment = (typeof data.departments)[number];
export type CareerRole = CareerDepartment["roles"][number];
export type PaySample = CareerDepartment["salary"]["samples"][number];
export const money = (n: number) =>
  n.toLocaleString("ko-KR", { maximumFractionDigits: 0 });
export function annualPay(
  s: Pick<PaySample, "payPeriod" | "minManwon" | "maxManwon">,
) {
  const factor = s.payPeriod === "month" ? 12 : 1;
  return {
    min: s.minManwon * factor,
    max: s.maxManwon === null ? null : s.maxManwon * factor,
  };
}
const unique = [
  ...new Map(
    data.departments
      .flatMap((d) => d.salary.samples)
      .map((s) => [s.sourceId, s]),
  ).values(),
];
export const collectedBenchmark = {
  count: unique.length,
  mean: unique.reduce((n, s) => n + annualPay(s).min, 0) / unique.length,
};
export function salarySummary(samples: PaySample[]) {
  if (!samples.length) return "직무별 급여 근거 미확인";
  const pays = samples.map(annualPay),
    min = Math.min(...pays.map((s) => s.min));
  const known = pays.flatMap((s) => (s.max === null ? [] : [s.max]));
  const unknown = pays.some((s) => s.max === null);
  if (!known.length) return `연 ${money(min)}만원 이상 · 상한 미확인`;
  const max = Math.max(...known, ...pays.map((s) => s.min));
  return `연 ${money(min)}${max === min ? "" : `~${money(max)}`}만원${unknown ? " · 일부 상한 미확인" : ""}`;
}
export function relativeStart(value: number) {
  const p = (value / collectedBenchmark.mean - 1) * 100;
  return Math.abs(p) < 0.05
    ? "기준과 같음"
    : `시작액 ${p > 0 ? "+" : ""}${p.toFixed(1)}%`;
}
export function roleSalary(department: CareerDepartment, role: CareerRole) {
  const samples = department.salary.samples.filter((s) =>
    (role.salarySourceIds as string[]).includes(s.sourceId),
  );
  return samples.length ? samples : null;
}
