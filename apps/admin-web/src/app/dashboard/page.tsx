import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().split('T')[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  // Truy vấn song song các chỉ số từ Schema v2.0
  const [
    totalMembersResult,
    activeMembersResult,
    activeMembershipsResult,
    expiringMembershipsResult,
    revenueResult,
    branchesResult,
    plansResult,
    programsResult,
    recentMembersResult,
  ] = await Promise.all([
    supabase.from('gym_members').select('*', { count: 'exact', head: true }),
    supabase.from('gym_members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('end_date', today)
      .lte('end_date', in7Days),
    supabase.from('payment_transactions').select('amount').eq('payment_status', 'completed'),
    supabase.from('branches').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('membership_plans').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('workout_programs').select('*', { count: 'exact', head: true }).eq('is_template', true),
    supabase
      .from('gym_members')
      .select('id, member_code, full_name, phone, status, joined_at, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const totalMembers = totalMembersResult.count || 0;
  const activeMembers = activeMembersResult.count || 0;
  const activeMemberships = activeMembershipsResult.count || 0;
  const expiringMemberships = expiringMembershipsResult.count || 0;
  const totalRevenue = (revenueResult.data || []).reduce(
    (acc, row) => acc + (Number(row.amount) || 0),
    0
  );
  const totalBranches = branchesResult.count || 0;
  const totalPlans = plansResult.count || 0;
  const totalTemplates = programsResult.count || 0;
  const recentMembers = recentMembersResult.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Command Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Command Center
              </span>
              <span className="text-xs text-slate-400">• Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Xin chào, {user?.email?.split('@')[0] || 'Quản trị viên'}! 👋
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Trung tâm chỉ huy vận hành chuỗi phòng gym, CRM hội viên 360° và trạm xếp bài tập huấn luyện viên.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <Link
              href="/dashboard/check-in"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <span>⚡ Mở Quầy Check-in</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: CRM Members */}
        <div className="bg-white rounded-xl p-5 shadow-2xs border border-slate-200 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng Hội Viên CRM
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
              👥
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalMembers}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{activeMembers} đang hoạt động</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Memberships */}
        <div className="bg-white rounded-xl p-5 shadow-2xs border border-slate-200 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Thẻ Tập Hiệu Lực
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
              📋
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeMemberships}
            </span>
            <div className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <span>⚠️</span>
              <span>{expiringMemberships} sắp hết hạn (7 ngày tới)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div className="bg-white rounded-xl p-5 shadow-2xs border border-slate-200 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Doanh Thu Thu Ngân
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
              💰
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalRevenue.toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              Giao dịch đã thanh toán
            </span>
          </div>
        </div>

        {/* Card 4: Services & Ecosystem */}
        <div className="bg-white rounded-xl p-5 shadow-2xs border border-slate-200 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hệ Sinh Thái Vận Hành
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
              🏢
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {totalBranches} CS • {totalPlans} Gói
            </span>
            <span className="text-xs text-slate-500 block mt-1 font-medium">
              {totalTemplates} Giáo án PT mẫu (3-Tier)
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent CRM Members */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hội viên CRM Mới Tiếp Nhận
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                5 hồ sơ hội viên đăng ký hoặc kích hoạt gần nhất tại hệ thống
              </p>
            </div>
            <Link
              href="/dashboard/members"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Xem tất cả hội viên →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentMembers.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <span className="text-3xl block">👥</span>
                <p className="text-sm font-medium text-slate-700">Chưa có hội viên nào trong hệ thống</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Hãy tiếp nhận khách hàng đầu tiên bằng cách nhấn nút &quot;+ Đăng ký Hội viên&quot; ở góc trên.
                </p>
                <Link
                  href="/dashboard/members/create"
                  className="inline-block mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  + Tiếp nhận Hội viên Ngay
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Mã thẻ</th>
                    <th className="px-4 py-3">Họ và tên</th>
                    <th className="px-4 py-3">Số điện thoại</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày gia nhập</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">
                        {member.member_code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {member.full_name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {member.phone}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            member.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {member.status === 'active' ? 'Đang tập' : member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {member.joined_at
                          ? new Date(member.joined_at).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Receptionist & PT Operational Shortcuts */}
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Lối Tắt Nghiệp Vụ Vận Hành
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Truy cập nhanh các phân hệ nghiệp vụ hàng ngày:
            </p>

            <div className="space-y-2.5">
              <Link
                href="/dashboard/check-in"
                className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-700">
                      Quầy Điểm danh Nhanh
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Check-in mã thẻ MEM, SĐT hoặc QR
                    </span>
                  </div>
                </div>
                <span className="text-xs text-emerald-600 group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>

              <Link
                href="/dashboard/plans"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📋</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-700">
                      Bảng giá & Gói tập
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Cấu hình gói tháng, gói PT, combo
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>

              <Link
                href="/dashboard/workouts"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏋️</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-700">
                      Trạm Xếp Bài Tập PT
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Biên soạn giáo án 3 tầng & InBody
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>

              <Link
                href="/dashboard/branches"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏢</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-700">
                      Chi nhánh & Cơ sở
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Quản lý mạng lưới chi nhánh phòng tập
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Phiên bản ERP: v2.0 Live</span>
            <Link href="/dashboard/settings" className="hover:text-slate-600 transition-colors">
              Cài đặt hệ thống ⚙️
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
