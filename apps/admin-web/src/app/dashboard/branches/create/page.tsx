'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createBranch } from '../actions';
import { Building2, ArrowLeft, AlertTriangle, Plus } from 'lucide-react';

export default function CreateBranchPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Tự sinh slug từ tên chi nhánh nếu người dùng chưa nhập slug riêng
  const handleGenerateSlug = () => {
    if (!name) return;
    const generated = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // Kiểm tra tên chi nhánh
    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập tên chi nhánh.');
      return;
    }

    // Kiểm tra định dạng slug nếu có nhập
    if (slug.trim() && !/^[a-z0-9-]+$/.test(slug.trim())) {
      setErrorMessage(
        'Slug định danh chỉ được chứa chữ cái thường không dấu, chữ số và dấu gạch ngang (-).'
      );
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    if (slug.trim()) formData.append('slug', slug.trim());
    if (phone.trim()) formData.append('phone', phone.trim());
    if (address.trim()) formData.append('address', address.trim());

    startTransition(async () => {
      const res = await createBranch(formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.push('/dashboard/branches');
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      {/* Enterprise Page Header (Không đóng hộp) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
              Tổng quan
            </Link>
            <span>/</span>
            <Link href="/dashboard/branches" className="hover:text-indigo-600 transition-colors">
              Chi nhánh cơ sở
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Tạo mới</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Thêm Chi Nhánh Mới
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Nhập thông tin cơ sở phòng tập vật lý để phân bổ nhân sự, thiết bị và hội viên.
          </p>
        </div>

        <Link
          href="/dashboard/branches"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về Danh sách</span>
        </Link>
      </div>

      {/* Main Card Form */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                Thông tin Cơ sở Chi nhánh
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các trường đánh dấu sao đỏ là bắt buộc
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Tên chi nhánh */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                Tên chi nhánh <span className="text-rose-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Chi nhánh Quận 1, Cơ sở Cầu Giấy..."
                disabled={isPending}
                required
                className="w-full text-xs sm:text-sm"
              />
            </div>

            {/* Slug định danh */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="slug" className="block text-xs sm:text-sm font-medium text-slate-700">
                  Định danh URL (Slug)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Tự sinh từ tên chi nhánh
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">/</span>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="chi-nhanh-quan-1"
                  disabled={isPending}
                  className="w-full pl-7 font-mono text-xs sm:text-sm"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Chỉ chấp nhận chữ thường không dấu, số và dấu gạch ngang (-).
              </p>
            </div>

            {/* Số điện thoại */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                Số điện thoại liên hệ
              </label>
              <Input
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0901234567"
                disabled={isPending}
                className="w-full text-xs sm:text-sm"
              />
            </div>

            {/* Địa chỉ chi nhánh */}
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                Địa chỉ chi nhánh
              </label>
              <Input
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: 123 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP.HCM"
                disabled={isPending}
                className="w-full text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Khu vực thông báo lỗi hiển thị ngay trên nút "Tạo chi nhánh" */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
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
                className="text-xs"
              >
                Hủy bỏ
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isPending}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>{isPending ? 'Đang tạo cơ sở...' : 'Tạo chi nhánh'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
