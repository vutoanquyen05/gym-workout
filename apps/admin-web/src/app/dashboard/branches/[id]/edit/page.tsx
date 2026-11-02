import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBranchById } from '../../actions';
import { BranchEditForm } from './branch-edit-form';

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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <span className="text-3xl block">⚠️</span>
          <h2 className="text-base font-bold text-slate-800">Không tìm thấy chi nhánh</h2>
          <p className="text-xs text-slate-500">
            Chi nhánh với ID &quot;{id}&quot; không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/branches"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              ← Quay lại danh sách chi nhánh
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/branches"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>←</span>
          <span>Quay lại danh sách chi nhánh</span>
        </Link>
      </div>

      {/* Main Edit Form */}
      <BranchEditForm branch={branch} />
    </div>
  );
}

