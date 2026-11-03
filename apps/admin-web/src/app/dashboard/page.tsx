import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import {
  Users,
  CreditCard,
  Building2,
  TrendingUp,
  ScanLine,
  UserPlus,
  ArrowUpRight,
  Dumbbell,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Truy vấn thống kê CRM Hội viên
  const { count: totalMembersCount } = await supabase
    .from('gym_members')
    .select('*', { count: 'exact', head: true });

  const { count: activeMembersCount } = await supabase
    .from('gym_members')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // 2. Truy vấn số lượng thẻ tập đang có hiệu lực
  const { count: activeMembershipsCount } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // 3. Truy vấn tổng doanh thu tích lũy (từ payment_transactions v2.0)
  const { data: transactions } = await supabase
    .from('payment_transactions')
    .select('amount, payment_status')
    .eq('payment_status', 'completed');

  const totalRevenue = (transactions || []).reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  // 4. Truy vấn số lượng Chi nhánh đang hoạt động
  const { count: activeBranchesCount } = await supabase
    .from('branches')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // 5. Truy vấn danh sách 5 Hội viên mới nhất (CRM 360°)
  const { data: recentMembers } = await supabase
    .from('gym_members')
    .select(`
      id,
      member_code,
      full_name,
      phone,
      status,
      created_at,
      home_branch:branches (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const totalMembers = totalMembersCount || 0;
  const activeMembers = activeMembersCount || 0;
  const activeMemberships = activeMembershipsCount || 0;
  const activeBranches = activeBranchesCount || 0;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Enterprise Page Header (Không đóng hộp) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Hệ thống</span>
            <span>/</span>
            <span className="font-medium text-slate-700">Tổng quan điều hành</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Trung tâm chỉ huy
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Giám sát thời gian thực: thẻ hội viên, phân bổ chi nhánh, dòng tiền giao dịch và giáo án PT.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/dashboard/check-in"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quầy điểm danh</span>
          </Link>
          <Link
            href="/dashboard/members/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm hội viên</span>
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CRM Members */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Tổng hội viên CRM
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {totalMembers.toLocaleString('vi-VN')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeMembers} đang hoạt động</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Memberships */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Thẻ tập hiệu lực
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {activeMemberships.toLocaleString('vi-VN')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Thời hạn và gói buổi</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Doanh thu tích lũy
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {totalRevenue.toLocaleString('vi-VN')} <span className="text-base font-semibold text-slate-500">₫</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>POS quầy và chuyển khoản</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Branches */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Chi nhánh hoạt động
            </span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {activeBranches}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Cơ sở đồng bộ v2.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Members (Left) & Quick Access Modules (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent CRM Members Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Hội viên CRM mới đăng ký
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                5 hồ sơ thành viên cập nhật gần nhất trên toàn hệ thống
              </p>
            </div>
            <Link
              href="/dashboard/members"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Mã hội viên</th>
                  <th className="px-5 py-3">Họ và tên</th>
                  <th className="px-5 py-3">Số điện thoại</th>
                  <th className="px-5 py-3">Cơ sở gốc</th>
                  <th className="px-5 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentMembers && recentMembers.length > 0 ? (
                  recentMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                        {member.member_code}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {member.full_name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-mono">
                        {member.phone || <span className="text-slate-400 italic">Chưa có SĐT</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {Array.isArray(member.home_branch) && member.home_branch[0]?.name
                          ? member.home_branch[0].name
                          : (member.home_branch as unknown as { name?: string })?.name || (
                              <span className="text-slate-400 italic">Chưa phân bổ</span>
                            )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            member.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : member.status === 'suspended'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              member.status === 'active'
                                ? 'bg-emerald-500'
                                : member.status === 'suspended'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {member.status === 'active'
                            ? 'Hoạt động'
                            : member.status === 'suspended'
                            ? 'Tạm dừng'
                            : 'Hết hạn'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-700">Chưa có dữ liệu hội viên CRM</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Bắt đầu đăng ký hội viên đầu tiên để theo dõi dữ liệu.
                      </p>
                      <Link
                        href="/dashboard/members/create"
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Đăng ký hội viên ngay</span>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: ERP Shortcuts (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Lối tắt vận hành ERP
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Truy cập nhanh các nghiệp vụ quản trị hàng ngày
            </p>

            <div className="space-y-2">
              <Link
                href="/dashboard/check-in"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                      Quầy tiếp tân và điểm danh
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Điểm danh thẻ và trừ buổi tự động
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>

              <Link
                href="/dashboard/plans"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                      Gói tập và bảng giá
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Cấu hình gói tháng và gói buổi PT
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>

              <Link
                href="/dashboard/workouts"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                      Trạm giáo án PT (3 tầng)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Biên soạn chương trình và gán học viên
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>

              <Link
                href="/dashboard/branches"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                      Quản trị chi nhánh
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mạng lưới cơ sở và phân quyền
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
