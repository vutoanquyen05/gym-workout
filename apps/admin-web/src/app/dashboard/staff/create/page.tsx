import React from 'react';
import Link from 'next/link';
import { getActiveBranchesForStaff } from '../actions';
import { StaffForm } from '../staff-form';
import { ArrowLeft } from 'lucide-react';

export default async function CreateStaffPage() {
  const { data: branches } = await getActiveBranchesForStaff();

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Enterprise Page Header (Không đóng hộp) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
              Tổng quan
            </Link>
            <span>/</span>
            <Link href="/dashboard/staff" className="hover:text-indigo-600 transition-colors">
              Nhân sự và PT
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Thêm mới</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Thêm nhân sự mới
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tạo hồ sơ huấn luyện viên thể hình (PT), quản lý chi nhánh hoặc nhân viên lễ tân quầy tiếp tân.
          </p>
        </div>

        <Link
          href="/dashboard/staff"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về danh sách</span>
        </Link>
      </div>

      {/* Main 2-Column Form with Live Preview */}
      <StaffForm branches={branches || []} />
    </div>
  );
}
