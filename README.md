# 진로 나침반

관심과 경험을 돌아보고, 충주 학교의 공식 자료를 비교하며 스스로 진학 방향을 찾아가는 개인용 웹앱. 실시간 AI 분석 없이 관리자가 검토한 Markdown 보고서만 게시합니다.

현재 **Phase 1 기반 구현**입니다. 기초 조사30문항 답변 대기 중이며 정식50+5 문구는 검토 초안입니다. 실제 학생 제출은 승인 전 차단됩니다. 학교11교와22개 과정의 정보는 확인한 범위를 표시합니다.

## 실행

Node22.18 이상과 pnpm11 사용.

```sh
pnpm install
pnpm dev
pnpm test
pnpm test:db
pnpm build
```

환경변수가 없으면 **개발 미리보기**로 실행됩니다. 실제 개인정보를 입력하지 마세요. 미리보기 저장은 브라우저 로컬 합성 데이터이며 DB 제출이 아닙니다. 관리자 기능과 실제 인증은 Supabase 연결 후 사용합니다.

## 실제 서비스 설정

1. Supabase 프로젝트를 준비합니다. Auth의 공개 가입을 끄고 이메일·비밀번호 방식으로 학생/형/테스트 계정을 생성합니다. 닉네임은 인증 정보가 아닙니다.
2. SQL Editor에서 supabase/migrations/202611110001_initial.sql을 실행하고 supabase/seed.sql을 실행합니다. 기존 프로젝트에 무작정 재실행하지 말고 마이그레이션 이력을 관리하세요.
3. 아래 SQL의 UUID를 실제 Auth 계정 ID로 치환합니다. 학생 계정은 기본 is_test=false를 유지합니다.

```sql
insert into private.admins(user_id) values ('ADMIN_AUTH_UUID');
update public.profiles set nickname='test', is_test=true where id='TEST_AUTH_UUID';
update public.profiles set nickname='탐험가' where id='STUDENT_AUTH_UUID';
```

4. .env.example을 참고해 .env.local에 프로젝트 URL과 **공개 publishable 또는 anon 키**를 설정합니다. service_role/secret 키는 브라우저에 넣지 않습니다.
5. 프로젝트 Auth URL을 로컬/실제 배포 URL에 맞춰 설정하고, 두 계정 RLS와 전체 시나리오를 확인합니다. private 스키마는 공개 API에 노출하지 않습니다.

## 문항 변경

src/data/survey.ts에서 새 ID로 문항을 작성하고 기초 조사와 편향을 검토한 뒤 형의 승인을 받습니다. 승인 후에만 approved:true로 설정합니다. `pnpm seed:generate`로 SQL과 문항 문서를 생성하고 DB에 새 버전을 등록합니다. 응답이 있는 버전은 수정하지 않습니다. 진행 중 구버전의 응답을 새 문항의 답변으로 해석하지 않습니다. 미승인 초안을 작성 중이던 학생은 새 승인 버전이 등록되면 빈 응답으로 새로 시작하며, 이전 초안은 원래 버전으로 DB에 보존됩니다. 이미 제출한 응답과 승인 버전에서 작성 중인 응답은 원래 버전을 유지합니다.

## 배포

현재 GitHub 원격·Supabase·Vercel 자격 증명이 없어 실제 배포는 미실행입니다.

- GitHub 비공개 저장소를 만들고 이 폴더의 원격으로 연결한 뒤 push합니다. `.gitignore`에서 USER_PROFILE.md/private/.env/work 제외를 유지합니다.
- Vercel에서 GitHub 저장소를 가져오고 Framework Vite, build `pnpm build`, output `dist`로 설정합니다.
- Vercel에 VITE_SUPABASE_URL 및 VITE_SUPABASE_PUBLISHABLE_KEY를 등록 후 배포합니다. 환경변수는 빌드 시 포함되므로 변경 후 재배포합니다.
- HTTPS URL에서 테스트계정→설문→DB→학교 관심→관리자→게시→학생 결과→취소→재게시→테스트 삭제를 검증합니다.
- 휴대폰 Wi-Fi를 끄고 모바일 데이터에서 접속을 직접 확인합니다. 로컬390px 반응형 검증이 이 검증을 대신하지 않습니다.

## 개인정보

`docs/USER_PROFILE.md`와 원문은 로컬 비공개로만 관리하며 Git·배포에 포함하지 않습니다. JSON 내보내기는 비공개 위치에 저장하고 목적이 끝난 파일을 정리합니다. 실제 데이터 삭제는 Auth 사용자 제거(SQL/대시보드) 시 FK cascade를 이용하며, 관리자 화면의 간편 삭제는 테스트 데이터에 한정합니다.

## 문서

- docs/PROJECT_BRIEF.md / REQUIREMENTS.md: 목적과 범위
- docs/CHAT_HISTORY.md: 원문 접근 실패 기록
- docs/SURVEY.md: 승인 전 문항 초안
- docs/SCHOOLS.md: 공식 출처·검증 한계
- docs/ARCHITECTURE.md: 인증·RLS·DB·상태
- docs/TEST_PLAN.md / CODEX_TASK.md: 검증 및 인수인계
