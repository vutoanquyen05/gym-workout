'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { MembershipPlan, togglePlanStatus } from './actions';
import {
  Search,
  X,
  CreditCard,
  Tag,
  Calendar,
  Dumbbell,
  Pencil,
  Power,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building,
  Globe,
} from 'lucide-react';

interface PlanTableProps {
  initialPlans: MembershipPlan[];
}

export function PlanTable({ initialPlans }: PlanTableProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>(initialPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fixed_period' | 'session_pack' | 'recurring'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isPending, startTransition] = useTransition();
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // Đếm nhanh
  const totalCount = plans.length;
  const activeCount = plans.filter((p) => p.is_active).length;
  const ptCount = plans.filter(
    (p) => p.plan_type === 'session_pack' || p.plan_type === 'pt_package'
  ).length;

  // Lọc dữ liệu
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Map chuẩn hóa type
    let normalizedType = plan.plan_type;
    if (normalizedType === 'membership') normalizedType = 'fixed_period';
    if (normalizedType === 'pt_package') normalizedType = 'session_pack';
    if (normalizedType === 'combo') normalizedType = 'recurring';

    const matchesType = typeFilter === 'all' ? true : normalizedType === typeFilter;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? plan.is_active
        : !plan.is_active;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Chuyển đổi trạng thái mở bán
  const handleToggleStatus = (planId: string, currentActive: boolean) => {
    const nextStatus = !currentActive;
    const actionText = nextStatus ? 'mở bán lại' : 'tạm ngưng mở bán';

    if (!confirm(`Bạn có chắc chắn muốn ${actionText} gói tập này?`)) {
      return;
    }

    setPendingPlanId(planId);
    setActionAlert(null);

    startTransition(async () => {
      const res = await togglePlanStatus(planId, nextStatus);
      setPendingPlanId(null);

      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
      } else {
        setActionAlert({
          type: 'success',
          message: `Đã ${actionText} gói tập thành công.`,
        });
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, is_active: nextStatus } : p))
        );
      }
    });
  };

  // Helper format loại gói
  const renderTypeBadge = (planType: string) => {
    if (planType === 'session_pack' || planType === 'pt_package') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          <Dumbbell className="w-3 h-3 text-violet-600" />
          <span>Gói Buổi PT</span>
        </span>
      );
    }
    if (planType === 'recurring' || planType === 'combo') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Tag className="w-3 h-3 text-amber-600" />
          <span>Gói Định Kỳ</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Calendar className="w-3 h-3 text-blue-600" />
        <span>Thẻ Thời Hạn</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* 3 Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng số gói tập
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
              {totalCount} danh mục
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Đang mở bán
            </span>
            <div className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
              {activeCount} gói kích hoạt
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Gói huấn luyện PT
            </span>
            <div className="text-xl font-bold text-violet-600 mt-1 tabular-nums">
              {ptCount} gói theo buổi
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Alert thông báo hành động */}
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

      {/* Toolbar: Search, Type Tabs & Status Filter */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên gói tập, quyền lợi hoặc mô tả..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Type Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                typeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTypeFilter('fixed_period')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                typeFilter === 'fixed_period'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Thẻ Thời Hạn
            </button>
            <button
              onClick={() => setTypeFilter('session_pack')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                typeFilter === 'session_pack'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Gói Buổi PT
            </button>
            <button
              onClick={() => setTypeFilter('recurring')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                typeFilter === 'recurring'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Định Kỳ
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1" />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="active">Đang mở bán</option>
            <option value="inactive">Đã ngừng bán</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredPlans.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Không tìm thấy gói tập phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Không có gói nào khớp với từ khóa &quot;{searchTerm}&quot; hoặc tiêu chí lọc đã chọn.
            </p>
            {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
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
                  <th className="py-3 px-5">Tên Gói Tập & Quyền Lợi</th>
                  <th className="py-3 px-4">Phân Loại</th>
                  <th className="py-3 px-4">Đơn Giá (VNĐ)</th>
                  <th className="py-3 px-4">Thời Hạn & Buổi</th>
                  <th className="py-3 px-4">Phạm Vi</th>
                  <th className="py-3 px-4">Hội Viên Dùng</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPlans.map((plan) => {
                  const isCurrentPending = isPending && pendingPlanId === plan.id;
                  const isPtPack = plan.plan_type === 'session_pack' || plan.plan_type === 'pt_package';
                  const unitPricePerDay = Math.round(plan.price / Math.max(plan.duration_days, 1));
                  const unitPricePerSession =
                    isPtPack && plan.session_limit
                      ? Math.round(plan.price / plan.session_limit)
                      : null;

                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Tên gói & Mô tả */}
                      <td className="py-3.5 px-5 max-w-xs">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 block text-xs">
                            {plan.name}
                          </span>
                          {plan.description ? (
                            <p className="text-[11px] text-slate-500 truncate" title={plan.description}>
                              {plan.description}
                            </p>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Chưa có mô tả quyền lợi</span>
                          )}
                        </div>
                      </td>

                      {/* Phân loại badge */}
                      <td className="py-3.5 px-4">
                        {renderTypeBadge(plan.plan_type)}
                      </td>

                      {/* Đơn giá VNĐ */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-xs tabular-nums">
                            {plan.price.toLocaleString('vi-VN')} ₫
                          </span>
                          <span className="text-[10px] text-slate-400 block tabular-nums">
                            {unitPricePerSession
                              ? `~${unitPricePerSession.toLocaleString('vi-VN')} ₫/buổi`
                              : `~${unitPricePerDay.toLocaleString('vi-VN')} ₫/ngày`}
                          </span>
                        </div>
                      </td>

                      {/* Thời hạn & Số buổi */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-xs">
                          <span className="font-medium text-slate-800 block">
                            {plan.duration_days} ngày
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {isPtPack && plan.session_limit
                              ? `${plan.session_limit} buổi tập`
                              : 'Không giới hạn buổi'}
                          </span>
                        </div>
                      </td>

                      {/* Phạm vi chi nhánh */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          {plan.scope === 'single_branch' ? (
                            <>
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>1 Chi nhánh</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3 text-indigo-500" />
                              <span>Toàn hệ thống</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Hội viên đang dùng */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span>{plan.active_members_count || 0} thẻ</span>
                        </span>
                      </td>

                      {/* Trạng thái mở bán */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            plan.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              plan.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {plan.is_active ? 'Đang mở bán' : 'Ngừng bán'}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/plans/${plan.id}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Sửa</span>
                          </Link>

                          <button
                            disabled={isCurrentPending}
                            onClick={() => handleToggleStatus(plan.id, plan.is_active)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                              plan.is_active
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={plan.is_active ? 'Tạm ngưng mở bán gói' : 'Mở bán lại gói này'}
                          >
                            <Power className="w-3 h-3" />
                            <span>
                              {isCurrentPending ? '...' : plan.is_active ? 'Ngừng' : 'Mở bán'}
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

