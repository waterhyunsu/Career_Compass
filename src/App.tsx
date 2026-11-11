import { useEffect, useRef, useState } from "react";
import {
  Compass,
  ArrowRight,
  Heart,
  BookOpen,
  LogIn,
  LogOut,
  X,
  ShieldCheck,
  Menu,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Home } from "./pages/Home";
import { SurveyPage } from "./pages/SurveyPage";
import { SchoolsPage } from "./pages/SchoolsPage";
import { AdminPage } from "./pages/AdminPage";
import { Markdown } from "./components/Markdown";
import {
  supabase,
  getProfile,
  isAdmin,
  loadSurvey,
  saveSurvey,
  loadFavorites,
  saveFavorite,
  loadReport,
  errorText,
  previewSurvey,
  type Profile,
  type Submission,
  type Favorite,
} from "./lib/api";
import type { Survey } from "./data/survey";
import { SessionGate } from "./lib/session";
import { statusLabels, validateAnswers, type Answers } from "./lib/domain";
const PREVIEW_KEY = "compass-synthetic-preview-v1";
function previewData() {
  try {
    return JSON.parse(localStorage.getItem(PREVIEW_KEY) ?? "{}");
  } catch {
    return {};
  }
}
export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "home"),
    [user, setUser] = useState<User | null>(null),
    [profile, setProfile] = useState<Profile | null>(null),
    [admin, setAdmin] = useState(false),
    [survey, setSurvey] = useState<Survey>(previewSurvey),
    [answers, setAnswers] = useState<Answers>({}),
    [submission, setSubmission] = useState<Submission | null>(null),
    [favorites, setFavorites] = useState<Favorite[]>([]),
    [report, setReport] = useState<string | undefined>(),
    [authOpen, setAuthOpen] = useState(false),
    [loading, setLoading] = useState(Boolean(supabase)),
    [toast, setToast] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [authBusy, setAuthBusy] = useState(false),
    [mobileMenu, setMobileMenu] = useState(false),
    [loadError, setLoadError] = useState(false);
  const preview = !supabase,
    sessionGate = useRef(new SessionGate());
  useEffect(() => {
    const onHash = () => {
      setRoute(location.hash.slice(1) || "home");
      setMobileMenu(false);
      window.scrollTo({ top: 0 });
    };
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);
  async function sync(next: User | null, force = false) {
    const epoch = sessionGate.current.start(next?.id ?? null, force);
    if (epoch === null) return;
    setLoading(true);
    setLoadError(false);
    setUser(next);
    setProfile(null);
    setAdmin(false);
    setSubmission(null);
    setAnswers({});
    setFavorites([]);
    setReport(undefined);
    try {
      if (next) {
        const [p, a, s, f] = await Promise.all([
          getProfile(next.id),
          isAdmin(),
          loadSurvey(next.id),
          loadFavorites(),
        ]);
        if (!sessionGate.current.current(epoch)) return;
        setProfile(p);
        setAdmin(a);
        setSurvey(s.survey);
        setSubmission(s.submission);
        setAnswers(s.submission?.answers ?? {});
        setFavorites(f.filter((x) => x.user_id === next.id));
        if (s.submission) {
          const r = await loadReport(s.submission.id);
          if (sessionGate.current.current(epoch)) setReport(r);
        }
      }
    } catch (e) {
      if (sessionGate.current.current(epoch)) {
        setToast(errorText(e));
        setLoadError(true);
      }
    } finally {
      if (sessionGate.current.current(epoch)) setLoading(false);
    }
  }
  useEffect(() => {
    if (preview) {
      const d = previewData();
      setAnswers(d.answers ?? {});
      setFavorites(d.favorites ?? []);
      return;
    }
    let active = true;
    supabase!.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setToast(error.message);
        setLoading(false);
      } else void sync(data.session?.user ?? null);
    });
    const { data } = supabase!.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT")
        setTimeout(() => {
          if (active) void sync(session?.user ?? null);
        }, 0);
    });
    return () => {
      active = false;
      sessionGate.current.invalidate();
      data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 10000);
    return () => clearTimeout(timer);
  }, [toast]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthBusy(true);
    try {
      const { error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setPassword("");
      setAuthOpen(false);
    } catch (e) {
      setToast(errorText(e));
    } finally {
      setAuthBusy(false);
    }
  }
  async function save(submit: boolean) {
    const epoch = sessionGate.current.token();
    const errors = validateAnswers(survey, answers, submit);
    if (errors.length) {
      setToast(errors[0]);
      return false;
    }
    try {
      if (preview) {
        localStorage.setItem(
          PREVIEW_KEY,
          JSON.stringify({ answers, favorites }),
        );
        setToast(
          "미리보기 답변을 이 브라우저에 저장했어요. 실제 제출이나 DB 저장은 아니에요.",
        );
        return true;
      }
      const saved = await saveSurvey(survey.id, answers, submit);
      if (!sessionGate.current.current(epoch)) return false;
      setSubmission(saved);
      setToast(
        submit ? "DB에 답변을 저장하고 제출했어요." : "DB에 임시 저장했어요.",
      );
      return true;
    } catch (e) {
      if (sessionGate.current.current(epoch))
        setToast("저장하지 못했어요. " + errorText(e));
      return false;
    }
  }
  async function favorite(
    school_id: string,
    department_id: string | null,
    note?: string,
  ) {
    if (!preview && !user) {
      setAuthOpen(true);
      return;
    }
    const epoch = sessionGate.current.token();
    const user_id = user?.id ?? "preview";
    const existing = favorites.find(
      (f) => f.school_id === school_id && f.department_id === department_id,
    );
    const entry = {
      user_id,
      school_id,
      department_id,
      target_id: department_id ?? "",
      note: note ?? existing?.note ?? "",
    };
    const remove = Boolean(existing) && note === undefined;
    try {
      if (!preview) await saveFavorite(entry, remove);
      if (!sessionGate.current.current(epoch)) return;
      const next = [
        ...favorites.filter(
          (f) => f.school_id !== school_id || f.department_id !== department_id,
        ),
        ...(remove ? [] : [entry]),
      ];
      if (preview)
        localStorage.setItem(
          PREVIEW_KEY,
          JSON.stringify({ ...previewData(), favorites: next }),
        );
      setFavorites((old) => [
        ...old.filter(
          (f) => f.school_id !== school_id || f.department_id !== department_id,
        ),
        ...(remove ? [] : [entry]),
      ]);
      setToast(remove ? "관심 목록에서 뺐어요." : "관심 목록에 저장했어요.");
    } catch (e) {
      if (sessionGate.current.current(epoch))
        setToast("저장하지 못했어요. " + errorText(e));
    }
  }
  const protectedRoute = ["survey", "result", "favorites", "admin"].includes(
      route,
    ),
    canView = preview ? route !== "admin" : Boolean(user);
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home">
          <span className="brand-mark">
            <Compass size={24} />
          </span>
          <span>
            <b>진로 나침반</b>
          </span>
        </a>
        <nav aria-label="주 메뉴" className={mobileMenu ? "menu-open" : ""}>
          {[
            { id: "home", label: "시작하기" },
            { id: "survey", label: "나를 알아보기" },
            { id: "schools", label: "학교 둘러보기" },
            { id: "favorites", label: "관심 모아보기" },
            { id: "result", label: "나의 방향" },
          ].map((n) => (
            <a
              href={"#" + n.id}
              key={n.id}
              className={route === n.id ? "active" : ""}
            >
              {n.label}
            </a>
          ))}
          {admin && (
            <a href="#admin" className={route === "admin" ? "active" : ""}>
              관리자
            </a>
          )}
        </nav>
        <div className="header-actions">
          {user ? (
            <button
              className="login-button"
              onClick={async () => {
                const { error } = await supabase!.auth.signOut();
                if (error) setToast(error.message);
              }}
            >
              <LogOut size={15} />
              <span>{profile?.nickname ?? "로그아웃"}</span>
            </button>
          ) : (
            <button className="login-button" onClick={() => setAuthOpen(true)}>
              <LogIn size={15} />
              <span>로그인</span>
            </button>
          )}
          <button
            className="mobile-menu icon-button"
            aria-label="메뉴 열기"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>
      {preview && (
        <div className="preview-banner">
          개발 미리보기 · 실제 개인정보를 입력하지 마세요 · DB·로그인 미연결
        </div>
      )}
      <main>
        {loading ? (
          <div className="panel centered">
            <Compass className="loading-icon" />
            <h2>네 공간을 준비하고 있어.</h2>
          </div>
        ) : loadError ? (
          <div className="panel centered">
            <h2>데이터를 불러오지 못했어요.</h2>
            <p>연결과 설문 데이터 설정을 확인해 주세요.</p>
            <button onClick={() => sync(user, true)}>다시 불러오기</button>
          </div>
        ) : protectedRoute && !canView ? (
          <div className="panel centered">
            <ShieldCheck size={36} />
            <h1>
              {route === "admin"
                ? "관리자 로그인이 필요해요."
                : "네 이야기만 담는 공간이야."}
            </h1>
            <p>초대받은 계정으로 로그인하면 이어서 할 수 있어.</p>
            <button className="primary" onClick={() => setAuthOpen(true)}>
              로그인 <ArrowRight size={16} />
            </button>
          </div>
        ) : route === "home" ? (
          <Home />
        ) : route === "survey" ? (
          <SurveyPage
            survey={survey}
            answers={answers}
            setAnswers={setAnswers}
            submission={submission}
            isTest={profile?.is_test ?? true}
            preview={preview}
            onSave={save}
          />
        ) : route === "schools" || route === "favorites" ? (
          <SchoolsPage
            key={route}
            favorites={favorites}
            onFavorite={favorite}
            onlySaved={route === "favorites"}
          />
        ) : route === "result" ? (
          <section className="panel result-panel">
            <p className="eyebrow">STEP 03 · 나의 방향</p>
            {user && (
              <button onClick={() => sync(user, true)}>
                결과 다시 불러오기
              </button>
            )}
            <h1>
              {report
                ? "함께 살펴본, 너의 이야기"
                : submission
                  ? statusLabels[submission.status]
                  : "아직 쓰이지 않은 너의 다음 장."}
            </h1>
            {report ? (
              <Markdown text={report} />
            ) : (
              <>
                <span className="big-icon">
                  <BookOpen size={30} />
                </span>
                <p>
                  {submission
                    ? "형이 답변을 살펴보고 검토한 결과를 이곳에 올려 줄 거야."
                    : "네 생각을 들려주면, 형이 차근차근 읽고 함께 정리해 줄 거야."}
                  <br />
                  특정 학교가 정답이라고 정해 주지 않아.
                </p>
                <a
                  href={submission ? "#schools" : "#survey"}
                  className="button primary"
                >
                  {submission ? "학교 둘러보기" : "나를 알아보기"}
                  <ArrowRight size={16} />
                </a>
              </>
            )}
          </section>
        ) : route === "admin" && admin ? (
          <AdminPage />
        ) : (
          <div className="panel centered">
            <h1>접근할 수 없는 화면이에요.</h1>
            <a href="#home">시작 화면으로</a>
          </div>
        )}
      </main>
      <footer>
        <a className="brand small" href="#home">
          <Compass size={19} />
          진로 나침반
        </a>
        <p>너의 속도로, 너의 방향으로.</p>
        <span>개인정보는 최소한으로 · 선택은 스스로</span>
        <a className="admin-link" href="#admin">
          관리자
        </a>
      </footer>
      <div className="mobile-bottom">
        <a href="#home">
          <Compass size={20} />
          시작
        </a>
        <a href="#survey">
          <BookOpen size={20} />나 알아보기
        </a>
        <a href="#schools">
          <BookOpen size={20} />
          학교 탐색
        </a>
        <a href="#favorites">
          <Heart size={20} />
          관심
        </a>
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button aria-label="알림 닫기" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {authOpen && (
        <div className="modal-backdrop">
          <section
            className="modal auth-modal"
            role="dialog"
            aria-modal="true"
            aria-label="로그인"
          >
            <button
              className="modal-close"
              aria-label="로그인 닫기"
              onClick={() => setAuthOpen(false)}
            >
              <X />
            </button>
            <span className="big-icon">
              <Compass />
            </span>
            <h2>다시 만나서 반가워.</h2>
            {preview ? (
              <>
                <p>
                  현재는 로그인 서비스가 연결되지 않은 개발 미리보기야. 관리자
                  화면과 실제 제출은 Supabase 설정 후 사용할 수 있어.
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setAuthOpen(false);
                    location.hash = "survey";
                  }}
                >
                  미리보기 둘러보기
                </button>
              </>
            ) : (
              <form onSubmit={login}>
                <p>
                  형에게 받은 계정으로 로그인해 줘.
                  <br />
                  닉네임은 로그인 정보가 아니야.
                </p>
                <label>
                  이메일
                  <input
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  비밀번호
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <button type="submit" className="primary" disabled={authBusy}>
                  {authBusy ? "로그인 중…" : "로그인"}
                </button>
                <small>계정이나 비밀번호를 잊었다면 형에게 알려 줘.</small>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
