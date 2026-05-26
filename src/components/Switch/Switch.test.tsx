import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

afterEach(() => {
  cleanup();
});

describe('Switch Component', () => {
  it('초기 상태가 올바르게 렌더링되는지 확인', () => {
    render(
      <Switch checked={false} onChange={() => {}} />
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('클릭 시 onChange 함수가 올바르게 호출되는지 확인', () => {
    const handleChange = vi.fn();
    
    render(<Switch checked={false} onChange={handleChange} />);

    const switchElement = screen.getByRole('switch');

    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });
});