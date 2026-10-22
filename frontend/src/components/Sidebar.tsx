'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileCode2,
  LogOut,
  LogIn,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('Agency Admin');

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated());
    setUsername(api.getSavedUsername());
  }, [pathname]);

  const handleLogout = () => {
    api.clearTokens();
    setIsAuthenticated(false);
    router.push('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: FolderKanban,
    },
    {
      label: 'Clients',
      href: '/clients',
      icon: Users,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-64 flex-col border-r border-slate-800/80 bg-slate-900/95 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-base">AgencyFlow</h1>
          <p className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">
            B2B Studio Portal
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
              )}
            </Link>
          );
        })}

        <div className="pt-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Developer Tools
          </p>
          <a
            href="http://localhost:8000/api/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <FileCode2 className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300" />
              <span>Swagger API Docs</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* User Session Bar */}
      <div className="border-t border-slate-800/80 p-4">
        {isAuthenticated ? (
          <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-2.5 border border-slate-700/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-white">{username}</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-400">JWT Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
