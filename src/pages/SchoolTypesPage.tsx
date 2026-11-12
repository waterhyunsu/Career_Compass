import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
const sources = {
  guide:
    "https://www.goe.go.kr/resource/old/BBSMSTR_000000030136/BBS_202403140548103310.pdf",
  example: "https://school.cbe.go.kr/cbci-h/MABACBG/",
  statistics:
    "https://www.kedi.re.kr/khome/mobile2/announce/selectAnnounceForm.do?article_sq_no=36534&board_sq_no=3&currentPage=1&selectTp=0",
  school: "https://school.cbe.go.kr/chungjuch-h/MABAGBH/view/5823607",
};
function Source({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className="type-source"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children} ↗
    </a>
  );
}
export function SchoolTypesPage() {
  return (
    <div className="type-page">
      <section className="type-hero">
        <p className="eyebrow">BEFORE YOU CHOOSE · 고등학교 이해하기</p>
        <h1>
          고등학교에서
          <br />
          <em>무엇을 배우게 될까?</em>
        </h1>
        <p>
          일반고와 특성화고, 이름은 들어봤는데 실제 수업은 어떻게 다를까? 학교를
          고르기 전에 같이 알아보자.
        </p>
        <a
          className="button primary"
          href="#type-compare"
          onClick={(e) => {
            e.preventDefault();
            document
              .getElementById("type-compare")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          두 학교 살펴보기 <ArrowRight size={17} />
        </a>
      </section>
      <section className="type-section" id="type-compare">
        <p className="eyebrow">01 · 한눈에 보기</p>
        <h2>둘 다 배우고, 배우는 내용의 비중이 달라.</h2>
        <p>
          어느 학교든 국어·수학·영어를 비롯한 여러 과목을 배우고, 관심사와
          앞으로의 길을 찾아갈 수 있어.
        </p>
        <div className="type-compare-grid">
          <article className="type-choice general">
            <span className="type-icon">
              <BookOpen size={22} />
            </span>
            <p className="eyebrow">여러 교과를 폭넓게</p>
            <h3>일반고</h3>
            <p>
              국어·수학·영어·사회·과학 등 여러 교과를 중심으로 배워. 관심 분야에
              따라 선택과목을 들으며 내용을 더 깊이 탐구할 수 있어.
            </p>
            <div className="type-tags">
              <span>여러 교과</span>
              <span>선택과목</span>
              <span>관심사 탐색</span>
            </div>
            <small>학교마다 개설되는 과목과 활동은 달라.</small>
          </article>
          <article className="type-choice vocational">
            <span className="type-icon">
              <Compass size={22} />
            </span>
            <p className="eyebrow">공통 과목과 전공을 함께</p>
            <h3>특성화고</h3>
            <p>
              국어·수학·영어 같은 과목도 배우고, 선택한 학과의 전문 수업도 배워.
              전공 수업에는 실습과 함께 원리·안전·기록을 배우는 내용도 있어.
            </p>
            <div className="type-tags">
              <span>공통 과목</span>
              <span>학과 전공</span>
              <span>이론과 실습</span>
            </div>
            <small>학과마다 수업 내용과 실습 비중은 달라.</small>
          </article>
        </div>
        <p className="type-footnote">
          일반고도 학교 여건에 따라 전문교과나 직업교육 과정을 운영할 수 있어.
          어떤 과목을 실제로 듣는지는 학교의 교육과정표를 확인해 줘.
        </p>
        <Source href={sources.guide}>
          교육부 2022 개정 교육과정 총론 해설
        </Source>
      </section>
      <section className="type-reality">
        <div className="type-reality-head">
          <span className="type-icon">
            <Lightbulb size={22} />
          </span>
          <div>
            <p className="eyebrow">02 · 진짜 수업 살펴보기</p>
            <h2>특성화고에 가면 커피만 만들까?</h2>
          </div>
        </div>
        <p className="type-big-answer">아니야. 여러 과목을 함께 배워.</p>
        <p>
          커피나 요리처럼 직접 해보는 수업이 있을 수 있어. 하지만 매일 실습만
          하는 것은 아니야. 국어·수학·영어도 배우고, 학과에 따라 전공의 원리와
          실제 업무를 함께 익혀.
        </p>
        <div className="type-example">
          <span className="type-label">
            실제 학교 자료 · 2025학년도 1학년 예시
          </span>
          <h3>상업계 고등학교 시간표에는?</h3>
          <div className="type-example-columns">
            <div>
              <strong>함께 배우는 과목</strong>
              <p>공통국어 · 공통수학 · 공통영어 · 통합사회 등</p>
            </div>
            <div>
              <strong>전공 관련 과목</strong>
              <p>상업경제 · 회계 원리 · 사무 관리 등</p>
            </div>
          </div>
          <p className="type-footnote">
            충북상업정보고등학교의 자료야. 충주상고의 시간표가 아니며,
            학과·입학연도별 과목은 달라질 수 있어.
          </p>
          <Source href={sources.example}>충북상업정보고 교육과정표 보기</Source>
        </div>
        <p className="type-note">
          충주상고에 관심이 있다면? 어떤 학과에서 무엇을 배우는지와 실제 실습
          내용을 학교에 직접 확인해 보자.
        </p>
        <Source href={sources.school}>충주상고 2027학년도 입학 안내</Source>
      </section>
      <section className="type-section">
        <p className="eyebrow">03 · 졸업 후의 길</p>
        <h2>선택지는 하나로 정해져 있지 않아.</h2>
        <div className="type-path-grid">
          <article>
            <GraduationCap size={24} />
            <h3>일반고를 졸업하면</h3>
            <p>
              대학 진학을 준비하는 학생이 많아. 취업이나 다른 배움의 길도 살펴볼
              수 있어.
            </p>
          </article>
          <article>
            <Compass size={24} />
            <h3>특성화고를 졸업하면</h3>
            <p>
              취업을 준비할 수도, 대학에 진학할 수도 있어. 각 경로의 조건과
              준비할 과목을 미리 확인해 보자.
            </p>
          </article>
        </div>
        <div className="type-stat">
          <div className="type-stat-number">
            약 <strong>절반</strong>
          </div>
          <div>
            <strong>직업계고 졸업 뒤 진학한 학생</strong>
            <p>
              2026년 전국 직업계고 졸업자 중 49.2%가 조사 기준일에 진학한 것으로
              집계됐어. 특성화고를 포함한 전국 통계이고, 충주상고의 진학률이나
              나의 결과를 뜻하지 않아.
            </p>
            <Source href={sources.statistics}>
              교육부·한국교육개발원 2026년 조사
            </Source>
          </div>
        </div>
      </section>
      <section className="type-section">
        <p className="eyebrow">04 · 더 궁금한 이야기</p>
        <h2>이렇게 생각할 수도 있어.</h2>
        <div className="type-faq">
          <details>
            <summary>특성화고는 공부를 안 해도 돼?</summary>
            <p>
              아니야. 국어·수학·영어 등과 전공 과목을 배우고, 각 수업의 이수
              기준도 확인해야 해. 실습에도 원리를 이해하고 연습하는 과정이
              필요해.
            </p>
          </details>
          <details>
            <summary>일반고에 가면 무조건 대학에 가야 해?</summary>
            <p>
              아니야. 대학 진학을 준비하는 학생이 많지만, 졸업 후 취업이나 다른
              진로를 선택할 수도 있어.
            </p>
          </details>
          <details>
            <summary>특성화고를 선택하면 대학은 못 가?</summary>
            <p>
              대학 진학도 가능해. 다만 학과와 학교마다 듣는 과목이 다르고,
              희망하는 대학·전형별로 준비할 조건도 다르니 미리 확인하는 게 좋아.
            </p>
          </details>
          <details>
            <summary>특성화고에서는 전공 실습만 해?</summary>
            <p>
              아니야. 보통교과도 배우고, 전공 수업 안에서도 개념과 원리를 배우는
              내용과 실무·실습이 함께 있을 수 있어. 정확한 시간표는 학과마다
              달라.
            </p>
          </details>
        </div>
        <Source href={sources.guide}>수업과 과목 편성의 공식 근거</Source>
      </section>
      <section className="type-next">
        <p className="eyebrow">YOUR NEXT STEP</p>
        <h2>어떤 수업을 배우고 싶은지부터 생각해 봐.</h2>
        <p>
          여러 과목을 더 탐구하고 싶은지, 궁금한 분야를 일찍 배워보고 싶은지
          아직 몰라도 괜찮아. 학교의 실제 수업을 함께 확인해 보자.
        </p>
        <ul>
          <li>국어·수학·영어와 전공 과목은 얼마나 배우나요?</li>
          <li>관심 학과에서 실제로 하는 실습과 이론 수업은 무엇인가요?</li>
          <li>대학 진학과 취업을 위해 각각 어떤 준비를 할 수 있나요?</li>
          <li>학교 분위기와 동아리, 체육 활동은 어떤가요?</li>
        </ul>
        <p className="type-footnote">
          학교에 ‘2027학년도 입학생 3개년 교육과정 편제표’를 요청하면 과목과
          학점 배정을 확인할 수 있어. 충주상고 2027학년도 학과별 편제표의 세부
          수업량은 아직 확인하지 못했어.
        </p>
        <a className="button primary" href="#schools">
          학교 둘러보기 <ArrowRight size={17} />
        </a>
        <p className="type-footnote">
          자료 확인: 2026.11.12 · 학교별 실제 운영과 최신 입학 조건은 공식
          안내를 다시 확인해 줘.
        </p>
      </section>
    </div>
  );
}
