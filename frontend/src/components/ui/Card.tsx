import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  glow = false,
  hoverable = true,
  className = '',
  ...props
}: CardProps) {
  const baseCard = glow ? 'glass-card-glow' : 'glass-card';
  const hoverStyle = hoverable ? '' : 'hover:border-slate-200/80 hover:shadow-sm';

  return (
    <div
      className={`${baseCard} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
