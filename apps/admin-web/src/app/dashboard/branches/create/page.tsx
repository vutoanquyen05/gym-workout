'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createBranch } from '../actions';

/**
 * Hàm chuyển đổi chuỗi tiếng Việt có dấu thành slug không dấu
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function CreateBranchPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('active');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isSlugManual) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true);
    setSlug(generateSlug(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('status', status);

    startTransition(async () => {
      try {
        const result = await createBranch(formData);

        if (result?.error) {
          setErrorMessage(result.error);
        } else if (result?.success) {
          router.push('/dashboard/branches');
          router.refresh();
        } else {
          setErrorMessage('Không nhận được phản hồi hợp lệ từ máy chủ.');
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/branches"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>←</span>
          <span>Quay lại danh sách chi nhánh</span>
        </Link>
      </div>

      {/* Main Card Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-sm">
              🏢
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Thêm Chi Nhánh Mới
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Nhập thông tin cơ sở phòng tập vật lý để phân bổ nhân sự, thiết bị và hội viên.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Tên chi nhánh */}
            <div className="sm:col-span-2">
              <Input
                label="Tên chi nhánh *"
                name="name"
                value={name}
                onChange={handleNameChange}
                placeholder="VD: Chi nhánh Quận 1, Gym Center Cầu Giấy..."
                required
                disabled={isPending}
              />
            </div>

            {/* URL Slug */}
            <div className="sm:col-span-2">
              <Input
                label="URL Slug định danh *"
                name="slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="VD: quan-1, cau-giay, hcm-center..."
                required
                disabled={isPending}
              />
              <span className="text-xs text-slate-400 mt-1 block">
                Được tạo tự động từ tên chi nhánh. Dùng làm định danh duy nhất trong hệ thống.
              </span>
            </div>

            {/* Số điện thoại */}
            <div>
              <Input
                label="Số điện thoại liên hệ"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0901 234 567"
                disabled={isPending}
              />
            </div>

            {/* Trạng thái hoạt động */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="status" className="text-sm font-medium text-slate-700">
                Trạng thái vận hành
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
                <option value="suspended">Tạm dừng (Suspended)</option>
                <option value="archived">Lưu trữ (Archived)</option>
              </select>
            </div>

            {/* Địa chỉ cơ sở */}
            <div className="sm:col-span-2">
              <Input
                label="Địa chỉ chi nhánh"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: 123 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP.HCM"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Khu vực thông báo lỗi hiển thị ngay trên nút "Tạo chi nhánh" */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
              <span className="text-lg leading-none shrink-0">⚠️</span>
              <div className="flex-1 overflow-hidden">
                <span className="font-semibold block text-red-800">
                  Lỗi xử lý khi tạo chi nhánh:
                </span>
                <span className="font-mono text-xs break-words text-red-700 mt-1 block bg-red-100/60 p-2.5 rounded-lg border border-red-200">
                  {errorMessage}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link href="/dashboard/branches">
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
              Tạo chi nhánh
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
