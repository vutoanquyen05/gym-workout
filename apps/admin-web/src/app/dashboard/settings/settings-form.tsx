'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GymProfile, updateGymProfile } from './actions';
import { Building2, Save, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface SettingsFormProps {
  gym: GymProfile;
}

export function SettingsForm({ gym }: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(gym.name || '');
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('name', name);

    startTransition(async () => {
      const res = await updateGymProfile(gym.id, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Đã cập nhật tên phòng tập thành công!');
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 sm:p-7 max-w-2xl">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Thông tin phòng tập
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tùy biến tên thương hiệu phòng tập hiển thị trên thanh tiêu đề và hóa đơn
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Lỗi cập nhật:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

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
        <div>
          <label htmlFor="name" className="block font-medium text-slate-700 mb-1.5">
            Tên thương hiệu phòng tập <span className="text-rose-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: GymOS Fitness Center..."
            disabled={isPending}
            className="w-full text-xs sm:text-sm"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Tên này sẽ được hiển thị trên thanh điều hướng đỉnh trang và hợp đồng hội viên.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Mã định danh hệ thống (Slug)</span>
          </div>
          <p className="font-mono text-xs text-slate-600">/{gym.slug || 'gym-os'}</p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            <span>{isPending ? 'Đang lưu...' : 'Lưu tên phòng tập'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

