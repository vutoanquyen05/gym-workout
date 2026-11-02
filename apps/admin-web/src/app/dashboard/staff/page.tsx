import React from 'react';
import Link from 'next/link';

export default function StaffPage() {
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
            <span className="text-slate-700 font-medium">Nhân sự & PT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>👥 Quản Lý Nhân Sự & Huấn Luyện Viên</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Phase P02-T04
            </span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Danh sách nhân sự, phân quyền chi nhánh (Manager, Receptionist) và hồ sơ huấn luyện viên thể hình (PT).
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
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mx-auto border border-purple-200">
          👥
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            Hồ Sơ Nhân Sự & Huấn Luyện Viên v2.0
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bảng `gym_staff` đã được mở rộng lưu trữ đầy đủ `full_name`, `phone`, `email`, `specialty`, `bio` và phân quyền RBAC đa cấp. Giao diện quản lý đội ngũ sẽ được xây dựng tại Task P02-T04.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ Phân quyền Manager / Receptionist / Trainer
          </span>
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ Hồ sơ chuyên môn & tiểu sử PT
          </span>
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ RLS phân quyền theo Chi nhánh
          </span>
        </div>
      </div>
    </div>
  );
}

