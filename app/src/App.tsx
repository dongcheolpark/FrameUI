import { useState } from "react";
import { Button, Switch, FRAME_UI_VERSION } from "FrameUI";
import "./App.css";

export function App() {
  const [count, setCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

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
      </section>
    </main>
  );
}
