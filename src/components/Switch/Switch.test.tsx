import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SwitchRoot, SwitchThumb } from './Switch';

describe('Switch Component', () => {
  it('초기 상태가 올바르게 렌더링되는지 확인', () => {
    render(
      <SwitchRoot checked={false} onChange={() => {}}>
        <div className="switch-track">
          <SwitchThumb />
        </div>
      </SwitchRoot>
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('클릭 시 onChange 함수가 올바르게 호출되는지 확인', () => {
    const handleChange = vi.fn();
    
    render(
      <SwitchRoot checked={false} onChange={handleChange}>
        <div className="switch-track">
          <SwitchThumb />
        </div>
      </SwitchRoot>
    );

    const switchElement = screen.getByRole('switch');

    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });
});