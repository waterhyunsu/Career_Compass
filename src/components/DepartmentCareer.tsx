import { annualPay, availableSamples, salarySummary } from "../lib/careers";
import { studentText } from "../lib/student-text";
import data from "../data/career-pathways.json";
import { WorkplaceExamples } from "./WorkplaceExamples";
const money = (n: number) => n.toLocaleString("ko-KR");
export function DepartmentCareer({
  departmentId,
  showWorkplaces = true,
}: {
  departmentId: string;
  showWorkplaces?: boolean;
}) {
  const career = data.departments.find((d) => d.departmentId === departmentId);
  if (!career) return null;
  const samples = availableSamples(career.salary.samples);
  const amounts = samples.map(annualPay);
  const min = amounts.length ? Math.min(...amounts.map((s) => s.min)) : null;
  const knownMax = amounts.flatMap((s) => (s.max === null ? [] : [s.max]));
  const max = knownMax.length
    ? Math.max(...knownMax, ...amounts.map((s) => s.min))
    : null;
  const hasUnknownUpper = samples.some((sample) => sample.maxManwon === null);
  const sourceLinks = (ids: string[]) =>
    career.sources
      .filter((s) => ids.includes(s.id))
      .map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
          {s.title
            .replace(": 진로 안내이며 취업 실적 아님", "")
            .replace("(교육 적용연도 미표기)", "")
            .trim()}{" "}
          ↗{s.publishedAt ? ` · ${s.publishedAt}` : ""}
        </a>
      ));
  return (
    <details className="career-panel">
      <summary>졸업 후 직무·초봉 보기</summary>
      <div className="career-content">
        <div className="career-overview">
          <div>
            <span>연계 직무</span>
            <strong>
              {career.roles.map((role) => role.title).join(" · ")}
            </strong>
          </div>
          <div>
            <span>신입 공고 초봉 · 세전</span>
            <strong>{salarySummary(samples)}</strong>
            <small>
              2026년 공고 사례 ·{" "}
              {hasUnknownUpper ? "일부 상한 미확인" : "조건별 차이 있음"}
            </small>
          </div>
        </div>
        <p className="career-overview-note">
          2026년 신입 공고 사례야. 졸업 시점의 급여 예측은 아니야.
        </p>
        <a className="career-more-link" href="#careers">
          9개 학과·직무 비교하러 가기 →
        </a>
        <details className="career-section">
          <summary>학교가 안내한 배움과 진로</summary>
          <p>{studentText(career.schoolGuidance)}</p>
          <div className="source-links">
            {sourceLinks(career.schoolSourceIds)}
          </div>
        </details>
        {showWorkplaces && <WorkplaceExamples departmentId={departmentId} />}
        <details className="career-section">
          <summary>연결해 볼 입문 직무</summary>

          {career.roles.map((role) => (
            <article className="career-role" key={role.title}>
              <strong>{role.title}</strong>
              <p>{studentText(role.tasks)}</p>
            </article>
          ))}
        </details>
        <details className="career-section">
          <summary>추가 준비와 더 배워볼 경로</summary>
          <ul>
            {career.preparation.map((t) => (
              <li key={t}>{studentText(t)}</li>
            ))}
          </ul>
          <p>{studentText(career.furtherPath)}</p>
        </details>
        <details className="career-section">
          <summary>초봉 근거와 채용 조건 확인</summary>
          <div className="career-salary">
            <h4>고졸 지원 가능 신입의 초봉 참고 추정</h4>
            <p className="salary-range">
              {min === null
                ? "연봉은 채용 공고에서 살펴봐"
                : `세전 ${salarySummary(samples)}`}
            </p>
            {min !== null && (
              <p>
                12개월로 나누면 월 약 {money(Math.round(min / 12))}
                {max !== null
                  ? `~${money(Math.round(max / 12))}만원`
                  : "만원 이상"}
              </p>
            )}
            {hasUnknownUpper && max !== null && (
              <p>
                확인된 공고 제시액을 묶은 참고 범위야. 일부 공고의 상한은
                미확인이므로 위 금액이 전체 상한은 아니야.
              </p>
            )}
            <p>2026년 고졸·학력무관 신입 채용 공고 사례 · 전국 지역 혼합</p>
            <details className="career-evidence">
              <summary>급여 근거 공고 {samples.length}개 확인</summary>
              {samples.map((sample) => (
                <article key={sample.sourceId}>
                  <strong>{sample.role}</strong>
                  <p>
                    {sample.region} · {sample.education} · {sample.experience}
                  </p>
                  <p>
                    공고 제시 {sample.payPeriod === "month" ? "월" : "연"}{" "}
                    {money(sample.minManwon)}
                    {sample.maxManwon !== null
                      ? `~${money(sample.maxManwon)}만원`
                      : "만원 이상"}{" "}
                    · 주 소정 {sample.weeklyHours}시간
                  </p>
                  <p>
                    {sample.contract}. {sample.notes}
                  </p>
                  <div className="source-links">
                    {sourceLinks([sample.sourceId])}
                  </div>
                </article>
              ))}
            </details>
          </div>
        </details>
        <details className="career-evidence">
          <summary>그 밖의 직무·준비 자료</summary>
          <div className="source-links">
            {sourceLinks(
              career.sources
                .filter((s) => s.kind === "occupation")
                .map((s) => s.id),
            )}
          </div>
        </details>
      </div>
    </details>
  );
}
