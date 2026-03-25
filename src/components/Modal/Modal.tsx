import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import './Modal.css';

// 1. 컨텍스트 생성 (모달의 열림/닫힘 상태 공유)
interface ModalContextProps {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

// 2. 메인 Modal 컴포넌트 (열림 상태에 따라 렌더링 결정)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  
  // ESC 키를 눌렀을 때 모달을 닫는 기능
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null; // 열려있지 않으면 아무것도 렌더링하지 않음

  return (
    <ModalContext.Provider value={{ onClose }}>
      {/* 배경 클릭 시 닫기 */}
      <div className="modal-overlay" onClick={onClose}>
        {/* 콘텐츠 박스 클릭 시 닫히지 않도록 이벤트 전파 중지 */}
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

// 3. 서브 컴포넌트: ModalHeader (제목 영역)
interface ModalHeaderProps {
  children: ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children }) => {
  return (
    <div style={{ marginBottom: "16px", fontSize: "20px", fontWeight: "bold" }}>
      {children}
    </div>
  );
};

// 4. 서브 컴포넌트: ModalBody (본문 영역)
interface ModalBodyProps {
  children: ReactNode;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children }) => {
  return (
    <div style={{ marginBottom: "20px", fontSize: "16px", color: "#333", lineHeight: "1.5" }}>
      {children}
    </div>
  );
};

// 5. 서브 컴포넌트: ModalFooter (버튼 영역)
interface ModalFooterProps {
  children: ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
      {children}
    </div>
  );
};