import { describe, it, expect } from 'vitest';
import { validateAnswers, progress, canSubmit } from '../src/lib/domain';
import { survey } from '../src/data/survey';
const complete = () => Object.fromEntries(survey.questions.map(q => [q.id, q.kind === 'scale' ? 1 : '']));
describe('설문 계약', () => {
 it('정해진 영역에 객관식 50개와 선택 서술 5개를 둔다', () => {
  expect(survey.questions.filter(q=>q.kind==='scale')).toHaveLength(50);
  expect(survey.questions.filter(q=>q.kind==='text')).toHaveLength(5);
  expect(['A','B','C','D','E'].map(a=>survey.questions.filter(q=>q.section===a).length)).toEqual([20,10,10,5,5]);
 });
 it('미응답과 unknown을 구분하고 서술형 공란을 허용한다',()=>{
  const a=complete(); a.a01='unknown';
  expect(validateAnswers(survey,a,true)).toEqual([]);
  expect(progress(survey,a)).toBe(100);
  delete a.a02;
  expect(validateAnswers(survey,a,true)).toContain('a02: 응답이 필요해요');
  expect(progress(survey,a)).toBe(98);
 });
 it('0점, 잘못된 키, 과도한 서술을 거부한다',()=>{
  expect(validateAnswers(survey,{a01:0,evil:5,t01:'x'.repeat(5001)},false)).toEqual(expect.arrayContaining(['a01: 올바른 응답을 골라 주세요','evil: 알 수 없는 문항','t01: 5000자 이내로 적어 주세요']));
 });
 it('최종 미확정 버전은 테스트 사용자만 제출한다',()=>{
  expect(canSubmit(survey,false)).toBe(false);
  expect(canSubmit(survey,true)).toBe(true);
  expect(canSubmit({...survey,approved:true},false)).toBe(true);
 });
});
