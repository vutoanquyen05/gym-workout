import React from 'react';
import Link from 'next/link';
import { ScanLine, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CheckInPage() {
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
            <span className="font-medium text-slate-700">Vận hành & Tiếp tân</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Quầy Điểm Danh Tiếp Tân
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Phase P04
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Hệ thống điểm danh tức thì dưới 300ms bằng Mã thẻ <code className="font-mono text-slate-700">MEM-XXXXXX</code>, Số điện thoại hoặc QR code.
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
        <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/70">
          <ScanLine className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-base font-semibold text-slate-900">
            Quầy Điểm Danh Thông Minh Sẵn Sàng
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hàm Transactional RPC <code className="font-mono text-slate-700">rpc_check_in_member</code> đã được triển khai hoàn chỉnh ở tầng Database v2.0. Giao diện quầy tiếp tân chuyên dụng với tra cứu tự động và Realtime Feed sẽ được tích hợp tại Phase P04.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>RPC rpc_check_in_member Ready</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trừ buổi tập tự động</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ghi log attendance_logs</span>
          </span>
        </div>
      </div>
    </div>
  );
}
