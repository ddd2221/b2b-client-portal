'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Trash2,
  Calendar,
  CheckCircle2,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Client, Project } from '@/lib/types';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newBudget, setNewBudget] = useState('35000');
  const [newDeadline, setNewDeadline] = useState('');
  const [newStatus, setNewStatus] = useState('in_progress');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects({
        search,
        status: statusFilter,
      });
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const clientsData = await api.getClients();
      setClients(clientsData);
      if (clientsData.length > 0 && !newClientId) {
        setNewClientId(String(clientsData[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClientId) return;
    setSubmitting(true);
    try {
      await api.createProject({
        title: newTitle,
        description: newDesc,
        client: Number(newClientId),
        budget: newBudget,
        status: newStatus as any,
        deadline: newDeadline || new Date().toISOString().split('T')[0],
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      await fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
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

  const statuses = [
    { label: 'All Projects', value: '' },
    { label: 'Planning', value: 'planning' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Review', value: 'review' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div>
      <Header
        title="Agency Projects"
        subtitle="Full visibility over all client deliverables, contracts, and deadlines"
        actionButton={{
          label: 'New Project',
          onClick: () => setIsModalOpen(true),
        }}
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title or client name..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          {statuses.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === tab.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span>Loading projects...</span>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
          <Briefcase className="h-10 w-10 text-slate-500 mb-3" />
          <h3 className="text-base font-semibold text-white">No projects found</h3>
          <p className="mt-1 text-sm text-slate-400">
            Try adjusting your search criteria or create a brand new client project.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => {
            const taskTotal = proj.tasks_count || 0;
            const taskDone = proj.completed_tasks_count || 0;
            const progressPct = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/30 hover:shadow-indigo-500/5 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      {proj.client_company || proj.client_name}
                    </span>
                    <StatusBadge status={proj.status} size="sm" />
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    <Link href={`/projects/${proj.id}`}>{proj.title}</Link>
                  </h3>

                  {proj.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                      {proj.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-slate-800/80 pt-4 space-y-3">
                  {/* Task Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                        Tasks Progress
                      </span>
                      <span className="font-mono text-slate-300">
                        {taskDone}/{taskTotal} ({progressPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget & Deadline */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Budget</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(proj.budget)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px] uppercase">Deadline</span>
                      <span className="font-mono text-slate-300 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {proj.deadline}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                    <button
                      onClick={() => handleDeleteProject(proj.id, proj.title)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/projects/${proj.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>Open Workspace</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. NextGen Microservices Architecture"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Client *
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

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Project goals, stack, deliverables..."
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Budget (USD) *
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
                Initial Status *
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
              Deadline Date *
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
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
