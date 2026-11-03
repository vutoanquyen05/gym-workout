'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MemberPlanOption,
  MemberBranchOption,
  MemberTrainerOption,
  registerNewMember,
} from '../actions';
import {
  Users,
  CreditCard,
  Building2,
  Dumbbell,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Save,
  ArrowLeft,
  Receipt,
  HeartPulse,
} from 'lucide-react';

interface CreateMemberFormProps {
  plans: MemberPlanOption[];
  branches: MemberBranchOption[];
  trainers: MemberTrainerOption[];
}

export function CreateMemberForm({
  plans,
  branches,
  trainers,
}: CreateMemberFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Thông tin cá nhân hội viên
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [healthNotes, setHealthNotes] = useState('');

  // 2. Thông tin gói tập & thanh toán POS
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [assignedPtId, setAssignedPtId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card' | 'qr'>('cash');
  const [paidAmount, setPaidAmount] = useState<string>(
    plans[0]?.price ? String(plans[0].price) : ''
  );
  const [paymentNotes, setPaymentNotes] = useState('');

  // Khi thay đổi gói tập, tự động cập nhật số tiền thanh toán
  const handlePlanChange = (selectedPlanId: string) => {
    setPlanId(selectedPlanId);
    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (selectedPlan) {
      setPaidAmount(String(selectedPlan.price));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên hội viên.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại của hội viên.');
      return;
    }

    const formData = new FormData();
    formData.append('fullName', fullName.trim());
    formData.append('phone', phone.trim());
    if (email.trim()) formData.append('email', email.trim());
    formData.append('gender', gender);
    if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
    if (address.trim()) formData.append('address', address.trim());
    if (emergencyContact.trim()) formData.append('emergencyContact', emergencyContact.trim());
    if (healthNotes.trim()) formData.append('healthNotes', healthNotes.trim());

    if (planId) formData.append('planId', planId);
    if (branchId) formData.append('branchId', branchId);
    if (assignedPtId) formData.append('assignedPtId', assignedPtId);
    formData.append('paymentMethod', paymentMethod);
    if (paidAmount) formData.append('paidAmount', paidAmount);
    if (paymentNotes.trim()) formData.append('paymentNotes', paymentNotes.trim());

    startTransition(async () => {
      try {
        const result = await registerNewMember(formData);

        if (result?.error) {
          setErrorMessage(result.error);
        } else if (result?.success) {
          setSuccessMessage(
            `Đăng ký hội viên thành công! Mã thẻ: ${result.memberCode || 'MEM-XXXXXX'}`
          );
          setTimeout(() => {
            router.push('/dashboard/members');
            router.refresh();
          }, 1200);
        } else {
          setErrorMessage('Không nhận được phản hồi xác thực từ máy chủ.');
        }
      } catch (err: unknown) {
        console.error('Registration exception:', err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Đã xảy ra lỗi khi gửi yêu cầu đăng ký.'
        );
      }
    });
  };

  const selectedPlan = plans.find((p) => p.id === planId);
  const selectedBranch = branches.find((b) => b.id === branchId);
  const selectedTrainer = trainers.find((t) => t.id === assignedPtId);
  const parsedPaidAmount = parseInt(paidAmount, 10) || 0;

  const initials = (fullName || 'HV')
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Cột trái: Form đăng ký 2 phân vùng (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Thông tin đăng ký hội viên mới
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Điền thông tin khách hàng và lựa chọn gói tập phát hành tại quầy tiếp tân
              </p>
            </div>
          </div>

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Lỗi đăng ký hội viên:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Thông báo thành công */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Thành công:</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
            {/* PHÂN VÙNG 1: THÔNG TIN CÁ NHÂN HỘI VIÊN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-100">
                  1
                </span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Thông tin cá nhân hội viên
                </h3>
              </div>

              {/* Họ và tên & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block font-medium text-slate-700 mb-1.5">
                    Họ và tên hội viên <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    disabled={isPending}
                    className="w-full text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block font-medium text-slate-700 mb-1.5">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0901234567"
                    disabled={isPending}
                    className="w-full text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              {/* Email & Giới tính & Ngày sinh */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label htmlFor="email" className="block font-medium text-slate-700 mb-1.5">
                    Địa chỉ email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hoivien@email.com"
                    disabled={isPending}
                    className="w-full text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block font-medium text-slate-700 mb-1.5">
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                    disabled={isPending}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block font-medium text-slate-700 mb-1.5">
                    Ngày sinh
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={isPending}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Địa chỉ & Người liên hệ khẩn cấp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address" className="block font-medium text-slate-700 mb-1.5">
                    Địa chỉ thường trú
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="VD: 123 Lê Lợi, Quận 1, TP.HCM"
                    disabled={isPending}
                    className="w-full text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContact" className="block font-medium text-slate-700 mb-1.5">
                    Liên hệ khẩn cấp (Tên và SĐT)
                  </label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="VD: Chị Mai - 0988123456"
                    disabled={isPending}
                    className="w-full text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Ghi chú sức khỏe */}
              <div>
                <label htmlFor="healthNotes" className="block font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  <span>Ghi chú sức khỏe và tiền sử bệnh lý</span>
                </label>
                <textarea
                  id="healthNotes"
                  name="healthNotes"
                  rows={2}
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                  placeholder="VD: Đau lưng nhẹ, huyết áp bình thường, dị ứng phấn hoa..."
                  disabled={isPending}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* PHÂN VÙNG 2: ĐĂNG KÝ GÓI TẬP VÀ THANH TOÁN POS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold border border-emerald-100">
                  2
                </span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Đăng ký gói tập và thanh toán POS
                </h3>
              </div>

              {/* Gói tập & Chi nhánh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="planId" className="block font-medium text-slate-700 mb-1.5">
                    Gói tập đăng ký <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="planId"
                    name="planId"
                    value={planId}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    disabled={isPending || plans.length === 0}
                    required
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {plans.length === 0 ? (
                      <option value="">Chưa có gói tập khả dụng</option>
                    ) : (
                      plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {p.price.toLocaleString('vi-VN')} ₫ ({p.duration_days} ngày)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="branchId" className="block font-medium text-slate-700 mb-1.5">
                    Cơ sở sinh hoạt chính
                  </label>
                  <select
                    id="branchId"
                    name="branchId"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    disabled={isPending}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Toàn hệ thống (mọi chi nhánh)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Huấn luyện viên PT phụ trách & Phương thức thanh toán */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignedPtId" className="block font-medium text-slate-700 mb-1.5">
                    Huấn luyện viên cá nhân (PT) phụ trách
                  </label>
                  <select
                    id="assignedPtId"
                    name="assignedPtId"
                    value={assignedPtId}
                    onChange={(e) => setAssignedPtId(e.target.value)}
                    disabled={isPending}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Tự luyện tập (không kèm HLV)</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} {t.specialty ? `(${t.specialty})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="block font-medium text-slate-700 mb-1.5">
                    Phương thức thanh toán
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    disabled={isPending}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="cash">Tiền mặt tại quầy (cash)</option>
                    <option value="transfer">Chuyển khoản ngân hàng (transfer)</option>
                    <option value="card">Thẻ tín dụng hoặc ATM POS (card)</option>
                    <option value="qr">Quét mã QR ví điện tử (qr)</option>
                  </select>
                </div>
              </div>

              {/* Số tiền thanh toán & Ghi chú hóa đơn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="paidAmount" className="block font-medium text-slate-700 mb-1.5">
                    Số tiền thanh toán thực tế (VNĐ)
                  </label>
                  <div className="relative">
                    <Input
                      id="paidAmount"
                      name="paidAmount"
                      type="number"
                      min="0"
                      step="10000"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="500000"
                      disabled={isPending}
                      className="w-full text-xs sm:text-sm font-semibold tabular-nums pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">₫</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="paymentNotes" className="block font-medium text-slate-700 mb-1.5">
                    Ghi chú thanh toán hoặc số hóa đơn
                  </label>
                  <Input
                    id="paymentNotes"
                    name="paymentNotes"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="VD: Giảm 10% khai trương, xuất HĐ VAT..."
                    disabled={isPending}
                    className="w-full text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link href="/dashboard/members">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Hủy bỏ</span>
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isPending}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>
                  {isPending ? 'Đang phát hành thẻ...' : 'Hoàn tất đăng ký hội viên'}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Cột phải: Live Member Card & Receipt Summary (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Thẻ hội viên xem trước (Live Member Card Preview)</span>
        </div>

        {/* Live Member Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center font-bold text-base border border-white/20">
                {initials}
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                  GymOS Member Card
                </span>
                <span className="text-lg font-bold tracking-tight block">
                  {fullName || 'Họ và tên hội viên'}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 py-3 border-y border-white/10 my-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Số điện thoại:</span>
              <span className="font-mono font-medium text-white">{phone || '09xx xxx xxx'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cơ sở đăng ký:</span>
              <span className="font-medium text-white">{selectedBranch?.name || 'Toàn hệ thống'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">HLV phụ trách:</span>
              <span className="font-medium text-white">{selectedTrainer?.full_name || 'Tự luyện tập'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Gói tập</span>
              <span className="font-semibold text-indigo-200">
                {selectedPlan?.name || 'Chưa chọn gói'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Thời hạn</span>
              <span className="font-semibold text-white">
                {selectedPlan ? `${selectedPlan.duration_days} ngày` : '30 ngày'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Receipt POS Box */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-900">
                Phiếu thu thanh toán POS
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Thu tiền tại quầy
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Đơn giá niêm yết:</span>
              <span className="tabular-nums font-medium">
                {(selectedPlan?.price || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Hình thức thanh toán:</span>
              <span className="font-medium capitalize">
                {paymentMethod === 'cash'
                  ? 'Tiền mặt'
                  : paymentMethod === 'transfer'
                  ? 'Chuyển khoản'
                  : paymentMethod === 'card'
                  ? 'Thẻ POS'
                  : 'Quét mã QR'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-semibold text-slate-900">
              <span>Tổng tiền thu:</span>
              <span className="text-base text-indigo-600 tabular-nums">
                {parsedPaidAmount.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
