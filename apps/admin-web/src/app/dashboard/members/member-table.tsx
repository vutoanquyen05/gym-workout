'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { MemberWithDetails, MemberBranchOption, updateMemberStatus } from './actions';
import {
  Search,
  X,
  Users,
  UserCheck,
  CreditCard,
  Dumbbell,
  Phone,
  Mail,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

interface MemberTableProps {
  initialMembers: MemberWithDetails[];
  branches: MemberBranchOption[];
}

export function MemberTable({ initialMembers, branches }: MemberTableProps) {
  const [members, setMembers] = useState<MemberWithDetails[]>(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);

  // Thống kê nhanh KPI
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'active').length;
  const activeMembershipCount = members.filter((m) => m.active_membership?.status === 'active').length;
  const ptCount = members.filter((m) => m.assigned_pt !== null).length;

  // Lọc dữ liệu
  const filteredMembers = members.filter((member) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (member.full_name && member.full_name.toLowerCase().includes(term)) ||
      (member.phone && member.phone.toLowerCase().includes(term)) ||
      (member.email && member.email.toLowerCase().includes(term)) ||
      (member.member_code && member.member_code.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === 'all' ? true : member.status === statusFilter;

    let matchesBranch = true;
    if (branchFilter === 'all') {
      matchesBranch = true;
    } else {
      matchesBranch = member.home_branch_id === branchFilter;
    }

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Chuyển đổi trạng thái hoạt động của hội viên
  const handleToggleStatus = (memberId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionLabel = nextStatus === 'suspended' ? 'tạm ngưng' : 'kích hoạt lại';

    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} hồ sơ hội viên này?`)) {
      return;
    }

    setPendingMemberId(memberId);
    setActionAlert(null);

    startTransition(async () => {
      const res = await updateMemberStatus(memberId, nextStatus);
      setPendingMemberId(null);

      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
      } else {
        setActionAlert({
          type: 'success',
          message: `Đã ${actionLabel} hồ sơ hội viên thành công.`,
        });
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, status: nextStatus } : m))
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng hội viên CRM
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
              {totalCount.toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Đang hoạt động
            </span>
            <div className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
              {activeCount.toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Thẻ tập hiệu lực
            </span>
            <div className="text-xl font-bold text-sky-600 mt-1 tabular-nums">
              {activeMembershipCount.toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Học viên kèm PT
            </span>
            <div className="text-xl font-bold text-violet-600 mt-1 tabular-nums">
              {ptCount.toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Alert thông báo */}
      {actionAlert && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionAlert.message}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="text-xs font-semibold underline hover:opacity-75"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Toolbar: Search, Status Tabs & Branch Dropdown */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã hội viên, họ tên, số điện thoại..."
            className="w-full h-10 pl-9 pr-8 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                statusFilter === 'suspended'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tạm ngưng
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1" />

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="h-10 text-sm px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Mọi chi nhánh</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main CRM Members Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Không tìm thấy hội viên phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Không có hội viên nào khớp với từ khóa &quot;{searchTerm}&quot; hoặc tiêu chí lọc trạng thái và chi nhánh.
            </p>
            {(searchTerm || statusFilter !== 'all' || branchFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setBranchFilter('all');
                }}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-5">Mã hội viên</th>
                  <th className="py-3 px-5">Họ và tên</th>
                  <th className="py-3 px-4">Cơ sở gốc</th>
                  <th className="py-3 px-4">Gói tập và hạn dùng</th>
                  <th className="py-3 px-4">Huấn luyện viên phụ trách</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMembers.map((member) => {
                  const isCurrentPending = isPending && pendingMemberId === member.id;
                  const isActive = member.status === 'active';
                  const initials = (member.full_name || 'HV')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(-2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Mã hội viên và Avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/members/${member.id}`}
                              className="font-mono text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline block"
                            >
                              {member.member_code}
                            </Link>
                            <span className="text-[10px] text-slate-400 block">
                              {new Date(member.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Họ và tên, SĐT, Email */}
                      <td className="py-3.5 px-5">
                        <Link
                          href={`/dashboard/members/${member.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block text-xs"
                        >
                          {member.full_name}
                        </Link>
                        <div className="flex flex-col gap-0.5 mt-0.5 text-[11px] text-slate-500">
                          {member.phone && (
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{member.phone}</span>
                            </span>
                          )}
                          {member.email && (
                            <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{member.email}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cơ sở gốc */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">
                            {member.home_branch?.name || (
                              <span className="text-slate-400 italic">Chưa phân bổ</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Gói tập và hạn dùng */}
                      <td className="py-3.5 px-4">
                        {member.active_membership ? (
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">
                              {member.active_membership.plan_name || 'Gói hội viên'}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>
                                Đến{' '}
                                {new Date(
                                  member.active_membership.end_date
                                ).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            {member.active_membership.remaining_sessions !== null &&
                              member.active_membership.remaining_sessions !== undefined && (
                                <span className="text-[10px] font-mono text-indigo-600 block mt-0.5">
                                  Còn {member.active_membership.remaining_sessions} buổi
                                </span>
                              )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Chưa có gói hiệu lực
                          </span>
                        )}
                      </td>

                      {/* Huấn luyện viên phụ trách */}
                      <td className="py-3.5 px-4">
                        {member.assigned_pt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Dumbbell className="w-3 h-3 text-indigo-600" />
                            <span>{member.assigned_pt.full_name}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Tự luyện tập</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/members/${member.id}`}
                            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
                            title="Xem toàn bộ hồ sơ chi tiết 360°"
                          >
                            <span>Chi tiết 360°</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>

                          <button
                            disabled={isCurrentPending}
                            onClick={() => handleToggleStatus(member.id, member.status)}
                            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                              isActive
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={isActive ? 'Tạm ngưng hồ sơ hội viên' : 'Kích hoạt lại'}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>
                              {isCurrentPending ? '...' : isActive ? 'Tạm ngưng' : 'Mở lại'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
