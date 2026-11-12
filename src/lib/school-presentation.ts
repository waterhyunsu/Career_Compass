// Student-facing text from the separately preserved official-source research.
export function schoolSubjects(text: string): string {
  const match = text.match(/공식 학과소개\([^)]*\):\s*(.*)/);
  if (!match) return "학교의 선택과목과 수업 활동을 살펴보자.";
  return match[1]
    .replace(/\s*2027 과목명은 미확인\./g, "")
    .replace(/\s*2027 개설 보장은 아님\./g, "")
    .trim();
}
export function schoolQualifications(text: string): string | null {
  if (!text.startsWith("학교 안내 예:")) return null;
  return text
    .replace("학교 안내 예:", "")
    .replace(/\s*2027 교육·취득 지원은 별도 확인 필요\./g, "")
    .replace(/현재 자격 명칭·응시조건 별도 확인\./g, "")
    .replace(/현재 응시조건 별도 확인\./g, "")
    .replace(/응시조건 별도 확인\./g, "")
    .replace(/국가·민간 구분 및 응시조건 별도 확인\./g, "")
    .trim();
}
export function schoolPathway(text: string): string {
  if (text.includes("공식 자료 확인 필요"))
    return "학교에서 운영하는 진로·진학 활동을 살펴보자.";
  return text
    .replace(/\s*공무원·공기업 취업 보장이 아님\./g, "")
    .replace(/\s*취업·진학 실적은 별도 확인\./g, "")
    .replace(/\s*취업 보장이 아님\./g, "")
    .replace(/\s*취업·진학 실적이 아님\./g, "")
    .replace(/\s*구체 진학·취업 프로그램과 실적은 별도 확인\./g, "")
    .replace(/\s*여학생 모집이며 취업 보장이 아님\./g, "")
    .replace(/\s*여학생 모집이며 실적과 구분\./g, "")
    .trim();
}

const interestQuestions: Record<string, string> = {
  "cjth-civil": "지도·측량이나 도로와 다리가 만들어지는 과정이 궁금해?",
  "cjth-architecture": "건물과 실내 공간을 도면으로 표현해 보고 싶어?",
  "cjth-electric": "전기회로와 기계가 움직이는 원리를 살펴보고 싶어?",
  "cjth-machine": "기계를 조립하거나 부품을 만드는 과정이 궁금해?",
  "chungjuch-accounting":
    "돈의 흐름을 정리하고 숫자를 꼼꼼히 맞춰 보는 일에 관심 있어?",
  "chungjuch-management":
    "물건이 만들어지고 이동하는 과정이나 함께 일하는 방식이 궁금해?",
  "chungjuch-it": "프로그램이 작동하는 원리나 작은 기능을 만드는 일이 궁금해?",
  "chungjuch-tourism": "여행·호텔이나 사람을 맞이하는 다양한 서비스가 궁금해?",
  "chungjuch-cooking":
    "음식의 재료와 조리 과정, 주방에서 함께 일하는 방식이 궁금해?",
  "had-accounting": "가게와 회사의 돈 흐름을 정리하는 일이 궁금해?",
  "had-visual": "그림·글자·색으로 생각을 전달하는 작업이 궁금해?",
  "had-sculpture": "입체 모양이나 공간·물건을 디자인하는 일이 궁금해?",
  "had-fashion": "옷의 디자인과 제작 과정을 배워 보고 싶어?",
  "had-beauty": "헤어·피부·메이크업 등 미용 분야가 궁금해?",
};
export const interestQuestion = (departmentId: string): string | null =>
  interestQuestions[departmentId] ?? null;

export const schoolPrograms: Record<string, { text: string; url: string }> = {
  "cjth-electric": {
    text: "충주공고는 현대엘리베이터와 연계한 승강기 교육을 도입했어. 2026학년도 2학년 수업에는 승강기 설치 기술 교재를 사용하도록 안내했어.",
    url: "https://www.cbe.go.kr/news/na/ntt/selectNttInfo.do?mi=10301&nttSn=1561801",
  },
};

/** Keep autonomous public schools in the general-school filter while naming them accurately. */
export function schoolTypeName(id: string, type: string): string {
  return id === "chungju" || id === "yesung" ? "자율형 공립고" : type;
}
