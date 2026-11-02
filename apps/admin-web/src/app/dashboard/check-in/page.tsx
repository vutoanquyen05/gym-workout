import React from 'react';
import Link from 'next/link';

export default function CheckInPage() {
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
            <span className="text-slate-700 font-medium">Quầy Điểm danh</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>⚡ Quầy Điểm Danh Tiếp Tân</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Phase P04
            </span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Hệ thống điểm danh tức thì dưới 300ms bằng Mã thẻ `MEM-XXXXXX`, Số điện thoại hoặc QR code.
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
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto border border-emerald-200">
          ⚡
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            Quầy Điểm Danh Thông Minh Sẵn Sàng
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hàm Transactional RPC `rpc_check_in_member` đã được triển khai hoàn chỉnh ở tầng Database v2.0. Giao diện quầy tiếp tân chuyên dụng với tra cứu tự động và Realtime Feed sẽ được tích hợp tại Phase P04.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ RPC rpc_check_in_member Ready
          </span>
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ Trừ buổi tập tự động
          </span>
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            ✓ Ghi log attendance_logs
          </span>
        </div>
      </div>
    </div>
  );
}

