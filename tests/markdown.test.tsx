import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "../src/components/Markdown";
it("HTML 스크립트, 이벤트, javascript 링크와 외부 추적 이미지를 실행 가능한 형태로 내보내지 않는다", () => {
  const html = renderToStaticMarkup(
    <Markdown
      text={
        "# 검토 결과\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[링크](javascript:alert(1))\n\n![추적](https://tracker.example/a.png)"
      }
    />,
  );
  expect(html).toContain("검토 결과");
  expect(html).not.toContain("<script");
  expect(html).not.toContain("<img");
  expect(html).not.toContain("javascript:");
  expect(html).not.toContain("onerror");
});
