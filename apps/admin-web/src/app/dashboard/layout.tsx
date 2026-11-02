import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { signOut } from './actions';
import { SidebarNav } from './sidebar-nav';
import { ScanLine, UserPlus, LogOut, Database } from 'lucide-react';

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

  // Tự động truy vấn tên phòng gym hiện tại (RLS policy gyms_select_policy)
  const { data: gyms } = await supabase
    .from('gyms')
    .select('id, name')
    .limit(1);

  const gymName = gyms?.[0]?.name || 'Gym Tracker ERP';
  const gymInitial = gymName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Devias / Enterprise Dark Shell */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80">
        {/* Brand / Logo */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shadow-xs text-xs tracking-wider shrink-0 group-hover:bg-indigo-500 transition-colors">
              {gymInitial}
            </div>
            <div className="overflow-hidden">
              <span className="font-semibold text-xs text-slate-100 tracking-tight block truncate group-hover:text-indigo-400 transition-colors">
                {gymName}
              </span>
              <span className="text-[10px] text-slate-400 block font-normal leading-none mt-0.5">
                All-in-One ERP Platform
              </span>
            </div>
          </Link>
          <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            v2.0
          </span>
        </div>

        {/* 7-Module ERP Navigation */}
        <SidebarNav />

        {/* Sidebar Footer - pb-16 to avoid Next.js DevTools indicator overlap */}
        <div className="p-3.5 pb-16 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-300 font-medium">PostgreSQL v2.0</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 truncate font-mono" title={user.email}>
            {user.email}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Quick-Action Topbar Header - h-14 */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
          {/* Left: Gym Name & Module Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{gymName}</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                ERP v2.0
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons & Account */}
          <div className="flex items-center gap-2.5">
            {/* Quick Action 1: Điểm danh nhanh */}
            <Link
              href="/dashboard/check-in"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
              <span>Điểm danh nhanh</span>
            </Link>

            {/* Quick Action 2: Đăng ký Hội viên */}
            <Link
              href="/dashboard/members/create"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-white" />
              <span>Đăng ký Hội viên</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

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
                className="inline-flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-3.5 h-3.5" />
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
