
interface StatusBadgeProps {
  status: 'success' | 'danger' | 'warning' | 'info';
  label: string;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    danger: 'bg-red-50 text-red-700 border-red-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    info: 'bg-blue-50 text-blue-700 border-blue-200/60',
  };

  const dotStyles = {
    success: 'bg-emerald-500',
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold tracking-wide uppercase select-none ${styles[status]} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles[status]}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles[status]}`}></span>
      </span>
      {label}
    </span>
  );
}

export default StatusBadge;
