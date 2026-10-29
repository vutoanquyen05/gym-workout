import React from 'react';
import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm">
            GT
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Gym Tracker Admin
          </span>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all"
        >
          Đăng nhập
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 flex flex-col items-center text-center justify-center">
        <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-200">
          Gym Management Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-2xl">
          Quản lý chuỗi phòng tập đa chi nhánh tập trung
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl">
          Cổng quản trị điều hành, điểm danh hội viên, quản lý gói tập và phân công huấn luyện viên cá nhân theo thời gian thực.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            Vào trang Quản trị →
          </Link>
        </div>
      </main>
    </div>
  );
}
