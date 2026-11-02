import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function StaffPage() {
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
              Phase P02-T04
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Danh sách nhân sự, phân quyền chi nhánh (Manager, Receptionist) và hồ sơ huấn luyện viên thể hình (PT).
          </p>
        </div>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Tổng quan</span>
          </Link>
        </div>
      </div>

      {/* Feature Preview Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-200/70">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-base font-semibold text-slate-900">
            Hồ Sơ Nhân Sự & Huấn Luyện Viên v2.0
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bảng <code className="font-mono text-slate-700">gym_staff</code> đã được mở rộng lưu trữ đầy đủ <code className="font-mono text-slate-700">full_name</code>, <code className="font-mono text-slate-700">phone</code>, <code className="font-mono text-slate-700">email</code>, <code className="font-mono text-slate-700">specialty</code>, <code className="font-mono text-slate-700">bio</code> và phân quyền RBAC đa cấp. Giao diện quản lý đội ngũ sẽ được xây dựng tại Task P02-T04.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phân quyền Manager / Receptionist / Trainer</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hồ sơ chuyên môn & tiểu sử PT</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>RLS phân quyền theo Chi nhánh</span>
          </span>
        </div>
      </div>
    </div>
  );
}
