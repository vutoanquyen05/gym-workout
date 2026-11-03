import React from 'react';
import Link from 'next/link';
import {
  Users,
  ScanLine,
  Dumbbell,
  Building2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Layers,
  LineChart,
} from 'lucide-react';

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-slate-900 tracking-tight">
                  GymOS
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  ERP v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hệ thống quản trị chuỗi phòng tập
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-11 px-5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 justify-center h-11 px-5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <span>Vào trung tâm chỉ huy</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Nền tảng quản trị chuỗi phòng gym thế hệ mới</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl leading-[1.15]">
              Điều hành chuỗi phòng tập và trạm giáo án huấn luyện tập trung
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              GymOS kết nối thông suốt quản trị hội viên CRM 360°, quầy tiếp tân điểm danh tự động, bảng giá thẻ tập đa năng và trạm biên soạn giáo án 3 tầng dành cho huấn luyện viên PT.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-7 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                <span>Vào trung tâm chỉ huy</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link
                href="/dashboard/members"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>Quản lý hội viên CRM</span>
              </Link>
            </div>

            {/* Trust Metrics Bar */}
            <div className="mt-16 pt-10 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl w-full text-left">
              <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg tabular-nums">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>100%</span>
                </div>
                <span className="text-xs font-medium text-slate-600 mt-1 block">
                  Đồng bộ đa chi nhánh
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg tabular-nums">
                  <Users className="w-5 h-5" />
                  <span>360°</span>
                </div>
                <span className="text-xs font-medium text-slate-600 mt-1 block">
                  Hồ sơ hội viên CRM
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg tabular-nums">
                  <ScanLine className="w-5 h-5" />
                  <span>01 chạm</span>
                </div>
                <span className="text-xs font-medium text-slate-600 mt-1 block">
                  Điểm danh thông minh
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg tabular-nums">
                  <Layers className="w-5 h-5" />
                  <span>03 tầng</span>
                </div>
                <span className="text-xs font-medium text-slate-600 mt-1 block">
                  Giáo án huấn luyện PT
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: 4 Core Modules */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Kiến trúc phân hệ đồng bộ
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
                4 trụ cột vận hành doanh nghiệp thể hình
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Thiết kế đồng bộ từ cơ sở dữ liệu Supabase PostgreSQL đến giao diện quản trị Admin Web và ứng dụng di động dành cho học viên.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Module 1: CRM 360 */}
              <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  CRM 360° hội viên và hợp đồng thẻ tập
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  Quản lý trọn vẹn vòng đời khách hàng từ lúc đăng ký, kích hoạt hợp đồng thời hạn, gói buổi tập PT, phân công huấn luyện viên cá nhân và tra cứu lịch sử tập luyện.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                  <Link href="/dashboard/members" className="hover:underline inline-flex items-center gap-1">
                    <span>Xem danh bạ hội viên</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Module 2: Smart Check-in */}
              <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
                  <ScanLine className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Quầy tiếp tân và điểm danh thông minh
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  Tiếp tân xác thực hội viên tức thì qua mã thẻ, số điện thoại hoặc mã QR. Tự động kiểm tra thời hạn thẻ, trừ buổi tập hợp lệ và cảnh báo thẻ hết hạn theo thời gian thực.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <Link href="/dashboard/check-in" className="hover:underline inline-flex items-center gap-1">
                    <span>Mở quầy tiếp tân</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Module 3: 3-Tier Programming Studio */}
              <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-violet-300 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center border border-violet-200 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Trạm giáo án huấn luyện 3 tầng
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  Công cụ số hóa giáo án khoa học dành cho huấn luyện viên PT: Tầng 1 (Chương trình tập), Tầng 2 (Lịch buổi tập theo tuần), Tầng 3 (Chi tiết bài tập, Sets, Reps, RPE và thời gian nghỉ).
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-violet-700">
                  <Link href="/dashboard/workouts" className="hover:underline inline-flex items-center gap-1">
                    <span>Khám phá trạm giáo án</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Module 4: Multi-Branch & Staff */}
              <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-sky-300 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-200 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Quản trị đa chi nhánh và nhân sự PT
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  Mở rộng chuỗi phòng gym không giới hạn với cơ chế phân quyền RBAC và RLS bảo mật tuyệt đối. Phân bổ nhân sự, theo dõi doanh thu và công suất phục vụ từng cơ sở.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-sky-700">
                  <Link href="/dashboard/branches" className="hover:underline inline-flex items-center gap-1">
                    <span>Xem mạng lưới chi nhánh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Sẵn sàng chuẩn hóa vận hành phòng gym của bạn?
            </h2>
            <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Truy cập ngay bảng điều khiển GymOS để trải nghiệm hệ sinh thái quản lý phòng gym hiện đại, bảo mật và tốc độ cao.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2.5 h-12 px-8 text-base font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-colors"
              >
                <span>Bắt đầu phiên làm việc</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              G
            </div>
            <span className="font-semibold text-slate-800">GymOS</span>
            <span>—</span>
            <span>Hệ thống quản trị phòng tập v2.0</span>
          </div>
          <p>© 2026 GymOS. Bảo lưu mọi quyền.</p>
        </div>
      </footer>
    </div>
  );
}
