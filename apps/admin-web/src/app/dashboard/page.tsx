import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { signOut } from './actions';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm">
            GT
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 tracking-tight leading-none">
              Gym Tracker Admin Portal
            </h1>
            <span className="text-xs text-slate-500">Bảng điều khiển quản trị</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">Đang đăng nhập:</span>
            <span className="text-sm font-semibold text-slate-800">{user.email}</span>
          </div>

          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            >
              Đăng xuất
            </Button>
          </form>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 sm:p-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Bảng điều khiển Admin
          </h2>
          <p className="text-slate-600 mb-6">
            Xin chào <span className="font-semibold text-slate-800">{user.email}</span>! Bạn đã kết nối và xác thực thành công với hệ thống Supabase Cloud.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
                Trạng thái Xác thực
              </span>
              <span className="text-lg font-bold text-slate-900 block">Hoạt động (Active)</span>
              <span className="text-xs text-slate-500 mt-1 block">JWT Session được xác thực an toàn trên Server</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                User ID
              </span>
              <span className="text-xs font-mono text-slate-700 block truncate" title={user.id}>
                {user.id}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Khóa định danh Supabase Auth</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Đăng nhập gần nhất
              </span>
              <span className="text-sm font-semibold text-slate-800 block">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString('vi-VN')
                  : 'Mới khởi tạo'}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Thời gian theo Supabase</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
