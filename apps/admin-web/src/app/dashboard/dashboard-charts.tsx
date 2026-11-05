'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  ScanLine,
  Users,
  CreditCard,
  Dumbbell,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DailyTrendItem {
  dateLabel: string; // VD: "30/10", "31/10", "01/11", ...
  fullDate: string;  // VD: "05/11/2026"
  revenue: number;   // Doanh thu (VNĐ)
  checkIns: number;  // Số lượt điểm danh
}

export interface DashboardSummaryStats {
  totalMembers: number;
  activeMembers: number;
  activeMemberships: number;
  expiringMemberships: number;
  totalPlans: number;
  activeStaff: number;
  workoutPrograms: number;
  totalCheckIns7d: number;
  totalRevenue7d: number;
}

interface DashboardChartsProps {
  trendData: DailyTrendItem[];
  summaryStats: DashboardSummaryStats;
}

export function DashboardCharts({ trendData, summaryStats }: DashboardChartsProps) {
  const [chartMode, setChartMode] = useState<'attendance' | 'revenue'>('attendance');

  // Format tiền tệ rút gọn cho trục Y (VD: 5tr, 500k)
  const formatYAxisRevenue = (val: number) => {
    if (val === 0) return '0 ₫';
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} tr`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)} k`;
    return `${val} ₫`;
  };

  const activePercent =
    summaryStats.totalMembers > 0
      ? Math.round((summaryStats.activeMembers / summaryStats.totalMembers) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột Trái (2 cols): Biểu đồ Điều hành 7 Ngày */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Xu hướng vận hành và doanh thu 7 ngày gần nhất
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {chartMode === 'attendance'
                ? `Tổng cộng ${summaryStats.totalCheckIns7d.toLocaleString('vi-VN')} lượt điểm danh trong 7 ngày qua`
                : `Tổng thu ${summaryStats.totalRevenue7d.toLocaleString('vi-VN')} ₫ qua quầy và chuyển khoản 7 ngày qua`}
            </p>
          </div>

          {/* Switch Tab chế độ biểu đồ */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setChartMode('attendance')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all',
                chartMode === 'attendance'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lưu lượng điểm danh</span>
            </button>

            <button
              onClick={() => setChartMode('revenue')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all',
                chartMode === 'revenue'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Doanh thu thu ngân</span>
            </button>
          </div>
        </div>

        {/* Khung vẽ Recharts */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'attendance' ? (
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyTrendItem;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-slate-300 border-b border-slate-700 pb-1">
                            Ngày {data.fullDate}
                          </p>
                          <p className="text-emerald-300 font-bold flex items-center justify-between gap-4 pt-0.5">
                            <span>Lượt điểm danh:</span>
                            <span className="text-sm font-mono">{data.checkIns} lượt</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="checkIns"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            ) : (
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tickFormatter={formatYAxisRevenue}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyTrendItem;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-slate-300 border-b border-slate-700 pb-1">
                            Ngày {data.fullDate}
                          </p>
                          <p className="text-indigo-300 font-bold flex items-center justify-between gap-4 pt-0.5">
                            <span>Doanh thu:</span>
                            <span className="text-sm font-mono">
                              {data.revenue.toLocaleString('vi-VN')} ₫
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#dashboardRevenueGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cột Phải (1 col): Phân Bổ Trạng Thái Hội Viên & Dịch Vụ */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Cơ cấu hội viên và dịch vụ
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉ số sức khỏe vận hành phòng gym
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Metric Bar 1: Tỷ lệ hội viên active */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hội viên đang hoạt động</span>
              </span>
              <span className="font-mono font-bold text-slate-900">
                {summaryStats.activeMembers} / {summaryStats.totalMembers} ({activePercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${Math.min(activePercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Metric Bar 2: Thẻ sắp hết hạn */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Thẻ sắp hết hạn (trong 7 ngày)</span>
              </span>
              <span className="font-mono font-bold text-amber-600">
                {summaryStats.expiringMemberships} thẻ
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${
                    summaryStats.activeMemberships > 0
                      ? Math.min(
                          Math.round(
                            (summaryStats.expiringMemberships / summaryStats.activeMemberships) * 100
                          ),
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* 3 Thẻ thống kê dịch vụ mini */}
          <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">Gói tập</p>
              <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                {summaryStats.totalPlans}
              </p>
              <p className="text-[10px] text-slate-500">Mở bán</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">Huấn luyện viên</p>
              <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                {summaryStats.activeStaff}
              </p>
              <p className="text-[10px] text-slate-500">Đang trực</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">Giáo án PT</p>
              <p className="text-base font-bold text-indigo-600 font-mono mt-0.5">
                {summaryStats.workoutPrograms}
              </p>
              <p className="text-[10px] text-slate-500">3 tầng</p>
            </div>
          </div>
        </div>

        {/* Nút hành động nhanh */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          <Link
            href="/dashboard/members"
            className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
          >
            <span>Quản lý danh sách hội viên</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

