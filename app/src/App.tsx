import { useState } from "react";
import { Button, FRAME_UI_VERSION } from "FrameUI";
import { Switch } from "../../src/components/Switch/Switch"; 
import { CheckboxCard } from "../../src/components/CheckboxCard/CheckboxCard";

export function App() {
  const [count, setCount] = useState(0);
  const [isOn, setIsOn] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <main className="page">
      <section className="card">
        <h1>FrameUI Demo</h1>
        <p>라이브러리 버전: {FRAME_UI_VERSION}</p>
        <p>버튼 클릭 수: {count}</p>
        
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginTop: '20px' }}>
          <Button
            label="클릭해보기"
            onClick={() => setCount((value) => value + 1)}
          />
        </div>

        {/* Checkbox Card Section */}
        <div className="divider" style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <p style={{ marginBottom: "15px", fontWeight: "bold" }}>플랜 선택 (Checkbox Cards):</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <CheckboxCard
              title="기본 플랜 (Basic)"
              description="개인 프로젝트를 위한 핵심 기능 제공"
              isSelected={selectedPlan === 'basic'}
              onSelect={() => setSelectedPlan('basic')}
            />
            <CheckboxCard
              title="프로 플랜 (Pro)"
              description="고급 기능 및 우선 순위 지원 포함"
              isSelected={selectedPlan === 'pro'}
              onSelect={() => setSelectedPlan('pro')}
            />
          </div>
        </div>

        {/* Switch Section */}
        <div className="divider" style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
           <p style={{ marginBottom: "10px" }}>
            알림 상태: <strong>{isOn ? "켜짐 (ON)" : "꺼짐 (OFF)"}</strong>
          </p>
          <Switch 
            checked={isOn} 
            onChange={setIsOn} 
          />
        </div>

      </section>
    </main>
  );
}