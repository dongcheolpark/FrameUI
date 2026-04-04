import { useState } from "react";
import { Button, Switch, Textarea, CheckboxCards, FRAME_UI_VERSION } from "FrameUI";
import "./App.css";

export function App() {
  const [count, setCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["frontend"]);

  return (
    <main className="page">
      <section className="card">
        <h1>FrameUI Demo</h1>
        <p>라이브러리 버전: {FRAME_UI_VERSION}</p>

        <hr />

        {/* Button 예시 */}
        <div className="component-section">
          <h2>Button Component</h2>
          <p>버튼 클릭 수: {count}</p>
          <Button
            label="클릭해보기"
            onClick={() => setCount((value) => value + 1)}
          />
        </div>

        <hr />

        {/* Switch 예시 */}
        <div className="component-section">
          <h2>Switch Component</h2>

          <div className="switch-example">
            <label>다크모드</label>
            <Switch
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
              aria-label="다크모드 토글"
            />
            <span className="status">{isDarkMode ? "🌙 ON" : "☀️ OFF"}</span>
          </div>

          <div className="switch-example">
            <label>알림 활성화</label>
            <Switch
              checked={isNotificationEnabled}
              onCheckedChange={setIsNotificationEnabled}
              aria-label="알림 토글"
            />
            <span className="status">
              {isNotificationEnabled ? "🔔 ON" : "🔕 OFF"}
            </span>
          </div>

          <div className="switch-example">
            <label>비활성화된 스위치</label>
            <Switch defaultChecked={true} disabled aria-label="비활성화 예시" />
            <span className="status">비활성화됨</span>
          </div>
        </div>

        <hr />

        {/* Textarea 예시 */}
        <div className="component-section">
          <h2>Textarea Component</h2>

          <div className="component-example" style={{ marginBottom: "24px" }}>
            <h3>1. 단축형(Shorthand) 사용</h3>
            <Textarea
              placeholder="댓글을 남겨주세요..."
              minRows={2}
              maxRows={4}
              actionSlot={<Button label="작성" />}
            />
          </div>

          <div className="component-example">
            <h3>2. Compound 패턴 사용 (유연한 구조)</h3>
            <Textarea.Root>
              <Textarea.Input placeholder="상세 내용을 입력하세요." minRows={4} />
              <Textarea.Action>
                <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "flex-end" }}>
                  <Button label="임시저장" />
                  <Button label="확인" />
                </div>
              </Textarea.Action>
            </Textarea.Root>
          </div>
        </div>

        {/* CheckboxCards 예시 */}
        <div className="component-section">
          <h2>CheckboxCards Component</h2>

          <CheckboxCards
            value={selectedRoles}
            onValueChange={setSelectedRoles}
            options={[
              {
                value: "design",
                label: "Design",
                description: "UI 작업",
              },
              {
                value: "frontend",
                label: "Frontend",
                description: "React 개발",
              },
              {
                value: "backend",
                label: "Backend",
                description: "API 개발",
              },
            ]}
          />

          <div className="status">
            선택된 값: {selectedRoles.join(", ") || "없음"}
          </div>

          <div style={{ height: 16 }} />

          <CheckboxCards
            orientation="horizontal"
            defaultValue={["basic"]}
            options={[
              { value: "basic", label: "Basic" },
              { value: "pro", label: "Pro" },
              { value: "team", label: "Team" },
            ]}
          />

          <div style={{ height: 16 }} />

          <CheckboxCards
            disabled
            defaultValue={["design"]}
            options={[
              { value: "design", label: "Disabled option" },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
