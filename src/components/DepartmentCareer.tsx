import data from "../data/career-pathways.json";
const money = (n: number) => n.toLocaleString("ko-KR");
export function DepartmentCareer({ departmentId }: { departmentId: string }) {
  const career = data.departments.find((d) => d.departmentId === departmentId);
  if (!career) return null;
  const salary = career.salary;
  const hasUnknownUpper = salary.samples.some(
    (sample) => sample.maxManwon === null,
  );
  const sourceLinks = (ids: string[]) =>
    career.sources
      .filter((s) => ids.includes(s.id))
      .map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
          {s.title} ↗{s.publishedAt ? ` · ${s.publishedAt}` : ""}
        </a>
      ));
  return (
    <details className="career-panel">
      <summary>졸업 후 직무·초봉 보기</summary>
      <div className="career-content">
        <p className="privacy-note">
          자료 확인 {data.checkedAt} · {data.notice}
        </p>
        <h4>학교가 안내한 배움과 진로</h4>
        <p>{career.schoolGuidance}</p>
        <div className="source-links">
          {sourceLinks(career.schoolSourceIds)}
        </div>
        <h4>연결해 볼 입문 직무</h4>
        <p className="privacy-note">
          학교 안내와 직업·채용 자료를 연결한 직무 예시야.
        </p>
        {career.roles.map((role) => (
          <article className="career-role" key={role.title}>
            <strong>{role.title}</strong>
            <p>{role.tasks}</p>
            <small>{role.entryNotes}</small>
          </article>
        ))}
        <h4>추가 준비와 더 배워볼 경로</h4>
        <ul>
          {career.preparation.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p>{career.furtherPath}</p>
        <h4>시장 흐름과 앞으로 살펴볼 점</h4>
        <p>{career.market.summary}</p>
        <div className="career-market-grid">
          <div>
            <strong>기회</strong>
            <ul>
              {career.market.opportunities.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>고려할 점</strong>
            <ul>
              {career.market.risks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="privacy-note">
          관련 산업 자료를 연결한 해석이야. 해당 학교 고졸 신입의 채용 규모나
          취업 성공 확률을 뜻하지 않아.
        </p>
        <div className="source-links">
          {sourceLinks(career.market.sourceIds)}
        </div>
        <div className="career-salary">
          <h4>고졸 지원 가능 신입의 초봉 참고 추정</h4>
          <p className="salary-range">
            세전 연 {money(salary.annualMinManwon)}
            {salary.annualMaxManwon !== null
              ? `~${money(salary.annualMaxManwon)}만원`
              : "만원 이상 · 상한 미확인"}
          </p>
          <p>
            12개월로 나누면 월 약{" "}
            {money(Math.round(salary.annualMinManwon / 12))}
            {salary.annualMaxManwon !== null
              ? `~${money(Math.round(salary.annualMaxManwon / 12))}만원`
              : "만원 이상"}
          </p>
          {hasUnknownUpper && salary.annualMaxManwon !== null && (
            <p>
              확인된 공고 제시액을 묶은 참고 범위야. 일부 공고의 상한은
              미확인이므로 위 금액이 전체 상한은 아니야.
            </p>
          )}
          <p>{data.salaryNotice}</p>
          <small>
            {salary.scope}. {salary.method}
          </small>
          <details className="career-evidence">
            <summary>급여 근거 공고 {salary.samples.length}개 확인</summary>
            {salary.samples.map((sample) => (
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
        <details className="career-evidence">
          <summary>그 밖의 직무·준비 자료</summary>
          <div className="source-links">
            {sourceLinks(
              career.sources
                .filter((s) => s.kind === "occupation")
                .map((s) => s.id),
            )}
          </div>
          <p className="privacy-note">
            출처에서 제시한 직업 전체 업무와 초급 역할은 다를 수 있어. 확인일{" "}
            {data.checkedAt}.
          </p>
        </details>
      </div>
    </details>
  );
}
