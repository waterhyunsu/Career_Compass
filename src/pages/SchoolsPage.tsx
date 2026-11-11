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
        2027학년도 공식 자료를 바탕으로 확인한 범위를 표시했어. 지원 자격과
        통학은 최종 확인이 필요해. 학교 순서는 추천 순위가 아니야.
      </div>
      {!onlySaved && (
        <a className="career-compare-entry" href="#careers">
          <strong>충주공고·충주상고 학과·직무 비교 →</strong>
          <span>9학과의 일·초봉·전망·영어 활용을 한눈에 살펴봐.</span>
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
                <span>{s.type}</span>
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
                    : "성별 조건 확인"}
                </span>
              </div>
              <h2>
                <button onClick={() => open(s)}>{s.name}</button>
              </h2>
              <p>{s.summary}</p>
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
                          {String(
                            schools.find((s) => s.id === id)?.[
                              key as keyof School
                            ] ?? "확인 필요",
                          )}
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
              {detail.type} · {detail.ownership} · {detail.gender}
            </p>
            <h1>{detail.name}</h1>
            <p>{detail.summary}</p>
            <p className="badge">
              2027 자료 · {detail.verification} · {detail.checkedAt}
            </p>
            <div className="notice">{detail.notes}</div>
            <h3>무엇을 배울까?</h3>
            <p>{detail.curriculum}</p>
            {detail.departments.map((d) => (
              <div className="department-card" key={d.id}>
                <div className="department-row">
                  <div>
                    <strong>
                      {d.name}
                      {d.capacity !== null ? ` · ${d.capacity}명` : ""}
                    </strong>
                    <p>{d.subjects}</p>
                    <small>자격증: {d.certifications}</small>
                    <p>{d.pathway}</p>
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
            <p>{detail.pathway}</p>
            <h3>입학 전에 확인해 봐</h3>
            <dl>
              <dt>전형</dt>
              <dd>{detail.selection}</dd>
              <dt>접수 기간</dt>
              <dd>{detail.applicationPeriod}</dd>
              <dt>통학</dt>
              <dd>{detail.commute}</dd>
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
                2027 입학 자료 ↗
              </a>
              {detail.sources.map((s) => (
                <a href={s.url} key={s.url} target="_blank" rel="noreferrer">
                  {s.title} ↗
                </a>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
