import React from 'react';
import './Switch.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  return (
    <div 
      className={`switch-track ${checked ? 'is-checked' : ''}`} 
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <div className="switch-thumb" />
    </div>
  );
};