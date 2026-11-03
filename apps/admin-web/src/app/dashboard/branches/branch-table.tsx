'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { BranchWithStats, toggleBranchStatus } from './actions';
import {
  Search,
  X,
  Building2,
  Phone,
  MapPin,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  Users,
  UserCheck,
} from 'lucide-react';

interface BranchTableProps {
  initialBranches: BranchWithStats[];
}

export function BranchTable({ initialBranches }: BranchTableProps) {
  const [branches, setBranches] = useState<BranchWithStats[]>(initialBranches);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isPending, startTransition] = useTransition();
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingBranchId, setPendingBranchId] = useState<string | null>(null);

  // Lọc dữ liệu theo Search và Trạng thái
  const filteredBranches = branches.filter((branch) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      branch.name.toLowerCase().includes(term) ||
      (branch.address && branch.address.toLowerCase().includes(term)) ||
      (branch.phone && branch.phone.toLowerCase().includes(term)) ||
      (branch.slug && branch.slug.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? branch.status === 'active' || !branch.status
        : branch.status === 'suspended';

    return matchesSearch && matchesStatus;
  });

  // Tính toán số lượng theo trạng thái
  const counts = {
    all: branches.length,
    active: branches.filter((b) => b.status === 'active' || !b.status).length,
    suspended: branches.filter((b) => b.status === 'suspended').length,
  };

  // Xử lý đổi trạng thái
  const handleToggleStatus = (branchId: string, currentStatus: string | null) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const actionLabel = nextStatus === 'suspended' ? 'tạm ngưng' : 'kích hoạt';

    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} chi nhánh này?`)) {
      return;
    }

    setPendingBranchId(branchId);
    setActionAlert(null);

    startTransition(async () => {
      const res = await toggleBranchStatus(branchId, currentStatus);
      setPendingBranchId(null);

      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
      } else {
        setActionAlert({
          type: 'success',
          message: `Đã ${actionLabel} chi nhánh thành công.`,
        });
        setBranches((prev) =>
          prev.map((b) => (b.id === branchId ? { ...b, status: nextStatus } : b))
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Alert Thông báo thao tác */}
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên chi nhánh, địa chỉ, số điện thoại..."
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hoạt động ({counts.active})
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
              statusFilter === 'suspended'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tạm ngưng ({counts.suspended})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredBranches.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Không tìm thấy chi nhánh phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Không có chi nhánh nào khớp với từ khóa &quot;{searchTerm}&quot; hoặc bộ lọc trạng thái hiện tại.
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
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
                  <th className="py-3 px-4">Tên cơ sở và đường dẫn</th>
                  <th className="py-3 px-4">Quy mô quản lý</th>
                  <th className="py-3 px-4">Liên hệ và địa chỉ</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBranches.map((branch) => {
                  const isActive = branch.status === 'active' || !branch.status;
                  const isSuspended = branch.status === 'suspended';
                  const isCurrentPending = isPending && pendingBranchId === branch.id;

                  return (
                    <tr key={branch.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">
                              {branch.name}
                            </span>
                            {branch.slug && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                /{branch.slug}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            title="Số nhân viên và PT đang hoạt động tại cơ sở"
                          >
                            <UserCheck className="w-3 h-3 text-slate-500" />
                            <span>{branch.staff_count || 0} HLV/NV</span>
                          </span>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                            title="Số hội viên đăng ký tại cơ sở này"
                          >
                            <Users className="w-3 h-3 text-indigo-600" />
                            <span>{branch.member_count || 0} hội viên</span>
                          </span>
                        </div>
                      </td>

                      {/* Contact & Address */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1 truncate">
                          <span className="text-slate-800 font-medium flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{branch.phone || <span className="text-slate-400 italic">Chưa có SĐT</span>}</span>
                          </span>
                          <span className="text-slate-500 flex items-center gap-1.5 truncate" title={branch.address || ''}>
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{branch.address || <span className="text-slate-400 italic">Chưa có địa chỉ</span>}</span>
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isSuspended
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : isSuspended ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'Đang hoạt động' : isSuspended ? 'Tạm ngưng' : 'Lưu trữ'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Edit Button */}
                          <Link
                            href={`/dashboard/branches/${branch.id}/edit`}
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Sửa</span>
                          </Link>

                          {/* Quick Status Toggle */}
                          {isActive && (
                            <button
                              disabled={isCurrentPending}
                              onClick={() => handleToggleStatus(branch.id, 'active')}
                              className="h-8 px-3 rounded-lg text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors"
                            >
                              {isCurrentPending ? '...' : 'Tạm ngưng'}
                            </button>
                          )}

                          {isSuspended && (
                            <button
                              disabled={isCurrentPending}
                              onClick={() => handleToggleStatus(branch.id, 'suspended')}
                              className="h-8 px-3 rounded-lg text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                            >
                              {isCurrentPending ? '...' : 'Mở lại'}
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
