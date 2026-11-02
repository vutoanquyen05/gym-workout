'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Branch, updateBranch } from '../../actions';

interface BranchEditFormProps {
  branch: Branch;
}

export function BranchEditForm({ branch }: BranchEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState(branch.name || '');
  const [slug, setSlug] = useState(branch.slug || '');
  const [phone, setPhone] = useState(branch.phone || '');
  const [address, setAddress] = useState(branch.address || '');
  const [status, setStatus] = useState(branch.status || 'active');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('status', status);

    startTransition(async () => {
      try {
        const result = await updateBranch(branch.id, formData);

        if (result?.error) {
          setErrorMessage(result.error);
        } else if (result?.success) {
          setSuccessMessage('Cập nhật thông tin chi nhánh thành công!');
          setTimeout(() => {
            router.push('/dashboard/branches');
            router.refresh();
          }, 600);
        } else {
          setErrorMessage('Không nhận được phản hồi hợp lệ từ máy chủ.');
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Đã xảy ra lỗi khi gửi yêu cầu cập nhật.',
        );
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xs border border-slate-200">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-2xs">
            🏢
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Chỉnh Sửa Chi Nhánh: {branch.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ID Cơ sở: <span className="font-mono text-slate-700">{branch.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Thông báo lỗi */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
          <span className="text-lg leading-none">⚠️</span>
          <div>
            <span className="font-semibold block">Không thể cập nhật chi nhánh:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Thông báo thành công */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
          <span className="text-lg leading-none">✅</span>
          <div>
            <span className="font-semibold block">Thành công:</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
        {/* Tên chi nhánh */}
        <div>
          <label htmlFor="name" className="block font-semibold text-slate-700 mb-1.5">
            Tên chi nhánh <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Chi nhánh Quận 1, Cơ sở Cầu Giấy..."
            className="w-full"
          />
        </div>

        {/* Slug định danh */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="slug" className="block font-semibold text-slate-700">
              Định danh URL (Slug) <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Dùng cho đường dẫn phân quyền</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-mono">/branches/</span>
            <Input
              id="slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="quan-1"
              className="pl-24 font-mono text-xs"
            />
          </div>
        </div>

        {/* Số điện thoại & Trạng thái */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block font-semibold text-slate-700 mb-1.5">
              Số điện thoại liên hệ
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 028 3822 9999"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="status" className="block font-semibold text-slate-700 mb-1.5">
              Trạng thái hoạt động
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">🟢 Đang hoạt động (active)</option>
              <option value="suspended">🟡 Tạm ngưng hoạt động (suspended)</option>
              <option value="archived">⚪ Lưu trữ / Đóng cửa (archived)</option>
            </select>
          </div>
        </div>

        {/* Địa chỉ cơ sở */}
        <div>
          <label htmlFor="address" className="block font-semibold text-slate-700 mb-1.5">
            Địa chỉ cơ sở phòng tập
          </label>
          <Input
            id="address"
            name="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="VD: 123 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP.HCM"
            className="w-full"
          />
        </div>

        {/* Form Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/dashboard/branches">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className="text-xs"
            >
              Hủy bỏ
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 text-xs font-semibold shadow-2xs"
          >
            {isPending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>{isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

