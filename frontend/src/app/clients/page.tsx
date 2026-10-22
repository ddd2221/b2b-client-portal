'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Building,
  Mail,
  FolderKanban,
  Calendar,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Client, ClientStatus } from '@/lib/types';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [submitting, setSubmitting] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await api.getClients(search, statusFilter);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !companyName || !email) return;
    setSubmitting(true);
    try {
      await api.createClient({
        name,
        company_name: companyName,
        email,
        status,
      });
      setIsModalOpen(false);
      setName('');
      setCompanyName('');
      setEmail('');
      await fetchClients();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating client');
    } finally {
      setSubmitting(false);
    }
  };

  const statuses = [
    { label: 'All Clients', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Leads', value: 'lead' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div>
      <Header
        title="Client Accounts"
        subtitle="Manage customer relationships, business partners, and associated project portfolios"
        actionButton={{
          label: 'Add Client',
          onClick: () => setIsModalOpen(true),
        }}
      />

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by contact, company, or email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

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

      {/* Clients Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Primary Contact</th>
                <th className="px-6 py-4">Contact Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Linked Projects</th>
                <th className="px-6 py-4">Partner Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                      <span>Loading client directory...</span>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No clients found matching the query.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Building className="h-4 w-4" />
                      </div>
                      <span>{c.company_name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        {c.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-300">
                        <FolderKanban className="h-3.5 w-3.5 text-indigo-400" />
                        {c.projects_count ?? 0} {c.projects_count === 1 ? 'project' : 'projects'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Client Partner"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Tech Solutions"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Contact Person *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Contact Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@acme.com"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Relationship Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
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
              {submitting ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
