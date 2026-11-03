import React from 'react';
import Link from 'next/link';
import { PlanForm } from '../plan-form';
import { ArrowLeft } from 'lucide-react';

export default function CreatePlanPage() {
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
            <Link href="/dashboard/plans" className="hover:text-indigo-600 transition-colors">
              Gói tập & Bảng giá
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Tạo mới</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Tạo Gói Tập Mới
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Khởi tạo gói tập mới: xác định thời hạn ngày, hạn mức buổi tập PT, quyền lợi chi nhánh và đơn giá niêm yết.
          </p>
        </div>

        <Link
          href="/dashboard/plans"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về Danh sách</span>
        </Link>
      </div>

      {/* Main 2-Column Form with Live Preview */}
      <PlanForm />
    </div>
  );
}

