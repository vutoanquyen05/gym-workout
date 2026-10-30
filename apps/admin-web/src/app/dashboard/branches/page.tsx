import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getBranches, Branch } from './actions';

export const dynamic = 'force-dynamic';

export default async function BranchesPage() {
  const { data: branches, error } = await getBranches();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý Chi nhánh
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Quản lý danh sách các cơ sở phòng tập, thông tin liên hệ và trạng thái vận hành.
            </p>
          </div>

          <Link href="/dashboard/branches/create">
            <Button className="flex items-center gap-2 self-start sm:self-center shadow-sm">
              <span className="text-lg leading-none">+</span>
              <span>Thêm chi nhánh mới</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
          <span className="text-lg leading-none">⚠️</span>
          <div>
            <span className="font-semibold block">Thông báo kết nối Supabase:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Danh sách Chi nhánh hoặc Trạng thái rỗng (Empty State) */}
      {branches && branches.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              Danh sách chi nhánh ({branches.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                  <th className="py-3.5 px-6 font-semibold">Tên chi nhánh</th>
                  <th className="py-3.5 px-6 font-semibold">Số điện thoại</th>
                  <th className="py-3.5 px-6 font-semibold">Địa chỉ</th>
                  <th className="py-3.5 px-6 font-semibold">Trạng thái</th>
                  <th className="py-3.5 px-6 font-semibold">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {branches.map((branch: Branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          🏢
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {branch.name}
                          </span>
                          {branch.slug && (
                            <span className="text-xs text-slate-400 font-mono">
                              /{branch.slug}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {branch.phone || (
                        <span className="text-slate-400 italic">Chưa cập nhật</span>
                      )}
                    </td>
                    <td
                      className="py-4 px-6 text-slate-600 max-w-xs truncate"
                      title={branch.address ?? ''}
                    >
                      {branch.address || (
                        <span className="text-slate-400 italic">Chưa cập nhật</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          branch.status === 'active' || !branch.status
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            branch.status === 'active' || !branch.status
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        {branch.status === 'active' || !branch.status
                          ? 'Hoạt động'
                          : branch.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {branch.created_at
                        ? new Date(branch.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center text-4xl mx-auto mb-4 border border-slate-200/60 shadow-inner">
            🏢
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Chưa có chi nhánh nào trong hệ thống
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Hệ thống quản lý phòng tập Gym Tracker sẵn sàng tiếp nhận cơ sở phòng tập đầu tiên của bạn để thiết lập cấu hình phân quyền và hội viên.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/branches/create">
              <Button className="inline-flex items-center gap-2 shadow-sm">
                <span className="text-base leading-none">+</span>
                <span>Thêm chi nhánh đầu tiên</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
