import { it, expect } from "vitest";
import { SessionGate } from "../src/lib/session";
it("동일 사용자의 세션 복원은 진행 중 답변을 초기화하지 않는다", () => {
  const s = new SessionGate();
  const token = s.start("a");
  expect(token).toBeTypeOf("number");
  expect(s.start("a")).toBe(null);
  expect(s.current(token!)).toBe(true);
});
it("로그아웃·계정 전환 후 이전 비동기 저장 결과를 폐기한다", () => {
  const s = new SessionGate();
  const a = s.start("a")!;
  s.start(null);
  expect(s.current(a)).toBe(false);
  const b = s.start("b")!;
  expect(s.current(a)).toBe(false);
  expect(s.current(b)).toBe(true);
});
it("명시적 다시 불러오기는 같은 계정에서도 갱신한다", () => {
  const s = new SessionGate();
  const a = s.start("a")!;
  expect(s.start("a", true)).not.toBe(a);
  expect(s.current(a)).toBe(false);
});
