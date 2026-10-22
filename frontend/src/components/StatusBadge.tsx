import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  // Client statuses
  active: {
    label: 'Active',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  lead: {
    label: 'Lead',
    bg: 'bg-sky-500/10 border-sky-500/20',
    text: 'text-sky-400',
    dot: 'bg-sky-400',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-slate-500/10 border-slate-500/20',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
  },
  // Project statuses
  planning: {
    label: 'Planning',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    text: 'text-indigo-400',
    dot: 'bg-indigo-400',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  review: {
    label: 'Review',
    bg: 'bg-purple-500/10 border-purple-500/20',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  // Task priorities
  high: {
    label: 'High Priority',
    bg: 'bg-rose-500/10 border-rose-500/20',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
  },
  medium: {
    label: 'Medium Priority',
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  low: {
    label: 'Low Priority',
    bg: 'bg-slate-500/10 border-slate-500/20',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const normalized = status.toLowerCase();
  const config = statusConfig[normalized] || {
    label: status,
    bg: 'bg-slate-800 border-slate-700',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${sizeClasses} shadow-sm backdrop-blur-sm`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
