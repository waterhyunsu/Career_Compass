/** Shortens school career descriptions without altering the source data. */
export function studentText(text: string): string {
  return text
    .replace(/\s*2027학년도 실제 운영은 별도 확인이 필요해요\./g, "")
    .replace(/\s*실제 취업처나 취업 실적을 뜻하지 않아요\./g, "")
    .replace(/\s*실제 취업처나 관리자로 바로 취업한다는 뜻은 아니에요\./g, "")
    .replace(/\s*졸업만으로 개발자 취업이 보장되는 것은 아니에요\./g, "")
    .replace(
      /생산·품질·자재 사무는 기업별로 채용이 있지만, 학과 이름만으로 안정적인 취업이 보장되지는 않아요\./g,
      "생산·품질·자재 사무에서 하는 일을 살펴보자.",
    )
    .replace(/아래(?:는| 내용은)[^.]*해석이에요\./g, "")
    .replace(/고쳐요([.!?])/g, "고쳐$1")
    .replace(/봐요([.!?])/g, "봐$1")
    .replace(/써요([.!?])/g, "써$1")
    .replace(/해요([.!?])/g, "해$1")
    .replace(/있어요([.!?])/g, "있어$1")
    .replace(/않아요([.!?])/g, "않아$1")
    .replace(/돼요([.!?])/g, "돼$1")
    .replace(/이에요([.!?])/g, "이야$1")
    .replace(/예요([.!?])/g, "야$1")
    .replace(/보세요([.!?])/g, "봐$1")
    .trim();
}
