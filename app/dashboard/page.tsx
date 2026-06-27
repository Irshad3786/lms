'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Clock, CheckCircle2, XCircle, LogOut, Bell, 
  Plus, User, Search, Filter, MessageSquare, 
  CalendarDays, Check, X, ShieldAlert, Award
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  leaveBalance: number;
}

interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  days: number;
  type: string;
  reason: string;
  status: string;
  adminNotes?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    leaveBalance: number;
  };
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  
  // State variables
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Employee States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Annual');
  const [reason, setReason] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  
  // Admin Action States
  const [decisionNotes, setDecisionNotes] = useState<{ [key: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Filters and UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);


  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setCurrentUser(data.user);
      
      // Once user profile is loaded, load requests and notifications
      await Promise.all([
        fetchLeaves(),
        fetchNotifications()
      ]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      router.push('/login');
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await fetch('/api/leaves');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Authenticate user on mount
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  // Submit Leave Request (Employee)
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setApplyError('Start date cannot be after end date');
      return;
    }

    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (leaveType !== 'Unpaid' && currentUser && currentUser.leaveBalance < days) {
      setApplyError(`Insufficient balance. Available: ${currentUser.leaveBalance} days, Required: ${days} days.`);
      return;
    }

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          type: leaveType,
          reason
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit leave request');
      }

      // Reset form and reload data
      setStartDate('');
      setEndDate('');
      setLeaveType('Annual');
      setReason('');
      setShowApplyModal(false);
      
      // Update UI data
      await fetchLeaves();
      await fetchProfile(); // refresh balance
    } catch (err) {
      setApplyError((err as Error).message || 'Submission failed');
    }
  };

  // Approve / Reject Leave Request (Admin)
  const handleDecision = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    const notes = decisionNotes[id] || '';

    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to process request');
      } else {
        // Clear notes for this request
        setDecisionNotes(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        // Reload data
        await fetchLeaves();
      }
    } catch (err) {
      console.error('Error handling decision:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // Helper date calc
  const getRequestedDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = getRequestedDays();
  const isBalanceWarning = leaveType !== 'Unpaid' && currentUser ? currentUser.leaveBalance < requestedDays : false;

  // Filter requests
  const filteredRequests = requests.filter(req => {
    // 1. Filter by employee search query (if admin)
    if (currentUser?.role === 'admin' && req.user) {
      const searchMatch = 
        req.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        req.user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        req.reason.toLowerCase().includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;
    } else {
      const searchMatch = req.reason.toLowerCase().includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;
    }

    // 2. Filter by leave type
    if (typeFilter !== 'All' && req.type !== typeFilter) return false;

    // 3. Filter by status
    if (statusFilter !== 'All' && req.status !== statusFilter) return false;

    return true;
  });

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm tracking-wide">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#F09819]/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#EDDE5D]/5 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="glass-panel border-b border-white/5 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EDDE5D] to-[#F09819] flex items-center justify-center shadow shadow-brand-orange/20">
            <CalendarDays className="w-5 h-5 text-slate-950" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#EDDE5D] to-[#F09819] bg-clip-text text-transparent">
            LMS Portal
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadNotificationsCount > 0) {
                  handleMarkNotificationsRead();
                }
              }}
              className="p-2.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-white/5 transition-all text-slate-300 hover:text-white relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/10 rounded-2xl shadow-xl overflow-hidden z-40 max-h-96 flex flex-col">
                <div className="p-4 border-b border-white/5 bg-slate-900/60 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200">Alerts & Notifications</h4>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400">
                    Latest 20
                  </span>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 text-xs transition-colors ${n.read ? 'text-slate-400 bg-transparent' : 'text-slate-200 bg-brand-orange/5'}`}
                      >
                        <p className="leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile identifier */}
          <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 py-1.5 pl-3 pr-4 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-brand-yellow">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser?.name}</p>
              <p className="text-[9px] text-slate-400 capitalize">{currentUser?.role}</p>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              currentUser?.role === 'admin' 
                ? 'bg-gradient-to-r from-[#EDDE5D] to-[#F09819] text-slate-950' 
                : 'bg-slate-800 text-slate-300'
            }`}>
              {currentUser?.role?.toUpperCase()}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl hover:bg-red-950/20 border border-transparent hover:border-red-500/10 transition-all text-slate-400 hover:text-red-400 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 z-10">
        
        {/* Top welcome row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Hello, {currentUser?.name}! 👋
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {currentUser?.role === 'admin' 
                ? 'Review and manage employee leave requests.' 
                : 'Apply for leaves and track your approval status.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.role === 'employee' && (
              <button
                onClick={() => { setShowApplyModal(true); setApplyError(null); }}
                className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold shadow shadow-brand-orange/20 cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Apply for Leave</span>
              </button>
            )}
          </div>
        </div>



        {/* -------------------- EMPLOYEE VIEW -------------------- */}
        {currentUser?.role === 'employee' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Leave Balance Stats Card */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-brand-yellow">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Leave Balance</p>
                <h3 className="text-3xl font-extrabold text-white text-glow">
                  {currentUser.leaveBalance} <span className="text-sm font-semibold text-slate-400">days left</span>
                </h3>
                <p className="text-[10px] text-slate-500">Allocated limit: 15 days total</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Approved Leaves Stats Card */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-emerald-500">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Approved Vacation</p>
                <h3 className="text-3xl font-extrabold text-white">
                  {requests.filter(r => r.status === 'APPROVED').reduce((acc, r) => acc + r.days, 0)} <span className="text-sm font-semibold text-slate-400">days</span>
                </h3>
                <p className="text-[10px] text-slate-500">
                  Total of {requests.filter(r => r.status === 'APPROVED').length} request(s) approved
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Pending Requests Stats Card */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-brand-orange">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Approvals</p>
                <h3 className="text-3xl font-extrabold text-white">
                  {requests.filter(r => r.status === 'PENDING').length} <span className="text-sm font-semibold text-slate-400">request(s)</span>
                </h3>
                <p className="text-[10px] text-slate-500">Waiting for manager decision</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                <Clock className="w-6 h-6" />
              </div>
            </div>

          </div>
        )}

        {/* -------------------- ADMIN VIEW -------------------- */}
        {currentUser?.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pending Approvals Card */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-brand-orange">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Approvals</p>
                <h3 className="text-3xl font-extrabold text-white text-glow">
                  {requests.filter(r => r.status === 'PENDING').length} <span className="text-sm font-semibold text-slate-400">active requests</span>
                </h3>
                <p className="text-[10px] text-slate-500">Requires your immediate action</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            {/* Total Leaves Approved Card */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-emerald-500">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Approved</p>
                <h3 className="text-3xl font-extrabold text-white">
                  {requests.filter(r => r.status === 'APPROVED').length} <span className="text-sm font-semibold text-slate-400">approved requests</span>
                </h3>
                <p className="text-[10px] text-slate-500">
                  Deductions applied to balances
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Total Rejected Card */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-red-500">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Rejected</p>
                <h3 className="text-3xl font-extrabold text-white">
                  {requests.filter(r => r.status === 'REJECTED').length} <span className="text-sm font-semibold text-slate-400">requests</span>
                </h3>
                <p className="text-[10px] text-slate-500">Employee balances preserved</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
                <XCircle className="w-6 h-6" />
              </div>
            </div>

          </div>
        )}

        {/* Requests List Card */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
          {/* Header & filters */}
          <div className="p-6 border-b border-white/5 bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Leave Requests Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser?.role === 'admin' 
                  ? 'Overview of all employee leave applications.' 
                  : 'Track your submitted leave request history.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reason or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-orange/40 transition-colors w-48"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 px-2 py-1 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none pr-2 cursor-pointer"
                >
                  <option value="All" className="bg-slate-950">All Types</option>
                  <option value="Annual" className="bg-slate-950">Annual</option>
                  <option value="Sick" className="bg-slate-950">Sick</option>
                  <option value="Unpaid" className="bg-slate-950">Unpaid</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 px-2 py-1 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none pr-2 cursor-pointer"
                >
                  <option value="All" className="bg-slate-950">All Statuses</option>
                  <option value="PENDING" className="bg-slate-950">Pending</option>
                  <option value="APPROVED" className="bg-slate-950">Approved</option>
                  <option value="REJECTED" className="bg-slate-950">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table content */}
          <div className="overflow-x-auto">
            {filteredRequests.length === 0 ? (
              <div className="p-16 text-center text-slate-500 text-sm">
                No leave requests found matching selected filters.
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/20">
                    {currentUser?.role === 'admin' && <th className="px-6 py-4">Employee</th>}
                    <th className="px-6 py-4">Leave Type</th>
                    <th className="px-6 py-4">Duration (Dates)</th>
                    <th className="px-6 py-4">Days</th>
                    <th className="px-6 py-4">Reason / Notes</th>
                    <th className="px-6 py-4">Status</th>
                    {currentUser?.role === 'admin' && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                      {currentUser?.role === 'admin' && (
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{req.user?.name}</div>
                          <div className="text-[10px] text-slate-400">{req.user?.email}</div>
                          <div className="text-[9px] text-brand-yellow font-medium mt-0.5">
                            Balance: {req.user?.leaveBalance} day(s) left
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          req.type === 'Annual' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' :
                          req.type === 'Sick' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{req.days}</td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-slate-300 text-xs font-medium leading-relaxed">{req.reason}</p>
                        {req.adminNotes && (
                          <div className="mt-1.5 p-2 bg-slate-950/60 border border-white/5 rounded-lg text-[10px] text-slate-400">
                            <span className="font-bold text-slate-300 uppercase block tracking-wider mb-0.5">Admin Comment:</span>
                            &quot;{req.adminNotes}&quot;
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${
                          req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-brand-orange/10 text-brand-orange border border-brand-orange/20 animate-pulse'
                        }`}>
                          {req.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {req.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                          {req.status === 'PENDING' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                          {req.status}
                        </span>
                      </td>
                      
                      {currentUser?.role === 'admin' && (
                        <td className="px-6 py-4 text-right">
                          {req.status === 'PENDING' ? (
                            <div className="space-y-2">
                              {/* Admin notes input */}
                              <input
                                type="text"
                                placeholder="Decision note..."
                                value={decisionNotes[req.id] || ''}
                                onChange={(e) => setDecisionNotes({
                                  ...decisionNotes,
                                  [req.id]: e.target.value
                                })}
                                className="w-full max-w-[150px] ml-auto block px-2.5 py-1 bg-slate-950 border border-white/10 rounded-lg text-[10px] placeholder-slate-500 focus:outline-none focus:border-brand-orange/50 text-right"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleDecision(req.id, 'APPROVED')}
                                  disabled={processingId !== null}
                                  className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                                  title="Approve Request"
                                >
                                  <Check className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={() => handleDecision(req.id, 'REJECTED')}
                                  disabled={processingId !== null}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                                  title="Reject Request"
                                >
                                  <X className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* -------------------- EMPLOYEE APPLY MODAL -------------------- */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 relative animate-scaleIn">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-yellow" />
                <span>Apply for Leave</span>
              </h3>
              <p className="text-slate-400 text-xs">Fill in dates and reason for manager approval.</p>
            </div>

            {applyError && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-200 text-xs">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Leave Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Annual', 'Sick', 'Unpaid'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLeaveType(t)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        leaveType === t
                          ? 'border-brand-orange/40 bg-brand-orange/5 text-brand-orange'
                          : 'border-white/10 bg-slate-900/20 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-905 bg-slate-900/60 border border-white/10 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-orange/40 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-905 bg-slate-900/60 border border-white/10 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-orange/40 transition-colors"
                  />
                </div>
              </div>

              {/* Calculator Summary */}
              {startDate && endDate && (
                <div className={`p-4 rounded-xl border transition-colors ${
                  isBalanceWarning 
                    ? 'bg-red-950/20 border-red-500/20 text-red-200' 
                    : 'bg-brand-orange/5 border-brand-orange/10 text-slate-200'
                } text-xs space-y-1`}>
                  <div className="flex justify-between font-semibold">
                    <span>Total requested duration:</span>
                    <span>{requestedDays} day(s)</span>
                  </div>
                  {isBalanceWarning ? (
                    <p className="text-[10px] text-red-400 font-medium">
                      ⚠️ Insufficient balance. You only have {currentUser?.leaveBalance} day(s) remaining.
                    </p>
                  ) : (
                    leaveType !== 'Unpaid' && (
                      <p className="text-[10px] text-slate-400">
                        Remaining balance after approval: {(currentUser?.leaveBalance || 0) - requestedDays} day(s).
                      </p>
                    )
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reason / Notes</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <textarea
                    required
                    rows={3}
                    placeholder="Briefly explain the purpose of your request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-orange/40 transition-colors text-xs resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestedDays <= 0 || isBalanceWarning}
                  className="flex-1 py-2.5 btn-primary rounded-xl text-xs font-bold shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  Submit Application
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-white/5 text-center text-xs text-slate-500 z-10">
        <p>Leave Management Portal &copy; 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}
