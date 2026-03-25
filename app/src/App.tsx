import { useState } from "react";
import { Button, FRAME_UI_VERSION } from "FrameUI";
import { Switch } from "../../src/components/Switch/Switch"; 
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../src/components/Modal/Modal";

export function App() {
  const [count, setCount] = useState(0);
  const [isOn, setIsOn] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="page">
      <section className="card">
        <h1>FrameUI Demo</h1>
        <p>라이브러리 버전: {FRAME_UI_VERSION}</p>
        <p>버튼 클릭 수: {count}</p>
        
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <Button
            label="클릭해보기"
            onClick={() => setCount((value) => value + 1)}
          />
          <Button 
            label="모달 열기 (Open Modal)" 
            onClick={() => setIsModalOpen(true)} 
          />
        </div>

        {/* Switch */}
        <div className="divider" style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
           <p style={{ marginBottom: "10px" }}>
            스위치 상태: <strong>{isOn ? "켜짐 (ON)" : "꺼짐 (OFF)"}</strong>
          </p>
          <Switch 
            checked={isOn} 
            onChange={setIsOn} 
          />
        </div>

        {/* Modal
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>알림 (Notice)</ModalHeader>
          <ModalBody>
            <p>FrameUI에 새로운 모달 컴포넌트가 추가되었습니다!</p>
            <p>현재 스위치 상태는 <strong>{isOn ? "켜짐" : "꺼짐"}</strong> 입니다.</p>
          </ModalBody>
          <ModalFooter>
            <Button label="닫기" onClick={() => setIsModalOpen(false)} />
          </ModalFooter>
        </Modal> */}

      </section>
    </main>
  );
}