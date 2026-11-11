# 기술 구조

## 클라이언트

React SPA, hash 화면 전환, Vite 빌드, Tailwind4 및 CSS. src/data/survey.ts는 승인 전55문항 초안이다. 실연동에서는 DB survey_versions에서 로드하며 제출한 응답과 승인 버전 진행분은 원래 버전을 유지한다. 미승인 초안 진행분만 있던 사용자는 새 승인 버전을 빈 답변으로 시작하며 과거 초안을 변경하거나 응답을 옮기지 않는다. 현재 학교 표시는 src/data/schools.json이며 동일 데이터를 seed.sql로 DB에도 등록한다. 학교 갱신은 JSON 수정→출처 검증→seed 생성→DB 반영→재배포 순서다.

src/lib/api.ts는 Supabase 익명/게시가능 키만 사용한다. 인증된 세션의 JWT를 Supabase가 전달한다. 서비스 역할 키는 프런트엔드나 VITE 환경변수에 쓰지 않는다. 미리보기는 환경변수가 없을 때만 작동하며 합성 데이터 저장 키는 compass-synthetic-preview-v1이다. 미리보기의 관리자·실제 제출은 비활성이다. 연결 오류 시 미리보기로 대체하지 않는다.

## 인증·권한

관리자 대시보드에서 Auth 계정을 초대/생성하고 공개 가입을 끈다. private.admins에 관리자의 auth UUID를 SQL로 지정한다. profiles.is_test와 nickname은 신뢰된 SQL에서만 설정한다. 사용자 metadata로 관리자나 테스트 권한을 부여하지 않는다.

| 테이블 | 학생 | 관리자 |
|---|---|---|
| profiles | 본인 읽기 | 전체 읽기 |
| survey_versions | 읽기 | 읽기, 등록은 trusted SQL |
| submissions | 본인 읽기, RPC 저장 | 전체 읽기, 상태 RPC |
| schools/departments | 공개 읽기 | 공개 읽기, 수정은 trusted SQL |
| favorites | 본인 CRUD | 전체 읽기 |
| report_drafts | 접근 불가 | 읽기·등록·수정 |
| published_reports | 본인 제출분 읽기 | 읽기·게시 RPC |

DB RLS와 테이블 GRANT를 함께 사용한다. UI 관리자 메뉴는 편의 기능이며 보안 경계는 DB다. private 스키마는 API 노출 목록에 추가하지 않는다.

## 트랜잭션 RPC

- save_survey: 로그인 확인, 버전 행 공유잠금, 테스트/승인 확인, JSON 키·타입·객관식50/서술5 정의 검증, upsert. draft만 갱신, submitted_at은 서버 시간. 동일 최종 답변 재제출은 멱등 처리, 다른 답변·draft 저장으로 덮어쓰기 불가.
- set_report_status: DB 관리자 검증과 제출 행 잠금. publish는 초안→게시본 복사와 상태 갱신을 원자적으로 처리한다. 수정된 초안은 재게시 전 학생에게 보이지 않는다. unpublish/review는 게시본 삭제와 under_review 갱신.
- delete_test_data: 관리자+대상 is_test 검증. 설문/연쇄보고서/관심 제거. Auth 계정과 테스트 플래그는 유지해 재검증 가능.

최초 응답 이후 survey_versions 수정·삭제는 트리거로 차단한다. 새 버전 ID로 승인 문항을 등록해야 한다. 이전 응답은 FK로 원래 문항을 유지한다. 서비스 역할은 서버 전용이며 원칙적으로 DB SQL Editor에서만 초기화한다.

## UI 상태와 결과

세션 ID가 같으면 반복 로그인 이벤트로 답변을 초기화하지 않는다. 계정 전환 세대 토큰으로 이전 비동기 읽기·저장 완료를 폐기한다. 보고서 초안 로드 전 편집·저장을 차단한다. Markdown은 react-markdown의 안전한 URL 처리와 skipHtml 사용, raw HTML 플러그인 없음, 외부 이미지 렌더링 차단. JSON은 텍스트 Blob으로 내보낸다.

임시 저장 버튼은 실연동 시 DB 저장이다. 자동저장이라고 표시하지 않는다. 페이지 이탈 전 임시 저장이 필요하다. 입력을 끝내면 검토→최종 제출이며 서버 저장 실패 시 답변을 유지하고 오류를 표시한다. 게시 결과는 다시 불러오기로 갱신한다.
