'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createMembership,
  MembershipPlan,
  MemberBranchOption,
} from '../actions';

interface CreateMemberFormProps {
  plans: MembershipPlan[];
  branches: MemberBranchOption[];
  initialError?: string | null;
}

export function CreateMemberForm({
  plans,
  branches,
  initialError,
}: CreateMemberFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError || null,
  );

  // Thông tin Khách hàng
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [userId, setUserId] = useState('');

  // Thông tin Thẻ tập
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [status, setStatus] = useState('active');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('userId', userId);
    formData.append('planId', planId);
    formData.append('startDate', startDate);
    if (branchId) formData.append('branchId', branchId);
    formData.append('status', status);

    startTransition(async () => {
      try {
        const result = await createMembership(formData);

        if (result?.error) {
          setErrorMessage(result.error);
        } else if (result?.success) {
          router.push('/dashboard/members');
          router.refresh();
        } else {
          setErrorMessage('Không nhận được phản hồi xác thực từ máy chủ.');
        }
      } catch (err: unknown) {
        console.error('Client action exception:', err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Đã xảy ra lỗi khi gửi yêu cầu đến máy chủ.',
        );
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
      {/* Header Form */}
      <div className="border-b border-slate-100 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-sm">
            👥
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Thêm Hội Viên Mới
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Đăng ký thông tin khách hàng, tự động cấp mã hội viên và kích hoạt thẻ tập.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PHÂN VÙNG 1: THÔNG TIN KHÁCH HÀNG */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Thông tin Khách hàng
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Họ và tên */}
            <div>
              <Input
                label="Họ và tên *"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                required
                disabled={isPending}
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <Input
                label="Số điện thoại"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0901 234 567"
                disabled={isPending}
              />
            </div>

            {/* Địa chỉ */}
            <div className="sm:col-span-2">
              <Input
                label="Địa chỉ thường trú"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: 123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM"
                disabled={isPending}
              />
            </div>

            {/* Email / User ID */}
            <div className="sm:col-span-2">
              <Input
                label="Email hoặc Mã User ID định danh *"
                name="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Nhập UUID (VD: a1b2c3d4-...) hoặc Email của tài khoản"
                required
                disabled={isPending}
              />
              <span className="text-xs text-slate-400 mt-1 block">
                Mã liên kết tài khoản hệ thống. Bạn có thể nhập Email đăng nhập hiện tại để tự cấp thẻ thử nghiệm.
              </span>
            </div>
          </div>
        </div>

        {/* PHÂN VÙNG 2: THÔNG TIN THẺ TẬP */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Thông tin Thẻ tập & Dịch vụ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Gói tập */}
            <div>
              <label
                htmlFor="planId"
                className="text-sm font-medium text-slate-700 block mb-1.5"
              >
                Gói tập đăng ký *
              </label>
              <select
                id="planId"
                name="planId"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                disabled={isPending || plans.length === 0}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
              >
                {plans.length === 0 ? (
                  <option value="">Chưa có gói tập nào</option>
                ) : (
                  plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {Number(p.price).toLocaleString('vi-VN')} ₫ ({p.duration_days} ngày)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Chi nhánh áp dụng */}
            <div>
              <label
                htmlFor="branchId"
                className="text-sm font-medium text-slate-700 block mb-1.5"
              >
                Chi nhánh áp dụng
              </label>
              <select
                id="branchId"
                name="branchId"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
              >
                <option value="">Tất cả chi nhánh (Toàn hệ thống)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    🏢 {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <label
                htmlFor="startDate"
                className="text-sm font-medium text-slate-700 block mb-1.5"
              >
                Ngày bắt đầu kích hoạt *
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isPending}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
              />
            </div>

            {/* Trạng thái thẻ */}
            <div>
              <label
                htmlFor="status"
                className="text-sm font-medium text-slate-700 block mb-1.5"
              >
                Trạng thái thẻ ban đầu
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
              >
                <option value="active">Hoạt động ngay (Active)</option>
                <option value="pending_payment">Chờ thanh toán (Pending Payment)</option>
                <option value="paused">Tạm ngưng (Paused)</option>
              </select>
            </div>
          </div>

          {/* Hộp xem trước mã thẻ tự động */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🎫</span>
              <span className="text-xs text-slate-600 font-medium">
                Mã hội viên tự động sinh:
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              MEM-XXXXXX (Tự động gán khi tạo)
            </span>
          </div>
        </div>

        {/* Thông báo lỗi nổi bật ngay trên nút hành động */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <span className="text-lg leading-none shrink-0">⚠️</span>
            <div className="flex-1 overflow-hidden">
              <span className="font-semibold block text-red-800">
                Lỗi xử lý khi cấp thẻ hội viên:
              </span>
              <span className="font-mono text-xs break-words text-red-700 mt-1 block bg-red-100/60 p-2.5 rounded-lg border border-red-200">
                {errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/dashboard/members">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className="text-slate-600 hover:bg-slate-50 border-slate-300"
            >
              Hủy bỏ
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            className="shadow-sm min-w-[150px]"
          >
            Cấp thẻ hội viên
          </Button>
        </div>
      </form>
    </div>
  );
}
