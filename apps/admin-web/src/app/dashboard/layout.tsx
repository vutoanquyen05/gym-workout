import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { signOut } from './actions';
import { SidebarNav } from './sidebar-nav';
import { ScanLine, UserPlus, LogOut, Database, Activity } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Devias / Enterprise Dark Shell - Rộng w-72 (288px) */}
      <aside className="w-72 bg-slate-950 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80">
        {/* Brand Header: GymOS Platform */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black flex items-center justify-center shadow-md text-base tracking-wider shrink-0 group-hover:from-indigo-400 group-hover:to-indigo-600 transition-all">
              G
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight block group-hover:text-indigo-300 transition-colors">
                  GymOS
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block font-normal leading-none mt-1">
                Hệ thống quản trị phòng tập
              </span>
            </div>
          </Link>
        </div>

        {/* 7-Module ERP Navigation */}
        <SidebarNav />

        {/* Sidebar Footer - pb-16 to avoid Next.js DevTools indicator overlap */}
        <div className="p-4 pb-16 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300 font-medium">PostgreSQL v2.0</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Hoạt động
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 truncate font-mono" title={user.email}>
            {user.email}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Quick-Action Topbar Header - h-16 */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
          {/* Left: Trạng thái vận hành trực tuyến */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hệ thống trực tuyến</span>
            </span>
            <span className="text-xs text-slate-400 hidden lg:inline">
              • Sẵn sàng tiếp nhận điểm danh và đăng ký hội viên
            </span>
          </div>

          {/* Right: Quick Action Buttons & Account */}
          <div className="flex items-center gap-3">
            {/* Quick Action 1: Điểm danh nhanh */}
            <Link
              href="/dashboard/check-in"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <ScanLine className="w-4 h-4 text-emerald-600" />
              <span>Điểm danh nhanh</span>
            </Link>

            {/* Quick Action 2: Đăng ký hội viên */}
            <Link
              href="/dashboard/members/create"
              className="inline-flex items-center gap-2 px-4.5 h-10 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>Đăng ký hội viên</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* User Account Info */}
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-slate-400 block leading-tight">Tài khoản</span>
              <span className="text-xs font-semibold text-slate-700 block truncate max-w-44 leading-tight">
                {user.email}
              </span>
            </div>

            {/* Sign Out Form */}
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors shadow-2xs"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-slate-50/70 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
