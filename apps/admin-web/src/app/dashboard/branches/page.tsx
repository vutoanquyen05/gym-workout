import React from 'react';
import Link from 'next/link';
import { getBranches } from './actions';
import { BranchTable } from './branch-table';
import { Building2, Plus, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BranchesPage() {
  const { data: branches, error } = await getBranches();

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
              Quản lý chi nhánh cơ sở
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              ERP v2.0
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Mạng lưới cơ sở phòng tập, cấu hình mã định danh (slug), nhân sự phân công và trạng thái vận hành.
          </p>
        </div>

        <Link
          href="/dashboard/branches/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm chi nhánh mới</span>
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

      {/* Danh sách Chi nhánh hoặc Trạng thái rỗng */}
      {branches && branches.length > 0 ? (
        <BranchTable initialBranches={branches} />
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <Building2 className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            Chưa có chi nhánh nào trong hệ thống
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Hệ thống quản lý phòng tập Gym Tracker sẵn sàng tiếp nhận cơ sở phòng tập đầu tiên của bạn để thiết lập cấu hình phân quyền và hội viên.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/branches/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm chi nhánh đầu tiên</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
