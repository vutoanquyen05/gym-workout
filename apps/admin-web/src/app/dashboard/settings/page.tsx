import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getGymProfile } from './actions';
import {
  Lock,
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  Database,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: gym }, { data: { user } }] = await Promise.all([
    getGymProfile(),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Enterprise Page Header (Không đóng hộp) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
              Hệ thống
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Cài đặt hệ thống</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Cài đặt hệ thống
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Định danh phần mềm
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Thông tin định danh phần mềm quản trị GymOS, hạ tầng cơ sở dữ liệu và bảo mật phân quyền.
          </p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Locked Identity & Admin Profile (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Bảng thông tin định danh hệ thống (Chỉ đọc / Locked) */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  G
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Thông tin định danh hệ thống
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cấu hình thương hiệu và mã định danh vận hành được khóa tự động
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Chế độ chỉ đọc</span>
              </span>
            </div>

            <div className="p-6 divide-y divide-slate-100">
              {/* Row 1: Tên phần mềm */}
              <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 block">
                    Tên phần mềm hệ thống
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    GymOS
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cố định</span>
                </span>
              </div>

              {/* Row 2: Mã định danh Slug */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 block">
                    Mã định danh hệ thống (Slug)
                  </span>
                  <span className="font-mono text-sm font-semibold text-indigo-700 mt-0.5 block bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100 w-fit">
                    /gymos
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Đường dẫn định danh API và Multi-tenant
                </span>
              </div>

              {/* Row 3: Phiên bản kiến trúc */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 block">
                    Phiên bản kiến trúc
                  </span>
                  <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                    v2.0 (CRM 360° và Giáo án 3 tầng)
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  All-in-One ERP
                </span>
              </div>

              {/* Row 4: Trạng thái bảo mật */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 block">
                    Trạng thái bảo mật
                  </span>
                  <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                    Row Level Security (Multi-tenant) đang kích hoạt
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đang bảo vệ</span>
                </span>
              </div>

              {/* Row 5: Ngày kích hoạt */}
              <div className="py-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 block">
                    Thời điểm thiết lập hệ thống
                  </span>
                  <span className="text-sm font-medium text-slate-700 mt-0.5 block">
                    {gym?.created_at ? new Date(gym.created_at).toLocaleDateString('vi-VN') : 'Đang hoạt động'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Đồng bộ tự động từ Supabase Cloud
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Tài khoản quản trị đang đăng nhập */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Phiên đăng nhập quản trị
                </h3>
                <p className="text-xs text-slate-500">
                  Thông tin tài khoản vận hành phiên làm việc hiện tại
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 font-medium block">Email đăng nhập:</span>
                <span className="font-semibold text-slate-900 font-mono block break-all">
                  {user?.email || 'admin@gymos.vn'}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 font-medium block">Vai trò quản trị:</span>
                <span className="font-semibold text-indigo-700 block">
                  Chủ sở hữu hệ thống (Owner)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Lối tắt quản trị & Hạ tầng (1 col) */}
        <div className="space-y-4">
          {/* Card 3: Lối tắt quản trị cơ sở */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Lối tắt quản trị cơ sở
            </h3>
            <p className="text-xs text-slate-500">
              Quản lý các thực thể chi nhánh, nhân sự và danh mục giá
            </p>

            <div className="space-y-2 pt-1">
              <Link
                href="/dashboard/branches"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                      Quản trị chi nhánh
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mạng lưới cơ sở và phòng tập
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>

              <Link
                href="/dashboard/staff"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                      Quản lý nhân sự và PT
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Đội ngũ huấn luyện viên và lễ tân
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>

              <Link
                href="/dashboard/plans"
                className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                      Gói tập và bảng giá
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Gói thời hạn và gói buổi tập
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Card 4: Hạ tầng dữ liệu */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Hạ tầng dữ liệu và bảo mật</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống vận hành trên nền tảng Supabase PostgreSQL v2.0, bảo vệ toàn vẹn dữ liệu bằng Row Level Security (RLS) và xác thực an toàn qua HttpOnly Cookie.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Kiến trúc dữ liệu</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono">
                PostgreSQL v2.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
