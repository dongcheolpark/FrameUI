import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

describe('Modal 컴포넌트', () => {
  it('isOpen이 true일 때 모달이 올바르게 표시되는지 확인', () => {
    // Модал нээлттэй үед зөв харагдаж байгааг шалгах
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <ModalHeader>테스트 제목</ModalHeader>
        <ModalBody>테스트 내용입니다.</ModalBody>
      </Modal>
    );

    // 제목이 화면에 있는지 확인
    expect(screen.getByText('테스트 제목')).toBeDefined();
    // 내용이 화면에 있는지 확인
    expect(screen.getByText('테스트 내용입니다.')).toBeDefined();
  });

  it('isOpen이 false일 때 모달이 렌더링되지 않는지 확인', () => {
    // Модал хаалттай үед харагдахгүй байх ёстойг шалгах
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <ModalHeader>숨겨진 제목</ModalHeader>
      </Modal>
    );

    // 화면에 제목이 없어야 함
    const header = screen.queryByText('숨겨진 제목');
    expect(header).toBeNull();
  });

  it('배경(Overlay) 클릭 시 onClose 함수가 호출되는지 확인', () => {
    // Арын бүрхүүл дээр дарахад хаагдаж байгааг шалгах
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <ModalBody>콘텐츠</ModalBody>
      </Modal>
    );

    // 모달 배경(role="dialog"의 부모 div) 클릭
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('ESC 키를 눌렀을 때 모달이 닫히는지 확인', () => {
    // ESC товчлуур дарахад хаагдаж байгааг шалгах
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <ModalBody>콘텐츠</ModalBody>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });
});