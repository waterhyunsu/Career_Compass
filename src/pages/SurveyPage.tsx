import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { choices, sections, type Survey } from "../data/survey";
import {
  progress,
  validateAnswers,
  canSubmit,
  type Answers,
} from "../lib/domain";
import type { Submission } from "../lib/api";
type Props = {
  survey: Survey;
  answers: Answers;
  setAnswers: (a: Answers) => void;
  submission: Submission | null;
  isTest: boolean;
  preview: boolean;
  saving?: boolean;
  onSave: (submit: boolean) => Promise<boolean>;
};
export function SurveyPage({
  survey,
  answers,
  setAnswers,
  submission,
  isTest,
  preview,
  saving = false,
  onSave,
}: Props) {
  const [page, setPage] = useState(0),
    [localBusy, setBusy] = useState(false),
    [error, setError] = useState("");
  const busy = saving || localBusy;
  const scale = survey.questions.filter((q) => q.kind === "scale"),
    texts = survey.questions.filter((q) => q.kind === "text");
  const pageCount = Math.ceil(scale.length / 5);
  const review = page === pageCount + 1;
  const open = page === pageCount;
  const done = submission && submission.status !== "draft";
  async function save(submit = false) {
    setError("");
    if (submit) {
      const errors = validateAnswers(survey, answers, true);
      if (errors.length) {
        setError(errors[0]);
        const id = errors[0].split(":")[0];
        setPage(Math.floor(scale.findIndex((q) => q.id === id) / 5));
        return;
      }
    }
    setBusy(true);
    try {
      await onSave(submit);
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <section className="panel centered">
        <span className="big-icon">
          <Check />
        </span>
        <p className="eyebrow">STEP 01 · 나를 알아보기</p>
        <h1>네 이야기를 잘 받았어.</h1>
        <p>
          형이 네 답변을 천천히 살펴볼 거야.
          <br />
          기다리는 동안 관심 있는 학교를 둘러봐도 좋아.
        </p>
        <p className="badge">
          {submission.status === "published"
            ? "결과가 게시되었어요"
            : "분석 대기 중"}
        </p>
        <a className="button primary" href="#schools">
          학교 둘러보기 <ArrowRight size={17} />
        </a>
      </section>
    );
  return (
    <div className="survey-wrap">
      <div className="page-heading">
        <p className="eyebrow">STEP 01 · 나를 알아보기</p>
        <h1>정답 없이, 네 생각대로.</h1>
        <p>모르는 질문이 있어도 괜찮아. 경험이 없다면 그대로 알려 줘.</p>
      </div>
      {!survey.approved && (
        <div className="notice">
          검토용 문항 초안이야. 기초 조사 답변과 형의 검토 후 확정할 예정이야.{" "}
          {preview
            ? "미리보기 답변은 이 브라우저에만 저장돼."
            : isTest
              ? "테스트 계정은 기능 검증을 위해 제출할 수 있어."
              : "지금은 임시 저장만 할 수 있어."}
        </div>
      )}
      <div className="progress-panel">
        <div>
          <strong>
            {review
              ? "답변 다시 보기"
              : open
                ? "조금 더 들려줄래?"
                : sections.find((s) => s.id === scale[page * 5]?.section)?.name}
          </strong>
          <span>
            객관식{" "}
            {
              Object.keys(answers).filter((k) => scale.some((q) => q.id === k))
                .length
            }{" "}
            / 50
          </span>
        </div>
        <progress max="100" value={progress(survey, answers)} />
        <small>{progress(survey, answers)}% · 서술형은 건너뛰어도 괜찮아</small>
      </div>
      <div className="section-tabs">
        {sections.map((s) => (
          <button
            key={s.id}
            disabled={busy}
            className={scale[page * 5]?.section === s.id ? "active" : ""}
            onClick={() =>
              setPage(
                Math.floor(scale.findIndex((q) => q.section === s.id) / 5),
              )
            }
          >
            {s.name}{" "}
            {
              scale.filter(
                (q) => q.section === s.id && answers[q.id] !== undefined,
              ).length
            }
            /{s.count}
          </button>
        ))}
        <button
          disabled={busy}
          onClick={() => setPage(pageCount)}
          className={open ? "active" : ""}
        >
          내 이야기
        </button>
      </div>
      {review ? (
        <div className="panel">
          <h2>제출 전에 한 번 살펴보자</h2>
          <p>
            객관식 50문항에 모두 답하면 제출할 수 있어. 서술형은 비워 두어도 돼.
          </p>
          {survey.questions.map((q, i) => (
            <div className="review-row" key={q.id}>
              <span>
                {i + 1}. {q.text}
              </span>
              <button
                disabled={busy}
                onClick={() =>
                  setPage(q.kind === "text" ? pageCount : Math.floor(i / 5))
                }
              >
                {q.kind === "text"
                  ? answers[q.id]
                    ? "작성함"
                    : "건너뜀"
                  : (choices.find((c) => c.value === answers[q.id])?.label ??
                    "미응답")}{" "}
                · 수정
              </button>
            </div>
          ))}
        </div>
      ) : open ? (
        <div className="question-list">
          {texts.map((q, i) => (
            <article className="question" key={q.id}>
              <span className="question-no">
                내 이야기 {i + 1} <small>선택</small>
              </span>
              <label htmlFor={q.id}>{q.text}</label>
              <textarea
                id={q.id}
                disabled={busy}
                maxLength={5000}
                value={answers[q.id] ?? ""}
                placeholder="떠오르는 만큼만 편하게 적어 줘."
                onChange={(e) =>
                  setAnswers({ ...answers, [q.id]: e.target.value })
                }
              />
              <small>{String(answers[q.id] ?? "").length}/5000</small>
            </article>
          ))}
        </div>
      ) : (
        <div className="question-list">
          {scale.slice(page * 5, page * 5 + 5).map((q, i) => (
            <fieldset className="question" key={q.id}>
              <legend>
                <span className="question-no">
                  QUESTION {String(page * 5 + i + 1).padStart(2, "0")}
                </span>
                {q.text}
              </legend>
              <div className="choices">
                {choices.map((c) => (
                  <label
                    key={c.value}
                    className={answers[q.id] === c.value ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      disabled={busy}
                      name={q.id}
                      checked={answers[q.id] === c.value}
                      value={c.value}
                      onChange={() =>
                        setAnswers({ ...answers, [q.id]: c.value })
                      }
                    />
                    <span className="choice-num">
                      {c.value === "unknown" ? "?" : c.value}
                    </span>
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="survey-actions">
        <button disabled={page === 0 || busy} onClick={() => setPage(page - 1)}>
          <ArrowLeft size={16} /> 이전
        </button>
        <button disabled={busy} onClick={() => save()}>
          <Save size={16} /> 임시 저장
        </button>
        {review ? (
          <button
            className="primary"
            disabled={busy || (!preview && !canSubmit(survey, isTest))}
            onClick={() => save(true)}
          >
            {busy
              ? "저장 중…"
              : preview
                ? "미리보기 저장 (실제 제출 아님)"
                : "최종 제출"}
            <Check size={16} />
          </button>
        ) : (
          <button
            className="primary"
            onClick={() => setPage(page + 1)}
            disabled={busy}
          >
            {open ? "답변 검토" : "다음"}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
      <p className="privacy-note">
        임시 저장 버튼을 누르면 나중에 이어서 할 수 있어. 답변은 너와 관리자만
        볼 수 있어.
      </p>
    </div>
  );
}
