import {
  ArrowRight,
  Compass,
  Heart,
  BookOpen,
  Footprints,
  Sparkles,
} from "lucide-react";
export function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">
            <span className="live-dot" />
            너의 속도로 찾아가는, 나만의 방향
          </span>
          <h1>
            아직 꿈이 없어도
            <br />
            <span>괜찮아.</span>
          </h1>
          <p>
            좋아하는 것과 잘 맞는 환경을 하나씩 찾아보자.
            <br />
            정답은 없어. 네 생각이 가장 중요해.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#survey">
              나를 알아보러 가기 <ArrowRight size={18} />
            </a>
            <a className="text-link" href="#schools">
              학교부터 둘러볼래 <ArrowRight size={16} />
            </a>
          </div>
          <div className="hero-note">
            <Heart size={15} />
            모르겠다는 답도, 소중한 네 생각이야.
          </div>
        </div>
        <div className="compass-art" aria-hidden="true">
          <div className="art-grid" />
          <span className="art-spark s1">✦</span>
          <span className="art-spark s2">✧</span>
          <div className="orbit orbit1" />
          <div className="orbit orbit2" />
          <div className="compass-disc">
            <span className="north">N</span>
            <span className="south">S</span>
            <span className="east">E</span>
            <span className="west">W</span>
            <div className="disc-inner" />
            <div className="needle">
              <i />
              <b />
            </div>
            <span className="pivot" />
          </div>
          <div className="art-label label-top">
            <Sparkles size={16} />
            나의 가능성
          </div>
          <div className="art-label label-bottom">
            <span>✳</span>시작점은 바로, 지금의 나
          </div>
          <span className="art-caption">YOUR OWN DIRECTION</span>
        </div>
      </section>
      <a className="career-compare-entry" href="#school-types">
        <strong>일반고와 특성화고, 무엇을 배울까? →</strong>
        <span>실제 수업 자료를 보며 차근차근 알아보자.</span>
      </a>
      <section className="journey">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR JOURNEY</p>
            <h2>조금씩 알아가면 돼.</h2>
          </div>
          <span className="muted">결정을 서두르지 않아도 괜찮아</span>
        </div>
        <div className="journey-grid">
          {[
            {
              n: "01",
              icon: Compass,
              title: "나를 알아보기",
              text: "관심과 경험을 돌아보며\n내가 어떤 사람인지 살펴봐.",
              href: "#survey",
              tag: "객관식 50개 · 내 이야기 5개",
            },
            {
              n: "02",
              icon: BookOpen,
              title: "학교 둘러보기",
              text: "학교마다 무엇을 배우는지,\n어떤 길이 있는지 비교해 봐.",
              href: "#schools",
              tag: "공식 자료로 차근차근",
            },
            {
              n: "03",
              icon: Footprints,
              title: "나의 방향 정리하기",
              text: "형과 함께 살펴본 이야기를 읽고\n너만의 다음 걸음을 정해 봐.",
              href: "#result",
              tag: "검토한 결과만 전달해",
            },
          ].map((c) => (
            <a className="journey-card" href={c.href} key={c.n}>
              <div className="card-top">
                <span className="tile-icon">
                  <c.icon size={24} />
                </span>
                <span className="step-number">{c.n}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <div className="card-bottom">
                <span>{c.tag}</span>
                <ArrowRight size={18} />
              </div>
            </a>
          ))}
        </div>
      </section>
      <aside className="reassurance">
        <span className="mini-flower">✳</span>
        <div>
          <strong>학교를 대신 골라 주는 곳이 아니야.</strong>
          <p>
            네 관심사와 경험, 실제 학교 정보를 함께 살펴보는 공간이야.
            <br className="desktop-break" />
            마지막 선택의 주인공은 언제나 너야.
          </p>
        </div>
        <Heart size={24} />
      </aside>
    </>
  );
}
