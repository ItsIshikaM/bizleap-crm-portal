import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  LogOut,
  Users,
  UserPlus,
  PhoneCall,
  CheckCircle,
  CalendarClock,
  PieChart,
  Download,
  Menu,
  X,
  MapPin,
  Building2,
  Mail,
  Phone,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import LeadFormModal from '../components/LeadFormModal';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/leads`;
const statusStyles = {
  New: 'bg-indigo-50 text-[#1908A6] border-indigo-200',
  Contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  Interested: 'bg-purple-50 text-purple-700 border-purple-200',
  Converted: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Lost: 'bg-rose-50 text-rose-500 border-rose-200',
};

const followUpBadgeStyles = {
  Overdue: 'bg-rose-50 text-rose-600 border-rose-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

function getFollowUpState(lead) {
  if (lead.followUpCompleted) return 'Completed';
  if (!lead.followUpDate) return 'None';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(lead.followUpDate);
  due.setHours(0, 0, 0, 0);

  return due < today ? 'Overdue' : 'Pending';
}

export default function Dashboard({ token, setToken }) {
  const [leads, setLeads] = useState([]);
  const [activeNav, setActiveNav] = useState('pipeline');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [modalError, setModalError] = useState('');
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem('user') || '{"name":"Jane Doe","email":"jane.doe@company.com"}'
  );
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchLeads = async () => {
    try {
      const { data } = await axios.get(API_URL, authHeader);
      setLeads(data);
    } catch (error) {
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, statusFilter, sourceFilter]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
  };

  const handleSaveLead = async (formData) => {
    setModalError('');
    try {
      if (editingLead) {
        await axios.put(`${API_URL}/${editingLead._id}`, formData, authHeader);
      } else {
        await axios.post(API_URL, formData, authHeader);
      }
      setIsModalOpen(false);
      setEditingLead(null);
      fetchLeads();
    } catch (error) {
      const rawMsg = error.response?.data?.message || 'Error saving lead';
      const cleanMsg = rawMsg.replace(/^Validation failed:\s*\w+:\s*/i, '');
      setModalError(cleanMsg);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { leadStatus: newStatus }, authHeader);
      fetchLeads();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleCompleteFollowUp = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { followUpCompleted: true }, authHeader);
      fetchLeads();
    } catch (error) {
      alert('Failed to mark follow-up as completed');
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm('Delete this lead permanently?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, authHeader);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      fetchLeads();
    } catch (error) {
      alert('Failed to delete lead');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected lead(s)?`)) return;
    try {
      await axios.post(`${API_URL}/bulk-delete`, { ids: selectedIds }, authHeader);
      setSelectedIds([]);
      fetchLeads();
    } catch (error) {
      alert('Failed to delete selected leads');
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l._id));
    }
  };

  const resetAllFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setSourceFilter('All');
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const headers = [
      'Full Name,Company,Industry,Location,Email,Country Code,Phone Number,Source,Status,Follow-Up Date,Follow-Up Status,Notes,Created Date',
    ];
    const rows = filteredLeads.map((l) => {
      const fState = getFollowUpState(l);
      const safeNotes = (l.notes || '').replace(/"/g, '""');
      const fDate = l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : '';
      const cDate = new Date(l.createdDate).toLocaleDateString();
      return `"${l.fullName}","${l.companyName}","${l.industry || ''}","${
        l.location || 'Not specified'
      }","${l.email}","${l.countryCode || '+91'}","${l.phone}","${l.leadSource}","${
        l.leadStatus
      }","${fDate}","${fState}","${safeNotes}","${cDate}"`;
    });
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bizleap-crm-leads.csv';
    a.click();
  };

  const getInitials = (name) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const filteredLeads = leads.filter((lead) => {
    const q = search.toLowerCase();
    const fullPhone = `${lead.countryCode || '+91'} ${lead.phone}`.toLowerCase();
    const matchesSearch =
      lead.fullName.toLowerCase().includes(q) ||
      lead.companyName.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      fullPhone.includes(q) ||
      (lead.industry || '').toLowerCase().includes(q) ||
      (lead.location || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || lead.leadStatus === statusFilter;
    const matchesSource = sourceFilter === 'All' || lead.leadSource === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const hasActiveFilters = search !== '' || statusFilter !== 'All' || sourceFilter !== 'All';

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.leadStatus === 'New').length;
  const contactedLeads = leads.filter((l) => l.leadStatus === 'Contacted').length;
  const interestedLeads = leads.filter((l) => l.leadStatus === 'Interested').length;
  const convertedLeads = leads.filter((l) => l.leadStatus === 'Converted').length;
  const lostLeads = leads.filter((l) => l.leadStatus === 'Lost').length;

  const engagedCount = contactedLeads + interestedLeads + convertedLeads;
  const qualifiedCount = interestedLeads + convertedLeads;

  const activeFollowUpLeads = leads
    .filter((l) => l.leadStatus !== 'Lost' && l.leadStatus !== 'Converted' && !l.followUpCompleted)
    .sort((a, b) => {
      if (!a.followUpDate) return 1;
      if (!b.followUpDate) return -1;
      return new Date(a.followUpDate) - new Date(b.followUpDate);
    });

  const completedFollowUpLeads = leads.filter(
    (l) => l.followUpCompleted && l.leadStatus !== 'Lost'
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-5">
      <div>
        <div className="flex items-center justify-between px-3 pt-1 pb-7">
          <span className="text-2xl font-extrabold tracking-tight text-[#1908A6]">
            BizLeap<span className="text-indigo-400">.</span>
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Workspace
        </p>
        <nav className="space-y-1.5">
          <button
            onClick={() => {
              setActiveNav('pipeline');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm transition cursor-pointer ${
              activeNav === 'pipeline'
                ? 'font-semibold bg-[#1908A6] text-white shadow-md shadow-indigo-900/15'
                : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-indigo-50/70'
            }`}
          >
            <span className="flex items-center gap-3">
              <Users size={18} />
              <span>Leads & Pipeline</span>
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeNav === 'pipeline'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {totalLeads}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('followups');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm transition cursor-pointer ${
              activeNav === 'followups'
                ? 'font-semibold bg-[#1908A6] text-white shadow-md shadow-indigo-900/15'
                : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-indigo-50/70'
            }`}
          >
            <span className="flex items-center gap-3">
              <CalendarClock size={18} />
              <span>Follow-Up Queue</span>
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeNav === 'followups'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {activeFollowUpLeads.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('analytics');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition cursor-pointer ${
              activeNav === 'analytics'
                ? 'font-semibold bg-[#1908A6] text-white shadow-md shadow-indigo-900/15'
                : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-indigo-50/70'
            }`}
          >
            <PieChart size={18} />
            <span>Conversion Insights</span>
          </button>
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200/80 space-y-3">
        <div className="px-3 py-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1908A6] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {getInitials(user.name || 'JD')}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200/80 transition cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flow-canvas text-slate-900">
      <aside className="hidden lg:block w-64 flow-sidebar border-r border-slate-200/70 shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden px-4 py-3 flex items-center justify-between border-b border-slate-200/70 bg-white">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-xl font-extrabold tracking-tight text-[#1908A6]">
              BizLeap<span className="text-indigo-400">.</span>
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {activeNav === 'pipeline' && 'Leads & CRM Pipeline'}
                {activeNav === 'followups' && 'Follow-Up Queue'}
                {activeNav === 'analytics' && 'Conversion Insights'}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {activeNav === 'pipeline' &&
                  'Manage potential customers, company profiles, and conversion stages'}
                {activeNav === 'followups' &&
                  'Active prospects requiring outreach or scheduled follow-ups'}
                {activeNav === 'analytics' &&
                  'Sales conversion funnel and lead acquisition channel performance'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-2xs transition cursor-pointer"
              >
                <Download size={15} />
                <span>Export</span>
              </button>

              <button
                onClick={() => {
                  setEditingLead(null);
                  setModalError('');
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1908A6] hover:bg-[#130682] text-white rounded-full text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Lead</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Leads"
              count={totalLeads}
              badge="All Records"
              badgeStyle="bg-indigo-100 text-[#1908A6]"
              icon={<Users className="text-[#1908A6]" size={18} />}
              featured
            />
            <StatCard
              title="New Leads"
              count={newLeads}
              badge="Uncontacted"
              badgeStyle="bg-sky-50 text-sky-600"
              icon={<UserPlus className="text-[#1908A6]" size={18} />}
            />
            <StatCard
              title="Contacted Leads"
              count={contactedLeads}
              badge="In Discussion"
              badgeStyle="bg-amber-50 text-amber-700"
              icon={<PhoneCall className="text-[#1908A6]" size={18} />}
            />
            <StatCard
              title="Converted Leads"
              count={convertedLeads}
              badge={`${totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0}% Rate`}
              badgeStyle="bg-emerald-50 text-emerald-600"
              icon={<CheckCircle className="text-[#1908A6]" size={18} />}
            />
          </div>

          {activeNav === 'pipeline' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.03)] p-4 sm:p-6">
              <div className="flex flex-col gap-4 pb-4 mb-3 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-2.5 text-[#1908A6]" size={17} />
                    <input
                      type="text"
                      placeholder="Search leads by name, company, email, phone, or city..."
                      className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300/90 focus:border-[#1908A6] focus:ring-2 focus:ring-indigo-100 rounded-full text-sm text-slate-800 placeholder-slate-400 outline-none transition"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Clear search"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <select
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300/80 rounded-full text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1908A6] cursor-pointer transition"
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                    >
                      <option value="All">Source: All</option>
                      <option value="Website">Source: Website</option>
                      <option value="LinkedIn">Source: LinkedIn</option>
                      <option value="Referral">Source: Referral</option>
                      <option value="Cold Call">Source: Cold Call</option>
                      <option value="Other">Source: Other</option>
                    </select>

                    {hasActiveFilters && (
                      <button
                        onClick={resetAllFilters}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-[#1908A6] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}

                    {selectedIds.length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-full shadow-xs transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Delete ({selectedIds.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex flex-wrap bg-slate-100/80 p-1 rounded-2xl sm:rounded-full gap-1">
                    {['All', 'New', 'Contacted', 'Interested', 'Converted', 'Lost'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                          statusFilter === tab
                            ? 'bg-[#1908A6] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-500">
                    Showing <strong className="text-slate-800">{filteredLeads.length}</strong> of{' '}
                    <strong className="text-slate-800">{totalLeads}</strong> leads
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-400 text-sm">Loading leads...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <p>No matching leads found.</p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      className="mt-2 text-[#1908A6] font-semibold hover:underline cursor-pointer"
                    >
                      Clear active filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 text-xs font-semibold text-slate-500">
                          <th className="py-3.5 px-3 w-10">
                            <input
                              type="checkbox"
                              checked={
                                filteredLeads.length > 0 &&
                                selectedIds.length === filteredLeads.length
                              }
                              onChange={toggleSelectAll}
                              className="rounded border-slate-300 text-[#1908A6] focus:ring-[#1908A6] cursor-pointer"
                            />
                          </th>
                          <th className="py-3.5 px-3">Lead & Email</th>
                          <th className="py-3.5 px-3">Phone Number</th>
                          <th className="py-3.5 px-3">Company & Location</th>
                          <th className="py-3.5 px-3">Source</th>
                          <th className="py-3.5 px-3">Status</th>
                          <th className="py-3.5 px-3">Follow-Up Details</th>
                          <th className="py-3.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredLeads.map((lead) => {
                          const isSelected = selectedIds.includes(lead._id);
                          const fState = getFollowUpState(lead);
                          return (
                            <tr
                              key={lead._id}
                              className={`group transition-all duration-150 ${
                                isSelected
                                  ? 'bg-indigo-50/90 border-l-4 border-l-[#1908A6]'
                                  : 'hover:bg-indigo-50/45 border-l-4 border-l-transparent hover:border-l-[#1908A6]/60'
                              }`}
                            >
                              <td className="py-3.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectRow(lead._id)}
                                  className="rounded border-slate-300 text-[#1908A6] focus:ring-[#1908A6] cursor-pointer"
                                />
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-indigo-50 group-hover:bg-[#1908A6] border border-indigo-100 text-[#1908A6] group-hover:text-white font-bold text-xs flex items-center justify-center shrink-0 transition-colors">
                                    {getInitials(lead.fullName)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900 group-hover:text-[#1908A6] transition-colors">
                                      {lead.fullName}
                                    </div>
                                    <div className="text-xs text-slate-500">{lead.email}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 group-hover:bg-white border border-slate-200/70 font-mono font-semibold text-slate-700 transition-colors">
                                    {lead.countryCode || '+91'}
                                  </span>
                                  <span>{lead.phone}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="font-medium text-slate-800">{lead.companyName}</div>
                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-white text-slate-600 transition-colors">
                                    {lead.industry || 'SaaS / IT'}
                                  </span>
                                  <span className="flex items-center gap-0.5 text-slate-400">
                                    <MapPin size={11} />
                                    {lead.location?.trim()
                                      ? lead.location
                                      : 'Location not specified'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-3 text-slate-600 text-xs font-medium">
                                {lead.leadSource}
                              </td>

                              <td className="py-3.5 px-3">
                                <select
                                  value={lead.leadStatus}
                                  onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none ${statusStyles[lead.leadStatus]}`}
                                >
                                  <option value="New">New</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Interested">Interested</option>
                                  <option value="Converted">Converted</option>
                                  <option value="Lost">Lost</option>
                                </select>
                              </td>

                              <td className="py-3.5 px-3 text-xs space-y-1">
                                {fState !== 'None' ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-slate-800">
                                      {lead.followUpDate
                                        ? new Date(lead.followUpDate).toLocaleDateString()
                                        : 'Completed'}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${followUpBadgeStyles[fState]}`}
                                    >
                                      {fState}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-slate-400">No follow-up scheduled</div>
                                )}

                                {lead.notes && (
                                  <div
                                    className="text-slate-500 italic truncate max-w-[180px]"
                                    title={lead.notes}
                                  >
                                    {lead.notes}
                                  </div>
                                )}

                                <div className="text-[11px] text-slate-400">
                                  Added: {new Date(lead.createdDate).toLocaleDateString()}
                                </div>
                              </td>

                              <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  {fState !== 'Completed' &&
                                    fState !== 'None' &&
                                    lead.leadStatus !== 'Lost' && (
                                      <button
                                        onClick={() => handleCompleteFollowUp(lead._id)}
                                        className="p-2 rounded-full bg-emerald-50/70 text-emerald-600 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                                        title="Mark Follow-Up Completed"
                                      >
                                        <CheckCircle2 size={15} />
                                      </button>
                                    )}
                                  <button
                                    onClick={() => {
                                      setEditingLead(lead);
                                      setModalError('');
                                      setIsModalOpen(true);
                                    }}
                                    className="p-2 rounded-full bg-slate-100/80 group-hover:bg-indigo-100 text-slate-600 group-hover:text-[#1908A6] hover:bg-[#1908A6] hover:text-white transition cursor-pointer"
                                    title="Edit Lead"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSingle(lead._id)}
                                    className="p-2 rounded-full bg-slate-100/80 group-hover:bg-rose-50 text-slate-600 group-hover:text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                                    title="Delete Lead"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE RESPONSIVE CARD LAYOUT */}
                  <div className="grid grid-cols-1 gap-3.5 md:hidden mt-3">
                    {filteredLeads.map((lead) => {
                      const isSelected = selectedIds.includes(lead._id);
                      const fState = getFollowUpState(lead);
                      return (
                        <div
                          key={lead._id}
                          className={`p-4 rounded-2xl border transition ${
                            isSelected
                              ? 'bg-indigo-50/70 border-[#1908A6]'
                              : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectRow(lead._id)}
                                className="rounded border-slate-300 text-[#1908A6] cursor-pointer"
                              />
                              <div className="w-9 h-9 rounded-full bg-indigo-50 text-[#1908A6] font-bold text-xs flex items-center justify-center shrink-0">
                                {getInitials(lead.fullName)}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm">{lead.fullName}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Building2 size={12} /> {lead.companyName}
                                </p>
                              </div>
                            </div>

                            <select
                              value={lead.leadStatus}
                              onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyles[lead.leadStatus]}`}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Interested">Interested</option>
                              <option value="Converted">Converted</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <Mail size={13} className="text-slate-400" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={13} className="text-slate-400" />
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-semibold">
                                {lead.countryCode || '+91'}
                              </span>
                              <span>{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={13} className="text-slate-400" />
                              <span>
                                {lead.location?.trim() ? lead.location : 'Location not specified'} -{' '}
                                {lead.industry || 'SaaS / IT'}
                              </span>
                            </div>
                            {fState !== 'None' && (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="font-medium text-slate-700">
                                  Follow-up:{' '}
                                  {lead.followUpDate
                                    ? new Date(lead.followUpDate).toLocaleDateString()
                                    : ''}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${followUpBadgeStyles[fState]}`}
                                >
                                  {fState}
                                </span>
                              </div>
                            )}
                            {lead.notes && <p className="text-slate-500 italic">{lead.notes}</p>}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              Source: <strong className="text-slate-600">{lead.leadSource}</strong>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingLead(lead);
                                  setModalError('');
                                  setIsModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-full bg-indigo-50 text-[#1908A6] text-xs font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSingle(lead._id)}
                                className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* VIEW 2: FOLLOW-UP QUEUE */}
          {activeNav === 'followups' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-4">
                  Pending & Overdue Follow-Ups ({activeFollowUpLeads.length})
                </h2>

                {activeFollowUpLeads.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">
                    All active leads are caught up! No pending follow-ups.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeFollowUpLeads.map((lead) => {
                      const fState = getFollowUpState(lead);
                      return (
                        <div
                          key={lead._id}
                          className="p-5 rounded-2xl border border-slate-200 hover:border-[#1908A6]/50 hover:bg-indigo-50/20 hover:shadow-md transition flex flex-col justify-between bg-white"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="font-bold text-slate-900">{lead.fullName}</h3>
                                <p className="text-xs text-slate-500">
                                  {lead.companyName} -{' '}
                                  {lead.location?.trim() ? lead.location : 'Location not specified'}
                                </p>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[lead.leadStatus]}`}
                              >
                                {lead.leadStatus}
                              </span>
                            </div>

                            <div className="mt-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span>
                                  <strong>Follow-Up Date:</strong>{' '}
                                  {lead.followUpDate
                                    ? new Date(lead.followUpDate).toLocaleDateString()
                                    : 'Not scheduled'}
                                </span>
                                {fState !== 'None' && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${followUpBadgeStyles[fState]}`}
                                  >
                                    {fState}
                                  </span>
                                )}
                              </div>
                              {lead.notes && (
                                <div>
                                  <strong>Note:</strong> {lead.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center gap-2">
                            <span className="text-xs text-slate-500">
                              <strong className="font-mono text-slate-700">
                                {lead.countryCode || '+91'}
                              </strong>{' '}
                              {lead.phone}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCompleteFollowUp(lead._id)}
                                className="px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-semibold transition cursor-pointer"
                              >
                                Mark Done
                              </button>
                              <button
                                onClick={() => {
                                  setEditingLead(lead);
                                  setModalError('');
                                  setIsModalOpen(true);
                                }}
                                className="text-xs font-semibold text-[#1908A6] hover:underline cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {completedFollowUpLeads.length > 0 && (
                <div className="bg-white/90 rounded-3xl border border-slate-200/80 p-6">
                  <h2 className="text-sm font-bold text-slate-600 mb-3">
                    Completed Follow-Ups ({completedFollowUpLeads.length})
                  </h2>
                  <div className="divide-y divide-slate-100 text-xs">
                    {completedFollowUpLeads.map((lead) => (
                      <div
                        key={lead._id}
                        className="py-2.5 flex items-center justify-between text-slate-600"
                      >
                        <div>
                          <strong className="text-slate-800">{lead.fullName}</strong> (
                          {lead.companyName}) - Status: {lead.leadStatus}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">
                          Completed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: CONVERSION INSIGHTS */}
          {activeNav === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp size={18} className="text-[#1908A6]" />
                      <span>Sales Conversion Funnel</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Stage-by-stage progression from lead capture to closed conversion
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                    {totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0}% Win Rate
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      stage: '1. Total Captured Leads',
                      sub: 'All incoming prospects in CRM',
                      count: totalLeads,
                      color: 'bg-[#1908A6]',
                    },
                    {
                      stage: '2. Engaged (Contacted + Beyond)',
                      sub: 'Prospects reached via call/email',
                      count: engagedCount,
                      color: 'bg-indigo-600',
                    },
                    {
                      stage: '3. Qualified (Interested + Converted)',
                      sub: 'High-intent prospects evaluating offer',
                      count: qualifiedCount,
                      color: 'bg-indigo-500',
                    },
                    {
                      stage: '4. Converted Customers',
                      sub: 'Successfully closed deals',
                      count: convertedLeads,
                      color: 'bg-emerald-500',
                    },
                  ].map((item) => {
                    const pct = totalLeads ? Math.round((item.count / totalLeads) * 100) : 0;
                    return (
                      <div
                        key={item.stage}
                        className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100"
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <div>
                            <div className="text-xs font-bold text-slate-800">{item.stage}</div>
                            <div className="text-[11px] text-slate-400">{item.sub}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-slate-900">
                              {item.count}
                            </span>
                            <span className="ml-1.5 text-xs font-semibold text-slate-500">
                              ({pct}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-3 bg-slate-200/70 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.max(pct, item.count > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {lostLeads > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                    <span>Closed Lost / Disqualified Leads</span>
                    <strong className="text-rose-600">
                      {lostLeads} ({totalLeads ? Math.round((lostLeads / totalLeads) * 100) : 0}%)
                    </strong>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Lead Acquisition Sources</h3>
                  <p className="text-xs text-slate-500 mt-0.5 mb-5">
                    Where your potential customers are coming from
                  </p>

                  <div className="space-y-4">
                    {[
                      { name: 'Website', dot: 'bg-[#1908A6]' },
                      { name: 'LinkedIn', dot: 'bg-sky-500' },
                      { name: 'Referral', dot: 'bg-emerald-500' },
                      { name: 'Cold Call', dot: 'bg-amber-500' },
                      { name: 'Other', dot: 'bg-slate-400' },
                    ].map((src) => {
                      const count = leads.filter((l) => l.leadSource === src.name).length;
                      const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
                      return (
                        <div key={src.name}>
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
                            <span className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${src.dot}`} />
                              {src.name}
                            </span>
                            <span>
                              {count} leads ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${src.dot} rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-600">
                  <strong className="text-[#1908A6]">Pipeline Tip:</strong> Follow up with{' '}
                  <strong>{newLeads}</strong> uncontacted lead(s) to maximize top-of-funnel
                  conversion.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalError('');
        }}
        onSave={handleSaveLead}
        editingLead={editingLead}
        serverError={modalError}
      />
    </div>
  );
}

function StatCard({ title, count, badge, badgeStyle, icon, featured }) {
  return (
    <div
      className={`${
        featured ? 'flow-card-featured' : 'bg-white'
      } p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.02)] flex flex-col justify-between`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <span className="text-3xl font-extrabold text-slate-900">{count}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeStyle}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}