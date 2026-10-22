import React from 'react';
import Link from 'next/link';
import { Plus, Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  actionButton,
}) => {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-3 w-3" />
            Live
          </span>
        </div>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actionButton && (
          actionButton.href ? (
            <Link
              href={actionButton.href}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {actionButton.label}
            </Link>
          ) : (
            <button
              onClick={actionButton.onClick}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {actionButton.label}
            </button>
          )
        )}
      </div>
    </header>
  );
};
