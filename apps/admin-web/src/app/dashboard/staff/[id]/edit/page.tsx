import React from 'react';
import Link from 'next/link';
import { getStaffById, getActiveBranchesForStaff } from '../../actions';
import { StaffForm } from '../../staff-form';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: staff, error }, { data: branches }] = await Promise.all([
    getStaffById(id),
    getActiveBranchesForStaff(),
  ]);

  if (error || !staff) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="p-8 bg-white rounded-xl border border-slate-200/80 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Không tìm thấy hồ sơ nhân sự</h2>
          <p className="text-xs text-slate-500">
            Hồ sơ nhân sự với ID &quot;{id}&quot; không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/staff"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại danh sách nhân sự</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              Nhân sự & PT
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Chỉnh sửa</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Chỉnh Sửa Hồ Sơ: {staff.full_name || 'Nhân Sự'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cập nhật vai trò, chi nhánh phụ trách, chuyên môn huấn luyện hoặc trạng thái hoạt động.
          </p>
        </div>

        <Link
          href="/dashboard/staff"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về Danh sách</span>
        </Link>
      </div>

      {/* Main 2-Column Form with Live Preview */}
      <StaffForm initialStaff={staff} branches={branches || []} isEdit={true} />
    </div>
  );
}

