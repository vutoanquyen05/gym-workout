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

  const [userId, setUserId] = useState('');
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
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-sm">
            👥
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Thêm Hội Viên Mới
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Cấp phát thẻ hội viên và kích hoạt quyền sử dụng dịch vụ tại phòng tập.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* User ID / Email */}
          <div className="sm:col-span-2">
            <Input
              label="Mã User ID hoặc Email Hội viên *"
              name="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Nhập UUID (VD: a1b2c3d4-...) hoặc Email của bạn để thử nghiệm"
              required
              disabled={isPending}
            />
            <span className="text-xs text-slate-400 mt-1 block">
              Mã định danh người dùng trong Supabase Auth. Bạn có thể nhập email của chính bạn để tự cấp thẻ mẫu.
            </span>
          </div>

          {/* Chọn Gói tập */}
          <div>
            <label
              htmlFor="planId"
              className="text-sm font-medium text-slate-700 block mb-1.5"
            >
              Chọn Gói tập *
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

          {/* Chi nhánh áp dụng */}
          <div>
            <label
              htmlFor="branchId"
              className="text-sm font-medium text-slate-700 block mb-1.5"
            >
              Chi nhánh cơ sở (Tùy chọn)
            </label>
            <select
              id="branchId"
              name="branchId"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
            >
              <option value="">Tất cả chi nhánh (All Branches)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng thái thẻ */}
          <div>
            <label
              htmlFor="status"
              className="text-sm font-medium text-slate-700 block mb-1.5"
            >
              Trạng thái thẻ
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
            >
              <option value="active">Hoạt động (Active)</option>
              <option value="pending_payment">Chờ thanh toán (Pending Payment)</option>
              <option value="paused">Tạm ngưng (Paused)</option>
            </select>
          </div>
        </div>

        {/* Thông báo lỗi nổi bật ngay trên nút hành động */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <span className="text-lg leading-none shrink-0">⚠️</span>
            <div className="flex-1 overflow-hidden">
              <span className="font-semibold block text-red-800">
                Lỗi xử lý khi tạo thẻ hội viên:
              </span>
              <span className="font-mono text-xs break-words text-red-700 mt-1 block bg-red-100/60 p-2.5 rounded-lg border border-red-200">
                {errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
            className="shadow-sm min-w-[140px]"
          >
            Cấp thẻ hội viên
          </Button>
        </div>
      </form>
    </div>
  );
}
