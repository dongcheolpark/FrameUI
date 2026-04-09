import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckboxCard } from './CheckboxCard';

describe('CheckboxCard 컴포넌트', () => {
  it('제목과 설명이 올바르게 렌더링되는지 확인', () => {
    // Гарчиг болон тайлбар зөв харагдаж байгааг шалгах
    render(
      <CheckboxCard 
        title="테스트 제목" 
        description="테스트 설명입니다." 
        isSelected={false} 
        onSelect={() => {}} 
      />
    );

    expect(screen.getByText('테스트 제목')).toBeDefined();
    expect(screen.getByText('테스트 설명입니다.')).toBeDefined();
  });

  it('isSelected가 true일 때 선택된 스타일(class)이 적용되는지 확인', () => {
    // Сонгогдсон үед 'is-selected' класс нэмэгдсэн эсэхийг шалгах
    const { container } = render(
      <CheckboxCard 
        title="카드" 
        isSelected={true} 
        onSelect={() => {}} 
      />
    );

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.classList.contains('is-selected')).toBe(true);
    expect(cardElement).toHaveAttribute('aria-checked', 'true');
  });

  it('카드를 클릭했을 때 onSelect 함수가 올바르게 호출되는지 확인', () => {
    // Картыг дарахад onSelect функц зөв утгатай дуудагдаж байгааг шалгах
    const handleSelect = vi.fn();
    render(
      <CheckboxCard 
        title="클릭 테스트" 
        isSelected={false} 
        onSelect={handleSelect} 
      />
    );

    const card = screen.getByRole('checkbox');
    fireEvent.click(card);

    // false байсан тул true утгатай дуудагдах ёстой
    expect(handleSelect).toHaveBeenCalledWith(true);
  });

  it('이미 선택된 카드를 클릭하면 false를 반환하는지 확인', () => {
    // Аль хэдийн сонгогдсон картыг дарахад false утга дамжуулж байгааг шалгах
    const handleSelect = vi.fn();
    render(
      <CheckboxCard 
        title="취소 테스트" 
        isSelected={true} 
        onSelect={handleSelect} 
      />
    );

    const card = screen.getByRole('checkbox');
    fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledWith(false);
  });
});