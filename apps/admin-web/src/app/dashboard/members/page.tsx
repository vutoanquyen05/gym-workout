import React from 'react';
import Link from 'next/link';
import { getMembers, getMemberRegistrationOptions } from './actions';
import { MemberTable } from './member-table';
import { UserPlus, AlertTriangle } from 'lucide-react';

export default async function MembersPage() {
  const [{ data: members, error }, { data: options }] = await Promise.all([
    getMembers(),
    getMemberRegistrationOptions(),
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
            <span className="font-medium text-slate-700">Vận hành và tiếp tân</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Quản lý hội viên CRM 360°
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              CRM 360°
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Tra cứu hồ sơ khách hàng, mã thẻ tập, hợp đồng hiệu lực, huấn luyện viên phụ trách và lịch sử điểm danh.
          </p>
        </div>

        <Link
          href="/dashboard/members/create"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>Đăng ký hội viên mới</span>
        </Link>
      </div>

      {/* Alert Lỗi nếu truy vấn thất bại */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 overflow-hidden">
            <span className="font-semibold block text-red-800">
              Thông báo kết nối cơ sở dữ liệu:
            </span>
            <span className="font-mono text-xs break-words text-red-700 mt-1 block bg-red-100/60 p-2.5 rounded-lg border border-red-200">
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Danh sách Hội viên với Bảng tương tác và Bộ lọc */}
      <MemberTable initialMembers={members || []} branches={options.branches || []} />
    </div>
  );
}
