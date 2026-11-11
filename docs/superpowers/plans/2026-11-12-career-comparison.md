# Career comparison implementation plan

**Goal:** 2학교9학과와 연계직무의 급여·전망·영어 및 필수역량을 비교한다.
**Architecture:** 기존 public career JSON 확장; 순수 salary 비교함수, 별도 React 페이지; seed와 migration으로 public DB 동기화.
**Stack:** React/TypeScript/Vite/Supabase/Vercel.
**Spec:** ../specs/2026-11-12-career-comparison-design.md

- [x] 자료: 역할별 skills/English/progression/salarySourceIds 작성; 공통 해외/어학 공식 출처와 통계 한계 명시.
- [x] RED: 공고 중복제거·월환산·미확인·필터·상세전환 검증 테스트.
- [x] 구현: career comparison helpers/page+links+mobile CSS, seed/migration/docs.
- [x] 검증: tests/build/DB/live DB 일치, 역할별 근거 연결 수동 검토.
- [ ] 배포: commit/push, Vercel Ready 및 제공파일 동일 확인, 운영 비교/상세 화면 검증.

Review focus: 없는 직무에 학과급여 전가 금지; 일부 상한 미확인; 표본평균 오해 방지; 학교 필터 후 선택 일관성; 모바일 정보 동등성.
