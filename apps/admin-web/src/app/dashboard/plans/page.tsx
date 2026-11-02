import React from 'react';
import Link from 'next/link';

export default function PlansPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Bảng điều khiển
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Gói tập & Bảng giá</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>📋 Quản Lý Gói Tập & Bảng Giá</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Phase P02-T03
            </span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Quản trị danh mục gói tập phòng gym (Gym tiêu chuẩn, PT 1 kèm 1, Combo) và chính sách giá VND.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            ← Về Tổng quan
          </Link>
        </div>
      </div>

      {/* Feature Preview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-2xs text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mx-auto border border-blue-200">
          📋
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            Danh Mục Gói Tập & Phân Loại v2.0
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Schema bảng `membership_plans` đã mở rộng hỗ trợ `plan_type` (fixed_period, session_pack, recurring) và giá tiền VND chuẩn hóa. Giao diện CRUD toàn diện sẽ được hoàn thiện tại Task P02-T03.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ Gói Tháng (fixed_period)
          </span>
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ Gói Buổi PT (session_pack)
          </span>
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ Giá BIGINT VND Chuẩn hóa
          </span>
        </div>
      </div>
    </div>
  );
}

