import { interestQuestion } from "../lib/school-presentation";
import { studentText } from "../lib/student-text";
import { useState } from "react";
import data from "../data/career-pathways.json";
import schools from "../data/schools.json";
import { DepartmentCareer } from "../components/DepartmentCareer";
import { WorkplaceExamples } from "../components/WorkplaceExamples";
import { workplaceExamples } from "../data/workplace-examples";
import {
  annualPay,
  availableSamples,
  salaryStart,
  collectedBenchmark,
  money,
  relativeStart,
  roleSalary,
  salarySummary,
  type CareerDepartment,
} from "../lib/careers";
const names = new Map(
  schools.flatMap((s) =>
    s.departments.map((d) => [d.id, { school: s.name, department: d.name }]),
  ),
);
function References({
  department,
  ids,
}: {
  department: CareerDepartment;
  ids: string[];
}) {
  return (
    <div className="source-links">
      {department.sources
        .filter((s) => ids.includes(s.id))
        .map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
            {s.title
              .replace(": 진로 안내이며 취업 실적 아님", "")
              .replace("(교육 적용연도 미표기)", "")
              .trim()}{" "}
            ↗
          </a>
        ))}
    </div>
  );
}
export function CareerComparePage() {
  const [school, setSchool] = useState("all"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<string | null>(null);
  const rows = data.departments.filter(
    (d) =>
      (school === "all" || d.schoolId === school) &&
      [
        names.get(d.departmentId)?.department,
        ...d.roles.map((r) => r.title),
        ...(workplaceExamples[d.departmentId] ?? []).map(
          (e) => `${e.place} ${e.work}`,
        ),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  const department = data.departments.find((d) => d.departmentId === selected);
  const open = (id: string) => {
    setSelected(id);
    window.scrollTo?.({ top: 0 });
  };
  const back = () => {
    setSelected(null);
    window.scrollTo?.({ top: 0 });
  };
  const title = department ? names.get(department.departmentId) : null;
  return (
    <section className="career-comparison">
      <div className="page-heading">
        <p className="eyebrow">EXPLORE · 학과에서 실제 일까지</p>
        <h1>
          {department
            ? `${title?.department}, 어떤 일을 할까?`
            : "배우는 것과 일하는 모습을 함께 비교해 봐."}
        </h1>
        <p>
          {department
            ? title?.school
            : "충주공고 4학과 · 충주상고 5학과의 배움과 진로를 살펴봐."}
        </p>
      </div>
      {department ? (
        <>
          <button className="comparison-back" onClick={back}>
            ← 비교표로 돌아가기
          </button>
          <div className="panel">
            <h2>학교가 안내한 진로</h2>
            <p>{studentText(department.schoolGuidance)}</p>
            {interestQuestion(department.departmentId) && (
              <p className="interest-question">
                생각해 볼 질문 · {interestQuestion(department.departmentId)}
              </p>
            )}
            <References
              department={department}
              ids={department.schoolSourceIds}
            />
          </div>
          <WorkplaceExamples departmentId={department.departmentId} />
          <h2>연계 직무별로 더 자세히</h2>
          <p>직무마다 어떤 일을 하고, 무엇을 준비하는지 살펴보자.</p>
          <div className="role-detail-grid">
            {department.roles.map((role) => {
              const samples = roleSalary(department, role);
              return (
                <article key={role.id} className="panel role-detail">
                  <p className="eyebrow">{title?.department} · 연계 직무</p>
                  <h2>{role.title}</h2>
                  <h3>실제로 하는 일</h3>
                  <p>{studentText(role.tasks)}</p>

                  <div className="role-pay">
                    <h3>초봉 연봉 수준 · 세전</h3>
                    <strong>{salarySummary(samples ?? [])}</strong>
                    {samples ? (
                      <>
                        <p>
                          {relativeStart(
                            Math.min(...samples.map((s) => annualPay(s).min)),
                          )}{" "}
                          · 수집 공고 시작액 평균 대비
                        </p>
                        <p className="privacy-note">
                          2026년 신입 공고 {samples.length}건 · 전국 사례
                        </p>
                        <details className="role-more">
                          <summary>채용 공고와 근무 조건 확인</summary>
                          {samples.map((s) => (
                            <div className="role-pay-sample" key={s.sourceId}>
                              <p>
                                {s.role} · {s.region} · {s.education} ·{" "}
                                {s.experience}
                              </p>
                              <p>
                                {s.payPeriod === "month" ? "월" : "연"}{" "}
                                {money(s.minManwon)}
                                {s.maxManwon === null
                                  ? "만원 이상"
                                  : s.maxManwon === s.minManwon
                                    ? "만원"
                                    : `~${money(s.maxManwon)}만원`}{" "}
                                · 주 소정 {s.weeklyHours}시간 · {s.contract}
                              </p>
                              <small>{s.notes}</small>
                              <References
                                department={department}
                                ids={[s.sourceId]}
                              />
                            </div>
                          ))}
                        </details>
                      </>
                    ) : (
                      <p>
                        관심 있는 직무의 채용 공고에서 근무 조건을 살펴보자.
                      </p>
                    )}
                  </div>
                  <details className="role-more">
                    <summary>근무환경과 준비할 역량</summary>
                    <p>{studentText(role.workEnvironment)}</p>
                    <h3>기본으로 준비할 역량</h3>
                    <ul>
                      {role.essentialSkills.map((t) => (
                        <li key={t}>{studentText(t)}</li>
                      ))}
                    </ul>
                    <h3>더 배워 볼 경로</h3>
                    <p>{studentText(role.nextStep)}</p>
                  </details>
                  <details className="role-more">
                    <summary>영어 활용과 연습 방법</summary>
                    <div className="english-highlight">
                      <h3>영어 활용</h3>
                      <p>{role.english.use}</p>
                      <h4>작게 연습해 보기</h4>
                      <p>{role.english.practice}</p>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
          <DepartmentCareer
            departmentId={department.departmentId}
            showWorkplaces={false}
          />
        </>
      ) : (
        <>
          <div className="comparison-intro panel">
            <div>
              <p className="eyebrow">한눈에 비교하고, 궁금한 일은 더 자세히</p>
              <h2>학교 → 학과 → 연계 직무</h2>
              <p>
                어떤 일을 하는지, 무엇을 준비해야 하는지부터 살펴봐. 급여 하나로
                학과를 고르지 않아도 괜찮아.
              </p>
            </div>
            <a href="#schools" className="comparison-link">
              학교·입학 정보 보기 ↗
            </a>
          </div>
          <p className="comparison-benchmark">
            비교 기준: 세전 연 약 {money(collectedBenchmark.mean)}만원 · 수집
            공고 {collectedBenchmark.count}건의 시작액 평균 · 전국 평균 아님{" "}
            <a
              href="#salary-method"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("salary-method")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              산정 방식 ↓
            </a>
          </p>
          <div className="comparison-controls">
            <label>
              학교
              <select
                aria-label="학교 선택"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              >
                <option value="all">두 학교 모두</option>
                <option value="cjth">충주공업고등학교</option>
                <option value="chungjuch">충주상업고등학교</option>
              </select>
            </label>
            <label>
              학과·직무 찾기
              <input
                aria-label="학과·직무 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 조리, 기계, 회계"
              />
            </label>
            <span>{rows.length}개 학과</span>
          </div>
          <p className="school-color-legend">
            <span className="legend-cjth">충주공고</span>
            <span className="legend-chungjuch">충주상고</span> · 학교별 색으로
            구분했어
          </p>
          <div
            className="comparison-table-wrap"
            tabIndex={0}
            aria-label="학과별 직무와 초봉 비교표"
          >
            <table className="career-table">
              <caption>학과별 직무·초봉 비교 · 2026 공고 사례</caption>
              <thead>
                <tr>
                  <th scope="col">학교·학과</th>
                  <th scope="col">연계 직무</th>
                  <th scope="col">세전 초봉 참고</th>
                  <th scope="col">수집 시작액 평균 대비</th>
                  <th scope="col">역량·영어</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr className={`school-${d.schoolId}`} key={d.departmentId}>
                    <th scope="row">
                      <small>{names.get(d.departmentId)?.school}</small>
                      <button
                        data-department={d.departmentId}
                        onClick={() => open(d.departmentId)}
                      >
                        {names.get(d.departmentId)?.department} →
                      </button>
                    </th>
                    <td>
                      {d.roles.map((r) => (
                        <div key={r.id}>{r.title}</div>
                      ))}
                    </td>
                    <td>
                      <strong>
                        {salarySummary(availableSamples(d.salary.samples))}
                      </strong>
                      <small>
                        학과 연계 공고 사례{" "}
                        {availableSamples(d.salary.samples).length}건 · 직무마다
                        다름
                      </small>
                    </td>
                    <td>
                      {relativeStart(
                        salaryStart(availableSamples(d.salary.samples)),
                      )}
                      <small>학과 공고 최저 시작액 기준</small>
                    </td>
                    <td>
                      {d.roles[0].essentialSkills[0]}
                      <small>영어: {d.roles[0].english.use}</small>
                      <button onClick={() => open(d.departmentId)}>
                        직무별 상세 보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="comparison-mobile-cards">
            {rows.map((d) => (
              <article
                className={`panel school-${d.schoolId}`}
                key={d.departmentId}
              >
                <p className="eyebrow">{names.get(d.departmentId)?.school}</p>
                <h2>{names.get(d.departmentId)?.department}</h2>
                <p>{d.roles.map((r) => r.title).join(" · ")}</p>
                <h3>세전 초봉 참고</h3>
                <strong>
                  {salarySummary(availableSamples(d.salary.samples))}
                </strong>
                <p>
                  {relativeStart(
                    salaryStart(availableSamples(d.salary.samples)),
                  )}{" "}
                  · 수집 시작액 평균 대비
                </p>
                <small>학과 공고 최저 시작액 기준 · 직무마다 다름</small>
                <details className="role-more mobile-comparison-more">
                  <summary>역량과 영어 활용</summary>
                  <h3>역량·영어</h3>
                  <p>{d.roles[0].essentialSkills[0]}</p>
                  <p>{d.roles[0].english.use}</p>
                </details>
                <button onClick={() => open(d.departmentId)}>
                  직무별 상세 보기 →
                </button>
              </article>
            ))}
          </div>
          {!rows.length && (
            <div className="panel">
              <p>조건에 맞는 학과·직무가 없어.</p>
              <button
                onClick={() => {
                  setSchool("all");
                  setQuery("");
                }}
              >
                검색·학교 초기화
              </button>
            </div>
          )}
        </>
      )}
      <aside className="panel comparison-method" id="salary-method">
        <h2>연봉 비교의 기준을 먼저 확인해 줘.</h2>
        <p>
          <strong>
            {data.comparison.benchmarkLabel}: 연 약{" "}
            {money(collectedBenchmark.mean)}만원
          </strong>{" "}
          · 중복 제외 {collectedBenchmark.count}개 공고
        </p>
        <p>{data.comparison.benchmarkMethod}</p>
        <p>{data.comparison.nationalAverageStatus}</p>
        <p>
          비교율 = (해당 공고 시작액 ÷ 수집 시작액 평균 − 1) × 100. 학과 표는
          해당 학과 공고의 가장 낮은 시작액, 직무 카드는 연결된 공고의 가장 낮은
          시작액을 사용해. 높은 초봉 순위나 취업 추천 점수가 아니야.
        </p>
        <p>
          2026년 신입 채용 공고에 적힌 세전 금액이야. 지역과 근무시간,
          상여·수당과 계약기간을 함께 살펴봐.
        </p>
        <p>
          월급×12는 비교용이며 12개월 계약을 보장하지 않아. 일부 공고의 상한
          미확인은 전체 상한을 뜻하지 않아. 실제 수령액·연장/야간
          수당·상여·퇴직금·휴게시간은 계약별로 확인해야 해. 자료 확인{" "}
          {data.checkedAt}.
        </p>
      </aside>
      <aside className="panel english-highlight">
        <h2>영어를 배우면 넓혀 볼 수 있는 선택</h2>
        <p>{data.comparison.englishNotice}</p>
        <p>{data.comparison.overseasNotice}</p>
        <div className="source-links">
          {data.comparison.sources.map((s) => (
            <a
              href={s.url}
              key={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.title
                .replace(": 진로 안내이며 취업 실적 아님", "")
                .replace("(교육 적용연도 미표기)", "")
                .trim()}{" "}
              ↗
            </a>
          ))}
        </div>
        <p className="privacy-note">
          공통 해외·어학 자료 확인 {data.checkedAt}. 직무별 연습은 위 자료와
          기존 직업 설명을 연결한 제안이야.
        </p>
      </aside>
    </section>
  );
}
