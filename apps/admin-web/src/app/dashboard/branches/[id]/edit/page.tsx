import React from 'react';
import Link from 'next/link';
import { getBranchById } from '../../actions';
import { BranchEditForm } from './branch-edit-form';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: branch, error } = await getBranchById(id);

  if (error || !branch) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="p-8 bg-white rounded-xl border border-slate-200/80 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Không tìm thấy chi nhánh</h2>
          <p className="text-xs text-slate-500">
            Chi nhánh với ID &quot;{id}&quot; không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/branches"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại danh sách chi nhánh</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      {/* Enterprise Page Header */}
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
            <span className="font-medium text-slate-700">Chỉnh sửa</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Chỉnh Sửa Chi Nhánh
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cập nhật tên, mã slug định danh, địa chỉ và trạng thái hoạt động của cơ sở <span className="font-semibold text-slate-700">{branch.name}</span>.
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

      {/* Main Edit Form */}
      <BranchEditForm branch={branch} />
    </div>
  );
}
