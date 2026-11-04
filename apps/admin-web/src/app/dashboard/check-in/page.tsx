import React from 'react';
import Link from 'next/link';
import { Users, UserPlus } from 'lucide-react';
import { getCheckInDeskData } from './actions';
import { CheckInDesk } from './check-in-desk';

export const dynamic = 'force-dynamic';

export default async function CheckInPage() {
  const deskData = await getCheckInDeskData();

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
            <span>/</span>
            <span className="font-medium text-slate-700">Quầy điểm danh</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Quầy điểm danh tiếp tân
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              v2.0 Realtime Desk
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Tra cứu mã thẻ, số điện thoại hoặc tên hội viên để xác thực thẻ tập và ghi nhận ra vào theo thời gian thực.
          </p>
        </div>

        {/* 2 Nút thao tác chuẩn phía trên bên phải */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/members"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors whitespace-nowrap"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Danh sách hội viên</span>
          </Link>

          <Link
            href="/dashboard/members/create"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng ký hội viên</span>
          </Link>
        </div>
      </div>

      {/* Main Check-In Desk Interactive Component */}
      <CheckInDesk initialData={deskData} />
    </div>
  );
}
