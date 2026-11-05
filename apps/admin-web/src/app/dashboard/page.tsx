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
  AlertTriangle,
  Receipt,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { DashboardCharts, DailyTrendItem, DashboardSummaryStats } from './dashboard-charts';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Mốc thời gian 7 ngày trước (bắt đầu từ 00:00:00 của 6 ngày trước)
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Truy vấn song song dữ liệu v2.0
  const [
    membersRes,
    activeMembersRes,
    activeMembershipsRes,
    allMembershipsRes,
    allTransactionsRes,
    recentTransactionsRes,
    attendance7dRes,
    branchesRes,
    plansRes,
    staffRes,
    programsRes,
    recentMembersRes,
  ] = await Promise.allSettled([
    // 1. Tổng hội viên
    supabase.from('gym_members').select('*', { count: 'exact', head: true }),
    // 2. Hội viên đang hoạt động
    supabase.from('gym_members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    // 3. Thẻ tập đang hiệu lực
    supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    // 4. Toàn bộ thẻ tập active để tính toán thẻ sắp hết hạn
    supabase
      .from('memberships')
      .select(`
        id,
        member_id,
        plan_id,
        status,
        start_date,
        end_date,
        remaining_sessions,
        member:gym_members(id, full_name, member_code, phone),
        plan:membership_plans(id, name, plan_type)
      `)
      .eq('status', 'active'),
    // 5. Toàn bộ giao dịch completed
    supabase
      .from('payment_transactions')
      .select('id, amount, payment_method, payment_status, created_at')
      .eq('payment_status', 'completed'),
    // 6. 5 giao dịch thu ngân mới nhất
    supabase
      .from('payment_transactions')
      .select(`
        id,
        invoice_code,
        amount,
        payment_method,
        payment_status,
        created_at,
        member:gym_members(id, full_name, member_code),
        membership:memberships(
          plan:membership_plans(name)
        )
      `)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5),
    // 7. Lượt điểm danh trong 7 ngày
    supabase
      .from('attendance_logs')
      .select('id, check_in_at')
      .gte('check_in_at', sevenDaysAgo.toISOString()),
    // 8. Chi nhánh hoạt động
    supabase.from('branches').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    // 9. Gói tập đang mở bán
    supabase.from('membership_plans').select('*', { count: 'exact', head: true }).eq('is_active', true),
    // 10. Nhân sự HLV active
    supabase.from('gym_staff').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    // 11. Giáo án 3 tầng
    supabase.from('workout_programs').select('*', { count: 'exact', head: true }),
    // 12. 5 Hội viên mới nhất
    supabase
      .from('gym_members')
      .select(`
        id,
        member_code,
        full_name,
        phone,
        status,
        created_at,
        home_branch:branches(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Xử lý an toàn kết quả trả về
  const totalMembers = membersRes.status === 'fulfilled' ? membersRes.value.count || 0 : 0;
  const activeMembers = activeMembersRes.status === 'fulfilled' ? activeMembersRes.value.count || 0 : 0;
  const activeMemberships = activeMembershipsRes.status === 'fulfilled' ? activeMembershipsRes.value.count || 0 : 0;
  const activeBranches = branchesRes.status === 'fulfilled' ? branchesRes.value.count || 0 : 0;
  const totalPlans = plansRes.status === 'fulfilled' ? plansRes.value.count || 0 : 0;
  const activeStaff = staffRes.status === 'fulfilled' ? staffRes.value.count || 0 : 0;
  const workoutPrograms = programsRes.status === 'fulfilled' ? programsRes.value.count || 0 : 0;

  const allTransactions =
    allTransactionsRes.status === 'fulfilled' ? allTransactionsRes.value.data || [] : [];
  const totalRevenue = allTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const recentTransactions =
    recentTransactionsRes.status === 'fulfilled' ? recentTransactionsRes.value.data || [] : [];
  const recentMembers =
    recentMembersRes.status === 'fulfilled' ? recentMembersRes.value.data || [] : [];
  const attendanceLogs7d =
    attendance7dRes.status === 'fulfilled' ? attendance7dRes.value.data || [] : [];
  const allMemberships =
    allMembershipsRes.status === 'fulfilled' ? allMembershipsRes.value.data || [] : [];

  // ===========================================================================
  // 1. TÍNH TOÁN DANH SÁCH THẺ SẮP HẾT HẠN (CSKH CẢNH BÁO: ≤ 7 ngày hoặc ≤ 2 buổi)
  // ===========================================================================
  const todayDateOnly = new Date();
  todayDateOnly.setHours(0, 0, 0, 0);

  interface ExpiringMembershipItem {
    id: string;
    memberId: string;
    memberName: string;
    memberCode: string;
    phone: string;
    planName: string;
    endDate: string;
    daysLeft: number;
    remainingSessions: number | null;
    alertReason: 'days' | 'sessions';
  }

  const expiringMembershipsList: ExpiringMembershipItem[] = [];

  allMemberships.forEach((m: any) => {
    const member = Array.isArray(m.member) ? m.member[0] : m.member;
    const plan = Array.isArray(m.plan) ? m.plan[0] : m.plan;
    if (!member) return;

    let isExpiring = false;
    let daysLeft = 999;
    let reason: 'days' | 'sessions' = 'days';

    // Kiểm tra theo ngày hết hạn
    if (m.end_date) {
      const expDate = new Date(m.end_date);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - todayDateOnly.getTime();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft >= 0 && daysLeft <= 7) {
        isExpiring = true;
        reason = 'days';
      }
    }

    // Kiểm tra theo số buổi còn lại
    if (m.remaining_sessions !== null && m.remaining_sessions !== undefined) {
      if (m.remaining_sessions > 0 && m.remaining_sessions <= 2) {
        isExpiring = true;
        reason = 'sessions';
      }
    }

    if (isExpiring) {
      expiringMembershipsList.push({
        id: m.id,
        memberId: member.id,
        memberName: member.full_name || 'Hội viên',
        memberCode: member.member_code || 'MEM-000000',
        phone: member.phone || '',
        planName: plan?.name || 'Gói tập',
        endDate: m.end_date ? new Date(m.end_date).toLocaleDateString('vi-VN') : 'Không giới hạn',
        daysLeft,
        remainingSessions: m.remaining_sessions,
        alertReason: reason,
      });
    }
  });

  // ===========================================================================
  // 2. TÍNH TOÁN CHUỖI DỮ LIỆU XU HƯỚNG 7 NGÀY GẦN NHẤT
  // ===========================================================================
  const trendData: DailyTrendItem[] = [];
  let totalRev7d = 0;
  let totalCheckIns7d = attendanceLogs7d.length;

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const dateStr = targetDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const dateLabel = `${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const fullDate = targetDate.toLocaleDateString('vi-VN');

    // Doanh thu trong ngày
    const dayRevenue = allTransactions
      .filter((t) => t.created_at && t.created_at.startsWith(dateStr))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // Điểm danh trong ngày
    const dayCheckIns = attendanceLogs7d.filter(
      (a) => a.check_in_at && a.check_in_at.startsWith(dateStr)
    ).length;

    totalRev7d += dayRevenue;

    trendData.push({
      dateLabel,
      fullDate,
      revenue: dayRevenue,
      checkIns: dayCheckIns,
    });
  }

  const summaryStats: DashboardSummaryStats = {
    totalMembers,
    activeMembers,
    activeMemberships,
    expiringMemberships: expiringMembershipsList.length,
    totalPlans,
    activeStaff,
    workoutPrograms,
    totalCheckIns7d,
    totalRevenue7d: totalRev7d,
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Enterprise Page Header */}
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
            Giám sát thời gian thực: thẻ hội viên, dòng tiền giao dịch, lưu lượng điểm danh và giáo án PT.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/dashboard/check-in"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs whitespace-nowrap"
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
            <span>Điểm danh nhanh</span>
          </Link>

          <Link
            href="/dashboard/members/create"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng ký hội viên</span>
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
              {totalRevenue.toLocaleString('vi-VN')}{' '}
              <span className="text-base font-semibold text-slate-500">₫</span>
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

      {/* Recharts Interactive Executive Charts Section */}
      <DashboardCharts trendData={trendData} summaryStats={summaryStats} />

      {/* Main Grid: Data Feeds & Operation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent CRM Members & Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Recent CRM Members */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
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
                    recentMembers.map((member: any) => (
                      <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                          <Link
                            href={`/dashboard/members/${member.id}`}
                            className="hover:text-indigo-600 transition-colors"
                          >
                            {member.member_code}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          <Link
                            href={`/dashboard/members/${member.id}`}
                            className="hover:text-indigo-600 transition-colors"
                          >
                            {member.full_name}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono">
                          {member.phone || <span className="text-slate-400 italic">Chưa có SĐT</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {Array.isArray(member.home_branch) && member.home_branch[0]?.name
                            ? member.home_branch[0].name
                            : member.home_branch?.name || (
                                <span className="text-slate-400 italic">Chi nhánh mặc định</span>
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
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Giao dịch thu ngân gần nhất (payment_transactions) */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Giao dịch thu ngân mới nhất
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  5 biên nhận thanh toán POS và chuyển khoản gần nhất
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>payment_transactions</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Mã hóa đơn</th>
                    <th className="px-5 py-3">Hội viên</th>
                    <th className="px-5 py-3">Phương thức</th>
                    <th className="px-5 py-3 text-right">Số tiền (VNĐ)</th>
                    <th className="px-5 py-3 text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions && recentTransactions.length > 0 ? (
                    recentTransactions.map((tx: any) => {
                      const member = Array.isArray(tx.member) ? tx.member[0] : tx.member;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-semibold text-indigo-600">
                            {tx.invoice_code || `INV-${tx.id.substring(0, 8)}`}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-900">
                            {member ? (
                              <Link
                                href={`/dashboard/members/${member.id}`}
                                className="hover:text-indigo-600 transition-colors"
                              >
                                {member.full_name}
                              </Link>
                            ) : (
                              <span className="text-slate-400 italic">Khách vãng lai</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                              {tx.payment_method === 'cash'
                                ? 'Tiền mặt'
                                : tx.payment_method === 'bank_transfer'
                                ? 'Chuyển khoản'
                                : tx.payment_method === 'pos'
                                ? 'Thẻ POS'
                                : tx.payment_method}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                            {Number(tx.amount || 0).toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-500 text-[11px]">
                            {new Date(tx.created_at).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        Chưa có giao dịch thu ngân nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Alerts & ERP Shortcuts */}
        <div className="space-y-6">
          {/* Card: Thẻ sắp hết hạn cần CSKH */}
          <div className="bg-white rounded-xl border border-amber-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-amber-50/60 border-b border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-amber-950">
                  Cảnh báo thẻ sắp hết hạn
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-200/70 text-amber-900">
                {expiringMembershipsList.length}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {expiringMembershipsList.length > 0 ? (
                expiringMembershipsList.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/20 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/dashboard/members/${item.memberId}`}
                          className="font-bold text-xs text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {item.memberName}
                        </Link>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.memberCode} • {item.phone || 'Chưa có SĐT'}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.alertReason === 'sessions'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.alertReason === 'sessions'
                          ? `Còn ${item.remainingSessions} buổi`
                          : `Còn ${item.daysLeft} ngày`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-600 truncate max-w-[160px]">
                        {item.planName}
                      </span>
                      <Link
                        href={`/dashboard/members/${item.memberId}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                      >
                        <span>Gia hạn thẻ</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-slate-700">Tất cả thẻ đều an toàn</p>
                  <p className="text-[11px] text-slate-400">
                    Không có hội viên nào sắp hết hạn trong 7 ngày tới.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card: Lối tắt vận hành ERP */}
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
