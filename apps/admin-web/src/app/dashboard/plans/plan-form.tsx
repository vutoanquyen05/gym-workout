'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MembershipPlan, createMembershipPlan, updateMembershipPlan } from './actions';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Save,
  ArrowLeft,
  Calendar,
  Dumbbell,
  Tag,
  Globe,
  Building,
  Sparkles,
} from 'lucide-react';

interface PlanFormProps {
  initialPlan?: MembershipPlan;
  isEdit?: boolean;
}

export function PlanForm({ initialPlan, isEdit = false }: PlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Normalize initial plan_type
  let defaultType: 'fixed_period' | 'session_pack' | 'recurring' = 'fixed_period';
  if (initialPlan) {
    if (initialPlan.plan_type === 'pt_package' || initialPlan.plan_type === 'session_pack') {
      defaultType = 'session_pack';
    } else if (initialPlan.plan_type === 'combo' || initialPlan.plan_type === 'recurring') {
      defaultType = 'recurring';
    }
  }

  // Form states
  const [name, setName] = useState(initialPlan?.name || '');
  const [planType, setPlanType] = useState<'fixed_period' | 'session_pack' | 'recurring'>(defaultType);
  const [price, setPrice] = useState<string>(initialPlan ? String(initialPlan.price) : '');
  const [durationDays, setDurationDays] = useState<string>(
    initialPlan ? String(initialPlan.duration_days) : '30'
  );
  const [sessionLimit, setSessionLimit] = useState<string>(
    initialPlan?.session_limit ? String(initialPlan.session_limit) : ''
  );
  const [scope, setScope] = useState<'all_branches' | 'single_branch'>(
    initialPlan?.scope || 'all_branches'
  );
  const [description, setDescription] = useState(initialPlan?.description || '');
  const [isActive, setIsActive] = useState<boolean>(
    initialPlan !== undefined ? initialPlan.is_active : true
  );

  // Quick duration selection
  const quickDurations = [
    { label: '30 ngày (1 tháng)', days: 30 },
    { label: '90 ngày (3 tháng)', days: 90 },
    { label: '180 ngày (6 tháng)', days: 180 },
    { label: '365 ngày (1 năm)', days: 365 },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('plan_type', planType);
    formData.append('price', price);
    formData.append('duration_days', durationDays);
    if (sessionLimit) {
      formData.append('session_limit', sessionLimit);
    }
    formData.append('scope', scope);
    formData.append('description', description);
    formData.append('is_active', String(isActive));

    startTransition(async () => {
      if (isEdit && initialPlan) {
        const res = await updateMembershipPlan(initialPlan.id, formData);
        if (res?.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage('Đã cập nhật gói tập thành công!');
          setTimeout(() => {
            router.push('/dashboard/plans');
            router.refresh();
          }, 800);
        }
      } else {
        const res = await createMembershipPlan(formData);
        if (res?.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage('Đã tạo gói tập mới thành công!');
          setTimeout(() => {
            router.push('/dashboard/plans');
            router.refresh();
          }, 800);
        }
      }
    });
  };

  const parsedPrice = parseInt(price, 10) || 0;
  const parsedDays = parseInt(durationDays, 10) || 0;
  const parsedSessions = parseInt(sessionLimit, 10) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Cột trái: Form nhập liệu thông minh (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {isEdit ? 'Chỉnh sửa gói tập' : 'Thông tin cấu hình gói tập'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập quyền lợi thời hạn, số buổi và đơn giá niêm yết
              </p>
            </div>
          </div>

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Lỗi thao tác:</span>
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

          <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
            {/* 1. Tên gói tập */}
            <div>
              <label htmlFor="name" className="block font-medium text-slate-700 mb-1.5">
                Tên gói tập niêm yết <span className="text-rose-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Gói hội viên 1 tháng, Gói PT 12 buổi..."
                disabled={isPending}
                className="w-full text-xs sm:text-sm"
              />
            </div>

            {/* 2. Loại gói tập (Plan Type) */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Phân loại gói tập <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPlanType('fixed_period')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    planType === 'fixed_period'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-xs">Thẻ thời hạn</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Tập không giới hạn số lượt theo ngày</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanType('session_pack')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    planType === 'session_pack'
                      ? 'border-violet-600 bg-violet-50/50 text-violet-900 ring-1 ring-violet-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-4 h-4 text-violet-600" />
                    <span className="font-semibold text-xs">Gói buổi PT</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Giới hạn số buổi tập cùng HLV</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanType('recurring')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    planType === 'recurring'
                      ? 'border-amber-600 bg-amber-50/50 text-amber-900 ring-1 ring-amber-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-xs">Gói định kỳ</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Combo tiện ích hoặc tự động gia hạn</p>
                </button>
              </div>
            </div>

            {/* 3. Đơn giá & Thời hạn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block font-medium text-slate-700 mb-1.5">
                  Đơn giá niêm yết (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="10000"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="VD: 500000"
                    disabled={isPending}
                    className="w-full text-xs sm:text-sm font-semibold tabular-nums pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">₫</span>
                </div>
              </div>

              <div>
                <label htmlFor="duration_days" className="block font-medium text-slate-700 mb-1.5">
                  Thời hạn hiệu lực (Ngày) <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="duration_days"
                  name="duration_days"
                  type="number"
                  min="1"
                  required
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="30"
                  disabled={isPending}
                  className="w-full text-xs sm:text-sm font-semibold tabular-nums"
                />
              </div>
            </div>

            {/* Nút chọn nhanh thời hạn */}
            <div>
              <span className="block text-[11px] text-slate-500 mb-1.5">
                Chọn nhanh thời hạn phổ biến:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickDurations.map((qd) => (
                  <button
                    key={qd.days}
                    type="button"
                    onClick={() => setDurationDays(String(qd.days))}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                      durationDays === String(qd.days)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {qd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Giới hạn số buổi (Nổi bật khi là Gói PT) */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                planType === 'session_pack'
                  ? 'bg-violet-50/40 border-violet-200 ring-1 ring-violet-200'
                  : 'bg-slate-50/40 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="session_limit" className="block font-medium text-slate-700">
                  Số buổi tập tối đa {planType === 'session_pack' && <span className="text-rose-500">*</span>}
                </label>
                {planType === 'session_pack' && (
                  <span className="text-[10px] font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                    Bắt buộc đối với gói PT
                  </span>
                )}
              </div>
              <Input
                id="session_limit"
                name="session_limit"
                type="number"
                min="1"
                required={planType === 'session_pack'}
                value={sessionLimit}
                onChange={(e) => setSessionLimit(e.target.value)}
                placeholder={planType === 'session_pack' ? 'VD: 12 hoặc 24 buổi PT' : 'Để trống nếu không giới hạn buổi'}
                disabled={isPending}
                className="w-full text-xs sm:text-sm bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Khi hội viên điểm danh thành công tại quầy, hệ thống tự động trừ 1 buổi trong hạn mức này.
              </p>
            </div>

            {/* 5. Phạm vi áp dụng & Trạng thái mở bán */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="scope" className="block font-medium text-slate-700 mb-1.5">
                  Phạm vi chi nhánh
                </label>
                <select
                  id="scope"
                  name="scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value as 'all_branches' | 'single_branch')}
                  disabled={isPending}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all_branches">Toàn hệ thống (mọi chi nhánh)</option>
                  <option value="single_branch">Giới hạn 1 chi nhánh gốc</option>
                </select>
              </div>

              <div>
                <label htmlFor="is_active" className="block font-medium text-slate-700 mb-1.5">
                  Trạng thái mở bán
                </label>
                <select
                  id="is_active"
                  name="is_active"
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                  disabled={isPending}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="true">Đang mở bán (hiển thị tại POS quầy)</option>
                  <option value="false">Tạm ngừng bán (ẩn khỏi POS)</option>
                </select>
              </div>
            </div>

            {/* 6. Mô tả quyền lợi */}
            <div>
              <label htmlFor="description" className="block font-medium text-slate-700 mb-1.5">
                Mô tả quyền lợi và điều khoản
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Bao gồm tủ đồ cá nhân, nước uống miễn phí và 1 buổi đo chỉ số cơ thể InBody..."
                disabled={isPending}
                className="w-full p-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link href="/dashboard/plans">
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
                  {isPending
                    ? 'Đang xử lý...'
                    : isEdit
                    ? 'Cập nhật gói tập'
                    : 'Tạo gói tập mới'}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Cột phải: Live Pricing Card Preview (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Xem trước thẻ bảng giá (Live POS Preview)</span>
        </div>

        {/* Live Preview Card */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200/80 shadow-md p-6 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Badge Loại gói & Trạng thái */}
          <div className="flex items-center justify-between mb-4">
            {planType === 'session_pack' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 border border-violet-200">
                <Dumbbell className="w-3.5 h-3.5 text-violet-600" />
                <span>Gói PT 1 kèm 1</span>
              </span>
            ) : planType === 'recurring' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Gói định kỳ</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Thẻ thời hạn</span>
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {isActive ? 'Đang mở bán' : 'Ngừng bán'}
            </span>
          </div>

          {/* Tên gói */}
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            {name || 'Tên gói tập của bạn'}
          </h3>

          {/* Đơn giá */}
          <div className="my-4 pb-4 border-b border-slate-100">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {parsedPrice.toLocaleString('vi-VN')}
              </span>
              <span className="text-sm font-semibold text-slate-500">₫</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {planType === 'session_pack' && parsedSessions > 0
                ? `Thời hạn ${parsedDays} ngày • ${parsedSessions} buổi (~${Math.round(
                    parsedPrice / parsedSessions
                  ).toLocaleString('vi-VN')} ₫/buổi)`
                : `Thời hạn ${parsedDays} ngày (~${Math.round(
                    parsedPrice / Math.max(parsedDays, 1)
                  ).toLocaleString('vi-VN')} ₫/ngày)`}
            </p>
          </div>

          {/* Danh sách quyền lợi */}
          <div className="space-y-2.5 text-xs text-slate-600 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thời hạn sử dụng: <strong>{parsedDays} ngày</strong> kể từ khi kích hoạt</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Hạn mức buổi tập: <strong>{parsedSessions > 0 ? `${parsedSessions} buổi` : 'Không giới hạn lượt tập'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {scope === 'all_branches' ? (
                <>
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Áp dụng trên <strong>toàn bộ chi nhánh</strong> hệ thống</span>
                </>
              ) : (
                <>
                  <Building className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Áp dụng giới hạn tại <strong>1 chi nhánh đăng ký</strong></span>
                </>
              )}
            </div>
            {description && (
              <div className="pt-2 text-slate-500 text-[11px] italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                &ldquo;{description}&rdquo;
              </div>
            )}
          </div>

          {/* Dummy POS Action Button */}
          <button
            type="button"
            disabled
            className="w-full py-2.5 rounded-lg text-xs font-semibold bg-slate-900 text-white opacity-80 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Mẫu giao diện bán thẻ tại quầy POS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
