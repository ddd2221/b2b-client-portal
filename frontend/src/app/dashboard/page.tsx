'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  DollarSign,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Client, DashboardStats } from '@/lib/types';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newBudget, setNewBudget] = useState('25000');
  const [newDeadline, setNewDeadline] = useState('');
  const [newStatus, setNewStatus] = useState('in_progress');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, clientsData] = await Promise.all([
        api.getDashboardStats(),
        api.getClients(),
      ]);
      setStats(statsData);
      setClients(clientsData);
      if (clientsData.length > 0 && !newClientId) {
        setNewClientId(String(clientsData[0].id));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch dashboard metrics');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId || !newTitle) return;
    setIsSubmitting(true);
    try {
      await api.createProject({
        title: newTitle,
        client: Number(newClientId),
        budget: newBudget,
        status: newStatus as any,
        deadline: newDeadline || new Date().toISOString().split('T')[0],
      });
      setIsModalOpen(false);
      setNewTitle('');
      await fetchDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number | string | undefined) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div>
      <Header
        title="Agency Overview"
        subtitle="Real-time studio health, pipeline analytics, and active client projects"
        actionButton={{
          label: 'New Project',
          onClick: () => setIsModalOpen(true),
        }}
      />

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
          <span>{error}</span>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1 font-medium hover:bg-rose-500/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={loading ? '...' : stats?.total_clients ?? 0}
          subtitle="Managed business partners"
          icon={Users}
          variant="indigo"
        />
        <StatCard
          title="Active Projects"
          value={loading ? '...' : stats?.active_projects ?? 0}
          subtitle={`Out of ${stats?.total_projects ?? 0} total engagements`}
          icon={Briefcase}
          variant="amber"
        />
        <StatCard
          title="Active Pipeline Budget"
          value={loading ? '...' : formatCurrency(stats?.total_active_budget)}
          subtitle="Total value of in-flight deliverables"
          icon={DollarSign}
          variant="emerald"
        />
        <StatCard
          title="Task Completion Rate"
          value={loading ? '...' : `${stats?.task_completion_rate ?? 0}%`}
          subtitle={`${stats?.completed_tasks ?? 0} / ${stats?.total_tasks ?? 0} tasks done`}
          icon={CheckCircle2}
          variant="purple"
        />
      </div>

      {/* Recent Projects Table */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Recent Client Projects</h2>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              Latest 5
            </span>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Projects</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Project Scope</th>
                <th className="px-6 py-3.5">Client & Company</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Budget</th>
                <th className="px-6 py-3.5">Deadline</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                      <span>Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : stats?.recent_projects && stats.recent_projects.length > 0 ? (
                stats.recent_projects.map((proj) => (
                  <tr
                    key={proj.id}
                    className="group hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <Link
                        href={`/projects/${proj.id}`}
                        className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{proj.title}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-200">
                        {proj.client_company || proj.client_name}
                      </div>
                      <div className="text-xs text-slate-500">{proj.client_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={proj.status} />
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-emerald-400">
                      {formatCurrency(proj.budget)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {proj.deadline}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/projects/${proj.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-600/10 hover:text-indigo-300 transition-all"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No projects found. Create one using the button above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Client Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Project Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. AI-Powered Workflow Automations"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Client
            </label>
            <select
              value={newClientId}
              onChange={(e) => setNewClientId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Budget (USD)
              </label>
              <input
                type="number"
                required
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Deadline Date
            </label>
            <input
              type="date"
              required
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
