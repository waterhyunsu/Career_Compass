import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SchoolsPage } from "../src/pages/SchoolsPage";
import {
  schoolSubjects,
  schoolQualifications,
  schoolPathway,
  schoolTypeName,
  schoolPrograms,
  interestQuestion,
} from "../src/lib/school-presentation";
import { SchoolTypesPage } from "../src/pages/SchoolTypesPage";
it("공식 학과소개 내용은 보존하고 중복된 확인 문구만 줄인다", () => {
  expect(
    schoolSubjects(
      "공식 학과소개(적용연도 미표기, 2026-11-11 확인): 회계 원리와 사무 행정. 2027 개설 보장은 아님.",
    ),
  ).toBe("회계 원리와 사무 행정.");
  expect(
    schoolQualifications("학교별 운영 여부 공식 자료 확인 필요"),
  ).toBeNull();
  expect(schoolPathway("경영·회계 분야를 안내. 취업 보장이 아님.")).toBe(
    "경영·회계 분야를 안내.",
  );
});
it("충주 동지역 배정과 별도 학교장 전형을 구분하고 오해를 바로잡는다", () => {
  const html = renderToStaticMarkup(<SchoolTypesPage />);
  for (const phrase of [
    "충주 동지역 평준화 일반고",
    "4개교",
    "중앙탑고·충원고",
    "바리스타 자격증이 있으면",
    "특성화고가 공부하기 더 쉬워?",
    "cbe.go.kr/news",
  ])
    expect(html).toContain(phrase);
});
it("학교 목록은 남학생 지원 표시의 범위를 이해할 수 있다", () => {
  const html = renderToStaticMarkup(
    <SchoolsPage favorites={[]} onFavorite={async () => {}} />,
  );
  expect(html).toContain("남학생 모집");
  expect(schoolTypeName("chungju", "일반고")).toBe("자율형 공립고");
  expect(schoolPrograms["cjth-electric"].text).toContain("2026학년도");
  expect(interestQuestion("chungjuch-tourism")).toContain("궁금해");
});
