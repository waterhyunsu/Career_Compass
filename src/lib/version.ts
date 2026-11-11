import type {Survey} from '../data/survey';
type Saved={version_id:string;status:string};
/** Never reinterpret old answers against different question wording. */
export function chooseSurvey<T extends Saved>(versions:Survey[],submissions:T[]):{survey:Survey;submission:T|null}{
 if(!versions.length)throw new Error('설문 버전이 아직 등록되지 않았어요. 관리자에게 알려 주세요.');
 const active=versions.find(v=>v.approved)??versions[0];
 const prior=submissions[0];const old=prior&&versions.find(v=>v.id===prior.version_id);
 if(prior&&!old)throw new Error('응답의 원래 문항 버전을 찾지 못했어요. 관리자에게 알려 주세요.');
 if(prior&&old){
  if(prior.status==='draft'&&!old.approved&&active.approved)return {survey:active,submission:submissions.find(s=>s.version_id===active.id)??null};
  return {survey:old,submission:prior};
 }
 return {survey:active,submission:null};
}
