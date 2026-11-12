import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import careerData from "../src/data/career-pathways.json";
import schools from "../src/data/schools.json";
import { DepartmentCareer } from "../src/components/DepartmentCareer";
it("대상2학교9학과의 직무·추정급여·학교/시장/채용출처를 빠짐없이 연결한다", () => {
  const targets = schools
    .filter((s) => ["cjth", "chungjuch"].includes(s.id))
    .flatMap((s) => s.departments.map((d) => d.id));
  expect(careerData.departments.map((d) => d.departmentId).sort()).toEqual(
    targets.sort(),
  );
  for (const d of careerData.departments) {
    const refs = new Set(d.sources.map((s) => s.id));
    expect(d.roles.length).toBeGreaterThan(0);
    expect(d.market.interpretation).toBe(true);
    for (const id of [
      ...d.schoolSourceIds,
      ...d.market.sourceIds,
      ...d.salary.samples.map((s) => s.sourceId),
    ])
      expect(refs.has(id)).toBe(true);
    expect(d.sources.some((s) => s.kind === "school")).toBe(true);
    expect(d.sources.some((s) => s.kind === "job_posting")).toBe(true);
    expect(d.salary.basisYear).toBe(2026);
    expect(d.salary.kind).toBe("posting_based_reference_estimate");
    expect(
      d.salary.samples.every(
        (s) => s.education.includes("고졸") || s.education.includes("학력무관"),
      ),
    ).toBe(true);
    const annual = (s: (typeof d.salary.samples)[number], value: number) =>
      s.payPeriod === "month" ? value * 12 : value;
    expect(d.salary.annualMinManwon).toBe(
      Math.min(...d.salary.samples.map((s) => annual(s, s.minManwon))),
    );
    const known = d.salary.samples
      .filter((s) => s.maxManwon !== null)
      .map((s) => annual(s, s.maxManwon!));
    expect(d.salary.annualMaxManwon).toBe(
      known.length ? Math.max(...known) : null,
    );
    for (const source of d.sources)
      expect(new URL(source.url).protocol).toBe("https:");
  }
});
it("학과 상세에 실제 업무·세전초봉·자료시점·공고원문·졸업시점 한계를 함께 표시한다", () => {
  const html = renderToStaticMarkup(
    <DepartmentCareer departmentId="chungjuch-it" />,
  );
  for (const text of [
    "졸업 후 직무·초봉 보기",
    "2026",
    "세전",
    "졸업 시점",
    "고졸",
    "고용24",
    "추가 준비",
    "일할 수 있는 곳과 하는 일",
    "채용 조건과 필요한 자격",
  ])
    expect(html).toContain(text);
  expect(html).toContain("work24.go.kr");
  expect(html).toContain("<details");
});
it("급여 상한 근거가 없으면 수치를 만들어 표시하지 않으며 미대상 학과는 패널을 만들지 않는다", () => {
  expect(
    renderToStaticMarkup(<DepartmentCareer departmentId="cjth-civil" />),
  ).toContain("상한 미확인");
  expect(
    renderToStaticMarkup(<DepartmentCareer departmentId="had-visual" />),
  ).toBe("");
});

it("일부 표본의 상한이 없으면 알려진 상한을 전체 상한처럼 단정하지 않는다", () => {
  const html = renderToStaticMarkup(
    <DepartmentCareer departmentId="chungjuch-accounting" />,
  );
  expect(html).toContain("일부 공고의 상한은 미확인");
  expect(html).toContain("전체 상한은 아니야");
});
