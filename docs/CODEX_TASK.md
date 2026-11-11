# 진행 상태와 다음 인수인계

## 현재 상태

2026-11-11 Phase2 검토. 기초 조사 답변 수령 및 비공개 프로필 갱신 완료. 50+5문항 사용자 승인 및 v2 반영 완료. 실행 위치 프로젝트 루트, main 브랜치. 초기 폴더가 비어 있어 기존파일 덮어쓰기 없이 새 Git 저장소를 생성했다.

## 완료한 기반

- [x] TCREI 설계·구현계획 및 프로젝트 문서 작성
- [x] 공유 대화 본문 접근실패 기록
- [x] 비공개 USER_PROFILE.md 형 전달·본인 진술·가설·미확인 구분 및 Git제외
- [x] React/Vite/TS/Tailwind, 모바일 시작·설문·학교·관심·결과·관리자 화면
- [x] 승인 전50+5 초안 데이터·버전 분리
- [x] 인증 API·RLS·DB스키마·트랜잭션 제출/게시·테스트삭제 코드
- [x] 학교11교22과정 데이터, 공식자료 및 미확인 범위 표시
- [x] 임시저장·이어하기·진행률·검토·제출 공통 구조
- [x] 검색·유형필터·최대3학교 비교·학교/학과 관심·학교 선택 이유
- [x] 관리자 조회·JSON·Markdown초안/미리보기·게시/취소/재게시
- [x] 단위·PostgreSQL정책·production빌드·모바일 미리보기 검증

## 보류·미완료

- [x] 기초 조사원문 수령·비공개 원문 보존·직접응답 기준 프로필 갱신
- [x] 기존50+5 중복·누락·표현 검토 및 전체 수정 제안 비공개 작성
- [x] 문항 중복/편향 검토안 보고·사용자 승인·approved-2026-11-11-v2 운영 DB 등록
- [ ] 학교 교육과정·진학취업프로그램/실적·통학 상세 최종 검증 (SCHOOLS 참고)
- [x] Supabase production 프로젝트, 비공개 가입 및 서버 관리자 역할 구성
- [x] 운영 HTTP 인증·RLS·DB저장 시나리오 (Supabase API 및 브라우저 제출 검증; 관리자 UI 일부 제외)
- [x] GitHub 비공개 Career_Compass 저장소 생성, SSH 원격 연결 및 첫 push (2026-11-11)
- [x] Vercel HTTPS production 배포
- [ ] 휴대폰 모바일데이터 외부접속
- [ ] 기초 조사 답변 후 문항 승인 및 실제 응답 분석·게시

## 운영 연결 (2026-11-11)

- GitHub private `waterhyunsu/Career_Compass`; `main` 배포 commit `9fac5ad` (개인정보 제거 후).
- Supabase project `Career_Compass`, Singapore; schema/seed 적용, signup disabled, 4 synthetic auth fixtures provisioned.
- Vercel production: https://career-compass-eight-iota.vercel.app/; public URL/key only.
- Live synthetic scenario confirmed for sign-in, draft/resume, 50 required + 5 optional response submission, school/department favorites, RLS separation, manager-only report publishing snapshots and test-only cleanup. Browser used response submission and school-interest screens; manager operations were verified against the live Supabase API. Test response data removed.
- Local `private/bootstrap-accounts.json` holds temporary fixture credentials; do not copy into Git or chat. Actual student account is not provisioned.
- Remaining: set Supabase Auth Site URL/redirect allowlist to the production URL; visually verify manager JSON download/report UI; check external mobile-data access; update this record after Phase 2. No student response or report has been published.

## Phase2 이어가기

공통 UI/DB를 다시 만들지 않는다. 제공원문은 private/intake/에 보존했고 docs/USER_PROFILE.md에 본인 진술·형 전달·가설·미확인을 구분했다. private/intake/SURVEY_REVIEW.md 및 survey-proposal.json의 수정안은 사용자 승인을 받았고 v2로 등록했다. 기존 비공개 제안 파일은 당시 검토 기록으로 보존한다. 새 관심사가 설문 전체를 편향시키지 않도록50+5와30문항을 교차검토한다. 추가 수정도 근거를 보고하고 사용자 승인 후 새 버전으로 등록한다. 이전 응답을 바뀐 문항으로 해석하지 않는다.

## 실행 판단 기록

- 사용자 명시 작업폴더 및 즉시개발 지시를 따라 지정폴더에서 구현. 불필요한 worktree/설계 재승인 요청은 하지 않음.
- 사용자 지정 Vercel/Supabase를 Sites 호스팅으로 대체하지 않음.
- 외부서비스 자격정보 없음: 배포완료로 표시하지 않고 배포가능 소스·SQL·운영절차 제공.
- 수동검토 보고서 초안과 게시본을 물리적 분리: 게시된 결과를 수정하는 동안 비공개 신규 내용이 새지 않게 함.

## GitHub 저장소

https://github.com/waterhyunsu/Career_Compass (Private). 미성년자 개인정보·원문·환경변수는 전체 Git 이력에서 제외 확인. 운영: https://career-compass-eight-iota.vercel.app/.

## 승인 문항 배포 기록

사용자가 50+5 수정안을 승인하여 `approved-2026-11-11-v2`를 신규 등록했다. A20/B10/C10/D5/E5 및 선택서술5 유지. 운영 DB의 55개 문구가 소스와 일치함을 API로 검증했고, 기존 테스트 제출은 v1에55개 응답으로 보존됨을 확인했다. 단위11개, PGlite 정책검증, production build 통과. 개인 원문과 프로필은 Git·DB·빌드에 포함하지 않았다.

## 전체 재검증

2026-11-12에 전체 코드/구조/로직을 리뷰하고 저장 중 편집·페이지왕복 잠금, 미제출 결과 안내, 원자적 게시, 전체 마이그레이션 검증 누락을 수정했다. 자세한 결과와 확인범위는 AUDIT_2026-11-12.md 참조.

## 2026-11-12 학과 진로 자료 추가

충주공고4·충주상고5학과에 학교 공식 진로, 입문 업무, 추가 준비, 시장 전망의 범위와 한계, 2026 신입 급여 공고 근거를 추가했다. DB는 departments.details.career에 보관하며 학생 응답·관심 저장을 유지했다. 상세 출처와 운영 방법은 CAREER_PATHWAYS.md 참조.

## 학과·직무 비교 확장

#careers 공개 화면, 9학과 표/모바일 카드, 19개 직무 상세, 직접 매칭 급여공고, 중복제거 표본평균, 역량·영어 학습 제안 구현. 최신 전국 고졸 신입 평균과8개 직무 급여 근거는 미확인으로 명시. migration005는 공개 career 자료만 수정. 자동 테스트25개·DB·빌드 통과.
