import React from 'react';

export default function MembersPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý Hội viên
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Theo dõi danh sách hội viên, gói tập đăng ký, lịch sử check-in và trạng thái thẻ.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Phase 2
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mx-auto mb-4">
          👥
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          Chưa có hội viên trong hệ thống
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
          Dữ liệu hội viên sẽ được đồng bộ từ ứng dụng Mobile của học viên và qua cổng đăng ký tại quầy lễ tân.
        </p>
      </div>
    </div>
  );
}
