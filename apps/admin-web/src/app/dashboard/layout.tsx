import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { signOut } from './actions';
import { SidebarNav } from './sidebar-nav';

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
      {/* Sidebar - fixed w-64, dark bg-gray-900 text-white */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 min-h-screen border-r border-gray-800">
        {/* Brand / Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center shadow-md text-xs tracking-wider shrink-0 group-hover:bg-blue-500 transition-colors">
              {gymInitial}
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-xs text-white tracking-tight block truncate group-hover:text-blue-400 transition-colors">
                {gymName}
              </span>
              <span className="text-[10px] text-gray-400 block font-normal leading-none mt-0.5">
                All-in-One ERP Platform
              </span>
            </div>
          </Link>
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            v2.0
          </span>
        </div>

        {/* 7-Module ERP Navigation */}
        <SidebarNav />

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-gray-800 bg-gray-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-gray-300 font-medium">PostgreSQL v2.0</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Live</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 truncate" title={user.email}>
            {user.email}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Quick-Action Topbar Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
          {/* Left: Gym Name & Module Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{gymName}</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                ERP v2.0
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons & Account */}
          <div className="flex items-center gap-3">
            {/* Quick Action 1: Điểm danh nhanh */}
            <Link
              href="/dashboard/check-in"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <span>⚡</span>
              <span>Điểm danh nhanh</span>
            </Link>

            {/* Quick Action 2: Đăng ký Hội viên */}
            <Link
              href="/dashboard/members/create"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
            >
              <span>+</span>
              <span>Đăng ký Hội viên</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* User Account Info */}
            <div className="text-right hidden md:block">
              <span className="text-[11px] text-slate-400 block leading-tight">Tài khoản</span>
              <span className="text-xs font-semibold text-slate-700 block truncate max-w-44 leading-tight">
                {user.email}
              </span>
            </div>

            {/* Sign Out Form */}
            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                className="text-xs py-1.5 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              >
                Đăng xuất
              </Button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-slate-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
