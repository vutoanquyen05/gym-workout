'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Branch, BranchWithStats, updateBranch } from '../../actions';
import { Building2, CheckCircle2, AlertTriangle, Save, ArrowLeft } from 'lucide-react';

interface BranchEditFormProps {
  branch: Branch | BranchWithStats;
}

export function BranchEditForm({ branch }: BranchEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states pre-filled
  const [name, setName] = useState(branch.name || '');
  const [slug, setSlug] = useState(branch.slug || '');
  const [phone, setPhone] = useState(branch.phone || '');
  const [address, setAddress] = useState(branch.address || '');
  const [status, setStatus] = useState(branch.status || 'active');

  // Tự sinh slug từ tên chi nhánh nếu người dùng muốn
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
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('status', status);

    startTransition(async () => {
      const res = await updateBranch(branch.id, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Đã cập nhật thông tin chi nhánh thành công!');
        setTimeout(() => {
          router.push('/dashboard/branches');
          router.refresh();
        }, 800);
      }
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
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
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Không thể cập nhật chi nhánh:</span>
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
        {/* Tên chi nhánh */}
        <div>
          <label htmlFor="name" className="block font-medium text-slate-700 mb-1.5">
            Tên chi nhánh <span className="text-rose-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Chi nhánh Quận 1, Cơ sở Cầu Giấy..."
            className="w-full text-xs sm:text-sm"
          />
        </div>

        {/* Slug định danh */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="slug" className="block font-medium text-slate-700">
              Định danh URL (Slug)
            </label>
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Tự sinh từ tên
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">/</span>
            <Input
              id="slug"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="chi-nhanh-quan-1"
              className="w-full pl-7 font-mono text-xs sm:text-sm"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Chỉ chấp nhận chữ thường không dấu, số và dấu gạch ngang (-).
          </p>
        </div>

        {/* Số điện thoại & Trạng thái */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block font-medium text-slate-700 mb-1.5">
              Số điện thoại liên hệ
            </label>
            <Input
              id="phone"
              name="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0901234567"
              className="w-full text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="status" className="block font-medium text-slate-700 mb-1.5">
              Trạng thái hoạt động
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="active">Đang hoạt động (active)</option>
              <option value="suspended">Tạm ngưng hoạt động (suspended)</option>
              <option value="archived">Lưu trữ / Đóng cửa (archived)</option>
            </select>
          </div>
        </div>

        {/* Địa chỉ cơ sở */}
        <div>
          <label htmlFor="address" className="block font-medium text-slate-700 mb-1.5">
            Địa chỉ cơ sở phòng tập
          </label>
          <Input
            id="address"
            name="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="VD: 123 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP.HCM"
            className="w-full text-xs sm:text-sm"
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
            <span>{isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
