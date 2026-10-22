import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'indigo' | 'emerald' | 'amber' | 'purple';
}

const variantStyles = {
  indigo: {
    border: 'border-indigo-500/20 hover:border-indigo-500/40',
    bg: 'from-indigo-950/30 to-slate-900/60',
    iconBg: 'bg-indigo-500/10 text-indigo-400',
    glow: 'group-hover:bg-indigo-500/10',
  },
  emerald: {
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    bg: 'from-emerald-950/30 to-slate-900/60',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    glow: 'group-hover:bg-emerald-500/10',
  },
  amber: {
    border: 'border-amber-500/20 hover:border-amber-500/40',
    bg: 'from-amber-950/30 to-slate-900/60',
    iconBg: 'bg-amber-500/10 text-amber-400',
    glow: 'group-hover:bg-amber-500/10',
  },
  purple: {
    border: 'border-purple-500/20 hover:border-purple-500/40',
    bg: 'from-purple-950/30 to-slate-900/60',
    iconBg: 'bg-purple-500/10 text-purple-400',
    glow: 'group-hover:bg-purple-500/10',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'indigo',
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${styles.bg} ${styles.border} p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1`}
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${styles.glow}`}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className={`rounded-xl p-2.5 ${styles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
