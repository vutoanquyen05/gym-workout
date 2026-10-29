import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stats = [
    {
      title: 'Tổng học viên',
      value: '0',
      change: 'Chưa có dữ liệu',
      icon: '👥',
      color: 'blue',
    },
    {
      title: 'Số chi nhánh',
      value: '0',
      change: 'Cần cấu hình',
      icon: '🏢',
      color: 'indigo',
    },
    {
      title: 'Doanh thu tháng',
      value: '0 ₫',
      change: 'Kỳ thanh toán này',
      icon: '💰',
      color: 'emerald',
    },
    {
      title: 'Huấn luyện viên (PT)',
      value: '0',
      change: 'Đang hoạt động',
      icon: '🏋️',
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Xin chào, {user?.email || 'Quản trị viên'}! 👋
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Chào mừng bạn đến với Hệ thống Quản trị Gym Tracker. Nền tảng Cloud đã sẵn sàng cho vận hành.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Hệ thống Cloud Online
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {stat.title}
              </span>
              <span className="text-2xl" role="img" aria-label={stat.title}>
                {stat.icon}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Highlights & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cloud Readiness Information */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900">
            Trạng thái Hạ tầng Quản lý Phòng tập
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Kiến trúc cơ sở dữ liệu Multi-Tenant (GM-1 đến GM-5) đã được triển khai trên Supabase PostgreSQL Cloud. 
            Hệ thống phân quyền Role-Based Access Control (RBAC) đã kích hoạt cho Tenant Owner, Branch Manager, PT và Member.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Xác thực người dùng</span>
              <span className="text-sm font-semibold text-slate-800">Supabase SSR Auth</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Mô hình phân vùng</span>
              <span className="text-sm font-semibold text-slate-800">Multi-Tenancy (RLS Isolation)</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Lối tắt nhanh
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Các tính năng quản lý cốt lõi tiếp theo:
            </p>

            <div className="space-y-2">
              <Link
                href="/dashboard/branches"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
              >
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                  🏢 Cấu hình Chi nhánh
                </span>
                <span className="text-xs text-slate-400 group-hover:text-blue-600">→</span>
              </Link>

              <Link
                href="/dashboard/members"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
              >
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                  👥 Quản lý Hội viên
                </span>
                <span className="text-xs text-slate-400 group-hover:text-blue-600">→</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
              >
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                  ⚙️ Cài đặt Hệ thống
                </span>
                <span className="text-xs text-slate-400 group-hover:text-blue-600">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
