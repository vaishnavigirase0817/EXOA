import React from 'react';

interface FloatingActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  pulse?: boolean;
  variant?: 'primary' | 'danger' | 'secondary';
}

export function FloatingAction({
  children,
  active = false,
  pulse = false,
  variant = 'secondary',
  className = '',
  ...props
}: FloatingActionProps) {
  const baseStyle = 'relative flex items-center justify-center rounded-full shadow-lg cursor-pointer transition-all duration-300 w-12 h-12 border focus:outline-none select-none';
  
  const variants = {
    primary: 'bg-blue-600 border-blue-500 hover:bg-blue-700 text-white hover:shadow-blue-500/20',
    danger: 'bg-red-500 border-red-400 hover:bg-red-600 text-white hover:shadow-red-500/20',
    secondary: 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700 hover:border-slate-300',
  };

  const activeStyle = active ? 'scale-95 ring-2 ring-blue-500/30' : '';

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${activeStyle} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="absolute inset-0 rounded-full animate-ping bg-current opacity-20 pointer-events-none" />
      )}
      <span className="z-10">{children}</span>
    </button>
  );
}

export default FloatingAction;
