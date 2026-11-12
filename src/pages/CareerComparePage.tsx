import { useState } from "react";
import data from "../data/career-pathways.json";
import schools from "../data/schools.json";
import { DepartmentCareer } from "../components/DepartmentCareer";
import {
  annualPay,
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
            {s.title} ↗
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
      [names.get(d.departmentId)?.department, ...d.roles.map((r) => r.title)]
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
            : "충주공고 4학과 · 충주상고 5학과 · 학교 순서는 추천 순위가 아니야."}
        </p>
      </div>
      {department ? (
        <>
          <button className="comparison-back" onClick={back}>
            ← 비교표로 돌아가기
          </button>
          <div className="panel">
            <h2>학교가 안내한 진로</h2>
            <p>{department.schoolGuidance}</p>
            <References
              department={department}
              ids={department.schoolSourceIds}
            />
            <p className="privacy-note">
              실제 학과별 취업 배치·졸업생 급여 실적은 미확인 · 자료 확인{" "}
              {data.checkedAt}
            </p>
          </div>
          <div className="panel">
            <h2>시장 흐름과 전망</h2>
            <p>{department.market.summary}</p>
            <div className="career-market-grid">
              <div>
                <h3>살펴볼 기회</h3>
                <ul>
                  {department.market.opportunities.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>함께 고려할 점</h3>
                <ul>
                  {department.market.risks.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="privacy-note">
              산업 전망을 연결한 해석이며 이 학교 고졸 신입의 채용 규모나 취업
              확률이 아니야.
            </p>
            <References
              department={department}
              ids={department.market.sourceIds}
            />
          </div>
          <h2>연계 직무별로 더 자세히</h2>
          <p>
            학과가 같아도 실제 업무·필요한 준비·급여는 다를 수 있어. 역량은 학습
            제안이며 회사별 채용 공고를 다시 확인해 줘.
          </p>
          <div className="role-detail-grid">
            {department.roles.map((role) => {
              const samples = roleSalary(department, role);
              return (
                <article key={role.id} className="panel role-detail">
                  <p className="eyebrow">{title?.department} · 연계 직무</p>
                  <h2>{role.title}</h2>
                  <h3>실제로 하는 일</h3>
                  <p>{role.tasks}</p>
                  <p className="privacy-note">{role.entryNotes}</p>

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
                          해당 직무와 연결되는 공고 {samples.length}건. 2026
                          사례이며 직무 평균·미래 졸업 시점의 임금이 아니야.
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
                        학과 전체나 다른 직무의 급여를 이 직무의 초봉으로 옮겨
                        쓰지 않았어. 실제 신입 공고의 학력·근무시간·계약 조건을
                        추가 확인해 줘.
                      </p>
                    )}
                  </div>
                  <details className="role-more">
                    <summary>근무환경과 준비할 역량</summary>
                    <p>{role.workEnvironment}</p>
                    <h3>기본으로 준비할 역량</h3>
                    <ul>
                      {role.essentialSkills.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                    <h3>더 배워 볼 경로</h3>
                    <p>{role.nextStep}</p>
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
          <DepartmentCareer departmentId={department.departmentId} />
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
          <div
            className="comparison-table-wrap"
            tabIndex={0}
            aria-label="학과별 직무 초봉 전망 비교표"
          >
            <table className="career-table">
              <caption>학과별 직무·초봉·전망 비교 · 2026 공고 사례</caption>
              <thead>
                <tr>
                  <th scope="col">학교·학과</th>
                  <th scope="col">연계 직무</th>
                  <th scope="col">세전 초봉 참고</th>
                  <th scope="col">수집 시작액 평균 대비</th>
                  <th scope="col">시장·전망</th>
                  <th scope="col">역량·영어</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.departmentId}>
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
                      <strong>{salarySummary(d.salary.samples)}</strong>
                      <small>
                        학과 연계 공고 사례 {d.salary.samples.length}건 ·
                        직무마다 다름
                      </small>
                    </td>
                    <td>
                      {relativeStart(d.salary.annualMinManwon)}
                      <small>학과 공고 최저 시작액 기준</small>
                    </td>
                    <td>{d.market.summary}</td>
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
              <article className="panel" key={d.departmentId}>
                <p className="eyebrow">{names.get(d.departmentId)?.school}</p>
                <h2>{names.get(d.departmentId)?.department}</h2>
                <p>{d.roles.map((r) => r.title).join(" · ")}</p>
                <h3>세전 초봉 참고</h3>
                <strong>{salarySummary(d.salary.samples)}</strong>
                <p>
                  {relativeStart(d.salary.annualMinManwon)} · 수집 시작액 평균
                  대비
                </p>
                <small>학과 공고 최저 시작액 기준 · 직무마다 다름</small>
                <h3>시장·전망</h3>
                <p>{d.market.summary}</p>
                <h3>역량·영어</h3>
                <p>{d.roles[0].essentialSkills[0]}</p>
                <p>{d.roles[0].english.use}</p>
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
        <p>{data.salaryNotice}</p>
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
              {s.title} ↗
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
