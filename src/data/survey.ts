export type Question = {
  id: string;
  section: string;
  kind: "scale" | "text";
  text: string;
};
export type Survey = {
  id: string;
  title: string;
  approved: boolean;
  questions: Question[];
};
export const sections = [
  { id: "A", name: "활동과 관심사", count: 20 },
  { id: "B", name: "문제 해결과 사고", count: 10 },
  { id: "C", name: "학습과 작업 환경", count: 10 },
  { id: "D", name: "가치관과 미래", count: 5 },
  { id: "E", name: "경험과 자기 이해", count: 5 },
];
export const survey: Survey = {
  id: "approved-2026-11-11-v2",
  title: "나를 알아가는 질문",
  approved: true,
  questions: [
    {
      id: "a01",
      section: "A",
      kind: "scale",
      text: "손으로 물건을 만들거나 고치는 활동이 궁금하다.",
    },
    {
      id: "a02",
      section: "A",
      kind: "scale",
      text: "식물이나 동물을 관찰하고 돌보는 활동이 궁금하다.",
    },
    {
      id: "a03",
      section: "A",
      kind: "scale",
      text: "음식이나 음료를 만드는 과정을 더 배워 보고 싶다.",
    },
    {
      id: "a04",
      section: "A",
      kind: "scale",
      text: "그림이나 사진으로 내 생각을 표현하는 활동이 궁금하다.",
    },
    {
      id: "a05",
      section: "A",
      kind: "scale",
      text: "음악을 만들거나 연주하는 활동이 궁금하다.",
    },
    {
      id: "a06",
      section: "A",
      kind: "scale",
      text: "운동이나 몸을 움직이는 활동을 더 해보고 싶다.",
    },
    {
      id: "a07",
      section: "A",
      kind: "scale",
      text: "이야기나 글을 쓰는 활동이 궁금하다.",
    },
    {
      id: "a08",
      section: "A",
      kind: "scale",
      text: "사람들의 이야기를 듣고 도움을 주는 활동이 궁금하다.",
    },
    {
      id: "a09",
      section: "A",
      kind: "scale",
      text: "물건을 소개하거나 판매하는 활동이 궁금하다.",
    },
    {
      id: "a10",
      section: "A",
      kind: "scale",
      text: "컴퓨터로 새로운 것을 만드는 활동이 궁금하다.",
    },
    {
      id: "a11",
      section: "A",
      kind: "scale",
      text: "숫자나 기록에서 규칙을 찾는 활동이 궁금하다.",
    },
    {
      id: "a12",
      section: "A",
      kind: "scale",
      text: "기계나 전자 기기가 움직이는 원리가 궁금하다.",
    },
    {
      id: "a13",
      section: "A",
      kind: "scale",
      text: "여행 장소나 행사를 계획하는 활동이 궁금하다.",
    },
    {
      id: "a14",
      section: "A",
      kind: "scale",
      text: "옷이나 공간을 꾸미는 활동이 궁금하다.",
    },
    {
      id: "a15",
      section: "A",
      kind: "scale",
      text: "실험으로 궁금한 것을 확인하는 활동이 궁금하다.",
    },
    {
      id: "a16",
      section: "A",
      kind: "scale",
      text: "외국어로 다른 사람과 소통하는 활동이 궁금하다.",
    },
    {
      id: "a17",
      section: "A",
      kind: "scale",
      text: "사람들 앞에서 설명하거나 발표하는 활동이 궁금하다.",
    },
    {
      id: "a18",
      section: "A",
      kind: "scale",
      text: "영상이나 게임이 만들어지는 과정이 궁금하다.",
    },
    {
      id: "a19",
      section: "A",
      kind: "scale",
      text: "역사나 문화를 찾아보며 사람들의 생활을 알아보는 활동이 궁금하다.",
    },
    {
      id: "a20",
      section: "A",
      kind: "scale",
      text: "생활 속 불편이나 환경 문제를 줄이는 활동이 궁금하다.",
    },
    {
      id: "b01",
      section: "B",
      kind: "scale",
      text: "문제가 생기면 원인을 하나씩 찾아보는 편이다.",
    },
    {
      id: "b02",
      section: "B",
      kind: "scale",
      text: "한 가지 문제에 여러 해결 방법을 생각해 보는 편이다.",
    },
    {
      id: "b03",
      section: "B",
      kind: "scale",
      text: "새로운 아이디어를 떠올리는 일이 재미있다.",
    },
    {
      id: "b04",
      section: "B",
      kind: "scale",
      text: "복잡한 일을 만나면 할 일을 작은 단계로 나눠 보는 편이다.",
    },
    {
      id: "b05",
      section: "B",
      kind: "scale",
      text: "궁금한 내용은 자료를 찾아 확인하는 편이다.",
    },
    {
      id: "b06",
      section: "B",
      kind: "scale",
      text: "해본 방법이 안 되면 다른 방법을 시도하는 편이다.",
    },
    {
      id: "b07",
      section: "B",
      kind: "scale",
      text: "방법을 잘 모를 때 다른 사람에게 도움을 요청하는 편이다.",
    },
    {
      id: "b08",
      section: "B",
      kind: "scale",
      text: "설명과 실제 결과가 다르면 이유가 궁금하다.",
    },
    {
      id: "b09",
      section: "B",
      kind: "scale",
      text: "물건이나 서비스의 불편한 점을 개선해 보고 싶다.",
    },
    {
      id: "b10",
      section: "B",
      kind: "scale",
      text: "해결한 과정을 다른 사람에게 설명해 보는 편이다.",
    },
    {
      id: "c01",
      section: "C",
      kind: "scale",
      text: "직접 해보면서 배우면 이해하기 편하다.",
    },
    {
      id: "c02",
      section: "C",
      kind: "scale",
      text: "글이나 설명을 먼저 읽으면 배우기 편하다.",
    },
    {
      id: "c03",
      section: "C",
      kind: "scale",
      text: "혼자 집중해서 할 일이 있을 때는 조용한 곳이 편하다.",
    },
    {
      id: "c04",
      section: "C",
      kind: "scale",
      text: "함께 할 일이 있을 때 서로 의견을 주고받으며 작업하는 것이 좋다.",
    },
    {
      id: "c05",
      section: "C",
      kind: "scale",
      text: "혼자 생각할 시간이 있으면 편하다.",
    },
    {
      id: "c06",
      section: "C",
      kind: "scale",
      text: "시작 전에 순서를 정하면 편하다.",
    },
    {
      id: "c07",
      section: "C",
      kind: "scale",
      text: "상황에 맞게 계획을 바꾸는 것이 편하다.",
    },
    {
      id: "c08",
      section: "C",
      kind: "scale",
      text: "연습하기 전보다 나아진 점을 확인하면 계속해 보고 싶다.",
    },
    {
      id: "c09",
      section: "C",
      kind: "scale",
      text: "어려울 때 질문할 사람이 있으면 배우기 편하다.",
    },
    {
      id: "c10",
      section: "C",
      kind: "scale",
      text: "같은 활동을 반복해서 익히는 것이 편하다.",
    },
    {
      id: "d01",
      section: "D",
      kind: "scale",
      text: "고등학교를 고를 때 편안하게 생활할 수 있는 분위기를 중요하게 생각한다.",
    },
    {
      id: "d02",
      section: "D",
      kind: "scale",
      text: "직업을 선택할 때 생활의 안정성이 중요하다.",
    },
    {
      id: "d03",
      section: "D",
      kind: "scale",
      text: "내가 재미를 느끼는 일을 더 배우는 것이 중요하다.",
    },
    {
      id: "d04",
      section: "D",
      kind: "scale",
      text: "다른 사람에게 도움이 되는 일을 하고 싶다.",
    },
    {
      id: "d05",
      section: "D",
      kind: "scale",
      text: "고등학교에서도 진학과 취업 가능성을 함께 알아보고 싶다.",
    },
    {
      id: "e01",
      section: "E",
      kind: "scale",
      text: "예전에 어려웠던 활동도 다른 방식으로 다시 경험해 보고 싶다.",
    },
    {
      id: "e02",
      section: "E",
      kind: "scale",
      text: "좋아하는 활동의 어떤 점이 좋은지 설명할 수 있다.",
    },
    {
      id: "e03",
      section: "E",
      kind: "scale",
      text: "잘 모르겠는 분야는 짧게 체험해 보고 판단하고 싶다.",
    },
    {
      id: "e04",
      section: "E",
      kind: "scale",
      text: "주변의 추천과 내 생각이 다를 때 내 이유를 말하고 싶다.",
    },
    {
      id: "e05",
      section: "E",
      kind: "scale",
      text: "학교나 진로를 정하기에는 아직 경험이나 정보가 부족하다고 느낀다.",
    },
    {
      id: "t01",
      section: "T",
      kind: "text",
      text: "고등학교에서 하루를 보낸다면 어떤 시간이 있으면 좋겠어? 떠오르는 수업이나 쉬는 시간의 모습을 하나만 적어도 돼.",
    },
    {
      id: "t02",
      section: "T",
      kind: "text",
      text: "배우다가 어려웠던 일이 있다면, 어떤 도움이나 다른 방법이 있었으면 좋았을까? 지금도 해보고 있는 일이나 학교 공부 이야기여도 괜찮아.",
    },
    {
      id: "t03",
      section: "T",
      kind: "text",
      text: "네가 말하는 편한 학교 분위기는 어떤 모습이야? 불편하거나 피하고 싶은 상황을 적어도 돼.",
    },
    {
      id: "t04",
      section: "T",
      kind: "text",
      text: "지금 관심 있는 학교나 학과가 있다면, 직접 해보고 싶은 수업과 아직 확인하고 싶은 점을 적어 줄래? 아직 없어도 괜찮아.",
    },
    {
      id: "t05",
      section: "T",
      kind: "text",
      text: "학교를 비교하는 데 더 알아보고 싶은 정보나 짧게 해보고 싶은 체험이 있을까? 형에게 바라는 도움이 있으면 적어도 돼. 아직 모르겠어도 괜찮아.",
    },
  ],
};
export const choices = [
  { value: 1, label: "전혀 아니다" },
  { value: 2, label: "아닌 편이다" },
  { value: 3, label: "보통이다" },
  { value: 4, label: "그런 편이다" },
  { value: 5, label: "매우 그렇다" },
  { value: "unknown" as const, label: "모르겠다 / 경험이 없다" },
];
