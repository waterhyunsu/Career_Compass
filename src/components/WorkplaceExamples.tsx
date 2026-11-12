import { workplaceExamples } from "../data/workplace-examples";

export function WorkplaceExamples({ departmentId }: { departmentId: string }) {
  const examples = workplaceExamples[departmentId];
  if (!examples) return null;
  return (
    <section className="workplace-examples">
      <h2>일할 수 있는 곳과 하는 일</h2>
      <p>
        학교의 학과 안내와 직업 자료를 바탕으로 정리한 입문 일자리 예시야. 이
        학교 졸업생의 실제 취업처나 채용 보장은 아니야. 채용 조건과 필요한
        자격은 회사마다 확인해 줘.
      </p>
      <div className="workplace-grid">
        {examples.map((example) => (
          <article className="workplace-example" key={example.place}>
            <h3>{example.place}</h3>
            <p>{example.work}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
