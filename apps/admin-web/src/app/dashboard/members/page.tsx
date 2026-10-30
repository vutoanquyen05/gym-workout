import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getMembers, Membership } from './actions';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return {
        label: 'Đang hoạt động',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'expired':
      return {
        label: 'Đã hết hạn',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        dotClass: 'bg-red-500',
      };
    case 'pending_payment':
      return {
        label: 'Chờ thanh toán',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'paused':
      return {
        label: 'Tạm ngưng',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}

export default async function MembersPage() {
  const { data: members, error } = await getMembers();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý Hội viên
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Theo dõi danh sách hội viên, thời hạn gói tập, lịch sử và số buổi tập còn lại.
            </p>
          </div>

          <Link href="/dashboard/members/create">
            <Button className="flex items-center gap-2 self-start sm:self-center shadow-sm">
              <span className="text-lg leading-none">+</span>
              <span>Thêm hội viên mới</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert Lỗi nếu truy vấn thất bại */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-sm">
          <span className="text-lg leading-none shrink-0">⚠️</span>
          <div className="flex-1 overflow-hidden">
            <span className="font-semibold block text-red-800">
              Lỗi kết nối cơ sở dữ liệu Supabase:
            </span>
            <span className="font-mono text-xs break-words text-red-700 mt-1 block bg-red-100/60 p-2.5 rounded-lg border border-red-200">
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Danh sách Hội viên hoặc Empty State */}
      {members && members.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              Danh sách hội viên ({members.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                  <th className="py-3.5 px-6 font-semibold">Mã Hội viên</th>
                  <th className="py-3.5 px-6 font-semibold">Trạng thái</th>
                  <th className="py-3.5 px-6 font-semibold">Ngày bắt đầu</th>
                  <th className="py-3.5 px-6 font-semibold">Ngày kết thúc</th>
                  <th className="py-3.5 px-6 font-semibold">Số buổi còn lại</th>
                  <th className="py-3.5 px-6 font-semibold">Ngày tạo thẻ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {members.map((member: Membership) => {
                  const badge = getStatusBadge(member.status);

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            👤
                          </div>
                          <div>
                            <span
                              className="font-mono text-xs font-semibold text-slate-900 block truncate max-w-[140px]"
                              title={member.qr_code_token || member.id}
                            >
                              {member.qr_code_token || `#${member.id.slice(0, 8)}`}
                            </span>
                            <span
                              className="text-[11px] text-slate-400 font-mono block truncate max-w-[140px]"
                              title={member.user_id}
                            >
                              UID: {member.user_id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {member.start_date
                          ? new Date(member.start_date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {member.end_date
                          ? new Date(member.end_date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="py-4 px-6">
                        {member.remaining_sessions !== null &&
                        member.remaining_sessions !== undefined ? (
                          <span className="font-semibold text-slate-800">
                            {member.remaining_sessions}{' '}
                            <span className="font-normal text-slate-500 text-xs">buổi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                            Không giới hạn
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {member.created_at
                          ? new Date(member.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center text-4xl mx-auto mb-4 border border-slate-200/60 shadow-inner">
            👥
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Chưa có hội viên nào trong hệ thống
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Dữ liệu hội viên sẽ được đồng bộ từ ứng dụng Mobile của học viên hoặc qua cổng đăng ký thẻ tập mới tại phòng gym.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/members/create">
              <Button className="inline-flex items-center gap-2 shadow-sm">
                <span className="text-base leading-none">+</span>
                <span>Thêm hội viên đầu tiên</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
