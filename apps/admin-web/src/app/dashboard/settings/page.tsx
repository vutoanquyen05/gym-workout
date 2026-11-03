import React from 'react';
import Link from 'next/link';
import { getGymProfile } from './actions';
import { SettingsForm } from './settings-form';
import { Settings, ArrowLeft, ShieldCheck, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { data: gym } = await getGymProfile();

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
            <span className="font-medium text-slate-700">Quản trị hệ thống</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Cài đặt hệ thống
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Cấu hình chung
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Cấu hình thông tin thương hiệu phòng tập, cơ sở dữ liệu và chính sách vận hành.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về tổng quan</span>
          </Link>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {gym ? (
            <SettingsForm gym={gym} />
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
              Đang tải dữ liệu cấu hình phòng tập...
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Hạ tầng dữ liệu</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống vận hành trên nền tảng Supabase PostgreSQL v2.0, bảo mật đa tầng bằng Row Level Security và xác thực Cookie httpOnly.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Phiên bản kiến trúc</span>
              <span className="font-semibold text-slate-700 font-mono">v2.0 Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
