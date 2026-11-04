'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ScanLine,
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  LogOut,
  UserCheck,
  Building2,
  CreditCard,
  Calendar,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Phone,
  ShieldCheck,
  User,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CheckInDeskData,
  CheckInResult,
  MemberLookupSummary,
  AttendanceRecord,
  performDeskCheckIn,
  checkOutAttendance,
} from './actions';

interface CheckInDeskProps {
  initialData: CheckInDeskData;
}

export function CheckInDesk({ initialData }: CheckInDeskProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Trạng thái quầy trực
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialData.branches[0]?.id || ''
  );
  const [selectedMethod, setSelectedMethod] = useState<
    'receptionist_manual' | 'desk_qr_scan' | 'turnstile_gate'
  >('receptionist_manual');
  const [lookupInput, setLookupInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);

  // Bộ lọc bảng nhật ký
  const [filterLogQuery, setFilterLogQuery] = useState<string>('');
  const [filterLogTimeTab, setFilterLogTimeTab] = useState<'today' | 'in_gym' | 'all'>('today');
  const [filterLogBranchId, setFilterLogBranchId] = useState<string>('');

  // Danh sách nhật ký điểm danh và KPI cục bộ
  const [recentLogs, setRecentLogs] = useState<AttendanceRecord[]>(initialData.recentLogs);
  const [kpis, setKpis] = useState(initialData.kpis);
  const [checkingOutIds, setCheckingOutIds] = useState<Set<string>>(new Set());

  // Tự động focus vào ô nhập mã khi tải trang
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Đồng bộ khi initialData thay đổi từ server
  useEffect(() => {
    setRecentLogs(initialData.recentLogs);
    setKpis(initialData.kpis);
    if (!selectedBranchId && initialData.branches.length > 0) {
      setSelectedBranchId(initialData.branches[0].id);
    }
  }, [initialData]);

  // Format ngày giờ
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return 'Chưa ghi nhận';
    const d = new Date(isoString);
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} • ${date}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Vô thời hạn';
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Tính thời lượng buổi tập
  const calculateDuration = (startIso: string, endIso?: string | null) => {
    const start = new Date(startIso).getTime();
    const end = endIso ? new Date(endIso).getTime() : Date.now();
    const diffMins = Math.max(0, Math.floor((end - start) / (1000 * 60)));

    if (diffMins < 60) {
      return `${diffMins} phút`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours} giờ ${mins} phút`;
  };

  // Lọc danh sách gợi ý hội viên tức thì
  const filteredSuggestions: MemberLookupSummary[] = React.useMemo(() => {
    const term = lookupInput.trim().toLowerCase();
    if (!term) {
      // Khi ô nhập trống, gợi ý 5 hội viên gần nhất
      return initialData.members.slice(0, 5);
    }
    return initialData.members
      .filter(
        (m) =>
          m.member_code.toLowerCase().includes(term) ||
          m.full_name.toLowerCase().includes(term) ||
          m.phone.includes(term)
      )
      .slice(0, 6);
  }, [lookupInput, initialData.members]);

  // Thực hiện điểm danh
  const handlePerformCheckIn = async (codeToUse?: string) => {
    const query = (codeToUse || lookupInput).trim();
    if (!query) {
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setCheckInResult(null);

    const res = await performDeskCheckIn({
      lookupInput: query,
      branchId: selectedBranchId || undefined,
      method: selectedMethod,
    });

    setIsSubmitting(false);
    setCheckInResult(res);

    if (res.success) {
      // Cập nhật ngay danh sách nhật ký điểm danh hiển thị
      const targetBranch = initialData.branches.find((b) => b.id === selectedBranchId);
      const newRecord: AttendanceRecord = {
        id: res.attendance_id || `temp-${Date.now()}`,
        member_id: res.member?.id || '',
        member_code: res.member?.member_code || query,
        full_name: res.member?.full_name || 'Hội viên',
        phone: res.member?.phone || '',
        branch_id: selectedBranchId,
        branch_name: targetBranch?.name || 'Chi nhánh quầy',
        membership_id: res.membership?.id || null,
        plan_name: res.membership?.plan_name || 'Gói tập',
        check_in_at: res.check_in_at || new Date().toISOString(),
        check_out_at: null,
        method: selectedMethod,
      };

      setRecentLogs((prev) => [newRecord, ...prev]);
      setKpis((prev) => ({
        ...prev,
        todayCheckIns: prev.todayCheckIns + 1,
        activeInGym: prev.activeInGym + 1,
      }));

      // Xóa ô nhập sau khi điểm danh thành công
      setLookupInput('');
      inputRef.current?.focus();

      // Làm mới dữ liệu nền
      startTransition(() => {
        router.refresh();
      });
    }
  };

  // Thực hiện ghi nhận ra về (Check-out)
  const handleCheckOut = async (attendanceId: string) => {
    setCheckingOutIds((prev) => new Set(prev).add(attendanceId));

    const res = await checkOutAttendance(attendanceId);

    setCheckingOutIds((prev) => {
      const next = new Set(prev);
      next.delete(attendanceId);
      return next;
    });

    if (res.success) {
      const nowIso = new Date().toISOString();
      setRecentLogs((prev) =>
        prev.map((log) => (log.id === attendanceId ? { ...log, check_out_at: nowIso } : log))
      );
      setKpis((prev) => ({
        ...prev,
        activeInGym: Math.max(0, prev.activeInGym - 1),
      }));

      startTransition(() => {
        router.refresh();
      });
    }
  };

  // Lọc bảng nhật ký điểm danh theo các tiêu chí
  const filteredLogs = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return recentLogs.filter((log) => {
      // 1. Lọc theo từ khóa tìm kiếm
      if (filterLogQuery.trim()) {
        const term = filterLogQuery.trim().toLowerCase();
        const matchName = log.full_name.toLowerCase().includes(term);
        const matchCode = log.member_code.toLowerCase().includes(term);
        const matchPhone = log.phone.includes(term);
        if (!matchName && !matchCode && !matchPhone) return false;
      }

      // 2. Lọc theo chi nhánh
      if (filterLogBranchId && log.branch_id !== filterLogBranchId) {
        return false;
      }

      // 3. Lọc theo tab thời gian
      if (filterLogTimeTab === 'in_gym') {
        return log.check_out_at === null;
      }

      if (filterLogTimeTab === 'today') {
        const logDate = new Date(log.check_in_at);
        return (
          logDate.getFullYear() === today.getFullYear() &&
          logDate.getMonth() === today.getMonth() &&
          logDate.getDate() === today.getDate()
        );
      }

      return true;
    });
  }, [recentLogs, filterLogQuery, filterLogBranchId, filterLogTimeTab]);

  return (
    <div className="space-y-6">
      {/* 4 Thẻ KPI Điểm Danh Tabular-nums */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Lượt điểm danh hôm nay */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Lượt điểm danh hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {kpis.todayCheckIns.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">lượt vào</span>
          </div>
        </div>

        {/* KPI 2: Đang tập trong phòng */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đang tập trong phòng</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-indigo-600 tabular-nums">
              {kpis.activeInGym.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">hội viên</span>
          </div>
        </div>

        {/* KPI 3: Hội viên đủ điều kiện */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Hội viên đủ điều kiện</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {kpis.eligibleMembers.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">thẻ hợp lệ</span>
          </div>
        </div>

        {/* KPI 4: Thẻ sắp hết hạn */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Thẻ sắp hết hạn</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
              {kpis.expiringSoonMembers.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">cần gia hạn</span>
          </div>
        </div>
      </div>

      {/* Bố cục Chia 2 Cột Trực Quan (Split-Desk Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (5/12): Trạm Quét Mã và Tra Cứu Tức Thì */}
        <div className="lg:col-span-5 space-y-5">
          {/* Hộp điều khiển điểm danh chính */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header hộp điểm danh */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <ScanLine className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Trạm tra cứu và điểm danh
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Tốc độ xử lý dưới 300ms với RPC rpc_check_in_member
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Trực tuyến</span>
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Chọn chi nhánh trực quầy và phương thức */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Chi nhánh trực quầy
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    {initialData.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                    {initialData.branches.length === 0 && (
                      <option value="">Cơ sở chính</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Phương thức ghi nhận
                  </label>
                  <select
                    value={selectedMethod}
                    onChange={(e) =>
                      setSelectedMethod(
                        e.target.value as 'receptionist_manual' | 'desk_qr_scan' | 'turnstile_gate'
                      )
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="receptionist_manual">Lễ tân tra cứu</option>
                    <option value="desk_qr_scan">Quét mã QR tại bàn</option>
                    <option value="turnstile_gate">Cổng kiểm soát</option>
                  </select>
                </div>
              </div>

              {/* Ô nhập tìm kiếm lớn tự động focus */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Mã thẻ hoặc số điện thoại hội viên <span className="text-rose-500">*</span>
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePerformCheckIn();
                  }}
                  className="space-y-3"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={lookupInput}
                      onChange={(e) => setLookupInput(e.target.value)}
                      placeholder="Nhập MEM-XXXXXX hoặc SĐT (VD: 0988...)"
                      disabled={isSubmitting}
                      className="w-full h-12 pl-10 pr-4 rounded-xl text-sm border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium shadow-2xs transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !lookupInput.trim()}
                    className="w-full h-12 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang xác thực thẻ...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Xác nhận điểm danh</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* THẺ KẾT QUẢ XÁC THỰC TỨC THÌ (Live Verification Result Card) */}
              {checkInResult && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {checkInResult.success ? (
                    /* Kết quả THÀNH CÔNG (Xanh lá) */
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-3 shadow-2xs">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>Xác thực thành công — Cho phép vào tập</span>
                        </div>
                        <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          {formatTime(checkInResult.check_in_at)}
                        </span>
                      </div>

                      <div className="bg-white/90 rounded-lg p-3 border border-emerald-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Hội viên:</span>
                          <span className="font-semibold text-slate-900">
                            {checkInResult.member?.full_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Mã thẻ:</span>
                          <span className="font-mono font-medium text-slate-800">
                            {checkInResult.member?.member_code}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Gói tập:</span>
                          <span className="font-medium text-indigo-700">
                            {checkInResult.membership?.plan_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Hạn sử dụng:</span>
                          <span className="font-medium text-slate-700">
                            {formatDate(checkInResult.membership?.end_date)}
                          </span>
                        </div>
                        {checkInResult.membership?.remaining_sessions !== null &&
                          checkInResult.membership?.remaining_sessions !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Số buổi còn lại:</span>
                              <span className="font-semibold text-emerald-700 tabular-nums">
                                {checkInResult.membership.remaining_sessions} buổi
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Dải cảnh báo nếu thẻ sắp hết hạn */}
                      {checkInResult.warning_expiring && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-medium">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Lưu ý tiếp tân: Thẻ của hội viên sắp hết hạn
                            {typeof checkInResult.days_left === 'number' && ` trong ${checkInResult.days_left} ngày`}.
                            Vui lòng tư vấn gia hạn.
                          </span>
                        </div>
                      )}

                      {/* Liên kết xem hồ sơ 360 */}
                      {checkInResult.member?.id && (
                        <div className="pt-1 flex justify-end">
                          <Link
                            href={`/dashboard/members/${checkInResult.member.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                          >
                            <span>Xem hồ sơ hội viên 360°</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Kết quả TỪ CHỐI (Đỏ) */
                    <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 space-y-3 shadow-2xs">
                      <div className="flex items-start gap-2 text-rose-800 font-semibold text-sm">
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span>Từ chối điểm danh</span>
                          <p className="text-xs font-normal text-rose-700 mt-0.5">
                            {checkInResult.message}
                          </p>
                        </div>
                      </div>

                      {checkInResult.member && (
                        <div className="bg-white/90 rounded-lg p-3 border border-rose-100 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Hội viên:</span>
                            <span className="font-semibold text-slate-900">
                              {checkInResult.member.full_name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Mã thẻ:</span>
                            <span className="font-mono text-slate-800">
                              {checkInResult.member.member_code}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Nút hành động mở hồ sơ 360 gia hạn */}
                      {checkInResult.member?.id && (
                        <div className="pt-1">
                          <Link
                            href={`/dashboard/members/${checkInResult.member.id}`}
                            className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Mở hồ sơ 360° để gia hạn gói tập</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DANH SÁCH GỢI Ý HỘI VIÊN TỨC THÌ (Quick Suggestion List) */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                {lookupInput.trim() ? 'Kết quả tìm kiếm nhanh' : 'Gợi ý hội viên gần đây'}
              </span>
              <span className="text-[11px] text-slate-400">
                {filteredSuggestions.length} hội viên
              </span>
            </div>

            {filteredSuggestions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <User className="w-6 h-6 mx-auto text-slate-300" />
                <p>Không tìm thấy hội viên phù hợp với từ khóa.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSuggestions.map((member) => {
                  const initial = member.full_name?.charAt(0)?.toUpperCase() || 'H';
                  return (
                    <div
                      key={member.id}
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {member.full_name}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {member.member_code}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="truncate">{member.phone}</span>
                            <span>•</span>
                            {member.has_valid_membership ? (
                              typeof member.days_left === 'number' && member.days_left <= 7 ? (
                                <span className="text-amber-600 font-medium">
                                  Sắp hết hạn ({member.days_left} ngày)
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-medium truncate">
                                  {member.active_plan_name || 'Thẻ hợp lệ'}
                                </span>
                              )
                            ) : (
                              <span className="text-rose-500 font-medium">Chưa có thẻ</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => handlePerformCheckIn(member.member_code)}
                        className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        <span>Điểm danh</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (7/12): Nhật Ký Điểm Danh và Kiểm Soát Ra Vào */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header và Bộ lọc Nhật ký */}
            <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Nhật ký ra vào theo thời gian thực
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Theo dõi hội viên đang tập luyện và ghi nhận lượt ra về
                    </p>
                  </div>
                </div>

                {/* Nút làm mới danh sách */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    startTransition(() => {
                      router.refresh();
                    });
                  }}
                  disabled={isPending}
                  className="h-8 px-3 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isPending ? 'animate-spin' : ''}`} />
                  <span>Cập nhật</span>
                </Button>
              </div>

              {/* Bộ lọc 3 tầng: Tìm kiếm + Tab thời gian + Chi nhánh */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                {/* Ô tìm kiếm nhanh trong bảng */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={filterLogQuery}
                    onChange={(e) => setFilterLogQuery(e.target.value)}
                    placeholder="Tìm tên, mã thẻ, SĐT trong nhật ký..."
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Tabs lọc thời gian */}
                <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setFilterLogTimeTab('today')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      filterLogTimeTab === 'today'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterLogTimeTab('in_gym')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      filterLogTimeTab === 'in_gym'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Đang tập ({kpis.activeInGym})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterLogTimeTab('all')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      filterLogTimeTab === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả
                  </button>
                </div>

                {/* Dropdown lọc theo chi nhánh */}
                {initialData.branches.length > 1 && (
                  <select
                    value={filterLogBranchId}
                    onChange={(e) => setFilterLogBranchId(e.target.value)}
                    className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none shrink-0"
                  >
                    <option value="">Tất cả cơ sở</option>
                    {initialData.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Bảng dữ liệu điểm danh */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Hội viên</th>
                    <th className="py-3 px-4">Gói tập và Cơ sở</th>
                    <th className="py-3 px-4">Thời gian vào / ra</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-medium text-slate-600">
                          Chưa có lượt điểm danh nào phù hợp
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Hãy sử dụng trạm tra cứu bên trái để ghi nhận lượt vào tập đầu tiên.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isStillInGym = log.check_out_at === null;
                      const isCheckingOut = checkingOutIds.has(log.id);

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Cột 1: Thông tin hội viên */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {log.member_id ? (
                                <Link
                                  href={`/dashboard/members/${log.member_id}`}
                                  className="hover:text-indigo-600 transition-colors"
                                >
                                  {log.full_name}
                                </Link>
                              ) : (
                                <span>{log.full_name}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                              <span>{log.member_code}</span>
                              {log.phone && (
                                <>
                                  <span>•</span>
                                  <span>{log.phone}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Cột 2: Gói tập và cơ sở */}
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800">{log.plan_name}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span>{log.branch_name}</span>
                              <span>•</span>
                              <span className="capitalize">
                                {log.method === 'receptionist_manual'
                                  ? 'Tiếp tân'
                                  : log.method === 'desk_qr_scan'
                                  ? 'QR bàn'
                                  : 'Cổng'}
                              </span>
                            </div>
                          </td>

                          {/* Cột 3: Giờ vào / ra */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Vào: {formatTime(log.check_in_at)}</span>
                            </div>

                            <div className="mt-1">
                              {isStillInGym ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Đang tập ({calculateDuration(log.check_in_at)})</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-500">
                                  Ra: {formatTime(log.check_out_at)} ({calculateDuration(log.check_in_at, log.check_out_at)})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Cột 4: Thao tác */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isStillInGym && (
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={isCheckingOut}
                                  onClick={() => handleCheckOut(log.id)}
                                  className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors"
                                >
                                  {isCheckingOut ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <LogOut className="w-3 h-3 text-slate-500" />
                                  )}
                                  <span>Ghi nhận ra về</span>
                                </Button>
                              )}

                              {log.member_id && (
                                <Link
                                  href={`/dashboard/members/${log.member_id}`}
                                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
                                  title="Xem hồ sơ 360°"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Chân trang bảng nhật ký */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 px-4">
              <span>Hiển thị {filteredLogs.length} lượt điểm danh gần nhất</span>
              <span className="font-mono text-[11px]">Hệ thống điểm danh GymOS v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

