'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { MembershipPlan, togglePlanStatus } from './actions';
import {
  Search,
  X,
  CreditCard,
  Pencil,
  Power,
  Calendar,
  Dumbbell,
  Tag,
  Building,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Users,
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

  // Thống kê nhanh
  const totalCount = plans.length;
  const activeCount = plans.filter((p) => p.is_active).length;
  const ptCount = plans.filter(
    (p) => p.plan_type === 'session_pack' || p.plan_type === 'pt_package'
  ).length;

  // Lọc danh sách gói tập
  const filteredPlans = plans.filter((plan) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      plan.name.toLowerCase().includes(term) ||
      (plan.description && plan.description.toLowerCase().includes(term));

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
  const handleToggleStatus = (planId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const actionLabel = nextStatus ? 'mở bán lại' : 'tạm ngưng mở bán';

    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} gói tập này?`)) {
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
          message: `Đã ${actionLabel} gói tập thành công.`,
        });
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, is_active: nextStatus } : p))
        );
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const renderTypeBadge = (planType: string) => {
    if (planType === 'session_pack' || planType === 'pt_package') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          <Dumbbell className="w-3 h-3 text-violet-600" />
          <span>Gói buổi PT</span>
        </span>
      );
    }
    if (planType === 'recurring' || planType === 'combo') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Tag className="w-3 h-3 text-amber-600" />
          <span>Gói định kỳ</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Calendar className="w-3 h-3 text-blue-600" />
        <span>Thẻ thời hạn</span>
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
            placeholder="Tìm theo tên gói tập hoặc mô tả..."
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
          {/* Plan Type Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                typeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTypeFilter('fixed_period')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                typeFilter === 'fixed_period'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Thẻ thời hạn
            </button>
            <button
              onClick={() => setTypeFilter('session_pack')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                typeFilter === 'session_pack'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Gói buổi PT
            </button>
            <button
              onClick={() => setTypeFilter('recurring')}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                typeFilter === 'recurring'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Định kỳ
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1" />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="h-10 text-sm px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
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
                  <th className="py-3 px-5">Tên gói và quyền lợi</th>
                  <th className="py-3 px-4">Loại gói</th>
                  <th className="py-3 px-4">Đơn giá niêm yết</th>
                  <th className="py-3 px-4">Thời hạn / Số buổi</th>
                  <th className="py-3 px-4">Phạm vi cơ sở</th>
                  <th className="py-3 px-4">Hội viên dùng</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPlans.map((plan) => {
                  const isCurrentPending = isPending && pendingPlanId === plan.id;
                  const isPtPack = plan.plan_type === 'session_pack' || plan.plan_type === 'pt_package';

                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Tên & Quyền lợi */}
                      <td className="py-3.5 px-5 max-w-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 block text-xs truncate">
                              {plan.name}
                            </span>
                            {plan.description && (
                              <span className="text-[11px] text-slate-400 block truncate">
                                {plan.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phân loại */}
                      <td className="py-3.5 px-4">{renderTypeBadge(plan.plan_type)}</td>

                      {/* Giá tiền */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-0.5">₫</span>
                      </td>

                      {/* Thời lượng / Buổi */}
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

                      {/* Phạm vi */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                          {plan.scope === 'single_branch' ? (
                            <>
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>1 chi nhánh</span>
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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
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
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Sửa</span>
                          </Link>

                          <button
                            disabled={isCurrentPending}
                            onClick={() => handleToggleStatus(plan.id, plan.is_active)}
                            className={`inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
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
