'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { StaffMember, BranchOption, StaffStatus, updateStaffStatus } from './actions';
import {
  Search,
  X,
  ShieldCheck,
  Dumbbell,
  UserCheck,
  Users,
  Phone,
  Mail,
  Building2,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  Award,
  Crown,
} from 'lucide-react';

interface StaffTableProps {
  initialStaff: StaffMember[];
  branches: BranchOption[];
}

export function StaffTable({ initialStaff, branches }: StaffTableProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'trainer' | 'receptionist' | 'manager' | 'owner'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingStaffId, setPendingStaffId] = useState<string | null>(null);

  // Thống kê nhanh
  const totalCount = staffList.length;
  const trainerCount = staffList.filter((s) => s.role === 'trainer').length;
  const frontDeskCount = staffList.filter((s) => s.role === 'receptionist' || s.role === 'manager').length;
  const activeCount = staffList.filter((s) => s.status === 'active').length;

  // Lọc dữ liệu
  const filteredStaff = staffList.filter((staff) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (staff.full_name && staff.full_name.toLowerCase().includes(term)) ||
      (staff.phone && staff.phone.toLowerCase().includes(term)) ||
      (staff.email && staff.email.toLowerCase().includes(term)) ||
      (staff.specialty && staff.specialty.toLowerCase().includes(term));

    const matchesRole = roleFilter === 'all' ? true : staff.role === roleFilter;

    let matchesBranch = true;
    if (branchFilter === 'all') {
      matchesBranch = true;
    } else if (branchFilter === 'all_branches') {
      matchesBranch = staff.branch_id === null;
    } else {
      matchesBranch = staff.branch_id === branchFilter;
    }

    return matchesSearch && matchesRole && matchesBranch;
  });

  // Chuyển đổi trạng thái nhanh
  const handleToggleStatus = (staffId: string, currentStatus: StaffStatus) => {
    const nextStatus: StaffStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionText = nextStatus === 'suspended' ? 'tạm ngưng làm việc' : 'kích hoạt lại';

    if (!confirm(`Bạn có chắc chắn muốn ${actionText} đối với nhân sự này?`)) {
      return;
    }

    setPendingStaffId(staffId);
    setActionAlert(null);

    startTransition(async () => {
      const res = await updateStaffStatus(staffId, nextStatus);
      setPendingStaffId(null);

      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
      } else {
        setActionAlert({
          type: 'success',
          message: `Đã ${actionText} nhân sự thành công.`,
        });
        setStaffList((prev) =>
          prev.map((s) => (s.id === staffId ? { ...s, status: nextStatus } : s))
        );
      }
    });
  };

  // Helper render badge vai trò
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Crown className="w-3 h-3 text-amber-600" />
            <span>Chủ phòng tập</span>
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            <span>Quản lý cơ sở</span>
          </span>
        );
      case 'receptionist':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <UserCheck className="w-3 h-3 text-sky-600" />
            <span>Lễ tân và thu ngân</span>
          </span>
        );
      case 'trainer':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Dumbbell className="w-3 h-3 text-indigo-600" />
            <span>Huấn luyện viên PT</span>
          </span>
        );
    }
  };

  // Helper render badge trạng thái
  const renderStatusBadge = (status: StaffStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Đang làm việc</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Tạm ngưng</span>
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Đã thu hồi quyền</span>
          </span>
        );
      case 'invited':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Đã mời</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng số nhân sự
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
              {totalCount} thành viên
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Huấn luyện viên PT
            </span>
            <div className="text-xl font-bold text-indigo-600 mt-1 tabular-nums">
              {trainerCount} HLV
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Quản lý và lễ tân
            </span>
            <div className="text-xl font-bold text-sky-600 mt-1 tabular-nums">
              {frontDeskCount} nhân sự
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Đang làm việc
            </span>
            <div className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
              {activeCount} đang hoạt động
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
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

      {/* Toolbar: Search, Role Tabs & Branch Dropdown */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên HLV, số điện thoại, email, chuyên môn..."
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
          {/* Role Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setRoleFilter('all')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                roleFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setRoleFilter('trainer')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                roleFilter === 'trainer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Huấn luyện viên PT
            </button>
            <button
              onClick={() => setRoleFilter('receptionist')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                roleFilter === 'receptionist'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Lễ tân
            </button>
            <button
              onClick={() => setRoleFilter('manager')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                roleFilter === 'manager'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Quản lý
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
            <option value="all_branches">Toàn hệ thống</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Không tìm thấy nhân sự phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Không có nhân sự nào khớp với từ khóa &quot;{searchTerm}&quot; hoặc tiêu chí lọc vai trò và chi nhánh.
            </p>
            {(searchTerm || roleFilter !== 'all' || branchFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
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
                  <th className="py-3 px-5">Nhân sự</th>
                  <th className="py-3 px-4">Vai trò đảm nhiệm</th>
                  <th className="py-3 px-4">Chi nhánh phân công</th>
                  <th className="py-3 px-4">Chuyên môn</th>
                  <th className="py-3 px-4">Học viên phụ trách</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStaff.map((staff) => {
                  const isCurrentPending = isPending && pendingStaffId === staff.id;
                  const initials = (staff.full_name || 'NV')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(-2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-5 max-w-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">
                              {staff.full_name}
                            </span>
                            <div className="flex flex-col gap-0.5 mt-0.5 text-[11px] text-slate-500">
                              {staff.phone && (
                                <span className="inline-flex items-center gap-1 font-mono">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{staff.phone}</span>
                                </span>
                              )}
                              {staff.email && (
                                <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{staff.email}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vai trò */}
                      <td className="py-3.5 px-4">{renderRoleBadge(staff.role)}</td>

                      {/* Chi nhánh */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                          {staff.branch_name ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{staff.branch_name}</span>
                            </>
                          ) : (
                            <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-100">
                              Toàn hệ thống
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Chuyên môn */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {staff.specialty ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium truncate" title={staff.specialty}>
                            <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{staff.specialty}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Chưa cập nhật</span>
                        )}
                      </td>

                      {/* Học viên phụ trách */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Users className="w-3 h-3 text-indigo-600" />
                          <span>{staff.assigned_members_count || 0} học viên</span>
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(staff.status)}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/staff/${staff.id}/edit`}
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Sửa</span>
                          </Link>

                          {staff.role !== 'owner' && (
                            <button
                              disabled={isCurrentPending}
                              onClick={() => handleToggleStatus(staff.id, staff.status)}
                              className={`inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                                staff.status === 'active'
                                  ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={staff.status === 'active' ? 'Tạm ngưng quyền làm việc' : 'Kích hoạt lại nhân sự'}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>
                                {isCurrentPending ? '...' : staff.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                              </span>
                            </button>
                          )}
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
