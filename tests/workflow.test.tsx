// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SurveyPage } from "../src/pages/SurveyPage";
import { survey } from "../src/data/survey";
import App from "../src/App";
import { AdminPage } from "../src/pages/AdminPage";
const mocks = vi.hoisted(() => ({
  publish: vi.fn().mockResolvedValue(undefined),
  saveSurvey: vi.fn(),
  save: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../src/lib/api", async () => {
  const real =
    await vi.importActual<typeof import("../src/lib/api")>("../src/lib/api");
  const draft = {
    id: "draft",
    user_id: "u",
    version_id: survey.id,
    answers: { a01: 1 },
    status: "draft",
    submitted_at: null,
    updated_at: "",
  };
  return {
    ...real,
    supabase: {
      auth: {
        getSession: async () => ({ data: { session: { user: { id: "u" } } } }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe() {} } },
        }),
      },
    },
    getProfile: async () => ({ id: "u", nickname: "학생", is_test: false }),
    isAdmin: async () => false,
    loadSurvey: async () => ({ survey, submission: draft }),
    loadFavorites: async () => [],
    loadReport: async () => undefined,
    adminData: async () => ({
      submissions: [
        {
          ...draft,
          id: "s",
          status: "submitted",
          submitted_at: "2026-11-11T00:00:00Z",
        },
      ],
      profiles: [{ id: "u", nickname: "test", is_test: true }],
      favorites: [],
      versions: [survey],
    }),
    loadDraft: async () => "# reviewed",
    publishReport: mocks.publish,
    saveReport: mocks.save,
    saveSurvey: mocks.saveSurvey,
    reportStatus: vi.fn(),
  };
});
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  window.scrollTo = vi.fn();
  mocks.publish.mockClear();
  mocks.save.mockClear();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  location.hash = "";
});
const button = (name: string) =>
  Array.from(host.querySelectorAll("button")).find(
    (x) => x.textContent?.trim() === name,
  )!;
async function click(b: HTMLElement) {
  await act(async () => b.click());
}
it("임시 저장 중 답변과 영역 이동을 잠그고 완료 후 다시 편집할 수 있다", async () => {
  let resolve!: (v: boolean) => void;
  const onSave = () => new Promise<boolean>((r) => (resolve = r));
  await act(async () =>
    root.render(
      <SurveyPage
        survey={survey}
        answers={{}}
        setAnswers={vi.fn()}
        submission={null}
        isTest
        preview={false}
        onSave={onSave}
      />,
    ),
  );
  await click(button("임시 저장"));
  expect(
    (host.querySelector("input") as HTMLInputElement).matches(":disabled"),
  ).toBe(true);
  expect(button("내 이야기").disabled).toBe(true);
  await act(async () => resolve(true));
  expect(
    (host.querySelector("input") as HTMLInputElement).matches(":disabled"),
  ).toBe(false);
});
it("최종 제출 중 검토 화면의 수정 버튼을 잠근다", async () => {
  let resolve!: (v: boolean) => void;
  const answers = Object.fromEntries(
    survey.questions.map((q) => [q.id, q.kind === "scale" ? 1 : ""]),
  );
  await act(async () =>
    root.render(
      <SurveyPage
        survey={survey}
        answers={answers}
        setAnswers={vi.fn()}
        submission={null}
        isTest
        preview={false}
        onSave={() => new Promise((r) => (resolve = r))}
      />,
    ),
  );
  for (let i = 0; i < 10; i++) await click(button("다음"));
  await click(button("답변 검토"));
  await click(button("최종 제출"));
  expect(
    Array.from(host.querySelectorAll(".review-row button")).every(
      (b) => (b as HTMLButtonElement).disabled,
    ),
  ).toBe(true);
  await act(async () => resolve(true));
});
it("작성 중인 설문을 분석 대기로 표시하거나 결과 새로고침으로 답변을 지우지 않는다", async () => {
  location.hash = "#result";
  await act(async () => root.render(<App />));
  expect(host.textContent).not.toContain("형이 답변을 살펴보고");
  expect(button("결과 다시 불러오기")).toBeUndefined();
  expect(host.querySelector(".result-panel a")?.getAttribute("href")).toBe(
    "#survey",
  );
});
it("관리자가 검토한 본문을 원자적 게시 API에 직접 전달한다", async () => {
  await act(async () => root.render(<AdminPage />));
  await click(host.querySelector(".submission-item")!);
  await click(button("저장 후 게시"));
  expect(mocks.publish).toHaveBeenCalledWith("s", "# reviewed");
  expect(mocks.save).not.toHaveBeenCalled();
});

it("저장 도중 다른 화면에 갔다 돌아와도 답변 잠금이 유지된다", async () => {
  let resolve!: (value: unknown) => void;
  mocks.saveSurvey.mockImplementation(() => new Promise((r) => (resolve = r)));
  location.hash = "#survey";
  await act(async () => root.render(<App />));
  await click(button("임시 저장"));
  await act(async () => {
    location.hash = "#schools";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  await act(async () => {
    location.hash = "#survey";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  expect(
    (host.querySelector("input") as HTMLInputElement).matches(":disabled"),
  ).toBe(true);
  await act(async () =>
    resolve({
      id: "draft",
      user_id: "u",
      version_id: survey.id,
      answers: { a01: 1 },
      status: "draft",
    }),
  );
  expect(
    (host.querySelector("input") as HTMLInputElement).matches(":disabled"),
  ).toBe(false);
});

it("저장 실패 후 답변을 유지하고 같은 화면에서 재시도할 수 있다", async () => {
  const saved = {
    id: "draft",
    user_id: "u",
    version_id: survey.id,
    answers: { a01: 1 },
    status: "draft",
  };
  mocks.saveSurvey
    .mockReset()
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(saved);
  location.hash = "#survey";
  await act(async () => root.render(<App />));
  await click(button("임시 저장"));
  expect(host.textContent).toContain("저장하지 못했어요. offline");
  expect(
    (host.querySelector('input[value="1"]') as HTMLInputElement).checked,
  ).toBe(true);
  expect(button("임시 저장").disabled).toBe(false);
  await click(button("임시 저장"));
  expect(host.textContent).toContain("DB에 임시 저장했어요.");
});
