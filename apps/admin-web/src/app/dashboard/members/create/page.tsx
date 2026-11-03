import React from 'react';
import Link from 'next/link';
import { getMemberRegistrationOptions } from '../actions';
import { CreateMemberForm } from './create-form';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CreateMemberPage() {
  const { data: options, error } = await getMemberRegistrationOptions();

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
            <Link href="/dashboard/members" className="hover:text-indigo-600 transition-colors">
              Hội viên CRM
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Đăng ký mới</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Đăng ký hội viên và phát hành thẻ
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tạo hồ sơ hội viên CRM 360°, phát hành thẻ tập và ghi nhận hóa đơn thu tiền tại quầy tiếp tân.
          </p>
        </div>

        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về danh sách</span>
        </Link>
      </div>

      {/* Thông báo lỗi nếu không tải được danh mục */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-red-800">
              Thông báo danh mục đăng ký:
            </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 2-Column Form with Live Preview */}
      <CreateMemberForm
        plans={options.plans || []}
        branches={options.branches || []}
        trainers={options.trainers || []}
      />
    </div>
  );
}
