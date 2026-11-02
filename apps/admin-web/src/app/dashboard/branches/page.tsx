import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getBranches } from './actions';
import { BranchTable } from './branch-table';

export const dynamic = 'force-dynamic';

export default async function BranchesPage() {
  const { data: branches, error } = await getBranches();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                Bảng điều khiển
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-medium">Chi nhánh cơ sở</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>🏢 Quản Lý Chi Nhánh Cơ Sở</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                ERP v2.0
              </span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Quản lý mạng lưới cơ sở phòng tập, cấu hình slug định danh, nhân sự phân công và trạng thái vận hành.
            </p>
          </div>

          <Link href="/dashboard/branches/create">
            <Button className="flex items-center gap-2 self-start sm:self-center shadow-2xs font-semibold text-xs">
              <span className="text-base leading-none">+</span>
              <span>Thêm chi nhánh mới</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-3">
          <span className="text-lg leading-none">⚠️</span>
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
        <div className="bg-white rounded-2xl p-12 text-center shadow-2xs border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-slate-200 shadow-inner">
            🏢
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Chưa có chi nhánh nào trong hệ thống
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Hệ thống quản lý phòng tập Gym Tracker sẵn sàng tiếp nhận cơ sở phòng tập đầu tiên của bạn để thiết lập cấu hình phân quyền và hội viên.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/branches/create">
              <Button className="inline-flex items-center gap-2 shadow-2xs text-xs font-semibold">
                <span className="text-base leading-none">+</span>
                <span>Thêm chi nhánh đầu tiên</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
