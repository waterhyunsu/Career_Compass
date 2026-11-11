// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import data from "../src/data/career-pathways.json";
import {
  annualPay,
  collectedBenchmark,
  salarySummary,
  roleSalary,
  relativeStart,
} from "../src/lib/careers";
import { CareerComparePage } from "../src/pages/CareerComparePage";
it("월급을 연환산하고 중복 제거한 공고 시작액만 표본평균에 쓴다", () => {
  expect(
    annualPay({ payPeriod: "month", minManwon: 220, maxManwon: 260 }),
  ).toEqual({ min: 2640, max: 3120 });
  const unique = new Map(
    data.departments
      .flatMap((d) => d.salary.samples)
      .map((s) => [s.sourceId, s]),
  );
  const expected =
    [...unique.values()].reduce(
      (n, s) => n + s.minManwon * (s.payPeriod === "month" ? 12 : 1),
      0,
    ) / unique.size;
  expect(collectedBenchmark.count).toBe(unique.size);
  expect(collectedBenchmark.mean).toBeCloseTo(expected);
  expect(relativeStart(collectedBenchmark.mean)).toBe("기준과 같음");
});
it("직무와 맞는 공고만 쓰고 미확인 급여와 상한을 만들지 않는다", () => {
  const cnc = data.departments.find((d) => d.departmentId === "cjth-machine")!;
  expect(roleSalary(cnc, cnc.roles[0])).toBeNull();
  expect(salarySummary(cnc.salary.samples)).toContain("일부 상한 미확인");
  for (const d of data.departments)
    for (const r of d.roles) {
      expect(r.essentialSkills.length).toBeGreaterThan(1);
      expect(r.english.use.length).toBeGreaterThan(10);
      expect(r.english.practice.length).toBeGreaterThan(10);
      for (const id of r.salarySourceIds)
        expect(d.salary.samples.some((s) => s.sourceId === id)).toBe(true);
    }
});
it("학교 필터·학과 선택·직무별 영어와 급여 미확인·복귀를 제공한다", async () => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<CareerComparePage />));
    expect(host.textContent).toContain("전국 평균");
    expect(host.querySelectorAll("tbody tr")).toHaveLength(9);
    const select = host.querySelector("select")!;
    await act(async () => {
      select.value = "cjth";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(host.querySelectorAll("tbody tr")).toHaveLength(4);
    const open = host.querySelector(
      'button[data-department="cjth-machine"]',
    ) as HTMLButtonElement;
    await act(async () => open.click());
    expect(host.textContent).toContain("CNC");
    expect(host.textContent).toContain("직무별 급여 근거 미확인");
    expect(host.textContent).toContain("영어 활용");
    expect(host.textContent).toContain("작게 연습해 보기");
    const back = [...host.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("비교표로 돌아가기"),
    )!;
    await act(async () => back.click());
    expect(host.querySelectorAll("tbody tr")).toHaveLength(4);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    scroll.mockRestore();
  }
});
