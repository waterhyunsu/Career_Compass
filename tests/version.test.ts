import {it,expect} from 'vitest';
import {chooseSurvey} from '../src/lib/version';
import {survey} from '../src/data/survey';
const old={id:'s',version_id:survey.id,status:'draft',answers:{a01:5}};
const approved={...survey,id:'approved-v2',approved:true};
it('검토 초안 응답이 있어도 새 승인 설문은 빈 응답으로 시작하고 과거 응답을 옮기지 않는다',()=>{
 const result=chooseSurvey([approved,survey],[old]);expect(result.survey.id).toBe('approved-v2');expect(result.submission).toBe(null);expect(old.answers.a01).toBe(5);
});
it('제출한 설문은 새 버전이 나와도 원래 문항으로 열람한다',()=>{
 const submitted={...old,status:'submitted'};expect(chooseSurvey([approved,survey],[submitted]).submission).toBe(submitted);expect(chooseSurvey([approved,survey],[submitted]).survey.id).toBe(survey.id);
});
it('승인된 설문을 진행 중이면 그 버전과 응답을 유지한다',()=>{
 const saved={...old,version_id:approved.id};expect(chooseSurvey([{...approved,id:'v3'},approved,survey],[saved]).submission).toBe(saved);
});
