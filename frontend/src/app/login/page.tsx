'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Lock, User, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await api.login(username, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-600/30">
              <Layers className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
              Welcome to AgencyFlow
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Sign in with your JWT credentials to access your agency workspace
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Username
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or demo"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 border-t border-slate-800/80 pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
              <span>Instant Recruiter Demo Credentials</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillCredentials('admin', 'admin123')}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-left text-xs transition-colors hover:border-indigo-500/50 hover:bg-slate-800"
              >
                <div className="font-semibold text-indigo-300">Admin Account</div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-400">admin / admin123</div>
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('demo', 'demo123')}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-left text-xs transition-colors hover:border-indigo-500/50 hover:bg-slate-800"
              >
                <div className="font-semibold text-emerald-300">Member Demo</div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-400">demo / demo123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
