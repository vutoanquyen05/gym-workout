import React from 'react';
import Link from 'next/link';
import { getStaffMembers, getActiveBranchesForStaff } from './actions';
import { StaffTable } from './staff-table';
import { ShieldCheck, Plus, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  const [{ data: staffList, error }, { data: branches }] = await Promise.all([
    getStaffMembers(),
    getActiveBranchesForStaff(),
  ]);

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
            <span className="font-medium text-slate-700">Quản trị doanh nghiệp</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Quản Lý Nhân Sự & Huấn Luyện Viên
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Staff & PT Hub
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Đội ngũ huấn luyện viên thể hình (PT), quản lý chi nhánh và lễ tân quầy tiếp đón toàn hệ thống phòng tập.
          </p>
        </div>

        <Link
          href="/dashboard/staff/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm nhân sự mới</span>
        </Link>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Thông báo kết nối Supabase:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Danh sách Nhân sự hoặc Empty State */}
      {staffList && staffList.length > 0 ? (
        <StaffTable initialStaff={staffList} branches={branches || []} />
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <ShieldCheck className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            Chưa có nhân sự nào trong danh sách
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Hãy bắt đầu thêm hồ sơ huấn luyện viên (PT) hoặc nhân viên lễ tân đầu tiên để phân công chi nhánh và gắn học viên.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/staff/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nhân sự đầu tiên</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
