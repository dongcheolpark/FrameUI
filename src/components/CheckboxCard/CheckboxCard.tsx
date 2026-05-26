import React from 'react';
import './CheckboxCard.css';

interface CheckboxCardProps {
  title: string;
  description?: string;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

export const CheckboxCard: React.FC<CheckboxCardProps> = ({
  title,
  description,
  isSelected,
  onSelect,
}) => {
  return (
    <div 
      className={`checkbox-card ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelect(!isSelected)}
      role="checkbox"
      aria-checked={isSelected}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        border: `2px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
        backgroundColor: isSelected ? '#3b82f6' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px'
      }}>
        {isSelected ? '✓' : ''}
      </div>

      <div className="checkbox-card-content">
        <div className="checkbox-card-title">{title}</div>
        {description && <div className="checkbox-card-description">{description}</div>}
      </div>
    </div>
  );
};