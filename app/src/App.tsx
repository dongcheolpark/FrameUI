import { useState } from "react";
import { Button, FRAME_UI_VERSION } from "FrameUI";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="page">
      <section className="card">
        <h1>FrameUI Demo</h1>
        <p>라이브러리 버전: {FRAME_UI_VERSION}</p>
        <p>버튼 클릭 수: {count}</p>

        <Button
          label="클릭해보기"
          onClick={() => setCount((value) => value + 1)}
        />
      </section>
    </main>
  );
}
