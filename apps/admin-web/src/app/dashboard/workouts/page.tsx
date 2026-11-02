import React from 'react';
import Link from 'next/link';

export default function WorkoutsPage() {
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
            <span className="text-slate-700 font-medium">Trạm Giáo án PT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🏋️ Trạm Xếp Bài Tập & Giáo Án PT</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              3-Tier Coaching
            </span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Biên tập giáo án 3 tầng chuẩn khoa học (Programs $\rightarrow$ Days $\rightarrow$ Exercises), phân công học viên và theo dõi InBody.
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
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto border border-indigo-200">
          🏋️
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            Trạm Giáo Án 3 Tầng & InBody Sẵn Sàng
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hạ tầng Database v2.0 (`workout_programs`, `program_days`, `program_day_exercises`, `body_measurements`) và RPC deep-clone `rpc_assign_program_template` đã sẵn sàng hoạt động. Giao diện trực quan sẽ được triển khai tại Phase P05.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ 12 Bài tập Hệ thống Chuẩn
          </span>
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ Giáo án mẫu Push - Pull - Legs
          </span>
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ RPC rpc_assign_program_template
          </span>
        </div>
      </div>
    </div>
  );
}

