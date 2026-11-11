import type { Survey } from '../data/survey';
export type Answers=Record<string,number|string>;
export function validateAnswers(s:Survey,a:Answers,final:boolean):string[]{
 const errors:string[]=[];
 for(const [id,value] of Object.entries(a)){
  const q=s.questions.find(q=>q.id===id);
  if(!q){errors.push(`${id}: 알 수 없는 문항`);continue;}
  if(q.kind==='scale' && ![1,2,3,4,5,'unknown'].includes(value)) errors.push(`${id}: 올바른 응답을 골라 주세요`);
  if(q.kind==='text' && (typeof value!=='string'||value.length>5000)) errors.push(`${id}: 5000자 이내로 적어 주세요`);
 }
 if(final) for(const q of s.questions) if(q.kind==='scale'&&a[q.id]===undefined) errors.push(`${q.id}: 응답이 필요해요`);
 return errors;
}
export function progress(s:Survey,a:Answers){const qs=s.questions.filter(q=>q.kind==='scale');return Math.round(qs.filter(q=>[1,2,3,4,5,'unknown'].includes(a[q.id])).length/qs.length*100);}
export function canSubmit(s:Survey,isTest:boolean){return s.approved||isTest;}
export const statusLabels:Record<string,string>={draft:'작성 중',submitted:'제출 완료 · 분석 대기',under_review:'형이 살펴보고 있어요',published:'함께 정리한 결과가 도착했어요'};
