import React from 'react';

export default function BranchesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý Chi nhánh
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Quản lý danh sách các cơ sở phòng tập, địa chỉ và thông tin liên hệ.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Phase 2
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mx-auto mb-4">
          🏢
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          Chưa có chi nhánh nào được tạo
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
          Hệ thống đã sẵn sàng hỗ trợ cấu hình đa chi nhánh (Multi-branch tenancy). Tính năng quản lý chi nhánh chi tiết sẽ được hoàn thiện trong phiên làm việc tiếp theo.
        </p>
      </div>
    </div>
  );
}
