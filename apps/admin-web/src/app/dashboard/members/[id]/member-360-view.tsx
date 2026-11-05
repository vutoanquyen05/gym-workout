'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Member360Profile,
  updateMemberProfile,
  renewOrAddMembership,
  updateSubscriptionStatus,
  recordBodyMeasurement,
  quickCheckInMember,
  updateMemberStatus,
} from '../actions';
import { QRCodeSVG } from 'qrcode.react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  CreditCard,
  History,
  Activity,
  ScanLine,
  Phone,
  Mail,
  Building2,
  Dumbbell,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  RefreshCw,
  Scale,
  HeartPulse,
  Flame,
  Pause,
  Play,
  XCircle,
  TrendingUp,
  Receipt,
  FileText,
  UserCheck,
} from 'lucide-react';

interface Member360ViewProps {
  initialData: Member360Profile;
}

export function Member360View({ initialData }: Member360ViewProps) {
  const [data, setData] = useState<Member360Profile>(initialData);
  const [activeTab, setActiveTab] = useState<'memberships' | 'payments' | 'attendance' | 'inbody'>('memberships');
  const [isPending, startTransition] = useTransition();
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [showMeasureForm, setShowMeasureForm] = useState(false);

  const { member, memberships, transactions, attendanceLogs, bodyMeasurements, workoutPrograms, branches, plans, trainers } = data;

  const isActive = member.status === 'active';
  const initials = (member.full_name || 'HV')
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  // Thống kê nhanh InBody mới nhất
  const latestMeasure = bodyMeasurements.length > 0 ? bodyMeasurements[0] : null;

  // Dữ liệu tiến độ InBody cho biểu đồ Recharts
  const inbodyChartData = React.useMemo(() => {
    return [...bodyMeasurements]
      .sort((a, b) => new Date((a.measured_at || a.created_at)).getTime() - new Date((b.measured_at || b.created_at)).getTime())
      .map((m) => {
        const d = new Date((m.measured_at || m.created_at));
        return {
          date: `${d.getDate()}/${d.getMonth() + 1}`,
          fullDate: d.toLocaleDateString('vi-VN'),
          weight: m.weight_kg,
          bodyFat: m.body_fat_pct,
          muscle: m.skeletal_muscle_kg,
        };
      });
  }, [bodyMeasurements]);
  const bmi =
    latestMeasure && latestMeasure.height_cm && latestMeasure.weight_kg
      ? (latestMeasure.weight_kg / Math.pow(latestMeasure.height_cm / 100, 2)).toFixed(1)
      : null;

  // Thống kê tài chính
  const totalSpent = transactions
    .filter((t) => t.payment_status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // 1. Điểm danh nhanh 1 chạm
  const handleQuickCheckIn = () => {
    setActionAlert(null);
    startTransition(async () => {
      const res = await quickCheckInMember(member.id, member.member_code, member.home_branch_id);
      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
        toast.error(res.error);
      } else {
        const msg = res?.message || 'Đã ghi nhận điểm danh hội viên thành công.';
        setActionAlert({ type: 'success', message: msg });
        toast.success(msg);
      }
    });
  };

  // 2. Chuyển đổi trạng thái hồ sơ hội viên
  const handleToggleMemberStatus = () => {
    const nextStatus = isActive ? 'suspended' : 'active';
    const actionLabel = isActive ? 'tạm ngưng' : 'kích hoạt lại';
    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} hồ sơ hội viên này?`)) return;

    setActionAlert(null);
    startTransition(async () => {
      const res = await updateMemberStatus(member.id, nextStatus);
      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
        toast.error(res.error);
      } else {
        const msg = `Đã ${actionLabel} hồ sơ thành công.`;
        setActionAlert({ type: 'success', message: msg });
        toast.success(msg);
        setData((prev) => ({
          ...prev,
          member: { ...prev.member, status: nextStatus },
        }));
      }
    });
  };

  // 3. Cập nhật trạng thái thẻ tập (Bảo lưu, mở lại, hủy)
  const handleToggleSubscription = (membershipId: string, currentStatus: string) => {
    let nextStatus: 'active' | 'paused' | 'cancelled' = 'paused';
    let label = 'bảo lưu';

    if (currentStatus === 'paused') {
      nextStatus = 'active';
      label = 'kích hoạt lại';
    } else if (currentStatus === 'active') {
      nextStatus = 'paused';
      label = 'bảo lưu';
    } else {
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn ${label} thẻ tập này?`)) return;

    setActionAlert(null);
    startTransition(async () => {
      const res = await updateSubscriptionStatus(membershipId, member.id, nextStatus);
      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
        toast.error(res.error);
      } else {
        const msg = `Đã ${label} thẻ tập thành công.`;
        setActionAlert({ type: 'success', message: msg });
        toast.success(msg);
        setData((prev) => ({
          ...prev,
          memberships: prev.memberships.map((m) =>
            m.id === membershipId ? { ...m, status: nextStatus } : m
          ),
        }));
      }
    });
  };

  // 4. Submit form cập nhật hồ sơ
  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionAlert(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateMemberProfile(member.id, formData);
      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
        toast.error(res.error);
      } else {
        setActionAlert({ type: 'success', message: 'Đã cập nhật hồ sơ hội viên thành công.' });
        toast.success('Đã cập nhật hồ sơ hội viên thành công.');
      }
    });
  };

  // 5. Submit form gia hạn thẻ
  const handleRenewMembership = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionAlert(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await renewOrAddMembership(member.id, formData);
      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
        toast.error(res.error);
      } else {
        setActionAlert({ type: 'success', message: 'Đã kích hoạt gia hạn gói tập thành công.' });
        toast.success('Đã kích hoạt gia hạn gói tập thành công.');
        setShowRenewForm(false);
      }
    });
  };

  // 6. Submit form InBody
  const handleRecordMeasurement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionAlert(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await recordBodyMeasurement(member.id, formData);
      if (res?.error) {
        setActionAlert({ type: 'error', message: res.error });
        toast.error(res.error);
      } else {
        setActionAlert({ type: 'success', message: 'Đã lưu chỉ số InBody thành công.' });
        toast.success('Đã lưu chỉ số InBody thành công.');
        setShowMeasureForm(false);
      }
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh bạ hội viên</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">ID: {member.id}</span>
      </div>

      {/* Alert thông báo thao tác */}
      {actionAlert && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between shadow-xs ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{actionAlert.message}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="text-xs font-semibold underline hover:opacity-75"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Hero Card: Hồ sơ tóm tắt định danh hội viên 360° */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar & Personal Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {member.full_name}
                </h1>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {member.member_code}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                </span>
              </div>

              {/* Meta tags */}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-medium">{member.phone}</span>
                </span>
                {member.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{member.email}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.home_branch?.name || 'Chưa phân bổ chi nhánh'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {member.assigned_pt
                      ? `PT: ${member.assigned_pt.full_name}`
                      : 'Tự luyện tập'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Primary Fast Actions & Real QR Code */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Mã QR Thẻ Hội Viên Thật */}
            <div className="hidden sm:flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <QRCodeSVG
                  value={`gymos://member/${member.member_code}`}
                  size={64}
                  level="M"
                />
              </div>
              <div className="text-left space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Mã QR Hội viên
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 block">
                  {member.member_code}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium block">
                  Quét tại quầy tiếp tân
                </span>
              </div>
            </div>
            <button
              onClick={handleQuickCheckIn}
              disabled={isPending || !isActive}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs whitespace-nowrap disabled:opacity-50"
            >
              <ScanLine className="w-4 h-4 text-emerald-600" />
              <span>Điểm danh nhanh</span>
            </button>

            <button
              onClick={handleToggleMemberStatus}
              disabled={isPending}
              className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold border transition-colors shadow-xs whitespace-nowrap disabled:opacity-50 ${
                isActive
                  ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isActive ? 'Tạm ngưng hồ sơ' : 'Kích hoạt lại'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('memberships')}
          className={`flex items-center gap-2 h-11 px-5 rounded-t-xl text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'memberships'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Thẻ tập và hồ sơ cá nhân</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
            {memberships.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 h-11 px-5 rounded-t-xl text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Lịch sử thanh toán</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
            {transactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 h-11 px-5 rounded-t-xl text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Nhật ký điểm danh</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
            {attendanceLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inbody')}
          className={`flex items-center gap-2 h-11 px-5 rounded-t-xl text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'inbody'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Chỉ số InBody và giáo án</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
            {bodyMeasurements.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT 1: Thẻ tập & Hồ sơ cá nhân */}
      {activeTab === 'memberships' && (
        <div className="space-y-6">
          {/* Sub-section 1: Danh sách thẻ tập */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Hợp đồng thẻ tập và gói buổi
                </h3>
                <p className="text-xs text-slate-500">
                  Toàn bộ các gói tập hội viên đã đăng ký hoặc đang sử dụng
                </p>
              </div>
              <button
                onClick={() => setShowRenewForm(!showRenewForm)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showRenewForm ? 'Đóng biểu mẫu' : 'Gia hạn gói tập tại quầy'}</span>
              </button>
            </div>

            {/* Form Gia Hạn / Đăng ký thêm gói tập */}
            {showRenewForm && (
              <form
                onSubmit={handleRenewMembership}
                className="p-6 bg-indigo-50/40 border-b border-indigo-100 space-y-4"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Kích hoạt gia hạn hoặc đăng ký gói mới</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Chọn gói tập <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="plan_id"
                      required
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Chọn gói tập --</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.price.toLocaleString('vi-VN')} ₫ ({p.duration_days} ngày)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Ngày bắt đầu kích hoạt
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Phương thức thanh toán
                    </label>
                    <select
                      name="payment_method"
                      defaultValue="cash"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="cash">Tiền mặt tại quầy</option>
                      <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                      <option value="card">Thẻ POS / Quẹt thẻ</option>
                      <option value="other">Phương thức khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Số tiền thực thu (₫, để trống nếu thu đúng giá niêm yết)
                    </label>
                    <input
                      type="number"
                      name="custom_amount"
                      placeholder="Mặc định theo giá gói..."
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Ghi chú gia hạn / Hóa đơn
                    </label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="Ví dụ: Giảm giá khai xuân, khách quen..."
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRenewForm(false)}
                    className="h-9 px-4 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="h-9 px-5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs disabled:opacity-50"
                  >
                    {isPending ? 'Đang kích hoạt...' : 'Kích hoạt thẻ ngay'}
                  </button>
                </div>
              </form>
            )}

            {/* Bảng danh sách thẻ tập */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Gói tập</th>
                    <th className="px-4 py-3">Thời hạn</th>
                    <th className="px-4 py-3">Số buổi còn lại</th>
                    <th className="px-4 py-3">Trạng thái thẻ</th>
                    <th className="px-4 py-3">Ghi chú</th>
                    <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memberships.length > 0 ? (
                    memberships.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-slate-900">
                          {m.plan?.name || 'Gói tập hội viên'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {new Date(m.start_date).toLocaleDateString('vi-VN')} đến{' '}
                          <span className="font-semibold text-slate-800">
                            {new Date(m.end_date).toLocaleDateString('vi-VN')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          {m.remaining_sessions !== null && m.remaining_sessions !== undefined ? (
                            <span className="font-semibold text-indigo-600">
                              {m.remaining_sessions} buổi
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Không giới hạn</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              m.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : m.status === 'paused'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                m.status === 'active'
                                  ? 'bg-emerald-500'
                                  : m.status === 'paused'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {m.status === 'active'
                              ? 'Hiệu lực'
                              : m.status === 'paused'
                              ? 'Bảo lưu'
                              : m.status === 'expired'
                              ? 'Hết hạn'
                              : 'Đã hủy'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 truncate max-w-xs">
                          {m.notes || <span className="text-slate-300 italic">Không có</span>}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {m.status === 'active' && (
                            <button
                              onClick={() => handleToggleSubscription(m.id, 'active')}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                            >
                              <Pause className="w-3 h-3" />
                              <span>Bảo lưu</span>
                            </button>
                          )}
                          {m.status === 'paused' && (
                            <button
                              onClick={() => handleToggleSubscription(m.id, 'paused')}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <Play className="w-3 h-3" />
                              <span>Mở lại</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        Chưa có hợp đồng thẻ tập nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-section 2: Form Cập nhật Hồ sơ Cá nhân & Gán PT */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Thông tin chi tiết hồ sơ hội viên
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Cập nhật thông tin liên hệ, cơ sở phụ trách, huấn luyện viên PT và ghi chú y tế
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Họ và tên hội viên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    defaultValue={member.full_name}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    defaultValue={member.phone}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Địa chỉ email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={member.email || ''}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    defaultValue={member.gender || 'male'}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    defaultValue={member.date_of_birth || ''}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Cơ sở trực thuộc
                  </label>
                  <select
                    name="home_branch_id"
                    defaultValue={member.home_branch_id || ''}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="">-- Chưa phân bổ --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Huấn luyện viên phụ trách (PT)
                  </label>
                  <select
                    name="assigned_pt_id"
                    defaultValue={member.assigned_pt_id || ''}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="">-- Tự luyện tập --</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} {t.specialty ? `(${t.specialty})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Địa chỉ thường trú
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={member.address || ''}
                    placeholder="Số nhà, đường, quận/huyện..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Liên hệ người thân khi khẩn cấp
                  </label>
                  <input
                    type="text"
                    name="emergency_contact"
                    defaultValue={member.emergency_contact || ''}
                    placeholder="Họ tên - Số điện thoại..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Ghi chú bệnh lý hoặc tình trạng thể lực
                </label>
                <textarea
                  name="health_notes"
                  rows={2}
                  defaultValue={member.health_notes || ''}
                  placeholder="Tiền sử chấn thương, huyết áp, dị ứng..."
                  className="w-full p-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-10 px-6 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs disabled:opacity-50"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu hồ sơ hội viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Lịch sử thanh toán */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Financial summary KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Tổng chi tiêu tích lũy
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
                {totalSpent.toLocaleString('vi-VN')} <span className="text-base text-slate-500">₫</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Tổng số giao dịch
              </span>
              <div className="text-2xl font-bold text-indigo-600 mt-2 tabular-nums">
                {transactions.length} hóa đơn
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Trạng thái tài chính
              </span>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mt-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Không có công nợ tồn đọng</span>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-sm font-semibold text-slate-900">
                Lịch sử hóa đơn thanh toán tại quầy
              </h3>
              <p className="text-xs text-slate-500">
                Toàn bộ các giao dịch tiền mặt, chuyển khoản và thẻ POS được lưu trữ
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Mã hóa đơn</th>
                    <th className="px-4 py-3">Thời gian thanh toán</th>
                    <th className="px-4 py-3">Số tiền</th>
                    <th className="px-4 py-3">Phương thức</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-6 py-3">Nội dung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length > 0 ? (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">
                          {t.invoice_code}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {new Date(t.paid_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900 text-xs">
                          {Number(t.amount).toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {t.payment_method === 'cash'
                              ? 'Tiền mặt'
                              : t.payment_method === 'bank_transfer'
                              ? 'Chuyển khoản'
                              : t.payment_method === 'card'
                              ? 'Thẻ POS'
                              : 'Khác'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              t.payment_status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {t.payment_status === 'completed' ? 'Hoàn thành' : t.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 truncate max-w-xs">
                          {t.notes || <span className="text-slate-300 italic">Không có</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        Chưa có lịch sử thanh toán nào cho hội viên này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Nhật ký điểm danh */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Nhật ký ra vào phòng tập
                </h3>
                <p className="text-xs text-slate-500">
                  Lịch sử điểm danh qua quầy tiếp tân hoặc mã định danh hội viên
                </p>
              </div>
              <button
                onClick={handleQuickCheckIn}
                disabled={isPending || !isActive}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Điểm danh lượt mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Thời điểm điểm danh</th>
                    <th className="px-4 py-3">Cơ sở tập luyện</th>
                    <th className="px-4 py-3">Phương thức xác thực</th>
                    <th className="px-6 py-3">Thời điểm rời quầy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceLogs.length > 0 ? (
                    attendanceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-slate-900">
                          {new Date(log.check_in_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">
                          {log.branch?.name || member.home_branch?.name || 'Chi nhánh mặc định'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>
                              {log.method === 'receptionist_manual'
                                ? 'Lễ tân tại quầy'
                                : log.method === 'desk_qr_scan'
                                ? 'Quét mã QR'
                                : 'Cổng kiểm soát'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                          {log.check_out_at
                            ? new Date(log.check_out_at).toLocaleTimeString('vi-VN')
                            : 'Chưa check-out'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                        Chưa có lượt điểm danh nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Chỉ số InBody & Giáo án */}
      {activeTab === 'inbody' && (
        <div className="space-y-6">
          {/* 4 InBody Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cân nặng
                </span>
                <Scale className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {latestMeasure ? latestMeasure.weight_kg : '--'}
                </span>
                <span className="text-xs font-semibold text-slate-500">kg</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tỷ lệ mỡ (Body Fat)
                </span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {latestMeasure?.body_fat_pct ? latestMeasure.body_fat_pct : '--'}
                </span>
                <span className="text-xs font-semibold text-slate-500">%</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Khối lượng cơ (Muscle)
                </span>
                <Dumbbell className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {latestMeasure?.skeletal_muscle_kg ? latestMeasure.skeletal_muscle_kg : '--'}
                </span>
                <span className="text-xs font-semibold text-slate-500">kg</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Chỉ số BMI
                </span>
                <HeartPulse className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {bmi || '--'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {bmi
                    ? Number(bmi) < 18.5
                      ? '(Gầy)'
                      : Number(bmi) < 24.9
                      ? '(Chuẩn)'
                      : '(Thừa cân)'
                    : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Biểu đồ biến thiên chỉ số InBody (Recharts) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Biểu đồ biến thiên chỉ số InBody
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi tiến độ thay đổi cân nặng (kg), tỷ lệ mỡ (%) và khối lượng cơ xương (kg)
                </p>
              </div>
              {/* Chú giải màu sắc */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="text-slate-700">Cân nặng (kg)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-slate-700">Cơ xương (kg)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-700">Tỷ lệ mỡ (%)</span>
                </div>
              </div>
            </div>

            {inbodyChartData.length >= 2 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={inbodyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="muscleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                              <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1">
                                Ngày đo: {item.fullDate}
                              </div>
                              <div className="text-indigo-300 flex justify-between gap-4">
                                <span>Cân nặng:</span>
                                <span className="font-bold">{item.weight} kg</span>
                              </div>
                              {item.muscle && (
                                <div className="text-emerald-300 flex justify-between gap-4">
                                  <span>Khối lượng cơ:</span>
                                  <span className="font-bold">{item.muscle} kg</span>
                                </div>
                              )}
                              {item.bodyFat && (
                                <div className="text-amber-300 flex justify-between gap-4">
                                  <span>Tỷ lệ mỡ:</span>
                                  <span className="font-bold">{item.bodyFat}%</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#weightGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="muscle"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#muscleGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-slate-600">Chưa đủ dữ liệu để dựng biểu đồ tiến độ</p>
                <p className="text-slate-400 mt-0.5">
                  Cần tối thiểu 2 lần đo chỉ số InBody khác ngày để hệ thống tự động vẽ biểu đồ xu hướng.
                </p>
              </div>
            )}
          </div>

          {/* Form Ghi nhận số đo mới */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Nhật ký cân đo chỉ số InBody
                </h3>
                <p className="text-xs text-slate-500">
                  Theo dõi sự thay đổi hình thể và tỷ lệ cơ mỡ theo thời gian
                </p>
              </div>
              <button
                onClick={() => setShowMeasureForm(!showMeasureForm)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showMeasureForm ? 'Đóng biểu mẫu' : 'Ghi nhận số đo mới'}</span>
              </button>
            </div>

            {showMeasureForm && (
              <form
                onSubmit={handleRecordMeasurement}
                className="p-6 bg-slate-50/60 border-b border-slate-200 space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Ngày cân đo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="measured_at"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Cân nặng (kg) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight_kg"
                      required
                      placeholder="VD: 68.5"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Chiều cao (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      name="height_cm"
                      placeholder="VD: 172"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tỷ lệ mỡ (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="body_fat_pct"
                      placeholder="VD: 18.2"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Khối lượng cơ (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="skeletal_muscle_kg"
                      placeholder="VD: 31.4"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Vòng eo (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      name="waist_cm"
                      placeholder="VD: 78"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Vòng ngực (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      name="chest_cm"
                      placeholder="VD: 94"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Vòng mông (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      name="hip_cm"
                      placeholder="VD: 95"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Ghi chú đánh giá
                  </label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="VD: Đạt mục tiêu giảm 1kg mỡ sau 1 tháng..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMeasureForm(false)}
                    className="h-9 px-4 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="h-9 px-5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs disabled:opacity-50"
                  >
                    {isPending ? 'Đang lưu...' : 'Lưu chỉ số InBody'}
                  </button>
                </div>
              </form>
            )}

            {/* Bảng lịch sử đo */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Ngày đo</th>
                    <th className="px-4 py-3">Cân nặng</th>
                    <th className="px-4 py-3">Tỷ lệ mỡ</th>
                    <th className="px-4 py-3">Khối lượng cơ</th>
                    <th className="px-4 py-3">Số đo 3 vòng (cm)</th>
                    <th className="px-6 py-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bodyMeasurements.length > 0 ? (
                    bodyMeasurements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-slate-900">
                          {new Date(m.measured_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                          {m.weight_kg} kg
                        </td>
                        <td className="px-4 py-3.5 font-mono text-amber-600">
                          {m.body_fat_pct ? `${m.body_fat_pct}%` : '--'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-emerald-600">
                          {m.skeletal_muscle_kg ? `${m.skeletal_muscle_kg} kg` : '--'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">
                          {m.chest_cm || '--'} / {m.waist_cm || '--'} / {m.hip_cm || '--'}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 truncate max-w-xs">
                          {m.notes || <span className="text-slate-300 italic">Không có</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        Chưa có lịch sử đo chỉ số InBody nào cho hội viên này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Khối Giáo án 3 tầng đã gán */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Giáo án huấn luyện đã gán (3 tầng)
                </h3>
                <p className="text-xs text-slate-500">
                  Chương trình tập luyện do PT phụ trách biên soạn và theo dõi
                </p>
              </div>
              <Link
                href="/dashboard/workouts"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Trạm giáo án PT</span>
              </Link>
            </div>

            {workoutPrograms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workoutPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900">
                        {prog.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-700">
                        {prog.difficulty}
                      </span>
                    </div>
                    {prog.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {prog.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Thời lượng: {prog.duration_weeks} tuần</span>
                      <span>•</span>
                      <span>{prog.days_per_week} buổi/tuần</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs">
                <Dumbbell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-medium text-slate-600">Chưa gán giáo án huấn luyện nào</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Huấn luyện viên phụ trách có thể chọn và gán giáo án mẫu từ Trạm giáo án PT.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

