import { studentText } from "../lib/student-text";
import { useState } from "react";
import {
  ArrowUpRight,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  Check,
} from "lucide-react";
import schools from "../data/schools.json";
import {
  interestQuestion,
  schoolPrograms,
  schoolTypeName,
  schoolSubjects,
  schoolQualifications,
  schoolPathway,
} from "../lib/school-presentation";
import { DepartmentCareer } from "../components/DepartmentCareer";
import type { Favorite } from "../lib/api";
export type School = (typeof schools)[number];
export function SchoolsPage({
  favorites,
  onFavorite,
  onlySaved = false,
}: {
  favorites: Favorite[];
  onFavorite: (
    school: string,
    department: string | null,
    note?: string,
  ) => Promise<void>;
  onlySaved?: boolean;
}) {
  const [filter, setFilter] = useState("전체"),
    [query, setQuery] = useState(""),
    [detail, setDetail] = useState<School | null>(null),
    [comparison, setComparison] = useState<string[]>([]),
    [showCompare, setShowCompare] = useState(false),
    [includeUnavailable, setIncludeUnavailable] = useState(false),
    [busy, setBusy] = useState(false),
    [note, setNote] = useState("");
  const noSavedSchools = onlySaved && favorites.length === 0;
  const has = (s: string, d: string | null = null) =>
    favorites.some((f) => f.school_id === s && f.department_id === d);
  const displayed = schools.filter(
    (s) =>
      (filter === "전체" || s.type === filter) &&
      s.name.includes(query) &&
      (!onlySaved || favorites.some((f) => f.school_id === s.id)) &&
      (includeUnavailable || s.maleEligibility !== "불가"),
  );
  async function favorite(s: string, d: string | null, n?: string) {
    setBusy(true);
    try {
      await onFavorite(s, d, n);
    } finally {
      setBusy(false);
    }
  }
  function compare(id: string) {
    setComparison((old) =>
      old.includes(id)
        ? old.filter((x) => x !== id)
        : old.length < 3
          ? [...old, id]
          : old,
    );
  }
  function open(s: School) {
    setDetail(s);
    setNote(
      favorites.find((f) => f.school_id === s.id && f.department_id === null)
        ?.note ?? "",
    );
  }
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">
          STEP 02 · {onlySaved ? "관심 학교와 선택 이유" : "학교 둘러보기"}
        </p>
        <h1>
          {onlySaved
            ? "마음이 가는 이유를 모아 봐."
            : "어떤 배움이 기다리고 있을까?"}
        </h1>
        <p>학교의 이름보다, 그곳에서 무엇을 배우고 싶은지 생각해 봐.</p>
      </div>
      <div className="notice">
        학교마다 배우는 과목과 입학 방식이 달라. 관심 있는 학교를 비교해 봐.
      </div>
      {!onlySaved && (
        <a className="career-compare-entry" href="#careers">
          <strong>충주공고·충주상고 학과·직무 비교 →</strong>
          <span>9학과의 일·초봉·전망·영어 활용을 한눈에 살펴봐.</span>
        </a>
      )}
      {!onlySaved && (
        <a className="career-compare-entry" href="#school-types">
          <strong>일반고와 특성화고, 무엇이 다를까? →</strong>
          <span>실제 과목과 졸업 후 길을 먼저 살펴봐.</span>
        </a>
      )}
      <div className="school-guide">
        <div>
          <strong>일반고</strong>
          <p>
            여러 교과를 배우며 관심 분야를 넓혀 갈 수 있어.
            <br />
            학교별 선택과목과 진학·진로 지원을 확인해 봐.
          </p>
        </div>
        <div>
          <strong>특성화고</strong>
          <p>
            공통 교과와 전공 실습을 함께 배워.
            <br />
            취업뿐 아니라 대학 진학 경로도 함께 살펴봐.
          </p>
        </div>
      </div>
      <div className="filter-bar">
        <div className="filter-tabs">
          {["전체", "일반고", "특성화고"].map((f) => (
            <button
              key={f}
              className={f === filter ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label="학교 이름 검색"
            placeholder="학교 이름 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="list-meta">
        <span>
          {displayed.length}개 학교 <SlidersHorizontal size={14} />
        </span>
        <label>
          <input
            type="checkbox"
            checked={includeUnavailable}
            onChange={(e) => setIncludeUnavailable(e.target.checked)}
          />
          남학생 지원 불가 학교도 보기
        </label>
      </div>
      <div className="schools-grid">
        {displayed.map((s, i) => (
          <article className="school-card" key={s.id}>
            <div className={"school-cover cover-" + (i % 4)}>
              <span className="school-monogram">
                {s.name.replace("등학교", "").slice(0, 2)}
              </span>
              <span className="cover-caption">
                {s.type === "일반고"
                  ? "EXPLORE YOUR POSSIBILITIES"
                  : "LEARN BY DOING"}
              </span>
              <button
                className={
                  "icon-button heart-button " + (has(s.id) ? "hearted" : "")
                }
                disabled={busy}
                aria-label={s.name + (has(s.id) ? " 관심 해제" : " 관심 저장")}
                onClick={() => favorite(s.id, null)}
              >
                <Heart size={18} fill={has(s.id) ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="school-body">
              <div className="school-tags">
                <span>{schoolTypeName(s.id, s.type)}</span>
                <span>
                  {s.ownership} · {s.gender}
                </span>
                <span
                  className={
                    s.maleEligibility === "불가" ? "unavailable" : "verified"
                  }
                >
                  {s.maleEligibility === "불가"
                    ? "남학생 지원 불가"
                    : "남학생 모집"}
                </span>
              </div>
              <h2>
                <button onClick={() => open(s)}>{s.name}</button>
              </h2>
              <p>{studentText(s.summary)}</p>
              <small className="school-address">
                <MapPin size={13} />
                {s.address}
              </small>
              <div className="department-chips">
                {s.departments.slice(0, 3).map((d) => (
                  <span key={d.id}>{d.name}</span>
                ))}
                {s.departments.length > 3 && (
                  <span>+{s.departments.length - 3}</span>
                )}
              </div>
              <div className="school-card-bottom">
                <button
                  className={
                    comparison.includes(s.id) ? "compare-selected" : ""
                  }
                  disabled={
                    !comparison.includes(s.id) && comparison.length >= 3
                  }
                  onClick={() => compare(s.id)}
                >
                  {comparison.includes(s.id) ? (
                    <Check size={14} />
                  ) : (
                    <span>＋</span>
                  )}{" "}
                  비교 담기
                </button>
                <button onClick={() => open(s)}>
                  자세히 보기 <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!displayed.length && (
        <div className="panel centered">
          <Heart />
          <h2>
            {noSavedSchools
              ? "아직 담아 둔 학교가 없어."
              : "조건에 맞는 학교가 없어."}
          </h2>
          <p>
            {noSavedSchools
              ? "학교를 둘러보고 마음이 가는 곳의 하트를 눌러 봐."
              : "학교 이름이나 유형, 지원 조건 필터를 바꿔 봐."}
          </p>
          {noSavedSchools ? (
            <a className="button primary" href="#schools">
              학교 둘러보기
            </a>
          ) : (
            <button
              className="primary"
              onClick={() => {
                setQuery("");
                setFilter("전체");
                setIncludeUnavailable(onlySaved);
              }}
            >
              검색·필터 초기화
            </button>
          )}
        </div>
      )}
      {comparison.length > 0 && (
        <div className="compare-tray">
          <span>
            <strong>{comparison.length}</strong>/3 학교를 담았어
          </span>
          <button
            className="primary"
            onClick={() => setShowCompare(!showCompare)}
          >
            나란히 비교하기
          </button>
          <button
            aria-label="비교 초기화"
            onClick={() => {
              setComparison([]);
              setShowCompare(false);
            }}
          >
            <X size={17} />
          </button>
        </div>
      )}
      {showCompare && (
        <div className="modal-backdrop">
          <section
            className="modal wide"
            role="dialog"
            aria-modal="true"
            aria-label="학교 비교"
          >
            <button
              className="modal-close"
              onClick={() => setShowCompare(false)}
              aria-label="비교 닫기"
            >
              <X />
            </button>
            <h2>나란히 놓고 생각해 보자</h2>
            <p>
              어느 학교가 더 좋은지보다, 내가 중요하게 생각하는 조건을 살펴봐.
            </p>
            <p className="privacy-note">
              화면이 좁다면 표를 좌우로 밀어서 비교해 봐.
            </p>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="학교 비교 표, 좌우 스크롤 가능"
            >
              <table>
                <thead>
                  <tr>
                    <th>살펴볼 점</th>
                    {comparison.map((id) => (
                      <th key={id}>{schools.find((s) => s.id === id)?.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["유형", "type"],
                    ["남학생 성별 조건", "maleEligibility"],
                    ["교육과정", "curriculum"],
                    ["진학·취업", "pathway"],
                    ["전형", "selection"],
                    ["접수 기간", "applicationPeriod"],
                    ["통학", "commute"],
                  ].map(([label, key]) => (
                    <tr key={key}>
                      <th>{label}</th>
                      {comparison.map((id) => (
                        <td key={id}>
                          {(() => {
                            const school = schools.find((s) => s.id === id)!;
                            if (key === "type")
                              return schoolTypeName(school.id, school.type);
                            if (key === "curriculum")
                              return school.type === "특성화고"
                                ? "보통교과와 학과별 전공 수업"
                                : "여러 교과와 선택과목";
                            if (key === "pathway")
                              return school.type === "특성화고"
                                ? "전공을 배우며 취업·대학 진학 탐색"
                                : "대학 진학·취업 등 다양한 진로 탐색";
                            if (key === "commute")
                              return "버스 노선과 등하교 시간을 살펴보자.";
                            if (key === "maleEligibility")
                              return school.maleEligibility === "불가"
                                ? "남학생 지원 불가"
                                : "남학생 모집";
                            return String(school[key as keyof School] ?? "");
                          })()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
      {detail && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={detail.name}
          >
            <button
              className="modal-close"
              aria-label="학교 상세 닫기"
              onClick={() => setDetail(null)}
            >
              <X />
            </button>
            <p className="eyebrow">
              {schoolTypeName(detail.id, detail.type)} · {detail.ownership} ·{" "}
              {detail.gender}
            </p>
            <h1>{detail.name}</h1>
            <p>{studentText(detail.summary)}</p>
            <p className="badge">2027학년도 입학 안내</p>
            <p className="school-important">
              지원할 때 졸업·거주 등 전형 조건을 함께 살펴봐.
              {detail.id === "chungjuch" &&
                " 특별전형 마감은 첨부 모집요강에 11월 20일로 적혀 있어. 홈페이지 본문의 날짜와 달라 원서 제출 전 학교에 확인해 줘."}
            </p>
            <h3>무엇을 배울까?</h3>
            <p>
              {detail.type === "특성화고"
                ? "아래는 학교가 소개한 학과별 배움이야. 2027학년도 과목 구성은 학교 교육과정표에서 살펴보자."
                : "여러 교과와 선택과목을 통해 관심 분야를 넓혀 가."}
            </p>
            {detail.type === "특성화고" && (
              <p className="school-qualifications-note">
                관련 자격은 학교 소개의 예시야. 자격마다 응시 조건이 있어.
              </p>
            )}
            {detail.departments.map((d) => (
              <div className="department-card" key={d.id}>
                <div className="department-row">
                  <div>
                    <strong>
                      {d.name}
                      {d.capacity !== null ? ` · ${d.capacity}명` : ""}
                    </strong>
                    <p>{schoolSubjects(d.subjects)}</p>
                    {schoolPrograms[d.id] && (
                      <p className="school-program">
                        {schoolPrograms[d.id].text}{" "}
                        <a
                          href={schoolPrograms[d.id].url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          교육청 자료 ↗
                        </a>
                      </p>
                    )}
                    {interestQuestion(d.id) && (
                      <p className="interest-question">
                        생각해 볼 질문 · {interestQuestion(d.id)}
                      </p>
                    )}
                    {schoolQualifications(d.certifications) && (
                      <small>
                        관련 자격 예시: {schoolQualifications(d.certifications)}
                      </small>
                    )}
                    {d.pathway &&
                      !d.pathway.includes("공식 자료 확인 필요") && (
                        <p>{schoolPathway(d.pathway)}</p>
                      )}
                  </div>
                  <button
                    disabled={busy}
                    aria-label={d.name + " 관심 저장"}
                    onClick={() => favorite(detail.id, d.id)}
                  >
                    <Heart
                      size={18}
                      fill={has(detail.id, d.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <DepartmentCareer departmentId={d.id} />
              </div>
            ))}
            <h3>어떤 길이 있을까?</h3>
            <p>
              {detail.type === "특성화고"
                ? "관심 있는 전공을 배우며 취업과 대학 진학 등 여러 길을 살펴볼 수 있어."
                : "대학 진학, 취업 등 다양한 진로를 살펴볼 수 있어."}
            </p>
            <h3>입학 전에 확인해 봐</h3>
            <dl>
              <dt>전형</dt>
              <dd>{detail.selection}</dd>
              <dt>접수 기간</dt>
              <dd>{detail.applicationPeriod}</dd>
              <dt>통학</dt>
              <dd>집에서 학교까지 버스 노선과 등하교 시간을 살펴보자.</dd>
            </dl>
            <h3>관심을 갖게 된 이유</h3>
            <textarea
              aria-label="학교 관심 이유"
              maxLength={2000}
              placeholder="배워 보고 싶은 것, 궁금한 점을 적어 봐."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              className="primary"
              disabled={busy}
              onClick={() => favorite(detail.id, null, note)}
            >
              관심 학교와 이유 저장
            </button>
            <h3>직접 확인할 공식 자료</h3>
            <div className="source-links">
              <a href={detail.homepage} target="_blank" rel="noreferrer">
                학교 홈페이지 ↗
              </a>
              <a href={detail.admissionsUrl} target="_blank" rel="noreferrer">
                2027 모집요강 보기 ↗
              </a>
              <details className="school-source-details">
                <summary>더 많은 공식 자료</summary>
                {detail.sources.map((s) => (
                  <a href={s.url} key={s.url} target="_blank" rel="noreferrer">
                    {s.title} ↗
                  </a>
                ))}
              </details>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
