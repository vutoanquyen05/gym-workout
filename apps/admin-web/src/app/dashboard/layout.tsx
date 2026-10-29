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

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - fixed w-64, dark bg-gray-900 text-white */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 min-h-screen border-r border-gray-800">
        {/* Brand / Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-gray-800">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
            GT
          </div>
          <div className="overflow-hidden">
            <Link
              href="/dashboard"
              className="font-bold text-sm text-white tracking-tight hover:text-blue-400 transition-colors block truncate"
            >
              Gym Tracker Admin
            </Link>
            <span className="text-[11px] text-gray-400 block font-normal leading-none mt-0.5">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">Supabase Cloud Active</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 truncate" title={user.email}>
            {user.email}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-800">
              Bảng điều khiển quản trị
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block">Đang đăng nhập</span>
              <span className="text-sm font-semibold text-slate-800 block truncate max-w-xs">
                {user.email}
              </span>
            </div>

            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                className="text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
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
