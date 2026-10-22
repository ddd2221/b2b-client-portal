'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Building,
  Mail,
  User,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Project, ProjectStatus, Task, TaskPriority } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task creation modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const fetchProjectDetail = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await api.getProject(projectId);
      setProject(data);
      setTasks(data.tasks || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load project details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [projectId]);

  const handleToggleTask = async (taskId: number) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
      )
    );

    try {
      const updated = await api.toggleTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error(err);
      // Revert if error
      fetchProjectDetail();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    setIsSubmittingTask(true);
    try {
      const newTask = await api.createTask({
        project: Number(projectId),
        title: taskTitle,
        priority: taskPriority,
        due_date: taskDueDate || null,
        is_completed: false,
      });
      setTasks((prev) => [newTask, ...prev]);
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDueDate('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating task');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    try {
      const updated = await api.updateProject(project.id, { status: newStatus });
      setProject((prev) => (prev ? { ...prev, status: updated.status } : null));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update project status');
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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-500" />
          <span>Loading project workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-400">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <h3 className="text-lg font-bold">Could not load project</h3>
        <p className="mt-1 text-sm">{error || 'Project not found'}</p>
        <Link
          href="/projects"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPercent =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div>
      {/* Navigation and Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* Change Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Project Overview Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
        
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <StatusBadge status={project.status} />
              <span className="text-xs font-mono text-slate-400">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {project.title}
            </h1>

            {project.description ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {project.description}
              </p>
            ) : (
              <p className="mt-2 text-xs italic text-slate-500">
                No description provided for this deliverable.
              </p>
            )}
          </div>

          {/* Quick Metrics Badge Container */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Contract Budget
              </span>
              <p className="mt-1 font-mono text-xl font-bold text-emerald-400">
                {formatCurrency(project.budget)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Target Deadline
              </span>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-400" />
                {project.deadline}
              </p>
            </div>
          </div>
        </div>

        {/* Client Detail Sub-bar */}
        <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-slate-800/80 pt-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-400" />
            <span className="text-white font-medium">
              {project.client_detail?.company_name || project.client_company}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <span>{project.client_detail?.name || project.client_name}</span>
          </div>
          {project.client_detail?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="font-mono">{project.client_detail.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Checklist Section */}
      <div className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Sprint Deliverables & Tasks</span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-mono text-slate-300">
                {completedCount}/{tasks.length}
              </span>
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Interactive task checklist synced with PostgreSQL database
            </p>
          </div>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Deliverable Task
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Overall Milestone Progress</span>
            <span className="font-mono font-semibold text-indigo-400">
              {progressPercent}% Completed
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center text-slate-400">
              <p className="text-sm">No tasks assigned to this project yet.</p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="mt-3 text-xs font-semibold text-indigo-400 hover:underline"
              >
                + Add your first task
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
                  task.is_completed
                    ? 'border-slate-800/60 bg-slate-900/40 opacity-75'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="shrink-0 transition-transform active:scale-90"
                    title={task.is_completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500 hover:text-indigo-400" />
                    )}
                  </button>

                  <div className="truncate">
                    <span
                      className={`text-sm font-medium ${
                        task.is_completed
                          ? 'line-through text-slate-500'
                          : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={task.priority} size="sm" />

                  {task.due_date && (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {task.due_date}
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="rounded-lg p-1 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Project Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Due Date
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingTask}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmittingTask ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
