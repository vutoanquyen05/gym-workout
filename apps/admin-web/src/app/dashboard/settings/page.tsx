import React from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
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
              Cài Đặt Hệ Thống
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              System Settings
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Cấu hình thông số tổ chức (Multi-tenant), hồ sơ thương hiệu gym, tích hợp Supabase Cloud và bảo mật.
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

      <div className="bg-white rounded-xl p-12 text-center border border-slate-200/80 shadow-xs">
        <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Settings className="w-7 h-7" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">
          Cài đặt tổ chức và phân quyền
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
          Hỗ trợ tùy biến thương hiệu phòng tập, chính sách bảo mật đa cấp và cấu hình thông báo tự động.
        </p>
      </div>
    </div>
  );
}
