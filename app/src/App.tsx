import { useState } from "react";
import { Button, Switch, Textarea, CheckboxCards, Tabs, FRAME_UI_VERSION } from "FrameUI";
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

        <hr />

        {/* Tabs 예시 */}
        <div className="component-section">
          <h2>Tabs Component</h2>
          
          <Tabs.Root defaultValue="account" className="tabs-root">
            <Tabs.List className="tabs-list">
              <Tabs.Trigger value="account" className="tabs-trigger">계정 관리</Tabs.Trigger>
              <Tabs.Trigger value="password" className="tabs-trigger">보안 및 비밀번호</Tabs.Trigger>
              <Tabs.Trigger value="billing" className="tabs-trigger" disabled>결제 (준비중)</Tabs.Trigger>
            </Tabs.List>
            
            <Tabs.Content value="account" className="tabs-content">
              <h3>개인 정보</h3>
              <p style={{ marginBottom: "16px" }}>계정의 기본 프로필 정보를 업데이트하세요.</p>
              <Textarea
                placeholder="간단한 자기소개를 작성해주세요." 
                minRows={2} 
                maxRows={4} 
              />
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                <Button label="변경 사항 저장" />
              </div>
            </Tabs.Content>

            <Tabs.Content value="password" className="tabs-content">
              <h3>로그인 및 보안</h3>
              <p style={{ marginBottom: "16px" }}>마지막 비밀번호 변경일: 최근 (2026.04.01)</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button label="비밀번호 변경" />
                <Button label="2단계 인증 로그아웃" style={{ background: "#ef4444" }} />
              </div>
            </Tabs.Content>

            <Tabs.Content value="billing" className="tabs-content">
              {/* Disabled tab contents normally won't be accessed, but strictly valid structure */}
              <h3>결제 수단 관리</h3>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </section>
    </main>
  );
}
