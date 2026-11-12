import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SchoolTypesPage } from "../src/pages/SchoolTypesPage";
it("학교 유형의 공통 수업·전공 이론과 실습·실제 예시의 학교와 연도·공식 자료를 보여준다", () => {
  const html = renderToStaticMarkup(<SchoolTypesPage />);
  for (const item of [
    "일반고",
    "특성화고",
    "국어·수학·영어",
    "원리",
    "실습",
    "2025학년도",
    "충북상업정보고",
    "충주상고의 시간표가 아니",
    "2027학년도",
    "49.2%",
    "kedi.re.kr",
    "goe.go.kr",
    "school.cbe.go.kr",
  ])
    expect(html).toContain(item);
  expect(html).toContain("<details>");
});
